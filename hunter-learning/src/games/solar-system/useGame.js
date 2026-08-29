import { useState, useRef, useCallback } from 'react';
import { PLANETS, planetByKey, buildDistractorKeys, orderIsCorrect } from './data';
import { shuffle, delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { useSpeech } from '../../hooks/useSpeech';

const KINDS = ['identify', 'order', 'feature'];

// 依 idx 決定性挑題型與目標；四選一與排序內容用 shuffle 隨機（測試只斷言成員/長度）。
export function buildChallenge(difficulty, idx) {
  const kind = KINDS[idx % KINDS.length];
  if (kind === 'identify') {
    const target = PLANETS[idx % PLANETS.length];
    return { kind, targetKey: target.key, choices: buildDistractorKeys(target.key, difficulty) };
  }
  if (kind === 'feature') {
    const target = PLANETS[idx % PLANETS.length];
    return {
      kind, targetKey: target.key,
      choices: buildDistractorKeys(target.key, difficulty),
      prompt: target.feature,
    };
  }
  // order
  if (difficulty === 'hard') {
    return { kind, mode: 'full', initial: shuffle(PLANETS.map(p => p.key)) };
  }
  const gapIndex = idx % PLANETS.length;
  const gapKey = PLANETS[gapIndex].key;
  const others = shuffle(PLANETS.filter(p => p.key !== gapKey).map(p => p.key)).slice(0, 2);
  const tray = shuffle([gapKey, ...others]);
  const initial = PLANETS.map((p, i) => (i === gapIndex ? null : p.key));
  return { kind, mode: 'gap', gapIndex, tray, initial };
}

export function useGame({ difficulty = 'easy', count = 9 }) {
  const [phase, setPhase]       = useState('explore');
  const [currentQ, setCurrentQ] = useState(0);
  const [stats, setStats]       = useState({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const locked    = useRef(false);
  const startTime = useRef(Date.now());
  const sound     = useSound();
  const speak     = useSpeech();

  const loadQuestion = useCallback((idx) => {
    setChallenge(buildChallenge(difficulty, idx));
    setFeedback(null);
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
    if (isCorrect) { sound.correct(); setStats(s => ({ ...s, correct: s.correct + 1 })); }
    else           { sound.wrong();   setStats(s => ({ ...s, wrong:   s.wrong   + 1 })); }
    await delay(isCorrect ? 900 : 1100);
    const next = currentQ + 1;
    setCurrentQ(next);
    if (next >= count) { sound.victory(); setPhase('result'); }
    else               { loadQuestion(next); }
    locked.current = false;
  }, [currentQ, count, sound, loadQuestion]);

  const handleChoose = useCallback((key) => {
    if (locked.current || !challenge || feedback) return;
    if (challenge.kind !== 'identify' && challenge.kind !== 'feature') return;
    locked.current = true;
    const correct = key === challenge.targetKey;
    if (correct) speak(planetByKey(challenge.targetKey).name, 'zh-TW');
    return finishAnswer(correct);
  }, [challenge, feedback, finishAnswer, speak]);

  const submitOrder = useCallback((arrangement) => {
    if (locked.current || !challenge || challenge.kind !== 'order' || feedback) return;
    locked.current = true;
    return finishAnswer(orderIsCorrect(arrangement));
  }, [challenge, feedback, finishAnswer]);

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
    phase, currentQ, count, stats, feedback, challenge,
    stars, title: TITLES[stars], elapsedSec, difficulty,
    startChallenge, handleChoose, submitOrder,
    targetName: challenge ? planetByKey(challenge.targetKey)?.name ?? '' : '',
  };
}
