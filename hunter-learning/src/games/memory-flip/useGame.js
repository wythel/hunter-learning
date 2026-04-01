import { useState, useRef, useCallback } from 'react';
import { shuffle } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { EN_ZH_PAIRS, MATH_PAIRS, ZH_EN_PAIRS } from '../../utils/data/cardPairs';

function buildCards(pairType, difficulty) {
  const pairs = difficulty === 'easy' ? 6 : 8;
  let source;
  if (pairType === 'math')       source = MATH_PAIRS;
  else if (pairType === 'zh-en') source = ZH_EN_PAIRS;
  else                           source = EN_ZH_PAIRS;

  const selected = shuffle(source).slice(0, pairs);
  const cards = [];
  selected.forEach((p, pairId) => {
    cards.push({ id: cards.length, pairId, text: p.a });
    cards.push({ id: cards.length, pairId, text: p.b });
  });
  return shuffle(cards);
}

export function useGame({ pairType, difficulty }) {
  const pairs = difficulty === 'easy' ? 6 : 8;
  const cols  = difficulty === 'easy' ? 3 : 4;

  const [cards, setCards]       = useState(() => buildCards(pairType, difficulty));
  const [flipped, setFlipped]   = useState([]);   // indices currently face-up
  const [matched, setMatched]   = useState(new Set());
  const [mismatch, setMismatch] = useState([]);
  const [flips, setFlips]       = useState(0);
  const [phase, setPhase]       = useState('playing');

  const locked    = useRef(false);
  const startTime = useRef(Date.now());
  const sound     = useSound();

  const handleFlip = useCallback(async (idx) => {
    if (locked.current) return;
    if (flipped.includes(idx)) return;
    if (matched.has(idx)) return;

    sound.flip();
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length < 2) return;

    locked.current = true;
    setFlips(f => f + 1);

    const [i1, i2] = newFlipped;
    setFlipped([i1, i2]);

    await new Promise(r => setTimeout(r, 400));

    if (cards[i1].pairId === cards[i2].pairId) {
      sound.match();
      const newMatched = new Set(matched);
      newMatched.add(i1);
      newMatched.add(i2);
      setMatched(newMatched);
      setFlipped([]);

      if (newMatched.size >= pairs * 2) {
        await new Promise(r => setTimeout(r, 500));
        sound.victory();
        setPhase('result');
      }
    } else {
      sound.mismatch();
      setMismatch([i1, i2]);
      await new Promise(r => setTimeout(r, 700));
      setMismatch([]);
      setFlipped([]);
    }

    locked.current = false;
  }, [cards, flipped, matched, pairs, sound]);

  const ratio = flips / pairs;
  let stars;
  if (ratio <= 1.5)      stars = 3;
  else if (ratio <= 2.5) stars = 2;
  else if (ratio <= 4)   stars = 1;
  else                   stars = 0;

  const TITLES = ['再試試看！', '繼續練習！', '做得很好！', '記憶力超強！'];
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    cards, flipped, matched, mismatch, flips, pairs, cols,
    phase, stars, title: TITLES[stars], elapsedSec,
    handleFlip,
  };
}
