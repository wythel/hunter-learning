# 太陽系 / 八大行星 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一個「太陽系」遊戲，用交錯的三種題型（認名字 / 排順序 / 猜特徵）讓小朋友學會八大行星的名字、離太陽順序與特徵。

**Architecture:** 沿用 codebase 每個遊戲的四檔慣例（`Settings.jsx` / `Game.jsx` / `useGame.js` / `data.js`）再加一個純 CSS 星球元件 `Planet.jsx`。`useGame` 是純狀態機、`buildChallenge(difficulty, idx)` 依 `idx % 3` 決定題型；排序題的判定放在 `data.js` 的純函式，讓 UI 拖曳與計分邏輯解耦、可單元測試。

**Tech Stack:** Vite + React + react-router-dom (HashRouter) + Mantine + framer-motion；測試 vitest + @testing-library/react。

## Global Constraints

- 所有指令在 `hunter-learning/` 目錄下執行（`npm run test:run` / `lint` / `build`）。
- **絕不**在 `docs/` 放任何手寫檔案；`docs/` 只由 `npm run build` 產生。
- 路由用 HashRouter；每個遊戲兩條 route：`/solar-system`（設定）與 `/solar-system/play`（遊戲）。
- `Game.jsx` 從 `location.state` 解構設定時**都給預設值**（`difficulty='easy'`, `count=9`）以向後相容。
- Commit 訊息：英文祈使句、無 conventional-commit 前綴（例：`Add solar-system data model and challenge builder`）。
- 測試放 `src/test/`，命名 `games.solar-system.<unit>.test.js(x)`。
- 難度值固定字串 `'easy'` / `'hard'`；題數為數字 `6 | 9 | 12`。

---

### Task 1: 行星資料與純函式 (`data.js`)

**Files:**
- Create: `hunter-learning/src/games/solar-system/data.js`
- Test: `hunter-learning/src/test/games.solar-system.data.test.js`

**Interfaces:**
- Produces:
  - `PLANETS`: 長度 8 的陣列，元素 `{ key:string, name:string, en:string, order:number(1..8), feature:string, gradient:string, ring:boolean, stripes:boolean }`，**依 order 由小到大排列**（index 0 = 水星 … index 7 = 海王星）。
  - `planetByKey(key) => planet` 物件。
  - `buildDistractorKeys(targetKey:string, difficulty:'easy'|'hard') => string[]`：長度 4、含 `targetKey`、無重複。`hard` 取 order 最相鄰的行星當干擾，`easy` 取隨機其他行星。順序經 `shuffle` 打亂。
  - `orderIsCorrect(arrangement:(string|null)[]) => boolean`：長度須為 8、無 `null`，且每個 index `i` 的 key 等於 `PLANETS[i].key` 時為 `true`。

- [ ] **Step 1: 寫失敗測試**

```js
// hunter-learning/src/test/games.solar-system.data.test.js
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
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.data.test.js`
Expected: FAIL（找不到模組 `../games/solar-system/data`）

- [ ] **Step 3: 實作 data.js**

