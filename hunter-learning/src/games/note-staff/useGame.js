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
  const wrongRef    = useRef([]); // 答錯的音符(供結算頁訂正)

  const currentNote = notes[noteIdx];

  // 共用的判定流程:handleAnswer(手動作答)與 handleTimeout(逾時)都走這裡。
  // value=null 表示逾時:不標示錯誤按鍵,只公布正確答案。
  const resolve = useCallback(async (isCorrect, value) => {
    const cur = notesRef.current[noteIdxRef.current];

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect && value != null) setWrongValue(value);

    setStatuses(prev => {
      const next = [...prev];
      next[noteIdxRef.current] = isCorrect ? 'correct' : 'wrong';
      return next;
    });

    if (isCorrect) {
      sound.playNote(cur.midi, 0.55);
    } else {
      sound.wrong();
      wrongRef.current.push({ note: cur });
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
  }, [clefMode, count, noteCount, sound]);

  const handleAnswer = useCallback((value) => {
    if (locked.current) return;
    locked.current = true;

    const cur = notesRef.current[noteIdxRef.current];
    const isCorrect = answerMode === 'name'
      ? value === cur.solfege
      : value === cur.midi;

    return resolve(isCorrect, value);
  }, [answerMode, resolve]);

  // 限時模式:10 秒未作答 → 該音符算錯
  const handleTimeout = useCallback(() => {
    if (locked.current) return;
    locked.current = true;
    return resolve(false, null);
  }, [resolve]);

  const stars      = calculateStars(stats.correct, stats.wrong);
  const title      = getResultTitle(stars, true);
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    phase, stats, currentQ, notes, noteIdx, statuses,
    note: currentNote,
    feedback, wrongValue, handleAnswer, handleTimeout,
    stars, title, elapsedSec,
    wrong: wrongRef.current,
  };
}
