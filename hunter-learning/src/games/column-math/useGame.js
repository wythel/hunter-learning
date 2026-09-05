import { useState, useRef, useCallback } from 'react';
import { rand, delay } from '../../utils/math';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { useSound } from '../../hooks/useSound';

// 直式一格一格填,給比一般 10 秒更寬裕的時間
export const COLUMN_TIMED_SECONDS = 20;

// 產生一題直式加減。
// flags:加法 → flags[p] = 第 p 位(0=個位)相加是否進位;
//       減法 → flags[p] = 第 p 位是否需要向第 p+1 位借位。
export function generateProblem(operation, difficulty, digits) {
  const op = operation === 'mix' ? (Math.random() < 0.5 ? 'add' : 'sub') : operation;
  const lo = 10 ** (digits - 1);
  const hi = 10 ** digits - 1;

  for (;;) {
    let a = rand(lo, hi);
    let b = rand(lo, hi);
    if (op === 'sub' && a < b) [a, b] = [b, a];

    const answer = op === 'add' ? a + b : a - b;
    // 減法答案位數不足會出現前導 0,直式寫起來怪,重出
    if (op === 'sub' && answer < lo) continue;

    const flags = [];
    let carry = 0;
    let cascade = false;
    for (let p = 0; p < digits; p++) {
      const da = Math.floor(a / 10 ** p) % 10;
      const db = Math.floor(b / 10 ** p) % 10;
      if (op === 'add') {
        flags[p] = da + db + carry >= 10 ? 1 : 0;
      } else {
        if (carry && da === 0) cascade = true; // 0 還要被借 → 連鎖借位,顯示太複雜
        flags[p] = da - carry < db ? 1 : 0;
      }
      carry = flags[p];
    }
    if (cascade) continue;

    const hasFlag = flags.some(Boolean);
    if (difficulty === 'easy' ? hasFlag : !hasFlag) continue;

    const sign = op === 'add' ? '+' : '−';
    return { op: sign, a, b, answer, flags, text: `${a} ${sign} ${b}` };
  }
}

export function useGame({ operation, difficulty, digits, count }) {
  const [question, setQuestion]         = useState(() => generateProblem(operation, difficulty, digits));
  const [filled, setFilled]             = useState(0); // 已填入的答案位數(從個位起)
  const [phase, setPhase]               = useState('playing');
  const [currentQ, setCurrentQ]         = useState(0);
  const [stats, setStats]               = useState({ correct: 0, wrong: 0 });
  const [wrongShake, setWrongShake]     = useState(0); // 每按錯 +1,UI 用來觸發搖晃
  const [celebrating, setCelebrating]   = useState(false);
  const [timeoutAnswer, setTimeoutAnswer] = useState(null);
  const [timerPaused, setTimerPaused]   = useState(false);

  const locked      = useRef(false);
  const filledRef   = useRef(0);
  const questionRef = useRef(question);
  const currentQRef = useRef(0);
  const erredRef    = useRef(false); // 這一題是否按錯過
  const wrongRef    = useRef([]);    // 答錯的題目(供結算頁訂正)
  const startTime   = useRef(Date.now());
  const sound       = useSound();

  questionRef.current = question;
  currentQRef.current = currentQ;

  const goNext = useCallback(async () => {
    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);
    if (newQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      const next = generateProblem(operation, difficulty, digits);
      questionRef.current = next;
      setQuestion(next);
      filledRef.current = 0;
      setFilled(0);
      erredRef.current = false;
    }
    setTimerPaused(false);
    locked.current = false;
  }, [count, operation, difficulty, digits, sound]);

  const handleDigit = useCallback(async (d) => {
    if (locked.current) return;
    const q = questionRef.current;
    const ansStr = String(q.answer);
    const expected = ansStr[ansStr.length - 1 - filledRef.current];

    if (String(d) !== expected) {
      erredRef.current = true;
      sound.wrong();
      setWrongShake(n => n + 1);
      return;
    }

    sound.click();
    filledRef.current += 1;
    setFilled(filledRef.current);
    if (filledRef.current < ansStr.length) return;

    // 整題填完
    locked.current = true;
    setTimerPaused(true);
    if (erredRef.current) {
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      wrongRef.current.push({ text: q.text, answer: q.answer });
    } else {
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    }
    sound.correct();
    setCelebrating(true);
    await delay(700);
    setCelebrating(false);
    await goNext();
  }, [sound, goNext]);

  // 限時模式:時間到 → 視同答錯並公布正確答案
  const handleTimeout = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setTimerPaused(true);
    const q = questionRef.current;

    sound.wrong();
    setTimeoutAnswer(q.answer);
    setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    wrongRef.current.push({ text: q.text, answer: q.answer });

    await delay(1400);
    setTimeoutAnswer(null);
    await goNext();
  }, [sound, goNext]);

  const stars = calculateStars(stats.correct, stats.wrong);
  const title = getResultTitle(stars);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    question, filled, phase, currentQ, stats,
    wrongShake, celebrating, timeoutAnswer, timerPaused,
    stars, title, elapsedSec,
    handleDigit, handleTimeout,
    wrong: wrongRef.current,
  };
}