```js
// hunter-learning/src/games/solar-system/data.js
import { shuffle } from '../../utils/math';

// 八大行星，依離太陽由近到遠排列（index 0..7 即 order 1..8）。
// gradient 用純 CSS 上色；ring=土星光環、stripes=木星條紋，由 Planet.jsx 加裝飾。
export const PLANETS = [
  { key: 'mercury', name: '水星', en: 'Mercury', order: 1, feature: '最小、離太陽最近',
    gradient: 'radial-gradient(circle at 35% 30%, #c9c2b6, #6e675d)', ring: false, stripes: false },
  { key: 'venus',   name: '金星', en: 'Venus',   order: 2, feature: '最熱的行星',
    gradient: 'radial-gradient(circle at 35% 30%, #f6dca0, #c9873f)', ring: false, stripes: false },
  { key: 'earth',   name: '地球', en: 'Earth',   order: 3, feature: '有生命、我們的家',
    gradient: 'radial-gradient(circle at 35% 30%, #7ec8ff, #1f6f4c)', ring: false, stripes: false },
  { key: 'mars',    name: '火星', en: 'Mars',    order: 4, feature: '紅色的星球',
    gradient: 'radial-gradient(circle at 35% 30%, #e0724a, #7a2b1a)', ring: false, stripes: false },
  { key: 'jupiter', name: '木星', en: 'Jupiter', order: 5, feature: '最大的行星',
    gradient: 'radial-gradient(circle at 35% 30%, #e6cfa8, #a9793f)', ring: false, stripes: true },
  { key: 'saturn',  name: '土星', en: 'Saturn',  order: 6, feature: '有美麗的光環',
    gradient: 'radial-gradient(circle at 35% 30%, #f0dcae, #c2a15e)', ring: true, stripes: false },
  { key: 'uranus',  name: '天王星', en: 'Uranus', order: 7, feature: '側躺著轉',
    gradient: 'radial-gradient(circle at 35% 30%, #d4f5f3, #5fb8c9)', ring: false, stripes: false },
  { key: 'neptune', name: '海王星', en: 'Neptune', order: 8, feature: '最遠、最藍',
    gradient: 'radial-gradient(circle at 35% 30%, #8aa6f7, #26408a)', ring: false, stripes: false },
];

export function planetByKey(key) {
  return PLANETS.find(p => p.key === key);
}

// 四選一的選項 keys：一定含 target，共 4 個、不重複。
// hard：取 order 最相鄰的行星當干擾（較難排除）；easy：隨機其他行星。
export function buildDistractorKeys(targetKey, difficulty = 'easy') {
  const target = planetByKey(targetKey);
  const others = PLANETS.filter(p => p.key !== targetKey);
  let pool;
  if (difficulty === 'hard') {
    pool = [...others].sort(
      (a, b) => Math.abs(a.order - target.order) - Math.abs(b.order - target.order),
    );
  } else {
    pool = shuffle(others);
  }
  const distractors = pool.slice(0, 3).map(p => p.key);
  return shuffle([targetKey, ...distractors]);
}

// 排序題判定：8 格、無空缺、每格行星的 order 等於格子位置。
export function orderIsCorrect(arrangement) {
  if (!Array.isArray(arrangement) || arrangement.length !== PLANETS.length) return false;
  return arrangement.every((key, i) => key === PLANETS[i].key);
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.data.test.js`
Expected: PASS（所有測試綠燈）

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/games/solar-system/data.js src/test/games.solar-system.data.test.js
git commit -m "Add solar-system data model and challenge helpers"
```

---

### Task 2: 遊戲狀態機 (`useGame.js`)

**Files:**
- Create: `hunter-learning/src/games/solar-system/useGame.js`
- Test: `hunter-learning/src/test/games.solar-system.useGame.test.js`

**Interfaces:**
- Consumes（Task 1）：`PLANETS`, `planetByKey`, `buildDistractorKeys`, `orderIsCorrect`。
- Produces：
  - `buildChallenge(difficulty, idx) => challenge`，`challenge.kind` = `['identify','order','feature'][idx % 3]`：
    - `identify`：`{ kind, targetKey, choices:string[] }`（`choices` 長度 4 含正解）。
    - `feature`：`{ kind, targetKey, choices:string[], prompt:string }`（`prompt` = 特徵文字）。
    - `order` (hard)：`{ kind, mode:'full', initial:string[] }`（8 個打亂的 key）。
    - `order` (easy)：`{ kind, mode:'gap', gapIndex:number, tray:string[], initial:(string|null)[] }`。
  - `useGame({ difficulty, count }) =>` 物件，含：
    - 狀態：`phase('explore'|'playing'|'result')`, `currentQ`, `count`, `stats{correct,wrong}`, `feedback`, `challenge`, `difficulty`, `stars`, `title`, `elapsedSec`。
    - 動作：`startChallenge()`、`handleChoose(key)`（identify+feature 共用，比對 `key===targetKey`）、`submitOrder(arrangement:(string|null)[])`（用 `orderIsCorrect` 判定）。
    - 輔助：`targetName`（目前題目正解中文名）。

- [ ] **Step 1: 寫失敗測試**

```js
// hunter-learning/src/test/games.solar-system.useGame.test.js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({ correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), click: vi.fn(), ready: vi.fn(), teaching: vi.fn() }),
}));
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => vi.fn() }));
vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame, buildChallenge } from '../games/solar-system/useGame';
import { PLANETS } from '../games/solar-system/data';

const wrongKey = key => PLANETS.find(p => p.key !== key).key;

// 依當前題目自動正確作答
async function answerCorrectly(result) {
  const c = result.current.challenge;
  if (c.kind === 'order') {
    const solved = PLANETS.map(p => p.key);
    await act(async () => { await result.current.submitOrder(solved); });
  } else {
    await act(async () => { await result.current.handleChoose(c.targetKey); });
  }
}
async function answerWrongly(result) {
  const c = result.current.challenge;
  if (c.kind === 'order') {
    const bad = PLANETS.map(p => p.key);
    [bad[0], bad[1]] = [bad[1], bad[0]];
    await act(async () => { await result.current.submitOrder(bad); });
  } else {
    await act(async () => { await result.current.handleChoose(wrongKey(c.targetKey)); });
  }
}

