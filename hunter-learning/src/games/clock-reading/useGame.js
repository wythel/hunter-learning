import { useState, useRef, useCallback } from 'react';
import { rand, shuffle } from '../../utils/math';
import { useSound } from '../../hooks/useSound';

function generateQuestion(difficulty) {
  const hour = rand(1, 12);
  let minute;
  if (difficulty === 'hour')    minute = 0;
  else if (difficulty === 'half') minute = Math.random() < 0.5 ? 0 : 30;
  else                            minute = rand(0, 11) * 5;
  return { hour, minute };
}

function generateChoices(q, difficulty) {
  const used = new Set([q.hour * 100 + q.minute]);
  const choices = [{ ...q }];
  let attempts = 0;
  while (choices.length < 4 && attempts < 200) {
    attempts++;
    const h = rand(1, 12);
    let m;
    if (difficulty === 'hour')    m = 0;
    else if (difficulty === 'half') m = Math.random() < 0.5 ? 0 : 30;
    else                            m = rand(0, 11) * 5;
    const key = h * 100 + m;
    if (!used.has(key)) { used.add(key); choices.push({ hour: h, minute: m }); }
  }
  return shuffle(choices);
}

function fmt(h, m) {
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function useGame({ mode, difficulty, count }) {
  const _initQ = useRef(null);
  if (_initQ.current === null) _initQ.current = generateQuestion(difficulty);
  const [question, setQuestion]   = useState(_initQ.current);
  const [choices, setChoices]     = useState(() => generateChoices(_initQ.current, difficulty));
  const [phase, setPhase]         = useState('playing');
  const [currentQ, setCurrentQ]   = useState(0);
  const [stats, setStats]         = useState({ correct: 0, wrong: 0 });
  const [feedback, setFeedback]   = useState(null);
  const [revealDigital, setRevealDigital] = useState(false);

  // Mode 2 (set) state
  const [setHour, setSetHour]       = useState(null);
  const [setMinute, setSetMinute]   = useState(null);
  const [displayHour, setDisplayHour]     = useState(null);
  const [displayMinute, setDisplayMinute] = useState(null);
  const [confirmActive, setConfirmActive] = useState(false);
  const [instruction, setInstruction]     = useState('點時鐘設定時間');

  const locked    = useRef(false);
  const startTime = useRef(Date.now());
  const sound     = useSound();

  // Initialise question ref for mode 2
  const questionRef = useRef(question);

  function loadNextQuestion(nextIdx) {
    const q = generateQuestion(difficulty);
    setQuestion(q);
    questionRef.current = q;
    setChoices(generateChoices(q, difficulty));
    setFeedback(null);
    setRevealDigital(false);

    if (mode === 'set') {
      setSetHour(null);
      setSetMinute(null);
      setDisplayHour(null);
      setDisplayMinute(null);
      setConfirmActive(false);
      setInstruction('點時鐘設定時間');
    }
  }

  // Mode 1: pick a choice
  const handleChoice = useCallback(async (choiceIdx) => {
    if (locked.current || feedback !== null) return;
    locked.current = true;

    const c = choices[choiceIdx];
    const isCorrect = c.hour === question.hour && c.minute === question.minute;
    setRevealDigital(true);
    setFeedback({ choiceIdx, correct: isCorrect });

    if (isCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      await new Promise(r => setTimeout(r, 900));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      await new Promise(r => setTimeout(r, 1100));
    }

    const nextQ = currentQ + 1;
    setCurrentQ(nextQ);
    if (nextQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      loadNextQuestion(nextQ);
    }
    locked.current = false;
  }, [choices, question, currentQ, count, feedback, sound, difficulty, mode]);

  // Mode 2: clock click
  const handleClockClick = useCallback(({ type, value }) => {
    if (locked.current) return;

    if (type === 'hour') {
      setSetHour(value);
      setDisplayHour(value);
      sound.click();

      if (difficulty === 'hour') {
        setSetMinute(0);
        setDisplayMinute(0);
        setConfirmActive(true);
        setInstruction('按確認送出！');
        sound.ready();
      } else {
        setInstruction(difficulty === 'half' ? '點外圍選整點或半點' : '點外圍設定分鐘');
        // If minute already set, activate confirm
        setSetMinute(m => {
          if (m !== null) {
            setConfirmActive(true);
            setInstruction('按確認送出！');
            sound.ready();
          }
          return m;
        });
      }
    } else if (type === 'minute') {
      setSetMinute(value);
      setDisplayMinute(value);
      sound.click();
      setSetHour(h => {
        if (h !== null) {
          setConfirmActive(true);
          setInstruction('按確認送出！');
          sound.ready();
        } else {
          setInstruction('點時鐘中間設定幾點');
        }
        return h;
      });
    }
  }, [sound, difficulty]);

  const handleConfirm = useCallback(async () => {
    if (locked.current || !confirmActive) return;
    locked.current = true;

    const q = questionRef.current;
    const isCorrect = setHour === q.hour && setMinute === q.minute;
    setRevealDigital(true);
    setFeedback({ correct: isCorrect });

    if (isCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      await new Promise(r => setTimeout(r, 900));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      sound.teaching();
      await new Promise(r => setTimeout(r, 1200));
    }

    const nextQ = currentQ + 1;
    setCurrentQ(nextQ);
    if (nextQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      loadNextQuestion(nextQ);
    }
    locked.current = false;
  }, [confirmActive, setHour, setMinute, currentQ, count, sound, difficulty, mode]);

  const stars = (() => {
    const { correct, wrong } = stats;
    const total = correct + wrong;
    if (total === 0) return 3;
    const pct = wrong / total;
    if (pct === 0)       return 3;
    if (pct <= 0.2)      return 2;
    if (pct <= 0.5)      return 1;
    return 0;
  })();

  const TITLES = ['再試一次！', '繼續練習！', '非常好！', '完美！'];
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    question, choices, phase, currentQ, count, stats,
    feedback, revealDigital,
    // mode 2
    setHour, setMinute, displayHour, displayMinute,
    confirmActive, instruction,
    stars, title: TITLES[stars], elapsedSec,
    handleChoice, handleClockClick, handleConfirm,
    fmt,
  };
}
