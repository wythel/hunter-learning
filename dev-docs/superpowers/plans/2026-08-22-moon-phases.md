# 月相星球 moon-phases 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一個全 SVG 的「月相星球」互動遊戲，用上帝俯視視角（因）＋地球視角月相盤（果）即時連動，讓 Hunter 理解月相成因，並附探索沙盒與答題挑戰。

**Architecture:** 照 `clock-reading` 的五檔慣例：`data.js`（純月相數學＋常數）、`MoonSystem.jsx`（雙視角 SVG 與拖曳，類比 `ClockSVG.jsx`）、`useGame.js`（沙盒＋挑戰狀態機）、`Settings.jsx`、`Game.jsx`。純數學抽進 `data.js` 以便單元測試；SVG 用連續數學繪製，不用 emoji 承載教學。

**Tech Stack:** Vite + React、react-router-dom（HashRouter）、Mantine、framer-motion、vitest + @testing-library/react。

## Global Constraints

- 所有指令在 `hunter-learning/` 目錄下執行（`npm run dev / test:run / lint / build`）。
- 路由用 HashRouter；每個遊戲兩條 route：`/moon-phases`（設定）與 `/moon-phases/play`（遊戲）。
- `Game.jsx` 從 `location.state` 解構設定時**一律給預設值**（`difficulty='easy'`、`count=8`）以向後相容。
- 難度慣例：`'easy'`/`'hard'`，icon `🌱`/`🔥`，text `簡單`/`困難`。
- 星星分級照現有慣例：`pct=wrong/total`；0→3、≤0.2→2、≤0.5→1、其餘→0。
- 測試放 `src/test/`，命名 `games.moon-phases.<x>.test.js`。
- 內部文件只放 `dev-docs/`，**絕不放 `docs/`**。
- Commit 訊息：英文祈使句、無 conventional-commit 前綴。
- 角度定義：軌道角 `φ ∈ [0,360)`，`φ=0`＝新月（月亮在地球與太陽之間），`φ=180`＝滿月，太陽在右。`illuminatedFraction(φ)=(1-cos φ)/2`。

---

### Task 1: 月相數學與常數（data.js）

**Files:**
- Create: `hunter-learning/src/games/moon-phases/data.js`
- Test: `hunter-learning/src/test/games.moon-phases.phase.test.js`

**Interfaces:**
- Produces:
  - `PHASES: { key:string, name:string, angles:number[] }[]`
  - `phaseKeysForDifficulty(difficulty:'easy'|'hard'): string[]`
  - `illuminatedFraction(angle:number): number`  // 0..1
  - `isWaxing(angle:number): boolean`
  - `classifyPhase(angle:number, difficulty='easy'): { key, name, angles }`
  - `angleMatchesPhase(angle:number, phaseKey:string, tol=25): boolean`

- [ ] **Step 1: 寫失敗測試**

`hunter-learning/src/test/games.moon-phases.phase.test.js`：
```js
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
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.phase.test.js`
Expected: FAIL（找不到模組 `../games/moon-phases/data`）

- [ ] **Step 3: 寫最小實作**