describe('buildChallenge', () => {
  it('cycles kind by idx % 3: identify / order / feature', () => {
    expect(buildChallenge('easy', 0).kind).toBe('identify');
    expect(buildChallenge('easy', 1).kind).toBe('order');
    expect(buildChallenge('easy', 2).kind).toBe('feature');
    expect(buildChallenge('easy', 3).kind).toBe('identify');
  });
  it('identify/feature always include the correct answer among 4 choices', () => {
    for (const idx of [0, 2, 3, 5]) {
      const c = buildChallenge('hard', idx);
      expect(c.choices).toContain(c.targetKey);
      expect(c.choices).toHaveLength(4);
      expect(new Set(c.choices).size).toBe(4);
    }
  });
  it('feature challenge carries the target feature as prompt', () => {
    const c = buildChallenge('easy', 2);
    expect(c.kind).toBe('feature');
    expect(c.prompt).toBe(PLANETS.find(p => p.key === c.targetKey).feature);
  });
  it('easy order is a gap challenge; hard order is a full sort', () => {
    const easy = buildChallenge('easy', 1);
    expect(easy.mode).toBe('gap');
    expect(easy.initial).toHaveLength(8);
    expect(easy.initial.filter(x => x === null)).toHaveLength(1);
    expect(easy.tray).toContain(PLANETS[easy.gapIndex].key);

    const hard = buildChallenge('hard', 1);
    expect(hard.mode).toBe('full');
    expect(hard.initial).toHaveLength(8);
    expect(new Set(hard.initial).size).toBe(8);
  });
});

