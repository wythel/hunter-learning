import { describe, it, expect } from 'vitest';
import { calculateStars, getResultTitle } from '../utils/scoring';

describe('calculateStars', () => {
  it('0 wrong → 3 stars', () => {
    expect(calculateStars(10, 0)).toBe(3);
  });

  it('1 wrong → 3 stars', () => {
    expect(calculateStars(9, 1)).toBe(3);
  });

  it('2 wrong out of 10 → 2 stars (accuracy 0.8 >= 0.7)', () => {
    expect(calculateStars(8, 2)).toBe(2);
  });

  it('5 wrong out of 10 → 1 star (accuracy 0.5 >= 0.4)', () => {
    expect(calculateStars(5, 5)).toBe(1);
  });

  it('8 wrong out of 10 → 0 stars', () => {
    expect(calculateStars(2, 8)).toBe(0);
  });

  it('all wrong → 0 stars', () => {
    expect(calculateStars(0, 10)).toBe(0);
  });
});

describe('getResultTitle', () => {
  it('3 stars completed → 完美通關！', () => {
    expect(getResultTitle(3, true)).toBe('完美通關！');
  });

  it('2 stars completed → 非常棒！', () => {
    expect(getResultTitle(2, true)).toBe('非常棒！');
  });

  it('1 star completed → 繼續努力！', () => {
    expect(getResultTitle(1, true)).toBe('繼續努力！');
  });

  it('0 stars completed → 辛苦了！', () => {
    expect(getResultTitle(0, true)).toBe('辛苦了！');
  });

  it('0 stars not completed → 勇者倒下了...', () => {
    expect(getResultTitle(0, false)).toBe('勇者倒下了...');
  });

  it('3 stars not completed → 勇者倒下了...', () => {
    expect(getResultTitle(3, false)).toBe('勇者倒下了...');
  });

  it('defaults completed=true', () => {
    expect(getResultTitle(3)).toBe('完美通關！');
  });
});