`hunter-learning/src/games/moon-phases/data.js`：
```js
// 月相純數學與常數。軌道角 φ：0=新月（月在日地之間），180=滿月，太陽在右。
// 幼兒版不分盈虧：兩側半月都叫「半月」，兩側眉月都叫「眉月」，兩側凸月都叫「凸月」。
export const PHASES = [
  { key: 'new',      name: '新月', angles: [0]       },
  { key: 'crescent', name: '眉月', angles: [45, 315] },
  { key: 'half',     name: '半月', angles: [90, 270] },
  { key: 'gibbous',  name: '凸月', angles: [135, 225] },
  { key: 'full',     name: '滿月', angles: [180]     },
];

export function phaseKeysForDifficulty(difficulty) {
  return difficulty === 'hard'
    ? ['new', 'crescent', 'half', 'gibbous', 'full']
    : ['new', 'half', 'full'];
}

const norm = a => ((a % 360) + 360) % 360;

export function illuminatedFraction(angle) {
  return (1 - Math.cos((angle * Math.PI) / 180)) / 2;
}

export function isWaxing(angle) {
  return norm(angle) < 180;
}

function angularDist(a, b) {
  const d = norm(a - b);
  return Math.min(d, 360 - d);
}

export function classifyPhase(angle, difficulty = 'easy') {
  const keys = phaseKeysForDifficulty(difficulty);
  const enabled = PHASES.filter(p => keys.includes(p.key));
  let best = enabled[0];
  let bestD = Infinity;
  for (const p of enabled) {
    for (const ca of p.angles) {
      const d = angularDist(angle, ca);
      if (d < bestD) { bestD = d; best = p; }
    }
  }
  return best;
}

export function angleMatchesPhase(angle, phaseKey, tol = 25) {
  const p = PHASES.find(x => x.key === phaseKey);
  if (!p) return false;
  return p.angles.some(ca => angularDist(angle, ca) <= tol);
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.phase.test.js`
Expected: PASS（全部）

- [ ] **Step 5: Commit**

```bash
git add hunter-learning/src/games/moon-phases/data.js hunter-learning/src/test/games.moon-phases.phase.test.js
git commit -m "Add moon-phases phase math and constants"
```

---

### Task 2: 雙視角 SVG 元件（MoonSystem.jsx）

畫上帝俯視圖（太陽平行光、地球、軌道、可拖曳的小月亮、視線虛線）＋地球視角大月相盤（連續渲染）。全 SVG，不用 emoji 承載教學。

**Files:**
- Create: `hunter-learning/src/games/moon-phases/MoonSystem.jsx`
- Test: `hunter-learning/src/test/games.moon-phases.MoonSystem.test.jsx`

**Interfaces:**
- Consumes（from Task 1）：`illuminatedFraction`, `isWaxing`, `classifyPhase`。
- Produces（component props）：
  - `<MoonSystem angle={number} onAngleChange={(a:number)=>void | null} difficulty={'easy'|'hard'} showLabel={boolean} />`
  - `onAngleChange` 為 `null` 時為唯讀（挑戰的辨認題用）；為函式時月亮可拖曳。
  - 匯出預設 `MoonSystem`；內部含 `MoonDisk`（不對外）。

**月相盤 SVG 繪法（關鍵，照抄）：** 在暗盤上疊層。半徑 `R`，亮面比例 `illum`，`waxing` 決定亮面在右(true)或左。`rx = |R·cos φ|` 為 terminator 半橢圓的水平半徑。
- 圖層順序：(1) 暗色整圓；(2) 亮色半圓在亮側；(3) 若 `illum>0.5`（凸）→ 亮色半橢圓疊在**暗側**；若 `illum<0.5`（缺）→ 暗色半橢圓疊在**亮側**。`illum=0.5` 時 `rx=0` 不需第三層。
- 驗證：新月 illum=0→亮半圓被等寬暗半橢圓完全蓋掉＝全暗；滿月 illum=1→亮半圓＋暗側等寬亮半橢圓＝全亮。

- [ ] **Step 1: 寫失敗測試（渲染煙霧測試）**

`hunter-learning/src/test/games.moon-phases.MoonSystem.test.jsx`：
```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MoonSystem from '../games/moon-phases/MoonSystem';

describe('MoonSystem', () => {
  it('renders svg with the phase name label for full moon (angle 180)', () => {
    const { container, getByText } = render(
      <MoonSystem angle={180} onAngleChange={null} difficulty="easy" showLabel />
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(getByText('滿月')).toBeTruthy();
  });

  it('shows 新月 at angle 0', () => {
    const { getByText } = render(
      <MoonSystem angle={0} onAngleChange={null} difficulty="easy" showLabel />
    );
    expect(getByText('新月')).toBeTruthy();
  });

  it('hides label when showLabel is false', () => {
    const { queryByText } = render(
      <MoonSystem angle={180} onAngleChange={null} difficulty="easy" showLabel={false} />
    );
    expect(queryByText('滿月')).toBeNull();
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.MoonSystem.test.jsx`
Expected: FAIL（找不到模組）

