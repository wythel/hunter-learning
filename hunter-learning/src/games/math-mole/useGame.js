import { useState, useRef, useCallback, useEffect } from 'react';
import { rand } from '../../utils/math';
import { useSound } from '../../hooks/useSound';

function generateQuestion(maxAnswer) {
  const a = rand(1, Math.floor(maxAnswer / 2));
  const b = rand(1, maxAnswer - a);
  if (Math.random() < 0.6) {
    return { text: `${a} + ${b} = ?`, answer: a + b };
  } else {
    return { text: `${a + b} − ${b} = ?`, answer: a };
  }
}

function pickIndices(count) {
  const idx = [];
  while (idx.length < count) {
    const i = rand(0, 8);
    if (!idx.includes(i)) idx.push(i);
  }
  return idx;
}

export function useGame({ difficulty, timeLimit }) {
  const maxAnswer = difficulty === 'easy' ? 10 : 20;

  const [question, setQuestion]   = useState(() => generateQuestion(maxAnswer));
  const [holes, setHoles]         = useState(() => Array(9).fill(null).map(() => ({ num: null, up: false })));
  const [flash, setFlash]         = useState(Array(9).fill(null));
  const [score, setScore]         = useState(0);
  const [correct, setCorrect]     = useState(0);
  const [total, setTotal]         = useState(0);
  const [timeLeft, setTimeLeft]   = useState(timeLimit);
  const [phase, setPhase]         = useState('playing');
  const [running, setRunning]     = useState(true);

  const lockedRef   = useRef(false);
  const runningRef  = useRef(true);
  const currentAns  = useRef(question.answer);
  const moleTimeout = useRef(null);
  const timerInterval = useRef(null);
  const startTime   = useRef(Date.now());
  const sound       = useSound();

  const showMoles = useCallback(() => {
    if (!runningRef.current) return;

    const q = generateQuestion(maxAnswer);
    currentAns.current = q.answer;
    setQuestion(q);

    const count   = rand(3, 4);
    const indices = pickIndices(count);
    const wrongNums = new Set();
    while (wrongNums.size < count - 1) {
      const n = rand(1, maxAnswer);
      if (n !== q.answer) wrongNums.add(n);
    }
    const nums = [q.answer, ...wrongNums];
    // shuffle nums
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    setHoles(prev => {
      const next = prev.map(h => ({ ...h, up: false, num: null }));
      indices.forEach((hi, ni) => {
        next[hi] = { num: nums[ni], up: true };
      });
      return next;
    });

    clearTimeout(moleTimeout.current);
    moleTimeout.current = setTimeout(() => {
      if (runningRef.current) showMoles();
    }, 2500);
  }, [maxAnswer]);

  useEffect(() => {
    showMoles();
    timerInterval.current = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 10) sound.tick();
        if (next <= 0) {
          clearInterval(timerInterval.current);
          clearTimeout(moleTimeout.current);
          runningRef.current = false;
          setRunning(false);
          setPhase('result');
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval.current);
      clearTimeout(moleTimeout.current);
      runningRef.current = false;
    };
  }, []);

  const handleHit = useCallback(async (idx) => {
    if (!runningRef.current || lockedRef.current) return;
    const hole = holes[idx];
    if (!hole.up) return;

    setTotal(t => t + 1);
    const isCorrect = hole.num === currentAns.current;

    if (isCorrect) {
      sound.hit();
      setScore(s => s + 10);
      setCorrect(c => c + 1);
      setFlash(f => { const n = [...f]; n[idx] = 'correct'; return n; });
      lockedRef.current = true;
      setHoles(h => { const n = [...h]; n[idx] = { ...n[idx], up: false }; return n; });
      await new Promise(r => setTimeout(r, 250));
      setFlash(f => { const n = [...f]; n[idx] = null; return n; });
      lockedRef.current = false;
      showMoles();
    } else {
      sound.miss();
      setFlash(f => { const n = [...f]; n[idx] = 'wrong'; return n; });
      await new Promise(r => setTimeout(r, 350));
      setFlash(f => { const n = [...f]; n[idx] = null; return n; });
    }
  }, [holes, showMoles, sound]);

  const wrong = total - correct;
  let stars;
  const acc = total > 0 ? correct / total : 0;
  if (acc >= 0.9 && correct >= 8) stars = 3;
  else if (acc >= 0.7)            stars = 2;
  else if (acc >= 0.4)            stars = 1;
  else                            stars = 0;

  const TITLES = ['再試一次！', '繼續練習！', '打得不錯！', '反應超快！'];
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    question, holes, flash, score, correct, wrong, total,
    timeLeft, timeLimit, phase, stars,
    title: TITLES[stars], elapsedSec,
    handleHit,
  };
}
