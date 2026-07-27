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

import { useGame } from '../games/make-ten/useGame';

describe('useGame (make-ten) timed mode', () => {
  it('choose mode: handleTimeout counts wrong and advances', async () => {
    const { result } = renderHook(() => useGame({ mode: 'choose', count: 8 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.feedback).toBe(null);
  });

  it('choose mode: timeout on last question ends the game', async () => {
    const { result } = renderHook(() => useGame({ mode: 'choose', count: 1 }));
    await act(async () => { await result.current.handleTimeout(); });
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });

  it('match mode: handleTimeout is a no-op', async () => {
    const { result } = renderHook(() => useGame({ mode: 'match', count: 4 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(0);
    expect(result.current.phase).toBe('playing');
  });
});
