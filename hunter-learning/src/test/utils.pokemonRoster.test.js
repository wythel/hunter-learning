import { describe, it, expect } from 'vitest';
import { POKEMON_ROSTER, rosterByPath } from '../utils/pokemonRoster';
import { pokemonSprite, pokemonArtwork } from '../utils/pokemon';

describe('pokemonRoster', () => {
  it('covers all 15 games', () => {
    expect(POKEMON_ROSTER).toHaveLength(15);
  });

  it('every entry has path, id, name and color', () => {
    for (const e of POKEMON_ROSTER) {
      expect(e.path).toMatch(/^\/[a-z-]+$/);
      expect(typeof e.id).toBe('number');
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('paths are unique', () => {
    const paths = POKEMON_ROSTER.map(e => e.path);
    expect(new Set(paths).size).toBe(15);
  });

  // 撞色會讓大廳兩張卡分不出來，spec 明確要求手動偏移
  it('colors are unique', () => {
    const colors = POKEMON_ROSTER.map(e => e.color.toUpperCase());
    expect(new Set(colors).size).toBe(15);
  });

  it('rosterByPath indexes by path', () => {
    expect(rosterByPath['/math-battle'].id).toBe(25);
    expect(rosterByPath['/note-staff'].id).toBe(39);
  });
});

describe('pokemon image helpers', () => {
  it('pokemonSprite returns the small classic sprite url', () => {
    expect(pokemonSprite(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    );
  });

  // 既有呼叫端（math-battle/sprites.js、note-staff/sprites.js）依賴這個網址不變
  it('pokemonArtwork keeps its existing url', () => {
    expect(pokemonArtwork(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    );
  });
});
