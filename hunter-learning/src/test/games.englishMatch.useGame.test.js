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

import { useGame } from '../games/english-match/useGame';

describe('useGame (english-match)', () => {
  it('initial: phase=playing, currentQ=0', () => {
    const { result } = renderHook(() => useGame({ topic: 'animals', count: 5 }));
    expect(result.current.phase).toBe('playing');
    expect(result.current.currentQ).toBe(0);
  });

  it('choices has 4 items', () => {
    const { result } = renderHook(() => useGame({ topic: 'animals', count: 5 }));
    expect(result.current.choices).toHaveLength(4);
  });

  it('question has emoji, zh, en', () => {
    const { result } = renderHook(() => useGame({ topic: 'animals', count: 5 }));
    expect(result.current.question.emoji).toBeDefined();
    expect(result.current.question.zh).toBeDefined();
    expect(result.current.question.en).toBeDefined();
  });

  it('correctIdx always points to the correct answer in choices array', () => {
    const { result } = renderHook(() => useGame({ topic: 'animals', count: 5 }));
    const { choices, correctIdx, question } = result.current;
    expect(choices[correctIdx].en).toBe(question.en);
  });

  it('handleChoice(correctIdx) → stats.correct increases', async () => {
    const { result } = renderHook(() => useGame({ topic: 'animals', count: 5 }));
    const { correctIdx } = result.current;
    await act(async () => {
      result.current.handleChoice(correctIdx);
    });
    await waitFor(() => {
      expect(result.current.stats.correct).toBe(1);
    }, { timeout: 2000 });
  });

  it('handleChoice with wrong index → stats.wrong increases', async () => {
    const { result } = renderHook(() => useGame({ topic: 'animals', count: 5 }));
    const { correctIdx } = result.current;
    const wrongIdx = correctIdx === 0 ? 1 : 0;
    await act(async () => {
      result.current.handleChoice(wrongIdx);
    });
    await waitFor(() => {
      expect(result.current.stats.wrong).toBe(1);
    }, { timeout: 2000 });
  });

  it('after count questions: phase=result', async () => {
    const count = 2;
    const { result } = renderHook(() => useGame({ topic: 'animals', count }));
    for (let i = 0; i < count; i++) {
      const { correctIdx } = result.current;
      await act(async () => {
        result.current.handleChoice(correctIdx);
      });
      if (i < count - 1) {
        await waitFor(() => {
          expect(result.current.currentQ).toBe(i + 1);
        }, { timeout: 2000 });
      }
    }
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    }, { timeout: 2000 });
  });
});
