import { describe, it, expect } from 'vitest';
import { EN_CONFUSABLES, pickHardDistractors } from '../utils/data/confusables';
import { EN_WORDS } from '../games/word-hunt/data';
import { WORDS } from '../utils/data/words';

// 兩個遊戲英文字池的聯集——困難模式會對這些字查 confusables。
const POOL_WORDS = [
  ...EN_WORDS.map(w => w.label),
  ...Object.values(WORDS).flat().map(w => w.en),
];

describe('EN_CONFUSABLES coverage', () => {
  it('every English pool word has ≥3 confusables, none equal to itself, all unique', () => {
    for (const word of new Set(POOL_WORDS)) {
      const bank = EN_CONFUSABLES[word.toLowerCase()];
      expect(bank, `missing confusables for "${word}"`).toBeDefined();
      expect(bank.length, `"${word}" needs ≥3 confusables`).toBeGreaterThanOrEqual(3);
      expect(bank, `"${word}" bank contains the answer`).not.toContain(word.toLowerCase());
      expect(new Set(bank).size, `"${word}" bank has duplicates`).toBe(bank.length);
    }
  });
});

describe('pickHardDistractors', () => {
  it('returns n words all drawn from the word\'s bank, excluding the answer', () => {
    const picks = pickHardDistractors('apple', 3);
    expect(picks).toHaveLength(3);
    for (const p of picks) {
      expect(EN_CONFUSABLES.apple).toContain(p);
      expect(p).not.toBe('apple');
    }
    expect(new Set(picks).size).toBe(picks.length); // no duplicates
  });

  it('is case-insensitive on the lookup key', () => {
    expect(pickHardDistractors('APPLE', 3)).toHaveLength(3);
  });

  it('returns [] for a word with no bank (e.g. a Chinese char)', () => {
    expect(pickHardDistractors('山', 3)).toEqual([]);
    expect(pickHardDistractors('notaword', 3)).toEqual([]);
  });

  it('never returns more than n', () => {
    expect(pickHardDistractors('cat', 2)).toHaveLength(2);
  });
});
