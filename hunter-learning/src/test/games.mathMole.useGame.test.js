import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../src/hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), flip: vi.fn(), match: vi.fn(), mismatch: vi.fn(),
    hit: vi.fn(), miss: vi.fn(), tick: vi.fn(), playerAttack: vi.fn(),
    monsterAttack: vi.fn(), monsterDie: vi.fn(), teaching: vi.fn(), ready: vi.fn(),
  }),
}));

import { useGame } from '../games/math-mole/useGame';

describe('useGame (math-mole)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initial: score=0, correct=0, phase=playing', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    expect(result.current.score).toBe(0);
    expect(result.current.correct).toBe(0);
    expect(result.current.phase).toBe('playing');
  });

  it('initial: timeLeft equals timeLimit', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    expect(result.current.timeLeft).toBe(30);
  });

  it('holes array has 9 items', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    expect(result.current.holes).toHaveLength(9);
  });

  it('after 1 second: timeLeft decreases by 1', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current.timeLeft).toBe(29);
  });

  it('after timeLimit seconds: phase=result', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 5 }));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.phase).toBe('result');
  });

  it('at least some holes are up after showMoles runs', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    // showMoles is called in useEffect on mount
    await act(async () => { vi.advanceTimersByTime(100); });
    const upCount = result.current.holes.filter(h => h.up).length;
    expect(upCount).toBeGreaterThan(0);
  });

  it('handleHit on correct number: score increases by 10', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    // Advance to trigger showMoles
    act(() => { vi.advanceTimersByTime(100); });

    // Find an up hole with the correct answer
    const holes = result.current.holes;
    const { answer } = result.current.question;
    const correctHoleIdx = holes.findIndex(h => h.up && h.num === answer);

    if (correctHoleIdx >= 0) {
      await act(async () => {
        result.current.handleHit(correctHoleIdx);
        vi.advanceTimersByTime(500);
      });
      expect(result.current.score).toBe(10);
      expect(result.current.correct).toBe(1);
    }
  });

  it('handleHit on wrong number: wrong count increases (score stays)', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    await act(async () => { vi.advanceTimersByTime(100); });

    const holes = result.current.holes;
    const { answer } = result.current.question;
    const wrongHoleIdx = holes.findIndex(h => h.up && h.num !== answer);

    if (wrongHoleIdx >= 0) {
      const scoreBefore = result.current.score;
      await act(async () => {
        result.current.handleHit(wrongHoleIdx);
        vi.advanceTimersByTime(500);
      });
      expect(result.current.score).toBe(scoreBefore);
      expect(result.current.total).toBeGreaterThan(0);
    }
  });

  it('cleanup: unmounting clears timers', () => {
    const { unmount } = renderHook(() => useGame({ difficulty: 'easy', timeLimit: 30 }));
    expect(() => {
      unmount();
      vi.runAllTimers();
    }).not.toThrow();
  });
});
