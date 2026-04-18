import { useState, useRef, useCallback } from 'react';
import { rand, delay } from '../../utils/math';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { useSound } from '../../hooks/useSound';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genQuestion() {
  const given = rand(1, 9);
  const correct = 10 - given;
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const c = rand(0, 10);
    if (c !== correct) wrongs.add(c);
  }
  return { given, correct, choices: shuffle([correct, ...wrongs]) };
}

// Generate 4 unique make-10 pairs, flattened & shuffled into tiles
function genTiles() {
  const used = new Set();
  const nums = [];
  while (nums.length < 8) {
    const a = rand(1, 9);
    const b = 10 - a;
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (!used.has(key)) {
      used.add(key);
      nums.push(a, b);
    }
  }
  return shuffle(nums).map((v, id) => ({ id, value: v, matched: false }));
}

export function useGame({ mode, count }) {
  const sound    = useSound();
  const startTime = useRef(Date.now());
  const locked   = useRef(false);

  // Shared
  const [phase, setPhase]   = useState('playing');
  const [stats, setStats]   = useState({ correct: 0, wrong: 0 });

  // Choose mode
  const [question, setQuestion] = useState(genQuestion);
  const [currentQ, setCurrentQ] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const currentQRef = useRef(0);
  currentQRef.current = currentQ;

  // Match mode
  const [tiles, setTiles]         = useState(() => mode === 'match' ? genTiles() : []);
  const [selId, setSelId]         = useState(null);
  const [wrongPair, setWrongPair] = useState(null); // [id, id] | null
  const [matchCount, setMatchCount] = useState(0);
  const selIdRef       = useRef(null);
  const matchCountRef  = useRef(0);
  const tilesRef       = useRef(tiles);
  tilesRef.current     = tiles;
  selIdRef.current     = selId;
  matchCountRef.current = matchCount;

  // ── Choose mode handler ────────────────────────────────────────────────────
  const handleAnswer = useCallback(async (choice) => {
    if (locked.current || mode !== 'choose') return;
    locked.current = true;

    const isCorrect = choice === question.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    isCorrect ? sound.correct() : sound.wrong();
    setStats(s => ({ ...s, ...(isCorrect ? { correct: s.correct + 1 } : { wrong: s.wrong + 1 }) }));

    await delay(isCorrect ? 380 : 700);
    setFeedback(null);

    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(200);
      sound.victory();
      setPhase('result');
    } else {
      setQuestion(genQuestion());
    }
    locked.current = false;
  }, [mode, count, question, sound]);

  // ── Match mode handler ─────────────────────────────────────────────────────
  const handleTap = useCallback(async (tileId) => {
    if (locked.current || mode !== 'match') return;

    const curTiles = tilesRef.current;
    const tile = curTiles.find(t => t.id === tileId);
    if (!tile || tile.matched) return;

    const curSel = selIdRef.current;

    if (curSel === null) {
      setSelId(tileId);
      selIdRef.current = tileId;
      return;
    }
    if (curSel === tileId) {
      setSelId(null);
      selIdRef.current = null;
      return;
    }

    const selTile = curTiles.find(t => t.id === curSel);
    if (!selTile) {
      setSelId(tileId);
      selIdRef.current = tileId;
      return;
    }

    setSelId(null);
    selIdRef.current = null;

    if (selTile.value + tile.value === 10) {
      locked.current = true;
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      setTiles(ts => ts.map(t =>
        t.id === tileId || t.id === curSel ? { ...t, matched: true } : t,
      ));

      const newCount = matchCountRef.current + 1;
      setMatchCount(newCount);
      matchCountRef.current = newCount;

      if (newCount >= count) {
        await delay(500);
        sound.victory();
        setPhase('result');
      } else {
        // All 4 pairs in current round matched?
        const willBeAllDone = curTiles.every(t =>
          t.matched || t.id === tileId || t.id === curSel,
        );
        if (willBeAllDone) {
          await delay(550);
          const next = genTiles();
          setTiles(next);
          tilesRef.current = next;
        }
      }
      locked.current = false;
    } else {
      locked.current = true;
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
      setWrongPair([curSel, tileId]);
      await delay(660);
      setWrongPair(null);
      locked.current = false;
    }
  }, [mode, count, sound]);

  const stars      = calculateStars(stats.correct, stats.wrong);
  const title      = getResultTitle(stars, true);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    // choose
    question, currentQ, feedback, handleAnswer,
    // match
    tiles, selId, wrongPair, matchCount, handleTap,
    // shared
    phase, stats, stars, title, elapsedSec,
  };
}
