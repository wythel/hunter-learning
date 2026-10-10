import { useState, useRef, useCallback } from 'react';
import { shuffle, delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { useSpeech } from '../../hooks/useSpeech';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { EN_CONFUSABLES } from '../../utils/data/confusables';
import { POOLS, ZH_LOOKALIKE_GROUPS } from './data';

// 編輯距離：英文困難模式用來找「拼起來很像」的字。
export function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

// 分數越小越像。字池裡現成的相近字（cat/hat/car）最優先，其次同字首，再比編輯距離。
function enLikeness(a, b) {
  const listed = (EN_CONFUSABLES[a] || []).includes(b) || (EN_CONFUSABLES[b] || []).includes(a);
  return editDistance(a, b) - (listed ? 10 : 0) - (a[0] === b[0] ? 1 : 0);
}

// 困難模式的干擾圖：選「字長得像題目」的圖，讓小朋友必須真的讀懂字，
// 不能只靠「這個字很長，應該是 watermelon」之類的線索猜。
export function pickLookalikes(question, pool, n = 3) {
  const others = pool.filter(w => w.id !== question.id);
  if (question.id.startsWith('zh-')) {
    const mates = new Set(
      ZH_LOOKALIKE_GROUPS.filter(g => g.includes(question.label)).flat(),
    );
    const near = shuffle(others.filter(w => mates.has(w.label))).slice(0, n);
    // 組別不足 n 個就用隨機補齊
    const rest = shuffle(others.filter(w => !near.includes(w))).slice(0, n - near.length);
    return [...near, ...rest];
  }
  // 英文：取最像的 6 個再隨機挑 3 個，避免同一題每次干擾都一樣
  const ranked = [...shuffle(others)]
    .sort((x, y) => enLikeness(question.label, x.label) - enLikeness(question.label, y.label));
  return shuffle(ranked.slice(0, n * 2)).slice(0, n);
}

export function buildChoices(question, pool, difficulty) {
  const wrong3 = difficulty === 'hard'
    ? pickLookalikes(question, pool, 3)
    : shuffle(pool.filter(w => w.id !== question.id)).slice(0, 3);
  return shuffle([question, ...wrong3]);
}

export function useGame({ mode, count, difficulty = 'easy' }) {
  const [pool]      = useState(() => POOLS[mode] || POOLS.en);
  const [questions] = useState(() => shuffle(pool).slice(0, count));

  const [currentQ, setCurrentQ] = useState(0);
  const [choices, setChoices]   = useState(() => buildChoices(questions[0], pool, difficulty));
  const [selected, setSelected] = useState(null); // index
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [phase, setPhase]       = useState('playing');
  const [stats, setStats]       = useState({ correct: 0, wrong: 0 });
  const locked                  = useRef(false);
  const [startTime]            = useState(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wrong, setWrong]       = useState([]); // 答錯的題目(供結算頁訂正)
  const sound                   = useSound();
  const speak                   = useSpeech();

  const question = questions[currentQ];
  const lang     = mode === 'zh' ? 'zh-TW' : 'en-US';

  const resolve = useCallback(async (isCorrect, idx) => {
    setSelected(idx);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    // 題目本身就是要考「讀」，所以作答前不唸；答完不論對錯都唸一次，讓小朋友把字和音連起來
    speak(question.label, lang);
    if (isCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      setWrong(w => [...w, {
        question,
        choices,
        correctIdx: choices.findIndex(c => c.id === question.id),
      }]);
    }

    await delay(isCorrect ? 700 : 1200);

    const nextQ = currentQ + 1;
    if (nextQ >= count) {
      sound.victory();
      setElapsedSec(Math.round((Date.now() - startTime) / 1000));
      setPhase('result');
    } else {
      setCurrentQ(nextQ);
      setChoices(buildChoices(questions[nextQ], pool, difficulty));
      setSelected(null);
      setFeedback(null);
    }

    locked.current = false;
  }, [question, choices, lang, currentQ, count, difficulty, sound, speak, startTime, pool, questions]);

  const handleChoice = useCallback((idx) => {
    if (locked.current || feedback !== null) return;
    locked.current = true;
    resolve(choices[idx].id === question.id, idx);
  }, [choices, question, feedback, resolve]);

  const handleTimeout = useCallback(() => {
    if (locked.current || feedback !== null) return;
    locked.current = true;
    resolve(false, null);
  }, [feedback, resolve]);

  const correctIdx = choices.findIndex(c => c.id === question.id);
  const stars      = calculateStars(stats.correct, stats.wrong);
  const title      = getResultTitle(stars, true);

  return {
    question, choices, selected, feedback, correctIdx,
    currentQ, count, stats, phase, elapsedSec, stars, title,
    handleChoice, handleTimeout,
    wrong,
  };
}