describe('useGame flow', () => {
  it('starts in explore, enters playing on startChallenge', () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 6 }));
    expect(result.current.phase).toBe('explore');
    act(() => result.current.startChallenge());
    expect(result.current.phase).toBe('playing');
    expect(result.current.count).toBe(6);
    expect(result.current.currentQ).toBe(0);
  });

  it('handleChoose: correct key scores correct and advances', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    expect(result.current.challenge.kind).toBe('identify'); // Q0 = idx 0
    await act(async () => { await result.current.handleChoose(result.current.challenge.targetKey); });
    expect(result.current.stats.correct).toBe(1);
    expect(result.current.currentQ).toBe(1);
  });

  it('handleChoose: wrong key scores wrong', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    const target = result.current.challenge.targetKey;
    await act(async () => { await result.current.handleChoose(wrongKey(target)); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('submitOrder: correct arrangement scores correct on the order question', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    await answerCorrectly(result);                       // clear Q0 identify → Q1 order
    expect(result.current.challenge.kind).toBe('order');
    await act(async () => { await result.current.submitOrder(PLANETS.map(p => p.key)); });
    expect(result.current.stats.correct).toBe(2);
  });

  it('submitOrder: wrong arrangement scores wrong', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    await answerCorrectly(result);                       // → Q1 order
    const bad = PLANETS.map(p => p.key);
    [bad[0], bad[1]] = [bad[1], bad[0]];
    await act(async () => { await result.current.submitOrder(bad); });
    expect(result.current.stats.wrong).toBe(1);
  });

  it('all correct → result phase with 3 stars', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 3; i++) await answerCorrectly(result);
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(3);
  });

  it('all wrong → 0 stars', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 3 }));
    act(() => result.current.startChallenge());
    for (let i = 0; i < 3; i++) await answerWrongly(result);
    expect(result.current.phase).toBe('result');
    expect(result.current.stars).toBe(0);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.useGame.test.js`
Expected: FAIL（找不到模組 `../games/solar-system/useGame`）

- [ ] **Step 3: 實作 useGame.js**

```js
// hunter-learning/src/games/solar-system/useGame.js
import { useState, useRef, useCallback } from 'react';
import { PLANETS, planetByKey, buildDistractorKeys, orderIsCorrect } from './data';
import { shuffle, delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
import { useSpeech } from '../../hooks/useSpeech';

const KINDS = ['identify', 'order', 'feature'];

// 依 idx 決定性挑題型與目標；四選一與排序內容用 shuffle 隨機（測試只斷言成員/長度）。
export function buildChallenge(difficulty, idx) {
  const kind = KINDS[idx % KINDS.length];
  if (kind === 'identify') {
    const target = PLANETS[idx % PLANETS.length];
    return { kind, targetKey: target.key, choices: buildDistractorKeys(target.key, difficulty) };
  }
  if (kind === 'feature') {
    const target = PLANETS[idx % PLANETS.length];
    return {
      kind, targetKey: target.key,
      choices: buildDistractorKeys(target.key, difficulty),
      prompt: target.feature,
    };
  }
  // order
  if (difficulty === 'hard') {
    return { kind, mode: 'full', initial: shuffle(PLANETS.map(p => p.key)) };
  }
  const gapIndex = idx % PLANETS.length;
  const gapKey = PLANETS[gapIndex].key;
  const others = shuffle(PLANETS.filter(p => p.key !== gapKey).map(p => p.key)).slice(0, 2);
  const tray = shuffle([gapKey, ...others]);
  const initial = PLANETS.map((p, i) => (i === gapIndex ? null : p.key));
  return { kind, mode: 'gap', gapIndex, tray, initial };
}

export function useGame({ difficulty = 'easy', count = 9 }) {
  const [phase, setPhase]       = useState('explore');
  const [currentQ, setCurrentQ] = useState(0);
  const [stats, setStats]       = useState({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const locked    = useRef(false);
  const startTime = useRef(Date.now());
  const sound     = useSound();
  const speak     = useSpeech();

  const loadQuestion = useCallback((idx) => {
    setChallenge(buildChallenge(difficulty, idx));
    setFeedback(null);
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
    if (isCorrect) { sound.correct(); setStats(s => ({ ...s, correct: s.correct + 1 })); }
    else           { sound.wrong();   setStats(s => ({ ...s, wrong:   s.wrong   + 1 })); }
    await delay(isCorrect ? 900 : 1100);
    const next = currentQ + 1;
    setCurrentQ(next);
    if (next >= count) { sound.victory(); setPhase('result'); }
    else               { loadQuestion(next); }
    locked.current = false;
  }, [currentQ, count, sound, loadQuestion]);

  const handleChoose = useCallback((key) => {
    if (locked.current || !challenge || feedback) return;
    if (challenge.kind !== 'identify' && challenge.kind !== 'feature') return;
    locked.current = true;
    const correct = key === challenge.targetKey;
    if (correct) speak(planetByKey(challenge.targetKey).name, 'zh-TW');
    return finishAnswer(correct);
  }, [challenge, feedback, finishAnswer, speak]);

  const submitOrder = useCallback((arrangement) => {
    if (locked.current || !challenge || challenge.kind !== 'order' || feedback) return;
    locked.current = true;
    return finishAnswer(orderIsCorrect(arrangement));
  }, [challenge, feedback, finishAnswer]);

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
    phase, currentQ, count, stats, feedback, challenge,
    stars, title: TITLES[stars], elapsedSec, difficulty,
    startChallenge, handleChoose, submitOrder,
    targetName: challenge ? planetByKey(challenge.targetKey)?.name ?? '' : '',
  };
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.useGame.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/games/solar-system/useGame.js src/test/games.solar-system.useGame.test.js
git commit -m "Add solar-system game state machine and challenge builder"
```

---

### Task 3: CSS 星球元件 (`Planet.jsx`)

**Files:**
- Create: `hunter-learning/src/games/solar-system/Planet.jsx`
- Test: `hunter-learning/src/test/games.solar-system.Planet.test.jsx`

**Interfaces:**
- Consumes（Task 1）：`planetByKey`。
- Produces：`<Planet planetKey={string} size={number=64} />` 預設輸出一顆 CSS 圓形星球；土星多一圈光環、木星多水平條紋。用 `data-testid={`planet-${planetKey}`}` 讓測試抓得到。

- [ ] **Step 1: 寫失敗測試**

```jsx
// hunter-learning/src/test/games.solar-system.Planet.test.jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Planet from '../games/solar-system/Planet';

describe('Planet', () => {
  it('renders a circular orb for the given planet key', () => {
    const { getByTestId } = render(<Planet planetKey="mars" size={80} />);
    const orb = getByTestId('planet-mars');
    expect(orb).toBeTruthy();
    expect(orb.style.width).toBe('80px');
    expect(orb.style.height).toBe('80px');
  });
  it('renders a ring for saturn', () => {
    const { getByTestId } = render(<Planet planetKey="saturn" />);
    expect(getByTestId('planet-saturn').querySelector('[data-ring]')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.Planet.test.jsx`
Expected: FAIL（找不到模組 `../games/solar-system/Planet`）

- [ ] **Step 3: 實作 Planet.jsx**

```jsx
// hunter-learning/src/games/solar-system/Planet.jsx
import { planetByKey } from './data';

// 純 CSS 星球：漸層圓 + 選配光環(土星)/條紋(木星)。無外部圖檔。
export default function Planet({ planetKey, size = 64 }) {
  const p = planetByKey(planetKey);
  if (!p) return null;

  return (
    <div
      data-testid={`planet-${planetKey}`}
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
    >
      {/* 土星光環：畫在球體後方的傾斜橢圓 */}
      {p.ring && (
        <div
          data-ring
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: size * 1.7, height: size * 0.5,
            transform: 'translate(-50%,-50%) rotate(-20deg)',
            borderRadius: '50%',
            border: `${Math.max(3, size * 0.06)}px solid rgba(226,205,150,0.75)`,
            boxSizing: 'border-box', pointerEvents: 'none',
          }}
        />
      )}
      {/* 球體 */}
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          background: p.gradient,
          boxShadow: 'inset -6px -6px 14px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.35)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* 木星條紋 */}
        {p.stripes && (
          <div
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background:
                'repeating-linear-gradient(180deg, rgba(120,80,40,0.28) 0 6px, rgba(255,240,210,0.18) 6px 12px)',
              mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.Planet.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/games/solar-system/Planet.jsx src/test/games.solar-system.Planet.test.jsx
git commit -m "Add CSS Planet orb component for solar-system"
```

---

### Task 4: 設定頁 (`Settings.jsx`)

**Files:**
- Create: `hunter-learning/src/games/solar-system/Settings.jsx`
- Test: `hunter-learning/src/test/games.solar-system.Settings.test.jsx`

**Interfaces:**
- Produces：預設匯出 `SolarSystemSettings` 元件；`onStart` 用 `navigate('/solar-system/play', { state: { difficulty, count } })`。

- [ ] **Step 1: 寫失敗測試**

```jsx
// hunter-learning/src/test/games.solar-system.Settings.test.jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import SolarSystemSettings from '../games/solar-system/Settings';

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <SolarSystemSettings />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('SolarSystemSettings', () => {
  it('shows the title and difficulty options', () => {
    const { getByText } = renderPage();
    expect(getByText('太陽系')).toBeTruthy();
    expect(getByText('簡單')).toBeTruthy();
    expect(getByText('困難')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.Settings.test.jsx`
Expected: FAIL（找不到模組 `../games/solar-system/Settings`）

- [ ] **Step 3: 實作 Settings.jsx**

```jsx
// hunter-learning/src/games/solar-system/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function SolarSystemSettings() {
  const navigate = useNavigate();
  const [difficulty, setDiff] = useState('easy');
  const [count, setCount]     = useState(9);

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '插缺口·好排除' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '完整排序·干擾相近' },
      ],
      selected: difficulty,
      onChange: setDiff,
    },
    {
      label: '題數',
      options: [
        { value: 6,  icon: '⚡', text: '6 題'  },
        { value: 9,  icon: '📚', text: '9 題'  },
        { value: 12, icon: '🏆', text: '12 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="太陽系"
      icon="🪐"
      settings={settings}
      onStart={() => navigate('/solar-system/play', { state: { difficulty, count } })}
    />
  );
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.Settings.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/games/solar-system/Settings.jsx src/test/games.solar-system.Settings.test.jsx
git commit -m "Add solar-system settings page"
```

---

### Task 5: 遊戲頁 (`Game.jsx`) — 探索 / 三題型渲染

**Files:**
- Create: `hunter-learning/src/games/solar-system/Game.jsx`
- Test: `hunter-learning/src/test/games.solar-system.Game.test.jsx`

**Interfaces:**
- Consumes：`useGame`（Task 2）、`Planet`（Task 3）、`planetByKey`/`PLANETS`（Task 1）、共用 `StarField`、`ResultScreen`。
- Produces：預設匯出 `SolarSystemGame`。三種題型渲染：
  - `explore`：8 顆行星排列，點一顆 → 唸名字 + 顯示特徵卡；按鈕「準備好了，開始挑戰！」→ `g.startChallenge()`。
  - `identify`：顯示題目行星（`<Planet>`）+ 4 顆選項按鈕（中文名 + 英文小字），點擊 → `g.handleChoose(key)`。
  - `feature`：顯示特徵文字卡 + 4 個行星選項，點擊 → `g.handleChoose(key)`。
  - `order`：gap 模式—太陽系一列含一個缺口，下方 tray 用 framer-motion `drag` 拖候選行星入缺口，放開命中缺口 → 以填好的 arrangement 呼叫 `g.submitOrder(arr)`；full 模式—framer-motion `Reorder.Group` 拖曳 8 顆，「確認順序」按鈕 → `g.submitOrder(currentArr)`。

**設計說明（拖曳）：** `order` 的排列狀態由 `Game` 以本地 `useState('arr')` 持有（不放進 `useGame`，避免 setState 後立即讀取的競態）；每次 `currentQ` 變動時用 `challenge.initial` 重置。判定一律呼叫 `g.submitOrder(arr)`，由 `useGame` 用純函式 `orderIsCorrect` 判定。

- [ ] **Step 1: 寫失敗測試（渲染煙霧測試：三題型 banner 與探索按鈕）**

```jsx
// hunter-learning/src/test/games.solar-system.Game.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import SolarSystemGame from '../games/solar-system/Game';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({ correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), click: vi.fn(), ready: vi.fn(), teaching: vi.fn() }),
}));
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => vi.fn() }));

function renderGame() {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={[{ pathname: '/solar-system/play', state: { difficulty: 'easy', count: 6 } }]}>
        <SolarSystemGame />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('SolarSystemGame', () => {
  it('starts in explore mode with a start button', () => {
    const { getByText } = renderGame();
    expect(getByText('準備好了，開始挑戰！')).toBeTruthy();
  });
  it('shows the identify question after starting', () => {
    const { getByText } = renderGame();
    fireEvent.click(getByText('準備好了，開始挑戰！'));
    expect(getByText('這是哪一顆行星？')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.Game.test.jsx`
Expected: FAIL（找不到模組 `../games/solar-system/Game`）

- [ ] **Step 3: 實作 Game.jsx**

```jsx
// hunter-learning/src/games/solar-system/Game.jsx
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Text, Button } from '@mantine/core';
import { Reorder } from 'framer-motion';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import Planet from './Planet';
import { useGame } from './useGame';
import { PLANETS, planetByKey } from './data';
import { useSpeech } from '../../hooks/useSpeech';

function ChoiceButton({ planetKey, disabled, onClick }) {
  const p = planetByKey(planetKey);
  return (
    <Button size="lg" radius="lg" disabled={disabled} onClick={onClick}
      style={{ height: 'auto', padding: '10px 6px', background: 'rgba(30,42,64,0.9)',
        border: '1.5px solid rgba(255,169,77,0.4)', color: '#e9edf7' }}>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.15 }}>
        <span style={{ fontWeight: 800, fontSize: 19 }}>{p.name}</span>
        <span style={{ fontSize: 11, color: 'rgba(180,195,215,0.7)' }}>{p.en}</span>
      </span>
    </Button>
  );
}

// ── 探索模式：點行星唸名字 + 顯示特徵卡 ──
function Explore({ onStart }) {
  const speak = useSpeech();
  const [picked, setPicked] = useState('earth');
  const p = planetByKey(picked);
  return (
    <>
      <Text style={{ fontSize: 17, fontWeight: 800, color: '#e9edf7', textAlign: 'center' }}>
        點行星認識太陽系！
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, margin: '14px 0' }}>
        {PLANETS.map(pl => (
          <button key={pl.key} onClick={() => { setPicked(pl.key); speak(pl.name, 'zh-TW'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Planet planetKey={pl.key} size={pl.key === picked ? 58 : 46} />
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', minHeight: 70 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#ffd8a8' }}>{p.name} <span style={{ fontSize: 14, color: 'rgba(180,195,215,0.7)' }}>{p.en}</span></div>
        <div style={{ fontSize: 15, color: 'rgba(210,220,235,0.85)', marginTop: 4 }}>{p.feature}</div>
      </div>
      <div style={{ marginTop: 'auto', width: '100%', maxWidth: 360 }}>
        <Button size="lg" radius="xl" fullWidth onClick={onStart}
          style={{ background: 'linear-gradient(135deg,#ffb066,#ff8c42)', fontWeight: 900 }}>
          準備好了，開始挑戰！
        </Button>
      </div>
    </>
  );
}

// ── 排序題（gap = 拖候選入缺口；full = Reorder 拖曳重排）──
function OrderChallenge({ challenge, disabled, onSubmit }) {
  const [arr, setArr] = useState(challenge.initial);
  const slotRefs = useRef([]);
  useEffect(() => { setArr(challenge.initial); }, [challenge]);

  if (challenge.mode === 'full') {
    return (
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Reorder.Group axis="x" values={arr} onReorder={setArr}
          style={{ display: 'flex', justifyContent: 'center', gap: 6, listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
          {arr.map(key => (
            <Reorder.Item key={key} value={key} style={{ cursor: 'grab' }}>
              <Planet planetKey={key} size={40} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Button mt={14} size="lg" radius="xl" fullWidth disabled={disabled} onClick={() => onSubmit(arr)}
          style={{ background: 'linear-gradient(135deg,#ffb066,#ff8c42)', fontWeight: 900 }}>
          確認順序
        </Button>
      </div>
    );
  }

  // gap 模式：拖 tray 候選命中缺口即填入並自動判定
  function handleDrop(key, info) {
    const el = slotRefs.current[challenge.gapIndex];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const { x, y } = info.point;
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      const filled = arr.map((k, i) => (i === challenge.gapIndex ? key : k));
      setArr(filled);
      onSubmit(filled);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
        {arr.map((key, i) => (
          <div key={i} ref={el => (slotRefs.current[i] = el)}
            style={{ width: 40, height: 40, borderRadius: '50%',
              border: key ? 'none' : '2px dashed rgba(255,169,77,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {key && <Planet planetKey={key} size={40} />}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 18 }}>
        {challenge.tray.map(key => (
          <MotionOrb key={key} planetKey={key} disabled={disabled} onDrop={info => handleDrop(key, info)} />
        ))}
      </div>
    </div>
  );
}

function MotionOrb({ planetKey, disabled, onDrop }) {
  // 用 framer-motion drag；放開回饋 onDragEnd 的座標給父層判定命中
  const { motion } = require('framer-motion');
  return (
    <motion.div drag={!disabled} dragSnapToOrigin
      onDragEnd={(e, info) => onDrop(info)}
      style={{ cursor: 'grab', touchAction: 'none' }}>
      <Planet planetKey={planetKey} size={44} />
    </motion.div>
  );
}

export default function SolarSystemGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { difficulty = 'easy', count = 9 } = location.state || {};
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
        onRetry={() => navigate('/solar-system/play', { state: { difficulty, count } })}
        onMenu={() => navigate('/solar-system')}
        onLobby={() => navigate('/')}
      />
    );
  }

  const c = g.challenge;
  const banner = g.phase === 'explore' ? ''
    : c?.kind === 'identify' ? '這是哪一顆行星？'
    : c?.kind === 'feature'  ? '哪一顆行星是這樣的？'
    : difficulty === 'hard'  ? '把行星依離太陽的順序排好！'
    : '把正確的行星拖進空格！';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 1 }}>

        {g.phase === 'explore' && <Explore onStart={g.startChallenge} />}

        {g.phase === 'playing' && c && (
          <>
            <div style={{ textAlign: 'center', minHeight: 48, marginBottom: 8 }}>
              <Text size="sm" style={{ color: 'rgba(139,163,190,0.8)', fontWeight: 700 }}>
                第 {g.currentQ + 1} / {count} 題
              </Text>
              <Text style={{ fontSize: 17, fontWeight: 800, color: '#e9edf7' }}>{banner}</Text>
            </div>

            {/* 題幹 */}
            {c.kind === 'identify' && (
              <div style={{ margin: '6px 0 14px' }}><Planet planetKey={c.targetKey} size={110} /></div>
            )}
            {c.kind === 'feature' && (
              <div style={{ margin: '10px 0 18px', padding: '16px 22px', borderRadius: 18,
                background: 'rgba(30,42,64,0.8)', border: '1.5px solid rgba(255,169,77,0.35)',
                fontSize: 22, fontWeight: 900, color: '#ffd8a8', textAlign: 'center' }}>
                {c.prompt}
              </div>
            )}

            {/* 作答區 */}
            {(c.kind === 'identify' || c.kind === 'feature') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 340 }}>
                {c.choices.map(key => (
                  <ChoiceButton key={key} planetKey={key} disabled={!!g.feedback}
                    onClick={() => g.handleChoose(key)} />
                ))}
              </div>
            )}
            {c.kind === 'order' && (
              <OrderChallenge challenge={c} disabled={!!g.feedback} onSubmit={g.submitOrder} />
            )}

            {/* 回饋 */}
            {g.feedback && (
              <Text style={{ fontSize: 20, fontWeight: 900, marginTop: 12,
                color: g.feedback.correct ? '#51cf66' : '#ff6b6b' }}>
                {g.feedback.correct ? '答對了！🎉' : '再想想～'}
              </Text>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

註：`MotionOrb` 內用 `require('framer-motion')` 只是為了在同檔集中；實作時請把 `import { motion, Reorder } from 'framer-motion'` 提到檔案頂端，移除 `require`。（見 Step 3.5）

- [ ] **Step 3.5: 修正 import（把 `motion` 併入頂部 import，移除 `require`）**

```jsx
// 檔案頂部改為：
import { Reorder, motion } from 'framer-motion';
```
```jsx
// MotionOrb 內移除這行：
//   const { motion } = require('framer-motion');
```

- [ ] **Step 4: 執行測試確認通過**

Run: `cd hunter-learning && npx vitest run src/test/games.solar-system.Game.test.jsx`
Expected: PASS（探索按鈕存在、開始後顯示「這是哪一顆行星？」）

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/games/solar-system/Game.jsx src/test/games.solar-system.Game.test.jsx
git commit -m "Add solar-system game page with explore and three challenge types"
```

---

### Task 6: 註冊路由與 Lobby 卡片

**Files:**
- Modify: `hunter-learning/src/App.jsx`（加 import + 兩條 route）
- Modify: `hunter-learning/src/pages/Lobby.jsx`（`GAMES` 陣列加一張卡）

**Interfaces:**
- Consumes：`SolarSystemSettings`（Task 4）、`SolarSystemGame`（Task 5）。

- [ ] **Step 1: App.jsx 加 import（在 MoonPhases import 之後）**

```jsx
import SolarSystemSettings from './games/solar-system/Settings';
import SolarSystemGame      from './games/solar-system/Game';
```

- [ ] **Step 2: App.jsx 加兩條 route（在 moon-phases 兩條 route 之後）**

```jsx
        <Route path="/solar-system"       element={<SolarSystemSettings />} />
        <Route path="/solar-system/play"  element={<SolarSystemGame />} />
```

- [ ] **Step 3: Lobby.jsx 的 `GAMES` 陣列末端加一張卡**

```jsx
  { path: '/solar-system',  icon: '🪐',  title: '太陽系',     desc: '認識八大行星！', color: '#ffa94d', glow: 'rgba(255,169,77,0.32)' },
```

- [ ] **Step 4: 手動驗證路由與卡片**

Run: `cd hunter-learning && npm run dev`
確認：首頁出現「太陽系」卡片 → 點入設定頁 → 開始 → 探索/三題型都能玩、排序可拖曳。看完 Ctrl-C。

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/App.jsx src/pages/Lobby.jsx
git commit -m "Wire up solar-system game: routes and lobby card"
```

---

### Task 7: 全量驗證（測試 + lint + build）

**Files:** 無（僅驗證）

- [ ] **Step 1: 跑全部測試**

Run: `cd hunter-learning && npm run test:run`
Expected: 全綠，含新增的 `games.solar-system.*` 四支測試。

- [ ] **Step 2: Lint**

Run: `cd hunter-learning && npm run lint`
Expected: 無錯誤（若有未使用 import 等，修掉再重跑）。

- [ ] **Step 3: Build 驗證可編譯**

Run: `cd hunter-learning && npm run build`
Expected: 成功輸出到 `../docs`。

- [ ] **Step 4: 清理 docs/ 舊 hashed 檔並提交部署（照 CLAUDE.md 部署流程）**

> ⚠️ 此步驟改動 `docs/`（GitHub Pages 發佈根）。**先與使用者確認要不要部署**；若只想完成開發、稍後再部署，跳過本步。

```bash
cd /Users/clin/Documents/Hunter_Learning
# 刪掉 docs/assets 中新 index.html 沒引用的舊 hashed 檔案（比對後手動刪）
git add -A
git commit -m "Build: deploy solar-system game"
# git push   # push 到 main 即部署，確認後再執行
```

---

## Self-Review

**Spec coverage：**
- 三學習目標（名字/順序/特徵）→ Task 2 `buildChallenge` 三題型 ✅
- CSS 星球（土星光環、木星條紋）→ Task 3 `Planet.jsx` ✅
- 難度切換順序題型（插缺口/完整排序）→ Task 2 `order` mode + Task 5 `OrderChallenge` ✅
- 四選一含正解、困難干擾相鄰 → Task 1 `buildDistractorKeys` ✅
- 中文為主+英文小字 → Task 5 `ChoiceButton` / `Explore` ✅
- 探索模式先玩後測 → Task 5 `Explore` + `phase:'explore'` ✅
- 題數 6/9/12 預設 9 → Task 4 `Settings` ✅
- 結算沿用 ResultScreen/星星 → Task 5 + Task 2 ✅
- 測試（三題型出現、正解在選項、計分、決定性 kind）→ Task 1/2/3/4/5 測試 ✅
- 註冊 App/Lobby → Task 6 ✅
- 不放檔進 docs/、部署清理 → Task 7 遵守 CLAUDE.md ✅

**Placeholder scan：** 無 TBD/TODO；所有 code step 皆含完整程式。Task 5 Step 3 的 `require` 已在 Step 3.5 明確修正為頂部 import。

**Type consistency：** `handleChoose(key)`、`submitOrder(arrangement)`、`buildChallenge(difficulty, idx)`、`buildDistractorKeys(targetKey, difficulty)`、`orderIsCorrect(arrangement)`、`<Planet planetKey size>` 在各 task 間一致；`challenge` 形狀（identify/feature 有 `choices`；order 有 `mode/initial/gapIndex/tray`）在 Task 2 定義、Task 5 消費一致。