- [ ] **Step 3: 寫實作**

`hunter-learning/src/games/moon-phases/MoonSystem.jsx`：
```jsx
import { useRef } from 'react';
import { illuminatedFraction, isWaxing, classifyPhase } from './data';

// ── 地球視角的月相盤：暗盤上疊亮半圓與 terminator 半橢圓 ──
function MoonDisk({ angle, R, cx, cy }) {
  const illum   = illuminatedFraction(angle);
  const waxing  = isWaxing(angle);
  const litSide = waxing ? 'right' : 'left';
  const darkSide = waxing ? 'left' : 'right';
  const rx = Math.abs(R * Math.cos((angle * Math.PI) / 180));

  const LIGHT = '#f6f2df';
  const DARK  = '#26324e';

  // 亮側半圓：sweep 1=右半、0=左半
  const semi = side => {
    const s = side === 'right' ? 1 : 0;
    return `M 0 ${-R} A ${R} ${R} 0 0 ${s} 0 ${R} Z`;
  };
  // 以 rx 為水平半徑的半橢圓（同樣 sweep 規則）
  const halfEllipse = side => {
    const s = side === 'right' ? 1 : 0;
    return `M 0 ${-R} A ${rx} ${R} 0 0 ${s} 0 ${R} Z`;
  };

  const gibbous = illum > 0.5;

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={R} fill={DARK} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <path d={semi(litSide)} fill={LIGHT} />
      {Math.abs(illum - 0.5) > 0.001 && (
        gibbous
          ? <path d={halfEllipse(darkSide)} fill={LIGHT} />
          : <path d={halfEllipse(litSide)}  fill={DARK}  />
      )}
    </g>
  );
}

export default function MoonSystem({ angle, onAngleChange, difficulty = 'easy', showLabel = true }) {
  const svgRef = useRef(null);

  // 版面座標（viewBox 320×440：上半俯視、下半月相盤）
  const W = 320;
  const ORBIT = { cx: 160, cy: 150, r: 95 };  // 地球在軌道中心
  const SUN   = { cx: 300, cy: 150, r: 20 };
  const rad   = (angle * Math.PI) / 180;
  // φ=0 月亮在地球右側（朝太陽）；螢幕上 x 向右、y 向上→用 -sin 讓角度逆時針增加
  const moon = {
    x: ORBIT.cx + ORBIT.r * Math.cos(rad),
    y: ORBIT.cy - ORBIT.r * Math.sin(rad),
  };

  const phase = classifyPhase(angle, difficulty);

  function pointToAngle(clientX, clientY) {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    // 換算到 viewBox 座標
    const vx = ((clientX - rect.left) / rect.width) * W;
    const vy = ((clientY - rect.top) / rect.height) * 440;
    const dx = vx - ORBIT.cx;
    const dy = ORBIT.cy - vy;           // 螢幕 y 向下 → 幾何 y 向上
    let a = (Math.atan2(dy, dx) * 180) / Math.PI;
    return ((a % 360) + 360) % 360;
  }

  const draggable = typeof onAngleChange === 'function';

  function startDrag(e) {
    if (!draggable) return;
    e.preventDefault();
    const move = ev => {
      const p = ev.touches ? ev.touches[0] : ev;
      onAngleChange(pointToAngle(p.clientX, p.clientY));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    move(e);
  }

  // 太陽平行光線（由右向左）
  const rays = [90, 130, 150, 170, 210].map((y, i) => (
    <line key={i} x1={W} y1={y} x2={ORBIT.cx + 40} y2={y}
      stroke="rgba(255,214,102,0.5)" strokeWidth="2" strokeDasharray="6 6" />
  ));

  return (
    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} 440`}
        style={{ width: '100%', touchAction: 'none', userSelect: 'none' }}
      >
        {/* ── 上半：上帝俯視圖 ── */}
        {rays}
        {/* 太陽 */}
        <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="#ffd23f" />
        <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="none" stroke="#ffb703" strokeWidth="3" />
        {/* 軌道 */}
        <circle cx={ORBIT.cx} cy={ORBIT.cy} r={ORBIT.r}
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 5" />
        {/* 地球 */}
        <circle cx={ORBIT.cx} cy={ORBIT.cy} r="16" fill="#3a7bd5" />
        <circle cx={ORBIT.cx} cy={ORBIT.cy} r="16" fill="#2f9e6e" opacity="0.55" />
        {/* 視線虛線 地球→月亮 */}
        <line x1={ORBIT.cx} y1={ORBIT.cy} x2={moon.x} y2={moon.y}
          stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 4" />
        {/* 小月亮：右半亮、左半暗（太陽恆照右側） */}
        <g transform={`translate(${moon.x} ${moon.y})`} onPointerDown={startDrag}
           style={{ cursor: draggable ? 'grab' : 'default' }}>
          <circle r="13" fill="#26324e" />
          <path d="M 0 -13 A 13 13 0 0 1 0 13 Z" fill="#f6f2df" />
          {draggable && <circle r="20" fill="transparent" />}
        </g>

        {/* ── 下半：地球視角月相盤 ── */}
        <MoonDisk angle={angle} R={70} cx={160} cy={330} />
      </svg>

      {showLabel && (
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#e9edf7' }}>{phase.name}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.MoonSystem.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hunter-learning/src/games/moon-phases/MoonSystem.jsx hunter-learning/src/test/games.moon-phases.MoonSystem.test.jsx
git commit -m "Add MoonSystem SVG dual-view component for moon-phases"
```

---

### Task 3: 遊戲狀態機（useGame.js）

沙盒（自由拖月亮）＋挑戰（拖到正確位置 / 辨認月相 混合），計分與星星。

**Files:**
- Create: `hunter-learning/src/games/moon-phases/useGame.js`
- Test: `hunter-learning/src/test/games.moon-phases.useGame.test.js`

**Interfaces:**
- Consumes（Task 1）：`PHASES`, `phaseKeysForDifficulty`, `classifyPhase`, `angleMatchesPhase`。
- Produces（hook 回傳）：
  - state：`phase`（`'sandbox'|'playing'|'result'`）、`angle`、`currentQ`、`count`、`stats:{correct,wrong}`、`feedback`（`null | {correct:boolean}`）、`challenge`（`null | {kind:'place'|'identify', targetKey, choices?}`）、`stars`、`title`、`elapsedSec`。
  - actions：`setAngle(a)`（沙盒與 place 題拖曳）、`startChallenge()`、`submitPlacement()`、`handleIdentify(phaseKey)`。
- 純邏輯輔助（獨立匯出以便測試）：`buildChallenge(difficulty, rngIndex): {kind, targetKey, choices}`。

- [ ] **Step 1: 寫失敗測試**

`hunter-learning/src/test/games.moon-phases.useGame.test.js`：
```js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// 音效與語音在 jsdom 無意義 → mock；delay 立即 resolve 讓非同步推進可同步斷言
vi.mock('../hooks/useSound', () => ({
  useSound: () => ({ correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), click: vi.fn(), ready: vi.fn(), teaching: vi.fn() }),
}));
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => vi.fn() }));
vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame, buildChallenge } from '../games/moon-phases/useGame';

