import { useState, useRef, useCallback } from 'react';
import { rand, delay } from '../../utils/math';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { useSound } from '../../hooks/useSound';
import { MONSTERS, PLAYER_SVG } from '../math-battle/sprites';

function generateChainQuestion(operation, difficulty) {
  const max = difficulty === 'easy' ? 9 : 19;
  const nums = [rand(1, max), rand(1, max), rand(1, max)];
  let ops = [];

  if (operation === 'add')      ops = ['+', '+'];
  else if (operation === 'sub') ops = ['−', '−'];
  else {
    ops = [
      Math.random() < 0.5 ? '+' : '−',
      Math.random() < 0.5 ? '+' : '−',
    ];
  }

  let answer = nums[0];
  for (let i = 0; i < ops.length; i++) {
    answer = ops[i] === '+' ? answer + nums[i + 1] : answer - nums[i + 1];
  }
  if (answer < 0 || answer > 99) return generateChainQuestion(operation, difficulty);

  return { text: `${nums[0]} ${ops[0]} ${nums[1]} ${ops[1]} ${nums[2]}`, answer };
}

export function useGame({ operation, difficulty, count }) {
  const [question, setQuestion]           = useState(() => generateChainQuestion(operation, difficulty));
  const [answer, setAnswer]               = useState('');
  const [phase, setPhase]                 = useState('playing');
  const [currentQ, setCurrentQ]           = useState(0);
  const [stats, setStats]                 = useState({ correct: 0, wrong: 0 });
  const [playerHP, setPlayerHP]           = useState(3);
  const [monsterIdx, setMonsterIdx]       = useState(0);
  const [monsterFlash, setMonsterFlash]   = useState(false);
  const [playerFlash, setPlayerFlash]     = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [monsterAttacking, setMonsterAttacking] = useState(false);
  const [completed, setCompleted]         = useState(true);

  const locked      = useRef(false);
  const answerRef   = useRef('');
  const questionRef = useRef(question);
  const currentQRef = useRef(0);
  const playerHPRef = useRef(3);
  const startTime   = useRef(Date.now());
  const sound       = useSound();

  questionRef.current = question;
  currentQRef.current = currentQ;
  playerHPRef.current = playerHP;

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
      if (newQ % 3 === 0) setMonsterIdx(i => (i + 1) % MONSTERS.length);
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
      const next = generateChainQuestion(operation, difficulty);
      questionRef.current = next;
      setQuestion(next);
    }

    locked.current = false;
  }, [count, operation, difficulty, sound]);

  const stars = calculateStars(stats.correct, stats.wrong);
  const title = getResultTitle(stars, completed);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    question, answer, phase, currentQ, stats, playerHP,
    monster: MONSTERS[monsterIdx], playerSvg: PLAYER_SVG,
    monsterFlash, playerFlash, playerAttacking, monsterAttacking,
    stars, title, elapsedSec, handleKey,
  };
}
