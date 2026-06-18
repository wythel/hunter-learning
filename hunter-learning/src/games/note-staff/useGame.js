import { useState, useRef, useCallback } from 'react';
import { delay } from '../../utils/math';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { useSound } from '../../hooks/useSound';
import { getNotePool } from './notes';

function pickNote(pool, prevId) {
  let pick;
  let attempts = 0;
  do {
    pick = pool[Math.floor(Math.random() * pool.length)];
    attempts++;
  } while (pick.id === prevId && attempts < 6);
  return pick;
}

export function useGame({ clefMode = 'treble', answerMode = 'name', count = 10 }) {
  const sound = useSound();
  const startTime = useRef(Date.now());
  const locked = useRef(false);

  const poolRef = useRef(getNotePool(clefMode));

  const [phase, setPhase] = useState('playing');
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [currentQ, setCurrentQ] = useState(0);
  const [note, setNote] = useState(() => pickNote(poolRef.current, null));
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [wrongValue, setWrongValue] = useState(null);

  const currentQRef = useRef(0);
  currentQRef.current = currentQ;
  const noteRef = useRef(note);
  noteRef.current = note;

  const handleAnswer = useCallback(async (value) => {
    if (locked.current) return;
    locked.current = true;

    const cur = noteRef.current;
    const isCorrect = answerMode === 'name'
      ? value === cur.solfege
      : value === cur.midi;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) setWrongValue(value);

    if (isCorrect) {
      // The note itself is the reward — no extra "ding" so it doesn't drown
      // out the pitch the child is supposed to hear.
      sound.playNote(cur.midi, 0.55);
    } else {
      sound.wrong();
    }

    setStats(s => ({
      ...s,
      ...(isCorrect ? { correct: s.correct + 1 } : { wrong: s.wrong + 1 }),
    }));

    await delay(isCorrect ? 600 : 1100);
    setFeedback(null);
    setWrongValue(null);

    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(200);
      sound.victory();
      setPhase('result');
    } else {
      const next = pickNote(poolRef.current, cur.id);
      setNote(next);
    }

    locked.current = false;
  }, [answerMode, count, sound]);

  const stars = calculateStars(stats.correct, stats.wrong);
  const title = getResultTitle(stars, true);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    phase, stats, currentQ, note, feedback, wrongValue,
    handleAnswer,
    stars, title, elapsedSec,
  };
}
