import { describe, it, expect } from 'vitest';
import { PLANETS, planetByKey, buildDistractorKeys, orderIsCorrect } from '../games/solar-system/data';

describe('PLANETS', () => {
  it('has 8 planets ordered by distance from the sun', () => {
    expect(PLANETS).toHaveLength(8);
    expect(PLANETS.map(p => p.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(PLANETS[0].key).toBe('mercury');
    expect(PLANETS[7].key).toBe('neptune');
  });
  it('every planet has a non-empty chinese name, english name and feature', () => {
    for (const p of PLANETS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.en.length).toBeGreaterThan(0);
      expect(p.feature.length).toBeGreaterThan(0);
    }
  });
});

describe('buildDistractorKeys', () => {
  it('easy: returns 4 unique keys including the target', () => {
    const choices = buildDistractorKeys('earth', 'easy');
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain('earth');
  });
  it('hard: distractors are the order-nearest planets', () => {
    // earth order=3 → nearest others by |order-3|: venus(2), mars(4), mercury(1)|jupiter(5)
    const choices = buildDistractorKeys('earth', 'hard');
    expect(choices).toHaveLength(4);
    expect(choices).toContain('earth');
    expect(choices).toContain('venus');
    expect(choices).toContain('mars');
  });
});

describe('orderIsCorrect', () => {
  it('true only when all 8 slots hold the right planet in order', () => {
    const correct = PLANETS.map(p => p.key);
    expect(orderIsCorrect(correct)).toBe(true);
  });
  it('false when a slot is empty', () => {
    const arr = PLANETS.map(p => p.key);
    arr[3] = null;
    expect(orderIsCorrect(arr)).toBe(false);
  });
  it('false when two planets are swapped', () => {
    const arr = PLANETS.map(p => p.key);
    [arr[0], arr[1]] = [arr[1], arr[0]];
    expect(orderIsCorrect(arr)).toBe(false);
  });
});

it('planetByKey returns the matching planet', () => {
  expect(planetByKey('saturn').name).toBe('土星');
});
