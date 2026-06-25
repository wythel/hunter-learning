import { useState, useRef, useCallback } from 'react';
import { delay } from '../../utils/math';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import { useSound } from '../../hooks/useSound';
import { getNotePool, TREBLE_NOTES, BASS_NOTES } from './notes';

function pickOne(pool, prevId) {
  let pick;
  let attempts = 0;
  do {
    pick = pool[Math.floor(Math.random() * pool.length)];
    attempts++;
  } while (pick.id === prevId && attempts < 6);
  return pick;
}

// In mixed mode each *question* picks one clef so all notes in the question
// share a staff. This avoids needing to render two staves at once.
function pickQuestion(clefMode, noteCount, prevLastId) {
  let pool;
  if (clefMode === 'mixed') {
    pool = Math.random() < 0.5 ? TREBLE_NOTES : BASS_NOTES;
  } else {
    pool = getNotePool(clefMode);
  }
  const notes = [];
  let lastId = prevLastId;
  for (let i = 0; i < noteCount; i++) {
    const n = pickOne(pool, lastId);
    notes.push(n);
    lastId = n.id;
  }
  return notes;
}

export function useGame({
  clefMode   = 'treble',
  answerMode = 'name',
  noteCount  = 1,
  count      = 10,
}) {
  const sound      = useSound();
  const startTime  = useRef(Date.now());
  const locked     = useRef(false);

  const [phase, setPhase]       = useState('playing');
  const [stats, setStats]       = useState({ correct: 0, wrong: 0 });
  const [currentQ, setCurrentQ] = useState(0);
  const [notes, setNotes]       = useState(() => pickQuestion(clefMode, noteCount, null));
  const [noteIdx, setNoteIdx]   = useState(0);
  // statuses: 'pending' | 'correct' | 'wrong', one per note
  const [statuses, setStatuses] = useState(() => Array(noteCount).fill('pending'));
  const [feedback, setFeedback]     = useState(null); // null | 'correct' | 'wrong'
  const [wrongValue, setWrongValue] = useState(null);

  const currentQRef = useRef(0);  currentQRef.current = currentQ;
  const notesRef    = useRef(notes); notesRef.current = notes;
  const noteIdxRef  = useRef(0);  noteIdxRef.current = noteIdx;

  const currentNote = notes[noteIdx];

  const handleAnswer = useCallback(async (value) => {
    if (locked.current) return;
    locked.current = true;

    const cur = notesRef.current[noteIdxRef.current];
    const isCorrect = answerMode === 'name'
      ? value === cur.solfege
      : value === cur.midi;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) setWrongValue(value);

    setStatuses(prev => {
      const next = [...prev];
      next[noteIdxRef.current] = isCorrect ? 'correct' : 'wrong';
      return next;
    });

    if (isCorrect) {
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

    const nextNoteIdx = noteIdxRef.current + 1;

    if (nextNoteIdx < noteCount) {
      // Still more notes in this question
      setNoteIdx(nextNoteIdx);
      locked.current = false;
      return;
    }

    // Question complete — show all results briefly then advance
    await delay(450);

    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(200);
      sound.victory();
      setPhase('result');
      locked.current = false;
      return;
    }

    const prevLastId = notesRef.current[notesRef.current.length - 1]?.id;
    const nextNotes = pickQuestion(clefMode, noteCount, prevLastId);
    setNotes(nextNotes);
    setStatuses(Array(noteCount).fill('pending'));
    setNoteIdx(0);
    notesRef.current = nextNotes;
    noteIdxRef.current = 0;

    locked.current = false;
  }, [answerMode, clefMode, count, noteCount, sound]);

  const stars      = calculateStars(stats.correct, stats.wrong);
  const title      = getResultTitle(stars, true);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    phase, stats, currentQ, notes, noteIdx, statuses,
    note: currentNote,
    feedback, wrongValue, handleAnswer,
    stars, title, elapsedSec,
  };
}
