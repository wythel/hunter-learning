import { describe, it, expect } from 'vitest';
import {
  PHASES, phaseKeysForDifficulty, illuminatedFraction,
  isWaxing, classifyPhase, angleMatchesPhase,
} from '../games/moon-phases/data';

describe('illuminatedFraction', () => {
  it('new / half / full / half over the orbit', () => {
    expect(illuminatedFraction(0)).toBeCloseTo(0);
    expect(illuminatedFraction(90)).toBeCloseTo(0.5);
    expect(illuminatedFraction(180)).toBeCloseTo(1);
    expect(illuminatedFraction(270)).toBeCloseTo(0.5);
  });
});

describe('isWaxing', () => {
  it('true before 180, false after', () => {
    expect(isWaxing(45)).toBe(true);
    expect(isWaxing(200)).toBe(false);
    expect(isWaxing(400)).toBe(true); // normalises (=40)
  });
});

describe('phaseKeysForDifficulty', () => {
  it('easy has 3, hard has 5', () => {
    expect(phaseKeysForDifficulty('easy')).toHaveLength(3);
    expect(phaseKeysForDifficulty('hard')).toHaveLength(5);
  });
});

describe('classifyPhase', () => {
  it('easy buckets to nearest of new/half/full', () => {
    expect(classifyPhase(10, 'easy').key).toBe('new');
    expect(classifyPhase(85, 'easy').key).toBe('half');
    expect(classifyPhase(175, 'easy').key).toBe('full');
    expect(classifyPhase(260, 'easy').key).toBe('half');
  });
  it('hard distinguishes crescent and gibbous', () => {
    expect(classifyPhase(45, 'hard').key).toBe('crescent');
    expect(classifyPhase(135, 'hard').key).toBe('gibbous');
    expect(classifyPhase(315, 'hard').key).toBe('crescent');
    expect(classifyPhase(225, 'hard').key).toBe('gibbous');
  });
});

describe('angleMatchesPhase', () => {
  it('accepts near a canonical angle, rejects far', () => {
    expect(angleMatchesPhase(180, 'full')).toBe(true);
    expect(angleMatchesPhase(90, 'full')).toBe(false);
    expect(angleMatchesPhase(270, 'half')).toBe(true);
    expect(angleMatchesPhase(95, 'half')).toBe(true);
    expect(angleMatchesPhase(5, 'new')).toBe(true);
  });
});
