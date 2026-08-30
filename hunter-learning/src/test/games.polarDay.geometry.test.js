import { describe, it, expect } from 'vitest';
import { TILT, declinationForSeason, seasonForOrbit, dayInfo } from '../games/polar-day/geometry';

describe('seasonForOrbit', () => {
  it('maps orbit angle (0=spring equinox) to season -1..1', () => {
    expect(seasonForOrbit(0)).toBeCloseTo(0);     // 春分
    expect(seasonForOrbit(90)).toBeCloseTo(1);    // 夏至：北極最朝太陽
    expect(seasonForOrbit(180)).toBeCloseTo(0);   // 秋分
    expect(seasonForOrbit(270)).toBeCloseTo(-1);  // 冬至：北極最背太陽
  });

  it('wraps past a full orbit', () => {
    expect(seasonForOrbit(450)).toBeCloseTo(1);   // 450 = 90
  });
});

describe('declinationForSeason', () => {
  it('maps season -1..1 to sun declination -TILT..TILT', () => {
    expect(declinationForSeason(1)).toBeCloseTo(TILT);   // 夏至
    expect(declinationForSeason(-1)).toBeCloseTo(-TILT);  // 冬至
    expect(declinationForSeason(0)).toBeCloseTo(0);       // 春/秋分
  });
});

describe('dayInfo', () => {
  it('equator is always half day, half night', () => {
    for (const dec of [TILT, 0, -TILT]) {
      const info = dayInfo(0, dec);
      expect(info.kind).toBe('normal');
      expect(info.fraction).toBeCloseTo(0.5);
    }
  });

  it('north pole in summer never gets dark (polar day)', () => {
    const info = dayInfo(90, TILT);
    expect(info.kind).toBe('polar-day');
    expect(info.fraction).toBe(1);
  });

  it('north pole in winter never gets light (polar night)', () => {
    const info = dayInfo(90, -TILT);
    expect(info.kind).toBe('polar-night');
    expect(info.fraction).toBe(0);
  });

  it('just inside the arctic circle in summer is polar day', () => {
    const info = dayInfo(67, TILT);
    expect(info.kind).toBe('polar-day');
    expect(info.fraction).toBe(1);
  });

  it('mid latitude summer has a longer day than night', () => {
    const info = dayInfo(45, TILT);
    expect(info.kind).toBe('normal');
    expect(info.fraction).toBeGreaterThan(0.5);
  });

  it('mid latitude winter has a longer night than day', () => {
    const info = dayInfo(45, -TILT);
    expect(info.kind).toBe('normal');
    expect(info.fraction).toBeLessThan(0.5);
  });
});