describe('buildChallenge', () => {
  it('produces a valid target within the difficulty set', () => {
    const easyKeys = ['new', 'half', 'full'];
    for (let i = 0; i < 6; i++) {
      const c = buildChallenge('easy', i);
      expect(easyKeys).toContain(c.targetKey);
      expect(['place', 'identify']).toContain(c.kind);
      if (c.kind === 'identify') {
        expect(c.choices).toContain(c.targetKey);
        expect(c.choices.length).toBe(Math.min(4, easyKeys.length));
      }
    }
  });
});

describe('useGame challenge flow', () => {
  it('starts in sandbox and enters playing on startChallenge', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 5 }));
    expect(result.current.phase).toBe('sandbox');
    act(() => result.current.startChallenge());
    expect(result.current.phase).toBe('playing');
    expect(result.current.count).toBe(5);
  });

  it('scores a correct placement and advances', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    // 強制當前題為 place full，避免隨機性
    act(() => result.current._debugSetChallenge({ kind: 'place', targetKey: 'full' }));
    act(() => result.current.setAngle(180));
    await act(async () => { await result.current.submitPlacement(); });
    expect(result.current.stats.correct).toBe(1);
    expect(result.current.currentQ).toBe(1);
  });

  it('scores a wrong placement', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    act(() => result.current._debugSetChallenge({ kind: 'place', targetKey: 'full' }));
    act(() => result.current.setAngle(0)); // 新月位置，非滿月
    await act(async () => { await result.current.submitPlacement(); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('reaches result after count questions', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 2 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 2; i++) {
      act(() => result.current._debugSetChallenge({ kind: 'place', targetKey: 'full' }));
      act(() => result.current.setAngle(180));
      await act(async () => { await result.current.submitPlacement(); });
    }
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(3);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.useGame.test.js`
Expected: FAIL（找不到模組）

- [ ] **Step 3: 寫實作**

`hunter-learning/src/games/moon-phases/useGame.js`：
```js
import { useState, useRef, useCallback } from 'react';
import { PHASES, phaseKeysForDifficulty, angleMatchesPhase } from './data';
import { shuffle, delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { useSpeech } from '../../hooks/useSpeech';

const nameOf = key => PHASES.find(p => p.key === key).name;

// 依 index 決定性地出題（測試可重現）：偶數 place、奇數 identify
export function buildChallenge(difficulty, rngIndex) {
  const keys = phaseKeysForDifficulty(difficulty);
  const targetKey = keys[rngIndex % keys.length];
  const kind = rngIndex % 2 === 0 ? 'place' : 'identify';
  if (kind === 'place') return { kind, targetKey };
  // identify：四選一（不足則用全部），一定含正解
  const distractors = shuffle(keys.filter(k => k !== targetKey));
  const take = Math.min(3, distractors.length);
  const choices = shuffle([targetKey, ...distractors.slice(0, take)]);
  return { kind, targetKey, choices };
}

export function useGame({ difficulty = 'easy', count = 8 }) {
  const [phase, setPhase]       = useState('sandbox');
  const [angle, setAngle]       = useState(180); // 沙盒初始給滿月，好看
  const [currentQ, setCurrentQ] = useState(0);
  const [stats, setStats]       = useState({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const locked    = useRef(false);
  const startTime = useRef(Date.now());
  const sound     = useSound();
  const speak     = useSpeech();

  const loadQuestion = useCallback((idx) => {
    const c = buildChallenge(difficulty, idx);
    setChallenge(c);
    setFeedback(null);
    // place 題把月亮放回新月起點讓 Hunter 自己拖；identify 題擺在目標 canonical 角度
    if (c.kind === 'place') {
      setAngle(0);
    } else {
      const target = PHASES.find(p => p.key === c.targetKey);
      setAngle(target.angles[0]);
    }
  }, [difficulty]);

  const startChallenge = useCallback(() => {
    setPhase('playing');
    setCurrentQ(0);
    setStats({ correct: 0, wrong: 0 });
    startTime.current = Date.now();
    loadQuestion(0);
  }, [loadQuestion]);

  const finishAnswer = useCallback(async (isCorrect) => {
    setFeedback({ correct: isCorrect });
    if (isCorrect) {
      sound.correct();
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    }
    await delay(isCorrect ? 900 : 1100);
    const next = currentQ + 1;
    setCurrentQ(next);
    if (next >= count) {
      sound.victory();
      setPhase('result');
    } else {
      loadQuestion(next);
    }
    locked.current = false;
  }, [currentQ, count, sound, loadQuestion]);

  const submitPlacement = useCallback(() => {
    if (locked.current || !challenge || challenge.kind !== 'place' || feedback) return;
    locked.current = true;
    return finishAnswer(angleMatchesPhase(angle, challenge.targetKey));
  }, [challenge, angle, feedback, finishAnswer]);

  const handleIdentify = useCallback((phaseKey) => {
    if (locked.current || !challenge || challenge.kind !== 'identify' || feedback) return;
    locked.current = true;
    const correct = phaseKey === challenge.targetKey;
    if (correct) speak(nameOf(challenge.targetKey), 'zh-TW');
    return finishAnswer(correct);
  }, [challenge, feedback, finishAnswer, speak]);

  const stars = (() => {
    const { correct, wrong } = stats;
    const total = correct + wrong;
    if (total === 0) return 3;
    const pct = wrong / total;
    if (pct === 0)  return 3;
    if (pct <= 0.2) return 2;
    if (pct <= 0.5) return 1;
    return 0;
  })();
  const TITLES = ['再試一次！', '繼續練習！', '非常好！', '完美！'];
  const elapsedSec = Math.round((Date.now() - startTime.current) / 1000);

  return {
    phase, angle, currentQ, count, stats, feedback, challenge,
    stars, title: TITLES[stars], elapsedSec, difficulty,
    setAngle, startChallenge, submitPlacement, handleIdentify,
    targetName: challenge ? nameOf(challenge.targetKey) : '',
    // 測試用：直接設定當前題目
    _debugSetChallenge: (c) => { setChallenge(c); setFeedback(null); },
  };
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.useGame.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hunter-learning/src/games/moon-phases/useGame.js hunter-learning/src/test/games.moon-phases.useGame.test.js
git commit -m "Add moon-phases game state machine (sandbox + challenge)"
```

---

### Task 4: 設定頁、遊戲頁與註冊（Settings.jsx / Game.jsx / App / Lobby）

**Files:**
- Create: `hunter-learning/src/games/moon-phases/Settings.jsx`
- Create: `hunter-learning/src/games/moon-phases/Game.jsx`
- Modify: `hunter-learning/src/App.jsx`（import + 兩條 route）
- Modify: `hunter-learning/src/pages/Lobby.jsx`（GAMES 陣列加一張卡）
- Test: `hunter-learning/src/test/games.moon-phases.Settings.test.jsx`

**Interfaces:**
- Consumes：`SettingsPage`、`ResultScreen`、`StarField`、`useGame`、`MoonSystem`。
- Produces：`MoonPhasesSettings`（default）、`MoonPhasesGame`（default）。

- [ ] **Step 1: 寫失敗測試（設定頁 UI）**

`hunter-learning/src/test/games.moon-phases.Settings.test.jsx`：
```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import MoonPhasesSettings from '../games/moon-phases/Settings';

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <MoonPhasesSettings />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('MoonPhasesSettings', () => {
  it('shows the title and difficulty options', () => {
    const { getByText } = renderPage();
    expect(getByText('月相星球')).toBeTruthy();
    expect(getByText('簡單')).toBeTruthy();
    expect(getByText('困難')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.Settings.test.jsx`
Expected: FAIL（找不到模組）

- [ ] **Step 3: 寫 Settings.jsx**

`hunter-learning/src/games/moon-phases/Settings.jsx`：
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function MoonPhasesSettings() {
  const navigate = useNavigate();
  const [difficulty, setDiff] = useState('easy');
  const [count, setCount]     = useState(8);

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '新月/半月/滿月' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '再加眉月/凸月' },
      ],
      selected: difficulty,
      onChange: setDiff,
    },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題'  },
        { value: 8,  icon: '📚', text: '8 題'  },
        { value: 10, icon: '🏆', text: '10 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="月相星球"
      icon="🌙"
      settings={settings}
      onStart={() => navigate('/moon-phases/play', { state: { difficulty, count } })}
    />
  );
}
```

- [ ] **Step 4: 執行 Settings 測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.moon-phases.Settings.test.jsx`
Expected: PASS

- [ ] **Step 5: 寫 Game.jsx**

`hunter-learning/src/games/moon-phases/Game.jsx`：
```jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Text, Button } from '@mantine/core';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import MoonSystem from './MoonSystem';
import { useGame } from './useGame';
import { PHASES, phaseKeysForDifficulty } from './data';

export default function MoonPhasesGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { difficulty = 'easy', count = 8 } = location.state || {};

  const g = useGame({ difficulty, count });

  if (g.phase === 'result') {
    return (
      <ResultScreen
        title={g.title}
        stars={g.stars}
        stats={[
          { icon: '✅', label: '答對', value: `${g.stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${g.stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${g.elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/moon-phases/play', { state: { difficulty, count } })}
        onMenu={() => navigate('/moon-phases')}
        onLobby={() => navigate('/')}
      />
    );
  }

  const isSandbox = g.phase === 'sandbox';
  const identifyKeys = g.challenge?.kind === 'identify'
    ? g.challenge.choices
    : phaseKeysForDifficulty(difficulty);

  const banner = isSandbox
    ? '拖動月亮繞地球轉，看看月相怎麼變！'
    : g.challenge?.kind === 'place'
      ? `把月亮拖到能看到「${g.targetName}」的位置`
      : '從地球看，這是什麼月相？';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 1,
      }}>
        {/* 進度 / 提示 */}
        <div style={{ textAlign: 'center', minHeight: 48, marginBottom: 4 }}>
          {!isSandbox && (
            <Text size="sm" style={{ color: 'rgba(139,163,190,0.8)', fontWeight: 700 }}>
              第 {g.currentQ + 1} / {count} 題
            </Text>
          )}
          <Text style={{ fontSize: 17, fontWeight: 800, color: '#e9edf7' }}>{banner}</Text>
        </div>

        {/* 雙視角：辨認題唯讀、其餘可拖 */}
        <MoonSystem
          angle={g.angle}
          onAngleChange={g.challenge?.kind === 'identify' ? null : g.setAngle}
          difficulty={difficulty}
          showLabel={isSandbox || g.challenge?.kind === 'place'}
        />

        {/* 回饋 */}
        {g.feedback && (
          <Text style={{ fontSize: 20, fontWeight: 900, marginTop: 6,
            color: g.feedback.correct ? '#51cf66' : '#ff6b6b' }}>
            {g.feedback.correct ? '答對了！🎉' : '再想想～'}
          </Text>
        )}

        {/* 操作區 */}
        <div style={{ marginTop: 'auto', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isSandbox && (
            <Button size="lg" radius="xl" fullWidth onClick={g.startChallenge}
              style={{ background: 'linear-gradient(135deg,#8b9dff,#6f6cff)', fontWeight: 900 }}>
              準備好了，開始挑戰！
            </Button>
          )}

          {!isSandbox && g.challenge?.kind === 'place' && (
            <Button size="lg" radius="xl" fullWidth disabled={!!g.feedback} onClick={g.submitPlacement}
              style={{ background: 'linear-gradient(135deg,#8b9dff,#6f6cff)', fontWeight: 900 }}>
              確認位置
            </Button>
          )}

          {!isSandbox && g.challenge?.kind === 'identify' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {identifyKeys.map(key => {
                const name = PHASES.find(p => p.key === key).name;
                return (
                  <Button key={key} size="lg" radius="lg" disabled={!!g.feedback}
                    onClick={() => g.handleIdentify(key)}
                    style={{ background: 'rgba(30,42,64,0.9)', border: '1.5px solid rgba(139,157,255,0.4)',
                      color: '#e9edf7', fontWeight: 800, fontSize: 20 }}>
                    {name}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 註冊 route（App.jsx）**

在 `hunter-learning/src/App.jsx` 的 import 區（其他遊戲 import 之後）加：
```jsx
import MoonPhasesSettings from './games/moon-phases/Settings';
import MoonPhasesGame     from './games/moon-phases/Game';
```
在 `<Routes>` 內（`word-hunt` 兩條 route 之後）加：
```jsx
        <Route path="/moon-phases"        element={<MoonPhasesSettings />} />
        <Route path="/moon-phases/play"   element={<MoonPhasesGame />} />
```

- [ ] **Step 7: 加大廳卡片（Lobby.jsx）**

在 `hunter-learning/src/pages/Lobby.jsx` 的 `GAMES` 陣列末端加一項：
```jsx
  { path: '/moon-phases',   icon: '🌙',  title: '月相星球',   desc: '認識月亮！',   color: '#c0c8e0', glow: 'rgba(192,200,224,0.32)' },
```

- [ ] **Step 8: 全測試 + lint**

Run: `cd hunter-learning && npm run test:run && npm run lint`
Expected: 全部 PASS、lint 無錯

- [ ] **Step 9: Commit**

```bash
git add hunter-learning/src/games/moon-phases/Settings.jsx hunter-learning/src/games/moon-phases/Game.jsx hunter-learning/src/App.jsx hunter-learning/src/pages/Lobby.jsx hunter-learning/src/test/games.moon-phases.Settings.test.jsx
git commit -m "Wire up moon-phases game: settings, game page, route, lobby card"
```

---

### Task 5: 瀏覽器實測與視覺驗證

**Files:** 無（僅驗證，如需微調再回對應檔）

- [ ] **Step 1: 啟動 dev server**

Run: `cd hunter-learning && npm run dev`（背景執行）

- [ ] **Step 2: 用瀏覽器逐項確認**

依 `chrome-devtools` skill 或手動：
1. 大廳出現「月相星球 🌙」卡，點入設定頁，簡單/困難、題數可選。
2. 進遊戲：沙盒可**拖動小月亮繞地球**，下方月相盤與名稱**即時變化**。
3. **視覺正確性**（關鍵）：拖到最右（新月位置，φ≈0）→ 月相盤全暗＝新月；拖到最左（φ≈180）→ 全亮＝滿月；上/下（φ≈90/270）→ 半月；困難模式中間位置出現眉月（細）與凸月（胖）。若月相盤亮暗方向相反，調整 `MoonDisk` 的 `litSide`/sweep。
4. 挑戰：place 題拖到正確區間判對、identify 題四選一判對／判錯有回饋，跑完 count 題進結果頁得星星。

- [ ] **Step 3: 修正任何視覺/互動問題**

若 Step 2 發現問題，回 `MoonSystem.jsx` 或 `Game.jsx` 修正，重跑 `npm run test:run` 確認未破壞測試後 commit：
```bash
git commit -am "Fix moon-phases visual/interaction issues found in browser testing"
```

---

## 部署（實作全部完成、驗證通過後才做）

依 CLAUDE.md 部署流程：
```bash
cd hunter-learning && npm run build          # 輸出到 ../docs
# 刪掉 docs/assets/ 中新 index.html 沒引用的舊 hashed 檔
cd .. && git add -A && git commit -m "Build: deploy moon-phases game" && git push
```
