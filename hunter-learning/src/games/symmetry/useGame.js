import { useState, useRef, useCallback } from 'react';
import { useSound } from '../../hooks/useSound';
import { getSymmetricShapes, getNonSymmetricShapes } from './ShapeDisplay';

// ─── Utility ────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Mode 1 data ─────────────────────────────────────────────────────────────

// Build a mode-1 question: 4 shapes, one question type
// questionType: 'find-symmetric' (pick the symmetric one among 3 non + 1 sym)
//             | 'find-non-symmetric' (pick the non-symmetric one among 3 sym + 1 non-sym)
function buildMode1Question(questionType) {
  const symmetric    = shuffle(getSymmetricShapes());
  const nonSymmetric = shuffle(getNonSymmetricShapes());

  let shapes;
  let correctIdx;

  if (questionType === 'find-symmetric') {
    // 1 symmetric + 3 non-symmetric
    const target = symmetric[0];
    const others = nonSymmetric.slice(0, 3);
    const pool   = shuffle([target, ...others]);
    correctIdx   = pool.findIndex(s => s.id === target.id);
    shapes       = pool;
  } else {
    // 'find-non-symmetric': 3 symmetric + 1 non-symmetric
    const target = nonSymmetric[0];
    const others = symmetric.slice(0, 3);
    const pool   = shuffle([target, ...others]);
    correctIdx   = pool.findIndex(s => s.id === target.id);
    shapes       = pool;
  }

  return { shapes, correctIdx, questionType };
}

function buildMode1Questions(count, difficulty) {
  const types = shuffle(
    Array.from({ length: count }, (_, i) =>
      i % 2 === 0 ? 'find-symmetric' : 'find-non-symmetric'
    )
  );
  return types.map(t => buildMode1Question(t));
}

// ─── Mode 2 data ─────────────────────────────────────────────────────────────

// Each pattern: boolean[5][2] representing left half [row][col 0 or 1]
const EASY_PATTERNS = [
  // Simple L
  [[1,0],[1,0],[1,0],[1,1],[0,0]],
  // T-bar top
  [[1,1],[0,1],[0,1],[0,1],[0,0]],
  // Step
  [[1,1],[1,0],[0,0],[0,0],[0,0]],
  // Full column
  [[1,0],[1,0],[1,0],[1,0],[1,0]],
  // Heart-like
  [[0,1],[1,1],[1,1],[0,1],[0,0]],
  // Diagonal
  [[1,0],[0,1],[0,0],[0,0],[0,0]],
  // Block
  [[1,1],[1,1],[0,0],[0,0],[0,0]],
  // Corner
  [[1,1],[1,0],[1,0],[0,0],[0,0]],
];

const HARD_PATTERNS = [
  // Cross-like
  [[0,1],[1,1],[0,1],[1,1],[0,1]],
  // Checkerboard-left
  [[1,0],[0,1],[1,0],[0,1],[1,0]],
  // Z-ish
  [[1,1],[0,1],[0,0],[1,0],[1,1]],
  // Snake
  [[1,0],[1,1],[0,1],[0,1],[0,0]],
  // Pyramid
  [[0,0],[1,0],[1,1],[1,1],[1,1]],
  // Arrow
  [[1,0],[1,1],[1,1],[1,0],[1,0]],
  // Plus arm
  [[0,1],[1,1],[1,1],[1,1],[0,1]],
  // Reverse L
  [[0,1],[0,1],[0,1],[1,1],[1,1]],
  // Diamond half
  [[0,0],[1,0],[1,1],[1,0],[0,0]],
  // Grid heavy
  [[1,1],[1,0],[1,1],[1,0],[1,1]],
];

function buildMode2Questions(count, difficulty) {
  const pool = shuffle(difficulty === 'hard' ? HARD_PATTERNS : EASY_PATTERNS);
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push(pool[i % pool.length]);
  }
  return questions;
}

// ─── Empty user grid ──────────────────────────────────────────────────────────

function emptyUserGrid() {
  // [5 rows][2 cols] → col3(idx0) and col4(idx1)
  return Array.from({ length: 5 }, () => [false, false]);
}

// ─── Check if right half matches mirror ──────────────────────────────────────

function checkComplete(pattern, userGrid) {
  // Mirror: left col0 → right col4 (userGrid idx1), left col1 → right col3 (userGrid idx0)
  for (let row = 0; row < 5; row++) {
    if (Boolean(userGrid[row][0]) !== Boolean(pattern[row][1])) return false; // col3 mirrors col1
    if (Boolean(userGrid[row][1]) !== Boolean(pattern[row][0])) return false; // col4 mirrors col0
  }
  return true;
}

