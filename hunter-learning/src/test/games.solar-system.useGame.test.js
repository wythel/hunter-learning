import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({ correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), click: vi.fn(), ready: vi.fn(), teaching: vi.fn() }),
}));
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => vi.fn() }));
vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame, buildChallenge } from '../games/solar-system/useGame';
import { PLANETS, orderIsCorrect } from '../games/solar-system/data';

const wrongKey = key => PLANETS.find(p => p.key !== key).key;

// 依當前題目自動正確作答
async function answerCorrectly(result) {
  const c = result.current.challenge;
  if (c.kind === 'order') {
    const solved = PLANETS.map(p => p.key);
    await act(async () => { await result.current.submitOrder(solved); });
  } else {
    await act(async () => { await result.current.handleChoose(c.targetKey); });
  }
}
async function answerWrongly(result) {
  const c = result.current.challenge;
  if (c.kind === 'order') {
    const bad = PLANETS.map(p => p.key);
    [bad[0], bad[1]] = [bad[1], bad[0]];
    await act(async () => { await result.current.submitOrder(bad); });
  } else {
    await act(async () => { await result.current.handleChoose(wrongKey(c.targetKey)); });
  }
}

describe('buildChallenge', () => {
  it('cycles kind by idx % 3: identify / order / feature', () => {
    expect(buildChallenge('easy', 0).kind).toBe('identify');
    expect(buildChallenge('easy', 1).kind).toBe('order');
    expect(buildChallenge('easy', 2).kind).toBe('feature');
    expect(buildChallenge('easy', 3).kind).toBe('identify');
  });
  it('identify/feature always include the correct answer among 4 choices', () => {
    for (const idx of [0, 2, 3, 5]) {
      const c = buildChallenge('hard', idx);
      expect(c.choices).toContain(c.targetKey);
      expect(c.choices).toHaveLength(4);
      expect(new Set(c.choices).size).toBe(4);
    }
  });
  it('feature challenge carries the target feature as prompt', () => {
    const c = buildChallenge('easy', 2);
    expect(c.kind).toBe('feature');
    expect(c.prompt).toBe(PLANETS.find(p => p.key === c.targetKey).feature);
  });
  it('easy order is a gap challenge; hard order is a full sort', () => {
    const easy = buildChallenge('easy', 1);
    expect(easy.mode).toBe('gap');
    expect(easy.initial).toHaveLength(8);
    expect(easy.initial.filter(x => x === null)).toHaveLength(1);
    expect(easy.tray).toEqual([PLANETS[easy.gapIndex].key]);

    const hard = buildChallenge('hard', 1);
    expect(hard.mode).toBe('full');
    expect(hard.initial).toHaveLength(8);
    expect(new Set(hard.initial).size).toBe(8);
  });
  it('hard order never spawns already-solved', () => {
    expect(orderIsCorrect(buildChallenge('hard', 1).initial)).toBe(false);
  });
});

describe('useGame flow', () => {
  it('starts in explore, enters playing on startChallenge', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 6 }));
    expect(result.current.phase).toBe('explore');
    act(() => result.current.startChallenge());
    expect(result.current.phase).toBe('playing');
    expect(result.current.count).toBe(6);
    expect(result.current.currentQ).toBe(0);
  });

  it('handleChoose: correct key scores correct and advances', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    expect(result.current.challenge.kind).toBe('identify'); // Q0 = idx 0
    await act(async () => { await result.current.handleChoose(result.current.challenge.targetKey); });
    expect(result.current.stats.correct).toBe(1);
    expect(result.current.currentQ).toBe(1);
  });

  it('handleChoose: wrong key scores wrong', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    const target = result.current.challenge.targetKey;
    await act(async () => { await result.current.handleChoose(wrongKey(target)); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('submitOrder: correct arrangement scores correct on the order question', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    await answerCorrectly(result);                       // clear Q0 identify → Q1 order
    expect(result.current.challenge.kind).toBe('order');
    await act(async () => { await result.current.submitOrder(PLANETS.map(p => p.key)); });
    expect(result.current.stats.correct).toBe(2);
  });

  it('submitOrder: wrong arrangement scores wrong', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    await answerCorrectly(result);                       // → Q1 order
    const bad = PLANETS.map(p => p.key);
    [bad[0], bad[1]] = [bad[1], bad[0]];
    await act(async () => { await result.current.submitOrder(bad); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('all correct → result phase with 3 stars', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 3; i++) await answerCorrectly(result);
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(3);
  });

  it('all wrong → 0 stars', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 3; i++) await answerWrongly(result);
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(0);
  });
});
