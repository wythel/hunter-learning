import { useState, useRef, useCallback } from 'react';
import { generateArith, delay } from '../../utils/math';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { useSound } from '../../hooks/useSound';
import { MONSTERS, PLAYER_SVG } from './sprites';

export function useGame({ difficulty, count }) {
  const [question, setQuestion]           = useState(() => generateArith(difficulty));
  const [answer, setAnswer]               = useState('');
  const [phase, setPhase]                 = useState('playing');
  const [currentQ, setCurrentQ]           = useState(0);
  const [stats, setStats]                 = useState({ correct: 0, wrong: 0 });
  const [playerHP, setPlayerHP]           = useState(3);
  const [monsterIdx, setMonsterIdx]       = useState(0);
  const [monsterHP, setMonsterHP]         = useState(3);
  const [monsterFlash, setMonsterFlash]   = useState(false);
  const [playerFlash, setPlayerFlash]     = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [monsterAttacking, setMonsterAttacking] = useState(false);
  const [completed, setCompleted]         = useState(true);

  const locked        = useRef(false);
  const answerRef     = useRef('');
  const questionRef   = useRef(question);
  const currentQRef   = useRef(0);
  const playerHPRef   = useRef(3);
  const monsterHPRef  = useRef(3);
  const startTime     = useRef(Date.now());
  const sound         = useSound();

  // Keep refs in sync
  questionRef.current  = question;
  currentQRef.current  = currentQ;
  playerHPRef.current  = playerHP;
  monsterHPRef.current = monsterHP;

  const handleKey = useCallback(async (key) => {
    if (locked.current) return;

    if (key === 'back') {
      answerRef.current = answerRef.current.slice(0, -1);
      setAnswer(answerRef.current);
      sound.click();
      return;
    }
    if (key !== 'ok') {
      if (answerRef.current.length >= 3) return;
      answerRef.current = answerRef.current + key;
      setAnswer(answerRef.current);
      sound.click();
      return;
    }

    // Submit
    const a = answerRef.current;
    const ans = parseInt(a, 10);
    if (!a || isNaN(ans)) return;

    locked.current = true;
    const isCorrect = ans === questionRef.current.answer;
    const newQ = currentQRef.current + 1;

    answerRef.current = '';
    setAnswer('');

    if (isCorrect) {
      sound.correct();
      setPlayerAttacking(true);
      await delay(350);
      setPlayerAttacking(false);
      setMonsterFlash(true);
      await delay(400);
      setMonsterFlash(false);

      setStats(s => ({ ...s, correct: s.correct + 1 }));
      const nextMonsterHP = monsterHPRef.current - 1;
      if (nextMonsterHP <= 0) {
        setMonsterIdx(i => (i + 1) % MONSTERS.length);
        setMonsterHP(3);
        monsterHPRef.current = 3;
      } else {
        setMonsterHP(nextMonsterHP);
        monsterHPRef.current = nextMonsterHP;
      }
    } else {
      sound.wrong();
      setMonsterAttacking(true);
      await delay(350);
      setMonsterAttacking(false);
      setPlayerFlash(true);
      await delay(400);
      setPlayerFlash(false);

      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      const nextHP = playerHPRef.current - 1;
      setPlayerHP(nextHP);
      if (nextHP <= 0) {
        setCompleted(false);
        await delay(500);
        sound.gameOver();
        await delay(700);
        setPhase('result');
        locked.current = false;
        return;
      }
    }

    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(400);
      sound.victory();
      setPhase('result');
    } else {
      const next = generateArith(difficulty);
      questionRef.current = next;
      setQuestion(next);
    }

    locked.current = false;
  }, [count, difficulty, sound]);

  const stars = calculateStars(stats.correct, stats.wrong);
  const title = getResultTitle(stars, completed);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);
  const monster = MONSTERS[monsterIdx];

  return {
    question, answer, phase, currentQ, stats, playerHP,
    monster, monsterHP, monsterMaxHP: 3, playerSvg: PLAYER_SVG,
    monsterFlash, playerFlash, playerAttacking, monsterAttacking,
    stars, title, elapsedSec, handleKey,
  };
}
