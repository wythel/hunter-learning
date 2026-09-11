import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), tick: vi.fn(), ready: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame, generateProblem } from '../games/column-math/useGame';

const digitAt = (n, place) => Math.floor(n / 10 ** place) % 10;

describe('generateProblem (column-math)', () => {
  it('easy add: no column carries, answer = a + b', () => {
    for (let i = 0; i < 40; i++) {
      const q = generateProblem('add', 'easy', 2);
      expect(q.op).toBe('+');
      expect(q.answer).toBe(q.a + q.b);
      for (let p = 0; p < 2; p++) {
        expect(digitAt(q.a, p) + digitAt(q.b, p)).toBeLessThan(10);
      }
      expect(q.flags.some(Boolean)).toBe(false);
    }
  });

  it('hard add: at least one carry', () => {
    for (let i = 0; i < 40; i++) {
      const q = generateProblem('add', 'hard', 2);
      expect(q.answer).toBe(q.a + q.b);
      expect(q.flags.some(Boolean)).toBe(true);
    }
  });

  it('easy sub: a > b, no borrow, answer keeps full digit count', () => {
    for (let i = 0; i < 40; i++) {
      const q = generateProblem('sub', 'easy', 2);
      expect(q.op).toBe('−');
      expect(q.a).toBeGreaterThan(q.b);
      expect(q.answer).toBe(q.a - q.b);
      expect(q.answer).toBeGreaterThanOrEqual(10);
      for (let p = 0; p < 2; p++) {
        expect(digitAt(q.a, p)).toBeGreaterThanOrEqual(digitAt(q.b, p));
      }
    }
  });

  it('hard sub: at least one borrow, answer keeps full digit count', () => {
    for (let i = 0; i < 40; i++) {
      const q = generateProblem('sub', 'hard', 2);
      expect(q.a).toBeGreaterThan(q.b);
      expect(q.answer).toBe(q.a - q.b);
      expect(q.answer).toBeGreaterThanOrEqual(10);
      expect(q.flags.some(Boolean)).toBe(true);
    }
  });

  it('3-digit: operands are in [100, 999]', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateProblem('mix', 'easy', 3);
      expect(q.a).toBeGreaterThanOrEqual(100);
      expect(q.a).toBeLessThanOrEqual(999);
      expect(q.b).toBeGreaterThanOrEqual(100);
      expect(q.b).toBeLessThanOrEqual(999);
    }
  });

  it('3-digit hard sub: no cascading borrow (a 0-digit never lends)', () => {
    for (let i = 0; i < 40; i++) {
      const q = generateProblem('sub', 'hard', 3);
      // 重算借位:若某位被借走(flags[p-1])且該位原本是 0 → 連鎖借位,不允許
      for (let p = 1; p < 3; p++) {
        if (q.flags[p - 1]) expect(digitAt(q.a, p)).toBeGreaterThan(0);
      }
    }
  });

  it('mix produces both + and − over many runs', () => {
    const ops = new Set();
    for (let i = 0; i < 60; i++) ops.add(generateProblem('mix', 'easy', 2).op);
    expect(ops.has('+')).toBe(true);
    expect(ops.has('−')).toBe(true);
  });

  it('text is "a op b" for the review screen', () => {
    const q = generateProblem('add', 'easy', 2);
    expect(q.text).toBe(`${q.a} + ${q.b}`);
  });
});

// 依正確答案由個位往高位逐位輸入
async function fillAnswer(result) {
  const ansStr = String(result.current.question.answer);
  for (let i = ansStr.length - 1; i >= 0; i--) {
    await act(async () => { result.current.handleDigit(ansStr[i]); });
  }
}

