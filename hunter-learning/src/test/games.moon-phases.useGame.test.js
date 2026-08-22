import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// 音效與語音在 jsdom 無意義 → mock；delay 立即 resolve 讓非同步推進可同步斷言
vi.mock('../hooks/useSound', () => ({
  useSound: () => ({ correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), click: vi.fn(), ready: vi.fn(), teaching: vi.fn() }),
}));
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => vi.fn() }));
vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame, buildChallenge } from '../games/moon-phases/useGame';

describe('buildChallenge', () => {
  it('produces a valid target within the difficulty set', () => {
    const easyKeys = ['new', 'half', 'full'];
    for (let i = 0; i < 6; i++) {
      const c = buildChallenge('easy', i);
      expect(easyKeys).toContain(c.targetKey);
      expect(['place', 'identify']).toContain(c.kind);
      if (c.kind === 'identify') {
        expect(c.choices).toContain(c.targetKey);
        expect(c.choices.length).toBe(Math.min(4, easyKeys.length));
      }
    }
  });
});

describe('useGame challenge flow', () => {
  it('starts in sandbox and enters playing on startChallenge', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 5 }));
    expect(result.current.phase).toBe('sandbox');
    act(() => result.current.startChallenge());
    expect(result.current.phase).toBe('playing');
    expect(result.current.count).toBe(5);
  });

  it('scores a correct placement and advances', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    // 強制當前題為 place full，避免隨機性
    act(() => result.current._debugSetChallenge({ kind: 'place', targetKey: 'full' }));
    act(() => result.current.setAngle(180));
    await act(async () => { await result.current.submitPlacement(); });
    expect(result.current.stats.correct).toBe(1);
    expect(result.current.currentQ).toBe(1);
  });

  it('scores a wrong placement', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    act(() => result.current._debugSetChallenge({ kind: 'place', targetKey: 'full' }));
    act(() => result.current.setAngle(0)); // 新月位置，非滿月
    await act(async () => { await result.current.submitPlacement(); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('reaches result after count questions', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 2 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 2; i++) {
      act(() => result.current._debugSetChallenge({ kind: 'place', targetKey: 'full' }));
      act(() => result.current.setAngle(180));
      await act(async () => { await result.current.submitPlacement(); });
    }
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(3);
  });
});
