import { describe, it, expect } from 'vitest';
import { generateArith } from '../utils/math';

describe('generateArith used by math-battle', () => {
  it('easy mode: a and b are single digit (≤ 9)', () => {
    for (let i = 0; i < 50; i++) {
      const { text } = generateArith('easy');
      const nums = text.split(/\s[+−]\s/).map(Number);
      expect(nums[0]).toBeLessThanOrEqual(9);
      expect(nums[1]).toBeLessThanOrEqual(9);
    }
  });

  it('easy addition: result ≤ 18', () => {
    let checked = 0;
    for (let i = 0; i < 200; i++) {
      const { text, answer } = generateArith('easy');
      if (text.includes('+')) {
        expect(answer).toBeLessThanOrEqual(18);
        checked++;
        if (checked >= 10) break;
      }
    }
  });

  it('hard mode: numbers ≥ 10 seen', () => {
    let sawLarge = false;
    for (let i = 0; i < 100; i++) {
      const { text } = generateArith('hard');
      const nums = text.split(/\s[+−]\s/).map(Number);
      if (nums[0] >= 10 || nums[1] >= 10) {
        sawLarge = true;
        break;
      }
    }
    expect(sawLarge).toBe(true);
  });

  it('addition: answer = a + b', () => {
    let checked = 0;
    for (let i = 0; i < 200; i++) {
      const { text, answer } = generateArith('easy');
      if (text.includes('+')) {
        const [a, b] = text.split(' + ').map(Number);
        expect(answer).toBe(a + b);
        checked++;
        if (checked >= 10) break;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('subtraction: answer = a - b and answer > 0', () => {
    let checked = 0;
    for (let i = 0; i < 200; i++) {
      const { text, answer } = generateArith('easy');
      if (text.includes('−')) {
        const [a, b] = text.split(' − ').map(Number);
        expect(answer).toBe(a - b);
        expect(answer).toBeGreaterThan(0);
        checked++;
        if (checked >= 10) break;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
