import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../src/hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), flip: vi.fn(), match: vi.fn(), mismatch: vi.fn(),
    hit: vi.fn(), miss: vi.fn(), tick: vi.fn(), playerAttack: vi.fn(),
    monsterAttack: vi.fn(), monsterDie: vi.fn(), teaching: vi.fn(), ready: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame } from '../games/math-battle/useGame';

describe('useGame (math-battle)', () => {
  it('initial state: phase=playing, currentQ=0, playerHP=3, answer=""', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    expect(result.current.phase).toBe('playing');
    expect(result.current.currentQ).toBe(0);
    expect(result.current.playerHP).toBe(3);
    expect(result.current.answer).toBe('');
  });

  it('handleKey with digit appends to answer', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    await act(async () => { result.current.handleKey('3'); });
    expect(result.current.answer).toBe('3');
    await act(async () => { result.current.handleKey('7'); });
    expect(result.current.answer).toBe('37');
  });

  it('handleKey("back") removes last char', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    await act(async () => { result.current.handleKey('3'); });
    await act(async () => { result.current.handleKey('7'); });
    await act(async () => { result.current.handleKey('back'); });
    expect(result.current.answer).toBe('3');
  });

  it('correct answer increases correct count', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    const correctAnswer = String(result.current.question.answer);
    for (const digit of correctAnswer) {
      await act(async () => { result.current.handleKey(digit); });
    }
    await act(async () => { result.current.handleKey('ok'); });
    await waitFor(() => {
      expect(result.current.stats.correct).toBe(1);
    });
  });

  it('wrong answer increases wrong count and decreases playerHP', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    // Find a definitely wrong answer
    const correctAnswer = result.current.question.answer;
    const wrongAnswer = String(correctAnswer + 100);
    for (const digit of wrongAnswer) {
      await act(async () => { result.current.handleKey(digit); });
    }
    await act(async () => { result.current.handleKey('ok'); });
    await waitFor(() => {
      expect(result.current.stats.wrong).toBe(1);
      expect(result.current.playerHP).toBe(2);
    });
  });

  it('after count correct answers: phase becomes result', async () => {
    const count = 3;
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count }));
    for (let i = 0; i < count; i++) {
      const correctAnswer = String(result.current.question.answer);
      for (const digit of correctAnswer) {
        await act(async () => { result.current.handleKey(digit); });
      }
      await act(async () => { result.current.handleKey('ok'); });
      if (i < count - 1) {
        await waitFor(() => {
          expect(result.current.currentQ).toBe(i + 1);
        });
      }
    }
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });

  it('playerHP=0 leads to result phase', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    for (let i = 0; i < 3; i++) {
      const correctAnswer = result.current.question.answer;
      const wrongAnswer = String(correctAnswer + 100);
      for (const digit of wrongAnswer) {
        await act(async () => { result.current.handleKey(digit); });
      }
      await act(async () => { result.current.handleKey('ok'); });
      if (i < 2) {
        await waitFor(() => {
          expect(result.current.playerHP).toBe(2 - i);
        });
      }
    }
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });
});
