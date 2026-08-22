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

import { useGame, buildChallenge } from '../games/moon-phases/useGame';
import { PHASES } from '../games/moon-phases/data';

const canonOf = key => PHASES.find(p => p.key === key).angles[0];
const wrongKeyEasy = key => ['new', 'half', 'full'].find(k => k !== key);
const wrongAngleEasy = key => (key === 'full' ? 0 : 180); // a canonical angle of another phase

// 依當前題目自動作答（place→拖到正解角度、identify→選正解 key）
async function answerCorrectly(result) {
  const c = result.current.challenge;
  if (c.kind === 'place') {
    act(() => result.current.setAngle(canonOf(c.targetKey)));
    await act(async () => { await result.current.submitPlacement(); });
  } else {
    await act(async () => { await result.current.handleIdentify(c.targetKey); });
  }
}

async function answerWrongly(result) {
  const c = result.current.challenge;
  if (c.kind === 'place') {
    act(() => result.current.setAngle(wrongAngleEasy(c.targetKey)));
    await act(async () => { await result.current.submitPlacement(); });
  } else {
    await act(async () => { await result.current.handleIdentify(wrongKeyEasy(c.targetKey)); });
  }
}

describe('buildChallenge', () => {
  it('easy: valid target, identify includes the answer among 3 choices', () => {
    const easyKeys = ['new', 'half', 'full'];
    for (let i = 0; i < 6; i++) {
      const c = buildChallenge('easy', i);
      expect(easyKeys).toContain(c.targetKey);
      expect(c.kind).toBe(i % 2 === 0 ? 'place' : 'identify');
      if (c.kind === 'identify') {
        expect(c.choices).toContain(c.targetKey);
        expect(c.choices.length).toBe(3); // min(4, 3 keys)
        expect(new Set(c.choices).size).toBe(3);
      }
    }
  });

  it('hard: identify offers 4 unique choices including the answer', () => {
    const hardKeys = ['new', 'crescent', 'half', 'gibbous', 'full'];
    const c = buildChallenge('hard', 1); // odd → identify
    expect(hardKeys).toContain(c.targetKey);
    expect(c.kind).toBe('identify');
    expect(c.choices).toContain(c.targetKey);
    expect(c.choices.length).toBe(4); // min(4, 5 keys)
    expect(new Set(c.choices).size).toBe(4);
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
    expect(result.current.challenge.kind).toBe('place'); // Q0 is always place (even index)
    const target = result.current.challenge.targetKey;
    act(() => result.current.setAngle(canonOf(target)));
    await act(async () => { await result.current.submitPlacement(); });
    expect(result.current.stats.correct).toBe(1);
    expect(result.current.currentQ).toBe(1);
  });

  it('scores a wrong placement', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    const target = result.current.challenge.targetKey;
    act(() => result.current.setAngle(wrongAngleEasy(target)));
    await act(async () => { await result.current.submitPlacement(); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('handleIdentify grades key equality: correct answer counts correct', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 5 }));
    act(() => result.current.startChallenge());
    await answerCorrectly(result); // clear Q0 (place) → advance to Q1 (identify)
    expect(result.current.challenge.kind).toBe('identify');
    const target = result.current.challenge.targetKey;
    await act(async () => { await result.current.handleIdentify(target); });
    expect(result.current.stats.correct).toBe(2);
  });

  it('handleIdentify grades key equality: wrong key counts wrong', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 5 }));
    act(() => result.current.startChallenge());
    await answerCorrectly(result); // clear Q0 → Q1 identify
    expect(result.current.challenge.kind).toBe('identify');
    const target = result.current.challenge.targetKey;
    await act(async () => { await result.current.handleIdentify(wrongKeyEasy(target)); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('all correct → result phase with 3 stars', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 3; i++) await answerCorrectly(result);
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(3);
  });

  it('half wrong → 1 star', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 2 }));
    act(() => result.current.startChallenge());
    await answerCorrectly(result); // 1 right
    await answerWrongly(result);   // 1 wrong → pct 0.5 → 1 star
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(1);
  });

  it('all wrong → 0 stars', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 2 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 2; i++) await answerWrongly(result);
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(0);
  });
});
