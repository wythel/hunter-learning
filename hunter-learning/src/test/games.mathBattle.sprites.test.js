import { describe, it, expect } from 'vitest';
import {
  EVOLUTION_STAGES,
  MONSTER_MAX_HP,
  buildMonsterRoster,
  stageIndexFor,
} from '../games/math-battle/sprites';

describe('math-battle 進化階段池', () => {
  it('剛好三個階段,每個階段都有寶可夢', () => {
    expect(EVOLUTION_STAGES).toHaveLength(3);
    for (const stage of EVOLUTION_STAGES) {
      expect(stage.length).toBeGreaterThanOrEqual(16);
    }
  });

  it('同一個家族依序排在三個階段(圖鑑編號遞增)', () => {
    const [s1, s2, s3] = EVOLUTION_STAGES;
    expect(s2).toHaveLength(s1.length);
    expect(s3).toHaveLength(s1.length);
    s1.forEach((basic, i) => {
      expect(s2[i].id).toBeGreaterThan(basic.id);
      expect(s3[i].id).toBeGreaterThan(s2[i].id);
    });
  });

  it('全站沒有重複的寶可夢,也不會是玩家的皮卡丘', () => {
    const ids = EVOLUTION_STAGES.flat().map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(25);
  });

  it('一擊必殺:對手最大 HP 是 1', () => {
    expect(MONSTER_MAX_HP).toBe(1);
  });
});

describe('stageIndexFor', () => {
  it('前 1/3 → 0、中間 1/3 → 1、最後 1/3 → 2', () => {
    expect([0, 1, 2].map(i => stageIndexFor(i, 3))).toEqual([0, 1, 2]);
    expect([0, 1, 2, 3, 4].map(i => stageIndexFor(i, 5))).toEqual([0, 0, 1, 1, 2]);
  });

  it('最後一題一定是最終進化型', () => {
    for (const count of [5, 10, 20]) {
      expect(stageIndexFor(count - 1, count)).toBe(2);
      expect(stageIndexFor(0, count)).toBe(0);
    }
  });
});

describe('buildMonsterRoster', () => {
  it('每題一隻,階段跟著題目進度走', () => {
    for (const count of [5, 10, 20]) {
      const roster = buildMonsterRoster(count);
      expect(roster).toHaveLength(count);
      roster.forEach((m, i) => {
        expect(EVOLUTION_STAGES[stageIndexFor(i, count)]).toContain(m);
      });
    }
  });

  it('三個階段都會出現', () => {
    const roster = buildMonsterRoster(10);
    const stages = roster.map((_, i) => stageIndexFor(i, 10));
    expect(new Set(stages)).toEqual(new Set([0, 1, 2]));
  });

  it('同一場不會出現重複的對手', () => {
    for (const count of [5, 10, 20]) {
      const ids = buildMonsterRoster(count).map(m => m.id);
      expect(new Set(ids).size).toBe(count);
    }
  });

  it('每局隨機:多抽幾次不會每次都一樣', () => {
    const key = () => buildMonsterRoster(10).map(m => m.id).join(',');
    const seen = new Set(Array.from({ length: 12 }, key));
    expect(seen.size).toBeGreaterThan(1);
  });
});
