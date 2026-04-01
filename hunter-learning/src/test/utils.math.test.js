import { describe, it, expect, vi } from 'vitest';
import { rand, shuffle, generateArith, delay } from '../utils/math';

describe('rand', () => {
  it('returns integer in [min, max]', () => {
    for (let i = 0; i < 100; i++) {
      const v = rand(3, 10);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('returns min when min === max', () => {
    expect(rand(5, 5)).toBe(5);
  });
});

describe('shuffle', () => {
  it('returns same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
    expect([...result].sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5];
    shuffle(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it('produces different order at least once in 20 runs', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const original = arr.join(',');
    let sawDiff = false;
    for (let i = 0; i < 20; i++) {
      if (shuffle(arr).join(',') !== original) {
        sawDiff = true;
        break;
      }
    }
    expect(sawDiff).toBe(true);
  });
});

describe('generateArith', () => {
  it('easy mode: answer fits range, text has + or −', () => {
    for (let i = 0; i < 50; i++) {
      const { text, answer } = generateArith('easy');
      expect(typeof answer).toBe('number');
      expect(answer).toBeGreaterThan(0);
      expect(text).toMatch(/[+−]/);
    }
  });

  it('easy mode: numbers are single digit', () => {
    for (let i = 0; i < 50; i++) {
      const { text } = generateArith('easy');
      const nums = text.split(/\s[+−]\s/).map(Number);
      expect(nums[0]).toBeLessThanOrEqual(9);
      expect(nums[1]).toBeLessThanOrEqual(9);
    }
  });

  it('hard mode: at least one number >= 10 (in majority of runs)', () => {
    let sawLarge = false;
    for (let i = 0; i < 50; i++) {
      const { text } = generateArith('hard');
      const nums = text.split(/\s[+−]\s/).map(Number);
      if (nums[0] >= 10 || nums[1] >= 10) {
        sawLarge = true;
        break;
      }
    }
    expect(sawLarge).toBe(true);
  });

  it('addition: answer equals a + b', () => {
    let checked = 0;
    for (let i = 0; i < 100; i++) {
      const { text, answer } = generateArith('easy');
      if (text.includes('+')) {
        const [a, b] = text.split(' + ').map(Number);
        expect(answer).toBe(a + b);
        checked++;
        if (checked >= 5) break;
      }
    }
  });

  it('subtraction: answer equals a - b and is positive', () => {
    let checked = 0;
    for (let i = 0; i < 100; i++) {
      const { text, answer } = generateArith('easy');
      if (text.includes('−')) {
        const [a, b] = text.split(' − ').map(Number);
        expect(answer).toBe(a - b);
        expect(answer).toBeGreaterThan(0);
        checked++;
        if (checked >= 5) break;
      }
    }
  });
});

describe('delay', () => {
  it('resolves after ~ms', async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});
