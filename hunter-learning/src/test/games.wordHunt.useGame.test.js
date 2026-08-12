import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), flip: vi.fn(), match: vi.fn(), mismatch: vi.fn(),
  }),
}));

const { speakSpy } = vi.hoisted(() => ({ speakSpy: vi.fn() }));
vi.mock('../hooks/useSpeech', () => ({
  useSpeech: () => speakSpy,
}));

beforeEach(() => {
  speakSpy.mockClear();
});

// keep shuffle real, make delay resolve instantly so advancing is fast
vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame } from '../games/word-hunt/useGame';
import { EN_CONFUSABLES } from '../utils/data/confusables';

describe('useGame (word-hunt)', () => {
  it('initial: phase=playing, currentQ=0, 4 choices', () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    expect(result.current.phase).toBe('playing');
    expect(result.current.currentQ).toBe(0);
    expect(result.current.choices).toHaveLength(4);
  });

  it('question has emoji and label', () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    expect(result.current.question.emoji).toBeDefined();
    expect(result.current.question.label).toBeDefined();
  });

  it('correctIdx points to the correct answer in choices array', () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    const { choices, correctIdx, question } = result.current;
    expect(choices[correctIdx].id).toBe(question.id);
  });

  it('zh mode pulls single Chinese characters', () => {
    const { result } = renderHook(() => useGame({ mode: 'zh', count: 5 }));
    expect(result.current.question.label).toHaveLength(1);
    expect(result.current.question.id.startsWith('zh-')).toBe(true);
  });

  it('handleChoice(correctIdx) → stats.correct increases and speaks the word', async () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    const { correctIdx, question } = result.current;
    await act(async () => {
      result.current.handleChoice(correctIdx);
    });
    await waitFor(() => {
      expect(result.current.stats.correct).toBe(1);
    });
    expect(speakSpy).toHaveBeenCalledWith(question.label, 'en-US');
  });

  it('handleChoice with wrong index → stats.wrong increases, no speech', async () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    const { correctIdx } = result.current;
    const wrongIdx = correctIdx === 0 ? 1 : 0;
    await act(async () => {
      result.current.handleChoice(wrongIdx);
    });
    await waitFor(() => {
      expect(result.current.stats.wrong).toBe(1);
    });
    expect(speakSpy).not.toHaveBeenCalled();
  });

  it('zh mode speaks in Mandarin (zh-TW)', async () => {
    const { result } = renderHook(() => useGame({ mode: 'zh', count: 5 }));
    const { correctIdx, question } = result.current;
    await act(async () => {
      result.current.handleChoice(correctIdx);
    });
    await waitFor(() => {
      expect(result.current.stats.correct).toBe(1);
    });
    expect(speakSpy).toHaveBeenCalledWith(question.label, 'zh-TW');
  });

  it('hard mode (en): 4 choices, correct answer present, distractors from confusable bank', () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5, difficulty: 'hard' }));
    const { choices, correctIdx, question } = result.current;
    expect(choices).toHaveLength(4);
    expect(choices[correctIdx].id).toBe(question.id);
    const bank = EN_CONFUSABLES[question.label];
    const distractors = choices.filter((_, i) => i !== correctIdx);
    for (const c of distractors) {
      expect(bank, `distractor "${c.label}" not in bank for "${question.label}"`).toContain(c.label);
    }
  });

  it('handleTimeout counts as wrong and advances', async () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    await act(async () => {
      result.current.handleTimeout();
    });
    await waitFor(() => {
      expect(result.current.stats.wrong).toBe(1);
      expect(result.current.currentQ).toBe(1);
    });
  });

  it('after count questions: phase=result', async () => {
    const count = 2;
    const { result } = renderHook(() => useGame({ mode: 'en', count }));
    for (let i = 0; i < count; i++) {
      const { correctIdx } = result.current;
      await act(async () => {
        result.current.handleChoice(correctIdx);
      });
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
});
