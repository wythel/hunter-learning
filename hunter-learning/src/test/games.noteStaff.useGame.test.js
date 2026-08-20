import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), playNote: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame } from '../games/note-staff/useGame';

describe('useGame (note-staff) timed mode', () => {
  it('handleTimeout marks the note wrong and advances the question', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 1, count: 10 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.wrongValue).toBe(null);
  });

  it('3-note mode: timeout advances to the next note within the question', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 3, count: 10 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.statuses[0]).toBe('wrong');
    expect(result.current.noteIdx).toBe(1);
    expect(result.current.currentQ).toBe(0);
  });

  it('regression: handleAnswer with the correct solfege counts correct', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 1, count: 10 }));
    const correct = result.current.note.solfege;
    await act(async () => { await result.current.handleAnswer(correct); });
    expect(result.current.stats.correct).toBe(1);
  });
});

describe('useGame (note-staff) 訂正 recording', () => {
  it('wrong answer records the note', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 1, count: 10 }));
    const note = result.current.note;
    await act(async () => { await result.current.handleAnswer(note.solfege + '_wrong'); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.wrong).toHaveLength(1);
    expect(result.current.wrong[0].note.solfege).toBe(note.solfege);
    expect(result.current.wrong[0].note.midi).toBe(note.midi);
  });

  it('correct answer records nothing', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 1, count: 10 }));
    const note = result.current.note;
    await act(async () => { await result.current.handleAnswer(note.solfege); });
    expect(result.current.wrong).toHaveLength(0);
  });

  it('timeout records the note as wrong', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 1, count: 10 }));
    const note = result.current.note;
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.wrong).toHaveLength(1);
    expect(result.current.wrong[0].note.solfege).toBe(note.solfege);
  });
});
