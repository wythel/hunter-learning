import { useState, useRef, useCallback } from 'react';
import { shuffle, delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { useSpeech } from '../../hooks/useSpeech';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { POOLS } from './data';

function buildChoices(question, pool) {
  const others = pool.filter(w => w.id !== question.id);
  const wrong3 = shuffle(others).slice(0, 3);
  return shuffle([question, ...wrong3]);
}

export function useGame({ mode, count }) {
  const pool      = useRef(POOLS[mode] || POOLS.en);
  const questions = useRef(shuffle(pool.current).slice(0, count));

  const [currentQ, setCurrentQ] = useState(0);
  const [choices, setChoices]   = useState(() => buildChoices(questions.current[0], pool.current));
  const [selected, setSelected] = useState(null); // index
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [phase, setPhase]       = useState('playing');
  const [stats, setStats]       = useState({ correct: 0, wrong: 0 });
  const locked                  = useRef(false);
  const startTime               = useRef(Date.now());
  const sound                   = useSound();
  const speak                   = useSpeech();

  const question = questions.current[currentQ];
  const lang     = mode === 'zh' ? 'zh-TW' : 'en-US';

  const resolve = useCallback(async (isCorrect, idx) => {
    setSelected(idx);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      sound.correct();
      speak(question.label, lang);
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    }

    await delay(isCorrect ? 700 : 1000);

    const nextQ = currentQ + 1;
    if (nextQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      setCurrentQ(nextQ);
      setChoices(buildChoices(questions.current[nextQ], pool.current));
      setSelected(null);
      setFeedback(null);
    }

    locked.current = false;
  }, [question, lang, currentQ, count, sound, speak]);

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
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);
  const stars      = calculateStars(stats.correct, stats.wrong);
  const title      = getResultTitle(stars, true);

  return {
    question, choices, selected, feedback, correctIdx,
    currentQ, count, stats, phase, elapsedSec, stars, title,
    handleChoice, handleTimeout,
  };
}