// ─── useGame ──────────────────────────────────────────────────────────────────

export function useGame({ mode, difficulty, count }) {
  const sound = useSound();

  // Build question lists once
  const questions = useRef(
    mode === 'mode1'
      ? buildMode1Questions(count, difficulty)
      : buildMode2Questions(count, difficulty)
  );

  const [currentQ,    setCurrentQ]    = useState(0);
  const [phase,       setPhase]       = useState('playing');
  const [stats,       setStats]       = useState({ correct: 0, wrong: 0 });
  const startTime                     = useRef(Date.now());
  const locked                        = useRef(false);

  // Mode 1 state
  const [selected,    setSelected]    = useState(null);
  const [feedback,    setFeedback]    = useState(null); // 'correct' | 'wrong'

  // Mode 2 state
  const [userGrid,    setUserGrid]    = useState(() => emptyUserGrid());
  const [cellFeedback,setCellFeedback]= useState({});
  const [puzzleDone,  setPuzzleDone]  = useState(false);
  const [mistakes,    setMistakes]    = useState(0); // total wrong cells clicked across all puzzles

  const question = questions.current[currentQ];

  // ── Mode 1 handler ──────────────────────────────────────────────────────────
  const handleMode1Choice = useCallback(async (idx) => {
    if (locked.current || feedback !== null) return;
    locked.current = true;

    const isCorrect = idx === question.correctIdx;
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
      setSelected(null);
      setFeedback(null);
    }
    locked.current = false;
  }, [question, currentQ, count, feedback, sound]);

  // ── Mode 2 handler ──────────────────────────────────────────────────────────
  const handleCellClick = useCallback((row, rightIdx) => {
    if (puzzleDone || locked.current) return;

    // Determine expected value: rightIdx 0 = col3 mirrors col1, rightIdx 1 = col4 mirrors col0
    const expected = rightIdx === 0
      ? Boolean(question[row][1])  // col3 should mirror left col1
      : Boolean(question[row][0]); // col4 should mirror left col0

    const fbKey = `${row}-${rightIdx}`;

    // Toggle: if cell is already correctly filled, ignore clicks (it's locked in green)
    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][rightIdx] = !prev[row][rightIdx];
      return next;
    });

    const isCorrect = !userGrid[row][rightIdx] === expected; // toggling ON and it matches expected

    if (!userGrid[row][rightIdx]) {
      // Toggling ON
      if (isCorrect) {
        sound.click();
        setCellFeedback(prev => ({ ...prev, [fbKey]: 'correct' }));
      } else {
        sound.wrong();
        setMistakes(m => m + 1);
        setStats(s => ({ ...s, wrong: s.wrong + 1 }));
        setCellFeedback(prev => ({ ...prev, [fbKey]: 'wrong' }));
        // Clear wrong feedback after a moment
        setTimeout(() => {
          setCellFeedback(prev => {
            const next = { ...prev };
            if (next[fbKey] === 'wrong') delete next[fbKey];
            return next;
          });
          // Also revert the cell
          setUserGrid(prev2 => {
            const next2 = prev2.map(r => [...r]);
            next2[row][rightIdx] = false;
            return next2;
          });
        }, 600);
      }
    } else {
      // Toggling OFF — clear feedback
      setCellFeedback(prev => {
        const next = { ...prev };
        delete next[fbKey];
        return next;
      });
    }
  }, [question, userGrid, puzzleDone, sound]);

  // Check if mode 2 puzzle is complete
  const checkPuzzle = useCallback(() => {
    if (mode !== 'mode2' || puzzleDone || locked.current) return;
    if (checkComplete(question, userGrid)) {
      locked.current = true;
      setPuzzleDone(true);
      sound.match();
      setStats(s => ({ ...s, correct: s.correct + 1 }));

      setTimeout(() => {
        const nextQ = currentQ + 1;
        if (nextQ >= count) {
          sound.victory();
          setPhase('result');
        } else {
          setCurrentQ(nextQ);
          setUserGrid(emptyUserGrid());
          setCellFeedback({});
          setPuzzleDone(false);
        }
        locked.current = false;
      }, 900);
    }
  }, [mode, puzzleDone, question, userGrid, currentQ, count, sound]);

  // Derived
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    question,
    currentQ,
    count,
    phase,
    stats,
    elapsedSec,
    mistakes,
    // mode 1
    selected,
    feedback,
    handleMode1Choice,
    // mode 2
    userGrid,
    cellFeedback,
    puzzleDone,
    handleCellClick,
    checkPuzzle,
  };
}
