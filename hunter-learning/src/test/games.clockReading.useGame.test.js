import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../src/hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), flip: vi.fn(), match: vi.fn(), mismatch: vi.fn(),
    hit: vi.fn(), miss: vi.fn(), tick: vi.fn(), playerAttack: vi.fn(),
    monsterAttack: vi.fn(), monsterDie: vi.fn(), teaching: vi.fn(), ready: vi.fn(),
  }),
}));

import { useGame } from '../games/clock-reading/useGame';

// Test generateQuestion indirectly via the hook
describe('useGame (clock-reading) - question generation', () => {
  it('difficulty=hour: minute is always 0 (run 20 times)', () => {
    for (let i = 0; i < 20; i++) {
      const { result } = renderHook(() => useGame({ mode: 'read', difficulty: 'hour', count: 10 }));
      expect(result.current.question.minute).toBe(0);
    }
  });

  it('difficulty=half: minute is 0 or 30 (run 20 times)', () => {
    for (let i = 0; i < 20; i++) {
      const { result } = renderHook(() => useGame({ mode: 'read', difficulty: 'half', count: 10 }));
      const m = result.current.question.minute;
      expect([0, 30]).toContain(m);
    }
  });

  it('difficulty=precise: minute is multiple of 5 (run 20 times)', () => {
    for (let i = 0; i < 20; i++) {
      const { result } = renderHook(() => useGame({ mode: 'read', difficulty: 'precise', count: 10 }));
      expect(result.current.question.minute % 5).toBe(0);
    }
  });
});

describe('useGame (clock-reading) - mode 1 (read)', () => {
  it('choices has 4 items', () => {
    const { result } = renderHook(() => useGame({ mode: 'read', difficulty: 'hour', count: 5 }));
    expect(result.current.choices).toHaveLength(4);
  });

  it('exactly one choice matches question', () => {
    const { result } = renderHook(() => useGame({ mode: 'read', difficulty: 'hour', count: 5 }));
    const { question, choices } = result.current;
    const matching = choices.filter(c => c.hour === question.hour && c.minute === question.minute);
    expect(matching).toHaveLength(1);
  });

  it('handleChoice(correct) → stats.correct++ and moves to next', async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useGame({ mode: 'read', difficulty: 'hour', count: 5 }));
      const { question, choices } = result.current;
      const correctIdx = choices.findIndex(c => c.hour === question.hour && c.minute === question.minute);
      await act(async () => {
        result.current.handleChoice(correctIdx);
        await vi.advanceTimersByTimeAsync(1200);
      });
      expect(result.current.stats.correct).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('handleChoice(wrong) → stats.wrong++', async () => {
    const { result } = renderHook(() => useGame({ mode: 'read', difficulty: 'hour', count: 5 }));
    const { question, choices } = result.current;
    const correctIdx = choices.findIndex(c => c.hour === question.hour && c.minute === question.minute);
    const wrongIdx = correctIdx === 0 ? 1 : 0;
    await act(async () => {
      result.current.handleChoice(wrongIdx);
    });
    await waitFor(() => {
      expect(result.current.stats.wrong).toBe(1);
    }, { timeout: 3000 });
  });
});

describe('useGame (clock-reading) - mode 2 (set)', () => {
  it('handleClockClick({type:hour, value:3}) sets setHour=3', async () => {
    const { result } = renderHook(() => useGame({ mode: 'set', difficulty: 'hour', count: 5 }));
    await act(async () => {
      result.current.handleClockClick({ type: 'hour', value: 3 });
    });
    expect(result.current.setHour).toBe(3);
  });

  it('difficulty=hour: confirmActive=true after hour tap', async () => {
    const { result } = renderHook(() => useGame({ mode: 'set', difficulty: 'hour', count: 5 }));
    await act(async () => {
      result.current.handleClockClick({ type: 'hour', value: 5 });
    });
    expect(result.current.confirmActive).toBe(true);
  });

  it('handleConfirm with correct answer: stats.correct++', async () => {
    const { result } = renderHook(() => useGame({ mode: 'set', difficulty: 'hour', count: 5 }));
    const { question } = result.current;
    // Set hour (for difficulty=hour, minute auto-set to 0)
    await act(async () => {
      result.current.handleClockClick({ type: 'hour', value: question.hour });
    });
    await waitFor(() => {
      expect(result.current.confirmActive).toBe(true);
    });
    await act(async () => {
      result.current.handleConfirm();
    });
    await waitFor(() => {
      expect(result.current.stats.correct).toBe(1);
    }, { timeout: 3000 });
  });

  it('handleConfirm with wrong answer: stats.wrong++', async () => {
    const { result } = renderHook(() => useGame({ mode: 'set', difficulty: 'hour', count: 5 }));
    const { question } = result.current;
    const wrongHour = question.hour === 12 ? 1 : question.hour + 1;
    await act(async () => {
      result.current.handleClockClick({ type: 'hour', value: wrongHour });
    });
    await waitFor(() => {
      expect(result.current.confirmActive).toBe(true);
    });
    await act(async () => {
      result.current.handleConfirm();
    });
    await waitFor(() => {
      expect(result.current.stats.wrong).toBe(1);
    }, { timeout: 3000 });
  });
});
