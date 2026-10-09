import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const speak = vi.fn();
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => speak }));
vi.mock('../hooks/useSound', () => ({
  useSound: () => ({ correct: vi.fn(), wrong: vi.fn(), victory: vi.fn() }),
}));

import { useGame, buildTiles, pickDistractors } from '../games/sentence-listen/useGame';
import { SENTENCES, toWords } from '../games/sentence-listen/data';

// 依序按出正確的字卡；重複字(兩個 the)取第一張還沒用過的。
// 最後一張會等 2.2 秒才換題，所以在同一個 act 裡推進假時鐘。
async function tapSentence(result) {
  const words = [...result.current.target];
  for (let i = 0; i < words.length; i++) {
    const tile = result.current.tiles.find(t => !t.used && t.word === words[i]);
    await act(async () => {
      const p = result.current.handleTile(tile.id);
      if (i === words.length - 1) await vi.advanceTimersByTimeAsync(2300);
      await p;
    });
  }
}

describe('sentence-listen data', () => {
  it('easy sentences are 3–4 words, hard are 5–6 (grade 1 length)', () => {
    for (const s of SENTENCES.easy) expect(toWords(s.en).length).toBeGreaterThanOrEqual(3);
    for (const s of SENTENCES.easy) expect(toWords(s.en).length).toBeLessThanOrEqual(4);
    for (const s of SENTENCES.hard) expect(toWords(s.en).length).toBeGreaterThanOrEqual(5);
    for (const s of SENTENCES.hard) expect(toWords(s.en).length).toBeLessThanOrEqual(6);
  });

  it('has enough sentences for the 15-question setting', () => {
    expect(SENTENCES.easy.length).toBeGreaterThanOrEqual(15);
    expect(SENTENCES.hard.length).toBeGreaterThanOrEqual(15);
  });

  it('sentences carry no punctuation and every one has a translation', () => {
    for (const s of [...SENTENCES.easy, ...SENTENCES.hard]) {
      expect(s.en).toMatch(/^[A-Za-z' ]+$/);
      expect(s.zh.length).toBeGreaterThan(0);
    }
  });

  it('toWords lowercases everything except I', () => {
    expect(toWords('The dog and I')).toEqual(['the', 'dog', 'and', 'I']);
  });
});

describe('tiles', () => {
  it('easy: tiles are exactly the sentence words', () => {
    const tiles = buildTiles({ en: 'I see a cat' }, 'easy');
    expect(tiles.map(t => t.word).sort()).toEqual(['I', 'a', 'cat', 'see'].sort());
  });

  it('hard: adds 3 distractors that are not in the sentence', () => {
    const words = toWords('The cat is on the bed');
    const extra = pickDistractors(words);
    expect(extra).toHaveLength(3);
    for (const d of extra) expect(words).not.toContain(d);
    expect(new Set(extra).size).toBe(3);
    expect(buildTiles({ en: 'The cat is on the bed' }, 'hard')).toHaveLength(9);
  });
});

describe('useGame (sentence-listen)', () => {
  beforeEach(() => { vi.useFakeTimers(); speak.mockClear(); });
  afterEach(() => vi.useRealTimers());

  it('speaks the sentence when a question starts', () => {
    const { result } = renderHook(() => useGame({ count: 3 }));
    expect(speak).toHaveBeenCalledWith(result.current.sentence.en, 'en-US', 0.85);
  });

  it('play(true) speaks slowly', () => {
    const { result } = renderHook(() => useGame({ count: 3 }));
    act(() => result.current.play(true));
    expect(speak).toHaveBeenLastCalledWith(result.current.sentence.en, 'en-US', 0.55);
  });

  it('a wrong tile does not advance and counts a wrong tap', async () => {
    const { result } = renderHook(() => useGame({ count: 3 }));
    const first = result.current.target[0];
    const wrong = result.current.tiles.find(t => t.word !== first);
    await act(async () => { await result.current.handleTile(wrong.id); });
    expect(result.current.placed).toBe(0);
    expect(result.current.wrongTaps).toBe(1);
    expect(result.current.wrongId).toBe(wrong.id);
  });

  it('tapping in order solves the question and moves on', async () => {
    const { result } = renderHook(() => useGame({ count: 2 }));
    const firstSentence = result.current.sentence.en;
    await tapSentence(result);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.sentence.en).not.toBe(firstSentence);
    expect(result.current.stats.perfect).toBe(1);
  });

  it('a question with a wrong tap is not counted as perfect', async () => {
    const { result } = renderHook(() => useGame({ count: 2 }));
    const wrong = result.current.tiles.find(t => t.word !== result.current.target[0]);
    await act(async () => { await result.current.handleTile(wrong.id); });
    await tapSentence(result);
    expect(result.current.stats).toEqual({ perfect: 0, missed: 1 });
  });

  it('finishing every question ends in result phase', async () => {
    const { result } = renderHook(() => useGame({ count: 2 }));
    await tapSentence(result);
    await tapSentence(result);
    expect(result.current.phase).toBe('result');
    expect(result.current.stats.perfect).toBe(2);
  });
});
