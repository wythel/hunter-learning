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

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame, buildChoices, pickLookalikes, editDistance } from '../games/word-picture/useGame';
import { POOLS, ZH_LOOKALIKE_GROUPS } from '../games/word-picture/data';

describe('useGame (word-picture)', () => {
  it('initial: phase=playing, 4 picture choices with emoji', () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    expect(result.current.phase).toBe('playing');
    expect(result.current.choices).toHaveLength(4);
    result.current.choices.forEach(c => expect(c.emoji).toBeTruthy());
  });

  it('does not speak the word before the player answers', () => {
    renderHook(() => useGame({ mode: 'en', count: 5 }));
    expect(speakSpy).not.toHaveBeenCalled();
  });

  it('correct pick → stats.correct++ and speaks the word', async () => {
    const { result } = renderHook(() => useGame({ mode: 'zh', count: 5 }));
    const { correctIdx, question } = result.current;
    await act(async () => { result.current.handleChoice(correctIdx); });
    await waitFor(() => expect(result.current.stats.correct).toBe(1));
    expect(speakSpy).toHaveBeenCalledWith(question.label, 'zh-TW');
  });

  it('wrong pick → recorded for review and still speaks the word', async () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 5 }));
    const { correctIdx, question } = result.current;
    await act(async () => { result.current.handleChoice((correctIdx + 1) % 4); });
    await waitFor(() => expect(result.current.stats.wrong).toBe(1));
    expect(result.current.wrong).toHaveLength(1);
    expect(result.current.wrong[0].question.id).toBe(question.id);
    expect(speakSpy).toHaveBeenCalledWith(question.label, 'en-US');
  });

  it('reaches result phase after count answers', async () => {
    const { result } = renderHook(() => useGame({ mode: 'en', count: 3 }));
    for (let i = 0; i < 3; i++) {
      await act(async () => { result.current.handleChoice(result.current.correctIdx); });
      await waitFor(() => expect(result.current.feedback).toBe(i === 2 ? 'correct' : null));
    }
    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(result.current.stats.correct).toBe(3);
  });
});

describe('word-picture choices', () => {
  // 選項是圖：同一字池若有兩個字共用同一個 emoji，就會出現兩張一模一樣的圖
  it.each(['en', 'zh'])('%s pool has unique emoji', (mode) => {
    const emojis = POOLS[mode].map(w => w.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });

  it.each(['easy', 'hard'])('%s: every word yields 4 distinct choices including the answer', (difficulty) => {
    for (const mode of ['en', 'zh']) {
      for (const q of POOLS[mode]) {
        const choices = buildChoices(q, POOLS[mode], difficulty);
        expect(choices).toHaveLength(4);
        expect(new Set(choices.map(c => c.id)).size).toBe(4);
        expect(choices.some(c => c.id === q.id)).toBe(true);
      }
    }
  });

  it('every zh lookalike group only names characters in the pool', () => {
    const labels = new Set(POOLS.zh.map(w => w.label));
    ZH_LOOKALIKE_GROUPS.flat().forEach(ch => expect(labels.has(ch)).toBe(true));
  });

  it('zh hard: 目 draws distractors from its shape groups', () => {
    const q = POOLS.zh.find(w => w.label === '目');
    const mates = new Set(['日', '田', '口', '星', '睡', '看']);
    const picks = pickLookalikes(q, POOLS.zh, 3);
    picks.forEach(p => expect(mates.has(p.label)).toBe(true));
  });

  it('en hard: cat gets short look-alike words, not long ones', () => {
    const q = POOLS.en.find(w => w.label === 'cat');
    for (let i = 0; i < 20; i++) {
      const labels = pickLookalikes(q, POOLS.en, 3).map(p => p.label);
      labels.forEach(l => expect(l.length).toBeLessThanOrEqual(5));
    }
  });

  it('editDistance basics', () => {
    expect(editDistance('cat', 'hat')).toBe(1);
    expect(editDistance('cat', 'cat')).toBe(0);
    expect(editDistance('sun', 'run')).toBe(1);
    expect(editDistance('', 'abc')).toBe(3);
  });
});
