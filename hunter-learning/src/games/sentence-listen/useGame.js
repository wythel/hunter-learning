import { useState, useRef, useCallback, useEffect } from 'react';
import { shuffle } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { useSpeech } from '../../hooks/useSpeech';
import { pickHardDistractors } from '../../utils/data/confusables';
import { SENTENCES, FILLER_WORDS, toWords } from './data';

const DISTRACTORS = 3;

// 困難模式：句中單字的拼字/發音相近字優先，不夠再用後備字補滿。
// 干擾字不能和句中任何字相同，否則會出現「兩張一樣的卡，只有一張能按」。
export function pickDistractors(words, n = DISTRACTORS) {
  const inSentence = new Set(words.map(w => w.toLowerCase()));
  const picked = [];
  for (const w of shuffle(words)) {
    for (const d of pickHardDistractors(w, 1)) {
      const k = d.toLowerCase();
      if (!inSentence.has(k) && !picked.includes(k)) picked.push(k);
    }
    if (picked.length >= n) break;
  }
  for (const f of shuffle(FILLER_WORDS)) {
    if (picked.length >= n) break;
    if (!inSentence.has(f) && !picked.includes(f)) picked.push(f);
  }
  return picked.slice(0, n);
}

export function buildTiles(sentence, difficulty) {
  const words = toWords(sentence.en);
  const extra = difficulty === 'hard' ? pickDistractors(words) : [];
  return shuffle([...words, ...extra]).map((word, id) => ({ id, word, used: false }));
}

export function useGame({ count, difficulty = 'easy' }) {
  const [questions] = useState(() => shuffle(SENTENCES[difficulty] || SENTENCES.easy).slice(0, count));
  const total       = questions.length;

  const [currentQ, setCurrentQ] = useState(0);
  const [tiles, setTiles]       = useState(() => buildTiles(questions[0], difficulty));
  const [placed, setPlaced]     = useState(0);       // 已依序放對幾個字
  const [wrongId, setWrongId]   = useState(null);    // 剛按錯的字卡(閃紅)
  const [solved, setSolved]     = useState(false);   // 本題完成
  const [phase, setPhase]       = useState('playing');
  const [stats, setStats]       = useState({ perfect: 0, missed: 0 }); // 題數:一次全對 / 有按錯
  const [taps, setTaps]         = useState({ wrong: 0 }); // 累計按錯次數
  const mistakesThisQ           = useRef(0);
  const locked                  = useRef(false);
  const [startTime]             = useState(() => Date.now());
  const [elapsedSec, setElapsed] = useState(0);
  const sound                   = useSound();
  const speak                   = useSpeech();

  const sentence = questions[currentQ];
  const target   = toWords(sentence.en);

  const play = useCallback((slow = false) => {
    speak(sentence.en, 'en-US', slow ? 0.55 : 0.85);
  }, [speak, sentence]);

  // 每題一開始自動唸一次
  useEffect(() => { play(); }, [currentQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTile = useCallback(async (id) => {
    if (locked.current || solved) return;
    const tile = tiles.find(t => t.id === id);
    if (!tile || tile.used) return;

    // 依字串比對而非 id：句中有重複字(如兩個 the)時，任一張都算對
    if (tile.word !== target[placed]) {
      sound.wrong();
      mistakesThisQ.current += 1;
      setTaps(t => ({ wrong: t.wrong + 1 }));
      setWrongId(id);
      setTimeout(() => setWrongId(w => (w === id ? null : w)), 500);
      return;
    }

    const nextPlaced = placed + 1;
    setTiles(ts => ts.map(t => (t.id === id ? { ...t, used: true } : t)));
    setPlaced(nextPlaced);
    setWrongId(null);

    if (nextPlaced < target.length) {
      speak(tile.word, 'en-US');
      return;
    }

    // 整句完成
    locked.current = true;
    setSolved(true);
    sound.correct();
    speak(sentence.en, 'en-US', 0.85);
    const perfect = mistakesThisQ.current === 0;
    setStats(s => perfect ? { ...s, perfect: s.perfect + 1 } : { ...s, missed: s.missed + 1 });

    await new Promise(r => setTimeout(r, 2200));

    const nextQ = currentQ + 1;
    if (nextQ >= total) {
      sound.victory();
      setElapsed(Math.round((Date.now() - startTime) / 1000));
      setPhase('result');
    } else {
      mistakesThisQ.current = 0;
      setCurrentQ(nextQ);
      setTiles(buildTiles(questions[nextQ], difficulty));
      setPlaced(0);
      setSolved(false);
    }
    locked.current = false;
  }, [tiles, target, placed, solved, sentence, questions, currentQ, total, difficulty, sound, speak, startTime]);

  return {
    sentence, target, tiles, placed, wrongId, solved,
    currentQ, total, stats, wrongTaps: taps.wrong, phase, elapsedSec,
    handleTile, play,
  };
}
