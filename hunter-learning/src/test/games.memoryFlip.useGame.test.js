import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../src/hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), flip: vi.fn(), match: vi.fn(), mismatch: vi.fn(),
    hit: vi.fn(), miss: vi.fn(), tick: vi.fn(), playerAttack: vi.fn(),
    monsterAttack: vi.fn(), monsterDie: vi.fn(), teaching: vi.fn(), ready: vi.fn(),
  }),
}));

import { useGame } from '../games/memory-flip/useGame';

describe('useGame (memory-flip)', () => {
  it('easy: cards.length === 12 (6 pairs * 2)', () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'easy' }));
    expect(result.current.cards).toHaveLength(12);
  });

  it('hard: cards.length === 16 (8 pairs * 2)', () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'hard' }));
    expect(result.current.cards).toHaveLength(16);
  });

  it('initial: flipped=[], matched=empty Set, flips=0', () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'easy' }));
    expect(result.current.flipped).toHaveLength(0);
    expect(result.current.matched.size).toBe(0);
    expect(result.current.flips).toBe(0);
  });

  it('handleFlip(0): card 0 is in flipped array', async () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'easy' }));
    await act(async () => { result.current.handleFlip(0); });
    expect(result.current.flipped).toContain(0);
  });

  it('handleFlip on matched card does nothing', async () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'easy' }));
    // Find two cards with same pairId
    const cards = result.current.cards;
    const pairId = cards[0].pairId;
    const partnerIdx = cards.findIndex((c, i) => i !== 0 && c.pairId === pairId);

    // Flip them to match
    await act(async () => { result.current.handleFlip(0); });
    await act(async () => { result.current.handleFlip(partnerIdx); });
    await waitFor(() => {
      expect(result.current.matched.has(0)).toBe(true);
    }, { timeout: 2000 });

    // Now try to flip matched card 0 again
    const matchedSizeBefore = result.current.matched.size;
    await act(async () => { result.current.handleFlip(0); });
    expect(result.current.matched.size).toBe(matchedSizeBefore);
  });

  it('stars: ratio <= 1.5 → 3 stars', () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'easy' }));
    // pairs=6, flips=0 initially → ratio = 0 → 3 stars
    expect(result.current.stars).toBe(3);
  });

  it('phase starts as playing', () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'easy' }));
    expect(result.current.phase).toBe('playing');
  });

  it('flipping two non-matching cards both unflip after delay', async () => {
    const { result } = renderHook(() => useGame({ pairType: 'en-zh', difficulty: 'easy' }));
    const cards = result.current.cards;
    // Find two cards with different pairId
    let i1 = 0, i2 = 1;
    for (let i = 1; i < cards.length; i++) {
      if (cards[i].pairId !== cards[0].pairId) {
        i2 = i;
        break;
      }
    }

    await act(async () => { result.current.handleFlip(i1); });
    await act(async () => { result.current.handleFlip(i2); });

    await waitFor(() => {
      expect(result.current.flipped).toHaveLength(0);
    }, { timeout: 3000 });
  });
});
