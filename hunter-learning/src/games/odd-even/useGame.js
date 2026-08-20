import { useState, useRef, useCallback } from 'react';
import { delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mode 2: 6 unique numbers with at least one odd AND one even
function generateSortQuestion(maxNum) {
  let numbers;
  do {
    const pool = [];
    while (pool.length < 6) {
      const n = rand(1, maxNum);
      if (!pool.includes(n)) pool.push(n);
    }
    numbers = pool;
  } while (
    numbers.every(n => n % 2 === 0) ||
    numbers.every(n => n % 2 === 1)
  );
  const target = Math.random() < 0.5 ? 'odd' : 'even';
  return { numbers: shuffle(numbers), target };
}

export function useGame({ mode, difficulty, count }) {
  const maxNum = difficulty === 'easy' ? 10 : 20;
  const sound  = useSound();
  const locked = useRef(false);
  const startTime = useRef(Date.now());

  const [currentQ, setCurrentQ] = useState(0);
  const [phase,    setPhase]    = useState('playing');
  const [stats,    setStats]    = useState({ correct: 0, wrong: 0 });

  // Mode 1 state
  const [number,   setNumber]   = useState(() => rand(1, maxNum));
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const numberRef = useRef(number);
  numberRef.current = number;
  const wrongRef = useRef([]); // 答錯的題目(供結算頁訂正,僅 identify 模式)

  // Mode 2 state
  const [sortQ,     setSortQ]     = useState(() => generateSortQuestion(maxNum));
  const [selected,  setSelected]  = useState(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [sortResult, setSortResult] = useState(null); // 'correct' | 'wrong'

  // ── Mode 1: answer odd or even ─────────────────────────────────────────────
  const handleAnswer = useCallback(async (answer) => {
    if (locked.current || feedback !== null) return;
    locked.current = true;

    const isCorrect = (answer === 'odd') === (number % 2 === 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      wrongRef.current.push({ number: numberRef.current });
    }

    await delay(isCorrect ? 750 : 1300);

    const nextQ = currentQ + 1;
    if (nextQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      setCurrentQ(nextQ);
      setNumber(rand(1, maxNum));
      setFeedback(null);
    }
    locked.current = false;
  }, [number, currentQ, count, feedback, maxNum, sound]);

  // ── Mode 2: toggle card selection ─────────────────────────────────────────
  const handleToggle = useCallback((num) => {
    if (submitted || locked.current) return;
    sound.click();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }, [submitted, sound]);

  // ── Mode 2: submit answer ──────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (submitted || locked.current || selected.size === 0) return;
    locked.current = true;
    setSubmitted(true);

    const { numbers, target } = sortQ;
    const correctSet = new Set(
      numbers.filter(n => target === 'odd' ? n % 2 === 1 : n % 2 === 0)
    );
    const allCorrect =
      [...correctSet].every(n => selected.has(n)) &&
      [...selected].every(n => correctSet.has(n));

    setSortResult(allCorrect ? 'correct' : 'wrong');
    if (allCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    }

    await delay(1400);

    const nextQ = currentQ + 1;
    if (nextQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      setCurrentQ(nextQ);
      setSortQ(generateSortQuestion(maxNum));
      setSelected(new Set());
      setSubmitted(false);
      setSortResult(null);
    }
    locked.current = false;
  }, [sortQ, selected, submitted, currentQ, count, maxNum, sound]);

  // 限時模式:10 秒未作答 → 視同答錯。
  // identify:feedback='wrong' 會顯示正確的奇/偶標籤。
  // sort:視同送出且答錯,submitted 畫面會標出所有應選的卡片。
  const handleTimeout = useCallback(async () => {
    if (locked.current) return;

    if (mode === 'identify') {
      if (feedback !== null) return;
      locked.current = true;

      setFeedback('wrong');
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      wrongRef.current.push({ number: numberRef.current });

      await delay(1300);

      const nextQ = currentQ + 1;
      if (nextQ >= count) {
        sound.victory();
        setPhase('result');
      } else {
        setCurrentQ(nextQ);
        setNumber(rand(1, maxNum));
        setFeedback(null);
      }
      locked.current = false;
      return;
    }

    // sort mode
    if (submitted) return;
    locked.current = true;

    setSubmitted(true);
    setSortResult('wrong');
    sound.wrong();
    setStats(s => ({ ...s, wrong: s.wrong + 1 }));

    await delay(1400);

    const nextQ = currentQ + 1;
    if (nextQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      setCurrentQ(nextQ);
      setSortQ(generateSortQuestion(maxNum));
      setSelected(new Set());
      setSubmitted(false);
      setSortResult(null);
    }
    locked.current = false;
  }, [mode, feedback, submitted, currentQ, count, maxNum, sound]);

  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    currentQ, count, phase, stats, elapsedSec,
    // mode 1
    number, feedback, handleAnswer,
    // mode 2
    sortQ, selected, submitted, sortResult, handleToggle, handleSubmit,
    handleTimeout,
    wrong: wrongRef.current,
  };
}
