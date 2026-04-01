import { useState, useRef, useCallback } from 'react';
import { shuffle } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { WORDS } from '../../utils/data/words';

function buildPool(topic) {
  if (topic === 'mix') return [...WORDS.animals, ...WORDS.fruits, ...WORDS.colors, ...WORDS.body];
  return WORDS[topic] || WORDS.animals;
}

function buildChoices(question, pool) {
  const others = pool.filter(w => w.en !== question.en);
  const wrong3 = shuffle(others).slice(0, 3);
  return shuffle([question, ...wrong3]);
}

export function useGame({ topic, count }) {
  const pool      = useRef(buildPool(topic));
  const questions = useRef(shuffle(pool.current).slice(0, count));

  const [currentQ, setCurrentQ]   = useState(0);
  const [choices, setChoices]     = useState(() => buildChoices(questions.current[0], pool.current));
  const [selected, setSelected]   = useState(null); // index
  const [feedback, setFeedback]   = useState(null); // 'correct' | 'wrong'
  const [phase, setPhase]         = useState('playing');
  const [stats, setStats]         = useState({ correct: 0, wrong: 0 });
  const locked                    = useRef(false);
  const startTime                 = useRef(Date.now());
  const sound                     = useSound();

  const question = questions.current[currentQ];

  const handleChoice = useCallback(async (idx) => {
    if (locked.current || feedback !== null) return;
    locked.current = true;

    const isCorrect = choices[idx].en === question.en;
    setSelected(idx);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    }

    await new Promise(r => setTimeout(r, isCorrect ? 700 : 1000));

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
  }, [choices, question, currentQ, count, feedback, sound]);

  const correctIdx = choices.findIndex(c => c.en === question.en);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    question, choices, selected, feedback, correctIdx,
    currentQ, count, stats, phase, elapsedSec,
    handleChoice,
  };
}