describe('useGame (column-math)', () => {
  const opts = { operation: 'add', difficulty: 'easy', digits: 2, count: 10 };

  it('initial state: phase=playing, currentQ=0, filled=0', () => {
    const { result } = renderHook(() => useGame(opts));
    expect(result.current.phase).toBe('playing');
    expect(result.current.currentQ).toBe(0);
    expect(result.current.filled).toBe(0);
  });

  it('correct ones digit fills a cell', async () => {
    const { result } = renderHook(() => useGame(opts));
    const ansStr = String(result.current.question.answer);
    await act(async () => { result.current.handleDigit(ansStr[ansStr.length - 1]); });
    expect(result.current.filled).toBe(1);
  });

  it('wrong digit does not fill, bumps wrongShake', async () => {
    const { result } = renderHook(() => useGame(opts));
    const ansStr = String(result.current.question.answer);
    const correctOnes = Number(ansStr[ansStr.length - 1]);
    const wrongDigit = String((correctOnes + 1) % 10);
    await act(async () => { result.current.handleDigit(wrongDigit); });
    expect(result.current.filled).toBe(0);
    expect(result.current.wrongShake).toBe(1);
  });

  it('completing all digits flawlessly: correct+1, next question, filled reset', async () => {
    const { result } = renderHook(() => useGame(opts));
    await fillAnswer(result);
    await waitFor(() => {
      expect(result.current.stats.correct).toBe(1);
      expect(result.current.currentQ).toBe(1);
      expect(result.current.filled).toBe(0);
    });
  });

  it('a wrong press then completion: counts wrong and records the question', async () => {
    const { result } = renderHook(() => useGame(opts));
    const q = result.current.question;
    const ansStr = String(q.answer);
    const correctOnes = Number(ansStr[ansStr.length - 1]);
    await act(async () => { result.current.handleDigit(String((correctOnes + 1) % 10)); });
    await fillAnswer(result);
    await waitFor(() => {
      expect(result.current.stats.wrong).toBe(1);
      expect(result.current.stats.correct).toBe(0);
    });
    expect(result.current.wrong).toHaveLength(1);
    expect(result.current.wrong[0]).toEqual({ text: q.text, answer: q.answer });
  });

  it('after count questions: phase becomes result', async () => {
    const count = 3;
    const { result } = renderHook(() => useGame({ ...opts, count }));
    for (let i = 0; i < count; i++) {
      await fillAnswer(result);
      if (i < count - 1) {
        await waitFor(() => expect(result.current.currentQ).toBe(i + 1));
      }
    }
    await waitFor(() => expect(result.current.phase).toBe('result'));
  });

  it('handleTimeout: counts wrong, records question, advances', async () => {
    const { result } = renderHook(() => useGame(opts));
    const q = result.current.question;
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.timeoutAnswer).toBe(null);
    expect(result.current.wrong[0]).toEqual({ text: q.text, answer: q.answer });
  });

  it('erred flag resets between questions', async () => {
    const { result } = renderHook(() => useGame(opts));
    const ansStr = String(result.current.question.answer);
    const correctOnes = Number(ansStr[ansStr.length - 1]);
    await act(async () => { result.current.handleDigit(String((correctOnes + 1) % 10)); });
    await fillAnswer(result);
    await waitFor(() => expect(result.current.currentQ).toBe(1));
    await fillAnswer(result);
    await waitFor(() => {
      expect(result.current.stats.correct).toBe(1);
      expect(result.current.stats.wrong).toBe(1);
    });
  });
});

describe('useGame (column-math) 寶可夢夥伴', () => {
  const opts = { operation: 'add', difficulty: 'easy', digits: 2, count: 10 };

  it('每題都有一隻夥伴,帶 id / 名字 / 圖', () => {
    const { result } = renderHook(() => useGame(opts));
    const m = result.current.monster;
    expect(m).toBeTruthy();
    expect(typeof m.id).toBe('number');
    expect(typeof m.name).toBe('string');
    expect(m.img).toMatch(/official-artwork/);
  });

  it('開場還沒收服任何寶可夢', () => {
    const { result } = renderHook(() => useGame(opts));
    expect(result.current.caught).toEqual([]);
  });

  it('整題填完就收服當前那隻', async () => {
    const { result } = renderHook(() => useGame(opts));
    const shown = result.current.monster;
    await fillAnswer(result);
    await waitFor(() => expect(result.current.caught).toHaveLength(1));
    expect(result.current.caught[0].id).toBe(shown.id);
  });

  it('按錯過但把整題填完,還是收服得到', async () => {
    const { result } = renderHook(() => useGame(opts));
    const ansStr = String(result.current.question.answer);
    const correctOnes = Number(ansStr[ansStr.length - 1]);
    await act(async () => { result.current.handleDigit(String((correctOnes + 1) % 10)); });
    await fillAnswer(result);
    await waitFor(() => expect(result.current.caught).toHaveLength(1));
  });

  it('限時逾時那題不收服,但仍換下一隻', async () => {
    const { result } = renderHook(() => useGame(opts));
    const shown = result.current.monster;
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.caught).toHaveLength(0);
    expect(result.current.monster.id).not.toBe(shown.id);
  });

  it('整場的夥伴一題換一隻,不重複', async () => {
    const count = 3;
    const { result } = renderHook(() => useGame({ ...opts, count }));
    for (let i = 0; i < count; i++) {
      await fillAnswer(result);
      if (i < count - 1) await waitFor(() => expect(result.current.currentQ).toBe(i + 1));
    }
    await waitFor(() => expect(result.current.phase).toBe('result'));
    const ids = result.current.caught.map(m => m.id);
    expect(ids).toHaveLength(count);
    expect(new Set(ids).size).toBe(count);
  });

  it('打完最後一題,monster 仍有值(結算前不會炸)', async () => {
    const { result } = renderHook(() => useGame({ ...opts, count: 1 }));
    await fillAnswer(result);
    await waitFor(() => expect(result.current.phase).toBe('result'));
    expect(result.current.monster).toBeTruthy();
  });
});
