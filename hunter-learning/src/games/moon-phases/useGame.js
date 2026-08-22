import { useState, useRef, useCallback } from 'react';
import { PHASES, phaseKeysForDifficulty, angleMatchesPhase } from './data';
import { shuffle, delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { useSpeech } from '../../hooks/useSpeech';

const nameOf = key => PHASES.find(p => p.key === key).name;

// 依 index 決定性地出題（測試可重現）：偶數 place、奇數 identify
export function buildChallenge(difficulty, rngIndex) {
  const keys = phaseKeysForDifficulty(difficulty);
  const targetKey = keys[rngIndex % keys.length];
  const kind = rngIndex % 2 === 0 ? 'place' : 'identify';
  if (kind === 'place') return { kind, targetKey };
  // identify：四選一（不足則用全部），一定含正解
  const distractors = shuffle(keys.filter(k => k !== targetKey));
  const take = Math.min(3, distractors.length);
  const choices = shuffle([targetKey, ...distractors.slice(0, take)]);
  return { kind, targetKey, choices };
}

export function useGame({ difficulty = 'easy', count = 8 }) {
  const [phase, setPhase]       = useState('sandbox');
  const [angle, setAngle]       = useState(180); // 沙盒初始給滿月，好看
  const [currentQ, setCurrentQ] = useState(0);
  const [stats, setStats]       = useState({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const locked    = useRef(false);
  const startTime = useRef(Date.now());
  const sound     = useSound();
  const speak     = useSpeech();

  const loadQuestion = useCallback((idx) => {
    const c = buildChallenge(difficulty, idx);
    setChallenge(c);
    setFeedback(null);
    // place 題把月亮放回新月起點讓 Hunter 自己拖；identify 題擺在目標 canonical 角度
    if (c.kind === 'place') {
      setAngle(0);
    } else {
      const target = PHASES.find(p => p.key === c.targetKey);
      setAngle(target.angles[0]);
    }
  }, [difficulty]);

  const startChallenge = useCallback(() => {
    setPhase('playing');
    setCurrentQ(0);
    setStats({ correct: 0, wrong: 0 });
    startTime.current = Date.now();
    loadQuestion(0);
  }, [loadQuestion]);

  const finishAnswer = useCallback(async (isCorrect) => {
    setFeedback({ correct: isCorrect });
    if (isCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    }
    await delay(isCorrect ? 900 : 1100);
    const next = currentQ + 1;
    setCurrentQ(next);
    if (next >= count) {
      sound.victory();
      setPhase('result');
    } else {
      loadQuestion(next);
    }
    locked.current = false;
  }, [currentQ, count, sound, loadQuestion]);

  const submitPlacement = useCallback(() => {
    if (locked.current || !challenge || challenge.kind !== 'place' || feedback) return;
    locked.current = true;
    return finishAnswer(angleMatchesPhase(angle, challenge.targetKey));
  }, [challenge, angle, feedback, finishAnswer]);

  const handleIdentify = useCallback((phaseKey) => {
    if (locked.current || !challenge || challenge.kind !== 'identify' || feedback) return;
    locked.current = true;
    const correct = phaseKey === challenge.targetKey;
    if (correct) speak(nameOf(challenge.targetKey), 'zh-TW');
    return finishAnswer(correct);
  }, [challenge, feedback, finishAnswer, speak]);

  const stars = (() => {
    const { correct, wrong } = stats;
    const total = correct + wrong;
    if (total === 0) return 3;
    const pct = wrong / total;
    if (pct === 0)  return 3;
    if (pct <= 0.2) return 2;
    if (pct <= 0.5) return 1;
    return 0;
  })();
  const TITLES = ['再試一次！', '繼續練習！', '非常好！', '完美！'];
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    phase, angle, currentQ, count, stats, feedback, challenge,
    stars, title: TITLES[stars], elapsedSec, difficulty,
    setAngle, startChallenge, submitPlacement, handleIdentify,
    targetName: challenge ? nameOf(challenge.targetKey) : '',
    // 測試用：直接設定當前題目
    _debugSetChallenge: (c) => { setChallenge(c); setFeedback(null); },
  };
}
