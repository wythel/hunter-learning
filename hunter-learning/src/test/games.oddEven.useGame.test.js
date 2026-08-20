import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame } from '../games/odd-even/useGame';

describe('useGame (odd-even) timed mode', () => {
  it('identify mode: handleTimeout counts wrong and advances', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 8 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.feedback).toBe(null);
  });

  it('identify mode: timeout on last question ends the game', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 1 }));
    await act(async () => { await result.current.handleTimeout(); });
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });

  it('sort mode: handleTimeout submits as wrong and advances', async () => {
    const { result } = renderHook(() => useGame({ mode: 'sort', difficulty: 'easy', count: 8 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.submitted).toBe(false);
    expect(result.current.sortResult).toBe(null);
  });

  it('regression: identify handleAnswer still works', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 8 }));
    const isOdd = result.current.number % 2 === 1;
    await act(async () => { await result.current.handleAnswer(isOdd ? 'odd' : 'even'); });
    expect(result.current.stats.correct).toBe(1);
  });
});

describe('useGame (odd-even) 訂正 recording', () => {
  it('identify mode: wrong answer records the number', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 8 }));
    const n = result.current.number;
    const isOdd = n % 2 === 1;
    await act(async () => { await result.current.handleAnswer(isOdd ? 'even' : 'odd'); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.wrong).toHaveLength(1);
    expect(result.current.wrong[0].number).toBe(n);
  });

  it('identify mode: correct answer records nothing', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 8 }));
    const n = result.current.number;
    const isOdd = n % 2 === 1;
    await act(async () => { await result.current.handleAnswer(isOdd ? 'odd' : 'even'); });
    expect(result.current.wrong).toHaveLength(0);
  });

  it('sort mode: records no wrong questions', async () => {
    const { result } = renderHook(() => useGame({ mode: 'sort', difficulty: 'easy', count: 8 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.wrong).toHaveLength(0);
  });
});
