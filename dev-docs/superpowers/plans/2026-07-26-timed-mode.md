# 限時模式（10 秒答題）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為算數大戰、連鎖算數、湊十大師、奇偶偵探、音符星球加上「限時挑戰（10 秒）」難度選擇；逾時視同答錯並公布正確答案。

**Architecture:** 新增共用 `useCountdown` hook（100ms tick、deadline 制）與 `TimeBar` 倒數條元件；每個遊戲的 `useGame` 增加 `handleTimeout`（行為比照答錯），`Game.jsx` 負責串接 countdown 與 UI，`Settings.jsx` 增加共用的「限時模式」設定列。悠閒模式（預設）行為與現在完全相同。

**Tech Stack:** Vite + React 19、@mantine/core 8、framer-motion 12、react-router-dom 7、vitest 4 + @testing-library/react。

**Spec:** `docs/superpowers/specs/2026-07-22-timed-mode-design.md`

## Global Constraints

- 所有 npm/npx 指令都在 `hunter-learning/` 目錄下執行（不是 repo root）。
- 時限固定 10 秒：常數 `TIMED_SECONDS = 10`，定義在 `src/hooks/useCountdown.js`，各遊戲 import 使用，不得另寫 `10`。
- 設定列文案完全一致：`😌 悠閒模式（sub: 不限時）` / `⏱️ 限時挑戰（sub: 10 秒）`，label `限時模式`，來自共用 `TIMED_SETTING`。
- `timed` 預設 `false`（悠閒模式）；未帶 `timed` 的舊 navigation state 必須照常運作。
- 湊十大師「配對模式」不支援限時（設定列隱藏、`handleTimeout` 為 no-op）。
- Commit 訊息用 repo 現有風格：英文祈使句、無 conventional-commit 前綴（例：`Add 3-note mode to note-staff game`），結尾加 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。
- 測試檔放 `src/test/`，命名沿用現有 `games.<name>.useGame.test.js` / `components.<Name>.test.jsx` / `hooks.<name>.test.js` 格式。
- 新測試檔 mock 路徑（相對於 `src/test/`）：`vi.mock('../hooks/useSound', ...)`、`vi.mock('../utils/math', ...)`（把 `delay` mock 成立即 resolve）。不要抄舊檔裡 `'../../src/hooks/useSound'` 這個錯誤路徑。

---

### Task 1: `useCountdown` hook

**Files:**
- Create: `hunter-learning/src/hooks/useCountdown.js`
- Test: `hunter-learning/src/test/hooks.useCountdown.test.js`

**Interfaces:**
- Consumes: 無（獨立 hook）。
- Produces:
  - `TIMED_SECONDS = 10`（named export）
  - `useCountdown({ seconds, enabled, paused = false, resetKey, onExpire })` → `{ fraction /* 1 → 0 */, timeLeft /* 秒，ceil */ }`
  - 語意：`enabled=false` 完全不跑；`paused=true` 凍結；`resetKey` 改變（含型別為字串如 `"0-1"`）時重置回滿檔並重新武裝 `onExpire`；歸零時呼叫 `onExpire` 恰好一次（每個 resetKey 週期）。

- [ ] **Step 1: Write the failing test**

建立 `hunter-learning/src/test/hooks.useCountdown.test.js`：

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown, TIMED_SECONDS } from '../hooks/useCountdown';

const baseProps = { seconds: 10, enabled: true, paused: false, resetKey: 0, onExpire: () => {} };

describe('useCountdown', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('TIMED_SECONDS is 10', () => {
    expect(TIMED_SECONDS).toBe(10);
  });

  it('starts full and counts down', () => {
    const { result } = renderHook(() => useCountdown({ ...baseProps }));
    expect(result.current.fraction).toBe(1);
    expect(result.current.timeLeft).toBe(10);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.fraction).toBeCloseTo(0.5, 1);
    expect(result.current.timeLeft).toBe(5);
  });

  it('calls onExpire exactly once at zero', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ ...baseProps, onExpire }));
    act(() => { vi.advanceTimersByTime(11000); });
    expect(result.current.fraction).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('does nothing when enabled=false', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ ...baseProps, enabled: false, onExpire }));
    act(() => { vi.advanceTimersByTime(20000); });
    expect(result.current.fraction).toBe(1);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('paused freezes the countdown, unpause resumes from where it stopped', () => {
    const { result, rerender } = renderHook(props => useCountdown(props), {
      initialProps: { ...baseProps },
    });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.fraction).toBeCloseTo(0.7, 1);
    rerender({ ...baseProps, paused: true });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.fraction).toBeCloseTo(0.7, 1);
    rerender({ ...baseProps, paused: false });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.fraction).toBeCloseTo(0.5, 1);
  });

  it('resetKey change refills and re-arms onExpire', () => {
    const onExpire = vi.fn();
    const { result, rerender } = renderHook(props => useCountdown(props), {
      initialProps: { ...baseProps, onExpire },
    });
    act(() => { vi.advanceTimersByTime(11000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
    rerender({ ...baseProps, onExpire, resetKey: 1 });
    expect(result.current.fraction).toBe(1);
    act(() => { vi.advanceTimersByTime(11000); });
    expect(onExpire).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd hunter-learning && npx vitest run src/test/hooks.useCountdown.test.js`
Expected: FAIL — `Failed to resolve import "../hooks/useCountdown"`。

- [ ] **Step 3: Write the implementation**

建立 `hunter-learning/src/hooks/useCountdown.js`：

```js
import { useState, useEffect, useRef } from 'react';

export const TIMED_SECONDS = 10;

// Countdown for timed mode. Deadline-based with a 100ms tick so the bar is
// smooth and immune to interval drift. Fires onExpire exactly once per
// resetKey cycle.
export function useCountdown({ seconds, enabled, paused = false, resetKey, onExpire }) {
  const totalMs = seconds * 1000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const remainingRef  = useRef(totalMs);
  const firedRef      = useRef(false);
  const onExpireRef   = useRef(onExpire);
  onExpireRef.current = onExpire;

  // New answer unit → refill and re-arm
  useEffect(() => {
    firedRef.current = false;
    remainingRef.current = totalMs;
    setRemainingMs(totalMs);
  }, [resetKey, totalMs]);

  // Tick while enabled and not paused
  useEffect(() => {
    if (!enabled || paused || firedRef.current) return;
    const startedAt = Date.now();
    const base = remainingRef.current;
    const id = setInterval(() => {
      const left = base - (Date.now() - startedAt);
      if (left <= 0) {
        remainingRef.current = 0;
        setRemainingMs(0);
        clearInterval(id);
        if (!firedRef.current) {
          firedRef.current = true;
          onExpireRef.current?.();
        }
      } else {
        remainingRef.current = left;
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [enabled, paused, resetKey, totalMs]);

  return {
    fraction: totalMs > 0 ? remainingMs / totalMs : 0,
    timeLeft: Math.ceil(remainingMs / 1000),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd hunter-learning && npx vitest run src/test/hooks.useCountdown.test.js`
Expected: PASS（6 tests）。

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/hooks/useCountdown.js src/test/hooks.useCountdown.test.js
git commit -m "Add useCountdown hook for timed mode

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `TimeBar` 元件 + 共用設定列

**Files:**
- Create: `hunter-learning/src/components/TimeBar.jsx`
- Create: `hunter-learning/src/utils/timedSetting.js`
- Modify: `hunter-learning/src/index.css`（新增 keyframes，接在既有 `@keyframes pulse-ring` 之後）
- Test: `hunter-learning/src/test/components.TimeBar.test.jsx`

**Interfaces:**
- Consumes: 無。
- Produces:
  - `<TimeBar fraction={number} />`（default export）— fraction 1→0，≤0.3 變紅並閃爍
  - `TIMED_SETTING`（named export from `utils/timedSetting.js`）— 展開進各 Settings 的 settings 陣列：`{ ...TIMED_SETTING, selected: timed, onChange: setTimed }`

- [ ] **Step 1: Write the failing test**

建立 `hunter-learning/src/test/components.TimeBar.test.jsx`：

```jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TimeBar from '../components/TimeBar';

describe('TimeBar', () => {
  it('fill width matches fraction', () => {
    const { container } = render(<TimeBar fraction={0.5} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.width).toBe('50%');
  });

  it('teal gradient and no pulse when plenty of time left', () => {
    const { container } = render(<TimeBar fraction={0.8} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.background).toContain('linear-gradient');
    expect(fill.style.animation).toBe('none');
  });

  it('red + pulsing when fraction <= 0.3', () => {
    const { container } = render(<TimeBar fraction={0.2} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.background.replace(/\s/g, '')).toMatch(/(#f85149|rgb\(248,81,73\))/i);
    expect(fill.style.animation).toContain('timebar-pulse');
  });

  it('clamps fraction below 0 to 0%', () => {
    const { container } = render(<TimeBar fraction={-0.2} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.width).toBe('0%');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd hunter-learning && npx vitest run src/test/components.TimeBar.test.jsx`
Expected: FAIL — `Failed to resolve import "../components/TimeBar"`。

- [ ] **Step 3: Write the implementation**

建立 `hunter-learning/src/components/TimeBar.jsx`：

```jsx
// Shrinking countdown bar for timed mode. Turns red and pulses when ≤30% left.
export default function TimeBar({ fraction }) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const low = clamped <= 0.3;

  return (
    <div style={{
      height: 8, borderRadius: 6,
      background: 'rgba(139,163,190,0.15)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${clamped * 100}%`,
        background: low ? '#f85149' : 'linear-gradient(90deg, #12b886, #0dcfaa)',
        borderRadius: 6,
        boxShadow: low ? '0 0 8px rgba(248,81,73,0.6)' : '0 0 6px rgba(18,184,134,0.4)',
        transition: 'width 0.1s linear',
        animation: low ? 'timebar-pulse 0.5s ease-in-out infinite alternate' : 'none',
      }} />
    </div>
  );
}
```

建立 `hunter-learning/src/utils/timedSetting.js`：

```js
// Shared「限時模式」settings row — spread into each game's settings array:
//   { ...TIMED_SETTING, selected: timed, onChange: setTimed }
export const TIMED_SETTING = {
  label: '限時模式',
  options: [
    { value: false, icon: '😌', text: '悠閒模式', sub: '不限時' },
    { value: true,  icon: '⏱️', text: '限時挑戰', sub: '10 秒' },
  ],
};
```

在 `hunter-learning/src/index.css` 檔尾（`@keyframes pulse-ring` 區塊之後）加上：

```css
@keyframes timebar-pulse {
  from { opacity: 1; }
  to   { opacity: 0.55; }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd hunter-learning && npx vitest run src/test/components.TimeBar.test.jsx`
Expected: PASS（4 tests）。

- [ ] **Step 5: Commit**

```bash
cd hunter-learning
git add src/components/TimeBar.jsx src/utils/timedSetting.js src/index.css src/test/components.TimeBar.test.jsx
git commit -m "Add TimeBar component and shared timed-mode setting

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 算數大戰（math-battle）

**Files:**
- Modify: `hunter-learning/src/games/math-battle/Settings.jsx`
- Modify: `hunter-learning/src/games/math-battle/useGame.js`
- Modify: `hunter-learning/src/games/math-battle/Game.jsx`
- Test: `hunter-learning/src/test/games.mathBattle.useGame.test.js`（附加測試）

**Interfaces:**
- Consumes: `useCountdown` / `TIMED_SECONDS`（Task 1）、`TimeBar`、`TIMED_SETTING`（Task 2）。
- Produces: `useGame` 額外回傳 `timeoutAnswer`（number|null，逾時期間顯示的正確答案）、`timerPaused`（boolean）、`handleTimeout`（async fn）。navigation state 增加 `timed`（boolean）。

- [ ] **Step 1: Write the failing tests**

在 `hunter-learning/src/test/games.mathBattle.useGame.test.js` 的 describe 區塊尾端（最後一個 `it` 之後）附加：

```js
  it('handleTimeout counts as wrong, decreases HP, advances question', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.playerHP).toBe(2);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.timeoutAnswer).toBe(null);
  });

  it('3 timeouts lead to game over', async () => {
    const { result } = renderHook(() => useGame({ difficulty: 'easy', count: 10 }));
    for (let i = 0; i < 3; i++) {
      await act(async () => { await result.current.handleTimeout(); });
    }
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd hunter-learning && npx vitest run src/test/games.mathBattle.useGame.test.js`
Expected: 新增 2 個測試 FAIL（`handleTimeout is not a function`），原有測試 PASS。

- [ ] **Step 3: Modify `useGame.js`**

3a. 在 `const [completed, setCompleted] = useState(true);`（第 20 行附近）下方加入：

```js
  const [timeoutAnswer, setTimeoutAnswer]       = useState(null);
  const [timerPaused, setTimerPaused]           = useState(false);
```

3b. handleKey 內，把

```js
    locked.current = true;
    const isCorrect = ans === questionRef.current.answer;
```

改為

```js
    locked.current = true;
    setTimerPaused(true);
    const isCorrect = ans === questionRef.current.answer;
```

3c. handleKey 的 game-over 分支，把

```js
        setPhase('result');
        locked.current = false;
        return;
```

改為

```js
        setPhase('result');
        setTimerPaused(false);
        locked.current = false;
        return;
```

3d. handleKey 結尾，把

```js
    locked.current = false;
  }, [count, difficulty, sound]);
```

改為

```js
    setTimerPaused(false);
    locked.current = false;
  }, [count, difficulty, sound]);
```

3e. 在 handleKey 定義之後（`}, [count, difficulty, sound]);` 與 `const stars = ...` 之間）插入：

```js
  // 限時模式:10 秒未作答 → 視同答錯並公布正確答案
  const handleTimeout = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setTimerPaused(true);

    answerRef.current = '';
    setAnswer('');
    setTimeoutAnswer(questionRef.current.answer);

    sound.wrong();
    setMonsterAttacking(true);
    await delay(350);
    setMonsterAttacking(false);
    setPlayerFlash(true);
    await delay(400);
    setPlayerFlash(false);

    setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    const nextHP = playerHPRef.current - 1;
    setPlayerHP(nextHP);

    await delay(450);
    setTimeoutAnswer(null);

    if (nextHP <= 0) {
      setCompleted(false);
      await delay(500);
      sound.gameOver();
      await delay(700);
      setPhase('result');
      setTimerPaused(false);
      locked.current = false;
      return;
    }

    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(400);
      sound.victory();
      setPhase('result');
    } else {
      const next = generateArith(difficulty);
      questionRef.current = next;
      setQuestion(next);
    }

    setTimerPaused(false);
    locked.current = false;
  }, [count, difficulty, sound]);
```

3f. return 物件內，把

```js
    stars, title, elapsedSec, handleKey,
```

改為

```js
    stars, title, elapsedSec, handleKey,
    timeoutAnswer, timerPaused, handleTimeout,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd hunter-learning && npx vitest run src/test/games.mathBattle.useGame.test.js`
Expected: PASS（全部，含新增 2 個）。

- [ ] **Step 5: Modify `Game.jsx`（串接 UI）**

5a. import 區加入：

```js
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
import TimeBar from '../../components/TimeBar';
```

5b. 把

```js
  const { difficulty = 'easy', count = 10 } = location.state || {};
```

改為

```js
  const { difficulty = 'easy', count = 10, timed = false } = location.state || {};
```

5c. useGame 解構加入新欄位，把

```js
    stars, title, elapsedSec, handleKey,
  } = useGame({ difficulty, count });
```

改為

```js
    stars, title, elapsedSec, handleKey,
    timeoutAnswer, timerPaused, handleTimeout,
  } = useGame({ difficulty, count });

  const { fraction } = useCountdown({
    seconds: TIMED_SECONDS,
    enabled: timed && phase === 'playing',
    paused: timerPaused,
    resetKey: currentQ,
    onExpire: handleTimeout,
  });
```

5d. ResultScreen 的 onRetry，把

```js
        onRetry={() => navigate('/math-battle/play', { state: { difficulty, count } })}
```

改為

```js
        onRetry={() => navigate('/math-battle/play', { state: { difficulty, count, timed } })}
```

5e. 渲染部分，把

```jsx
    <GameLayout>
      <BattleField
```

改為

```jsx
    <GameLayout>
      {timeoutAnswer != null && (
        <div style={{
          position: 'absolute', top: '34%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 20,
          background: 'rgba(10,22,38,0.95)',
          border: '2px solid rgba(248,81,73,0.6)',
          borderRadius: 18, padding: '14px 24px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 30, lineHeight: 1 }}>⏰</div>
          <div style={{ color: '#f85149', fontWeight: 900, fontSize: 15, marginTop: 6 }}>時間到！</div>
          <div style={{ color: '#e6edf3', fontWeight: 900, fontSize: 22, marginTop: 4 }}>
            正確答案：{timeoutAnswer}
          </div>
        </div>
      )}
      <BattleField
```

並把

```jsx
      <BattleUI
```

改為

```jsx
      {timed && (
        <div style={{ padding: '0 16px 6px' }}>
          <TimeBar fraction={fraction} />
        </div>
      )}
      <BattleUI
```

- [ ] **Step 6: Modify `Settings.jsx`**

以下列完整內容覆寫 `hunter-learning/src/games/math-battle/Settings.jsx`：

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';

export default function MathBattleSettings() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [count, setCount]           = useState(10);
  const [timed, setTimed]           = useState(false);

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '個位數' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '兩位數' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    { ...TIMED_SETTING, selected: timed, onChange: setTimed },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題',  sub: '快速' },
        { value: 10, icon: '⚔️', text: '10 題', sub: '標準' },
        { value: 20, icon: '🏆', text: '20 題', sub: '挑戰' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="算數大戰"
      icon="⚔️"
      settings={settings}
      onStart={() => navigate('/math-battle/play', { state: { difficulty, count, timed } })}
    />
  );
}
```

- [ ] **Step 7: Run full test suite**

Run: `cd hunter-learning && npm run test:run`
Expected: 全部 PASS。

- [ ] **Step 8: Commit**

```bash
cd hunter-learning
git add src/games/math-battle src/test/games.mathBattle.useGame.test.js
git commit -m "Add 10s timed mode to math-battle

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 連鎖算數（chain-math）

**Files:**
- Modify: `hunter-learning/src/games/chain-math/Settings.jsx`
- Modify: `hunter-learning/src/games/chain-math/useGame.js`
- Modify: `hunter-learning/src/games/chain-math/Game.jsx`
- Test: `hunter-learning/src/test/games.chainMath.useGame.test.js`（附加測試）

**Interfaces:**
- Consumes: 同 Task 3。
- Produces: 同 Task 3（`timeoutAnswer`、`timerPaused`、`handleTimeout`、state `timed`）。chain-math 的 navigation state 為 `{ operation, difficulty, count, timed }`。

與 Task 3 完全同構，差異只有：題目產生器是 `generateChainQuestion(operation, difficulty)`、handleKey/handleTimeout 的 deps 是 `[count, operation, difficulty, sound]`、路徑是 `/chain-math/*`。**不要假設可以「參考 Task 3 的 diff」——照本 task 明列的內容改。**

- [ ] **Step 1: Write the failing tests**

在 `hunter-learning/src/test/games.chainMath.useGame.test.js` 的 describe 區塊尾端附加（若該檔 import 缺 `waitFor`，從 `@testing-library/react` 補上）：

```js
  it('handleTimeout counts as wrong, decreases HP, advances question', async () => {
    const { result } = renderHook(() => useGame({ operation: 'add', difficulty: 'easy', count: 10 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.playerHP).toBe(2);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.timeoutAnswer).toBe(null);
  });

  it('3 timeouts lead to game over', async () => {
    const { result } = renderHook(() => useGame({ operation: 'add', difficulty: 'easy', count: 10 }));
    for (let i = 0; i < 3; i++) {
      await act(async () => { await result.current.handleTimeout(); });
    }
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd hunter-learning && npx vitest run src/test/games.chainMath.useGame.test.js`
Expected: 新增 2 個測試 FAIL，原有測試 PASS。

- [ ] **Step 3: Modify `useGame.js`**

3a. 在 `const [completed, setCompleted] = useState(true);` 下方加入：

```js
  const [timeoutAnswer, setTimeoutAnswer]       = useState(null);
  const [timerPaused, setTimerPaused]           = useState(false);
```

3b. handleKey 內，把

```js
    locked.current = true;
    const isCorrect = ans === questionRef.current.answer;
```

改為

```js
    locked.current = true;
    setTimerPaused(true);
    const isCorrect = ans === questionRef.current.answer;
```

3c. handleKey 的 game-over 分支，把

```js
        setPhase('result');
        locked.current = false;
        return;
```

改為

```js
        setPhase('result');
        setTimerPaused(false);
        locked.current = false;
        return;
```

3d. handleKey 結尾，把

```js
    locked.current = false;
  }, [count, operation, difficulty, sound]);
```

改為

```js
    setTimerPaused(false);
    locked.current = false;
  }, [count, operation, difficulty, sound]);
```

3e. 在 handleKey 定義之後插入：

```js
  // 限時模式:10 秒未作答 → 視同答錯並公布正確答案
  const handleTimeout = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setTimerPaused(true);

    answerRef.current = '';
    setAnswer('');
    setTimeoutAnswer(questionRef.current.answer);

    sound.wrong();
    setMonsterAttacking(true);
    await delay(350);
    setMonsterAttacking(false);
    setPlayerFlash(true);
    await delay(400);
    setPlayerFlash(false);

    setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    const nextHP = playerHPRef.current - 1;
    setPlayerHP(nextHP);

    await delay(450);
    setTimeoutAnswer(null);

    if (nextHP <= 0) {
      setCompleted(false);
      await delay(500);
      sound.gameOver();
      await delay(700);
      setPhase('result');
      setTimerPaused(false);
      locked.current = false;
      return;
    }

    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(400);
      sound.victory();
      setPhase('result');
    } else {
      const next = generateChainQuestion(operation, difficulty);
      questionRef.current = next;
      setQuestion(next);
    }

    setTimerPaused(false);
    locked.current = false;
  }, [count, operation, difficulty, sound]);
```

3f. return 物件內，把

```js
    stars, title, elapsedSec, handleKey,
```

改為

```js
    stars, title, elapsedSec, handleKey,
    timeoutAnswer, timerPaused, handleTimeout,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd hunter-learning && npx vitest run src/test/games.chainMath.useGame.test.js`
Expected: PASS。

- [ ] **Step 5: Modify `Game.jsx`**

5a. import 區加入：

```js
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
import TimeBar from '../../components/TimeBar';
```

5b. 把

```js
  const { operation = 'add', difficulty = 'easy', count = 10 } = location.state || {};
```

改為

```js
  const { operation = 'add', difficulty = 'easy', count = 10, timed = false } = location.state || {};
```

5c. 把

```js
    stars, title, elapsedSec, handleKey,
  } = useGame({ operation, difficulty, count });
```

改為

```js
    stars, title, elapsedSec, handleKey,
    timeoutAnswer, timerPaused, handleTimeout,
  } = useGame({ operation, difficulty, count });

  const { fraction } = useCountdown({
    seconds: TIMED_SECONDS,
    enabled: timed && phase === 'playing',
    paused: timerPaused,
    resetKey: currentQ,
    onExpire: handleTimeout,
  });
```

5d. onRetry，把

```js
        onRetry={() => navigate('/chain-math/play', { state: { operation, difficulty, count } })}
```

改為

```js
        onRetry={() => navigate('/chain-math/play', { state: { operation, difficulty, count, timed } })}
```

5e. 渲染部分，把

```jsx
    <GameLayout>
      <BattleField
```

改為

```jsx
    <GameLayout>
      {timeoutAnswer != null && (
        <div style={{
          position: 'absolute', top: '34%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 20,
          background: 'rgba(10,22,38,0.95)',
          border: '2px solid rgba(248,81,73,0.6)',
          borderRadius: 18, padding: '14px 24px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 30, lineHeight: 1 }}>⏰</div>
          <div style={{ color: '#f85149', fontWeight: 900, fontSize: 15, marginTop: 6 }}>時間到！</div>
          <div style={{ color: '#e6edf3', fontWeight: 900, fontSize: 22, marginTop: 4 }}>
            正確答案：{timeoutAnswer}
          </div>
        </div>
      )}
      <BattleField
```

並把

```jsx
      <BattleUI
```

改為

```jsx
      {timed && (
        <div style={{ padding: '0 16px 6px' }}>
          <TimeBar fraction={fraction} />
        </div>
      )}
      <BattleUI
```

- [ ] **Step 6: Modify `Settings.jsx`**

以下列完整內容覆寫 `hunter-learning/src/games/chain-math/Settings.jsx`：

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';

export default function ChainMathSettings() {
  const navigate = useNavigate();
  const [operation, setOperation] = useState('add');
  const [difficulty, setDifficulty] = useState('easy');
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);

  const settings = [
    {
      label: '運算',
      options: [
        { value: 'add', icon: '➕', text: '加法' },
        { value: 'sub', icon: '➖', text: '減法' },
        { value: 'mix', icon: '🔀', text: '混合' },
      ],
      selected: operation,
      onChange: setOperation,
    },
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '個位數' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '兩位數' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    { ...TIMED_SETTING, selected: timed, onChange: setTimed },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題' },
        { value: 10, icon: '⚔️', text: '10 題' },
        { value: 20, icon: '🏆', text: '20 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="連鎖算數大戰"
      icon="➕"
      settings={settings}
      onStart={() => navigate('/chain-math/play', { state: { operation, difficulty, count, timed } })}
    />
  );
}
```

- [ ] **Step 7: Run full test suite**

Run: `cd hunter-learning && npm run test:run`
Expected: 全部 PASS。

- [ ] **Step 8: Commit**

```bash
cd hunter-learning
git add src/games/chain-math src/test/games.chainMath.useGame.test.js
git commit -m "Add 10s timed mode to chain-math

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: 湊十大師（make-ten，僅「選答案」模式）

**Files:**
- Modify: `hunter-learning/src/games/make-ten/Settings.jsx`
- Modify: `hunter-learning/src/games/make-ten/useGame.js`
- Modify: `hunter-learning/src/games/make-ten/Game.jsx`
- Test: Create `hunter-learning/src/test/games.makeTen.useGame.test.js`

**Interfaces:**
- Consumes: `useCountdown`/`TIMED_SECONDS`、`TimeBar`、`TIMED_SETTING`。
- Produces: `useGame` 額外回傳 `handleTimeout`（choose 模式：計錯並前進；match 模式：no-op）。navigation state 增加 `timed`；match 模式下一律為 `false`。

備註：ChooseView 在 `feedback === 'wrong'` 時本來就會高亮正確選項，所以逾時只需 `setFeedback('wrong')`，「顯示正確答案」由既有 UI 完成。

- [ ] **Step 1: Write the failing tests**

建立 `hunter-learning/src/test/games.makeTen.useGame.test.js`：

```js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame } from '../games/make-ten/useGame';

describe('useGame (make-ten) timed mode', () => {
  it('choose mode: handleTimeout counts wrong and advances', async () => {
    const { result } = renderHook(() => useGame({ mode: 'choose', count: 8 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.feedback).toBe(null);
  });

  it('choose mode: timeout on last question ends the game', async () => {
    const { result } = renderHook(() => useGame({ mode: 'choose', count: 1 }));
    await act(async () => { await result.current.handleTimeout(); });
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });

  it('match mode: handleTimeout is a no-op', async () => {
    const { result } = renderHook(() => useGame({ mode: 'match', count: 4 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(0);
    expect(result.current.phase).toBe('playing');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd hunter-learning && npx vitest run src/test/games.makeTen.useGame.test.js`
Expected: FAIL — `handleTimeout is not a function`。

- [ ] **Step 3: Modify `useGame.js`**

3a. 在 `handleAnswer` 定義（`}, [mode, count, question, sound]);`）之後、`// ── Match mode handler` 註解之前插入：

```js
  // 限時模式(僅 choose 模式):10 秒未作答 → 視同答錯,
  // feedback='wrong' 會讓 ChooseView 高亮正確選項
  const handleTimeout = useCallback(async () => {
    if (locked.current || mode !== 'choose') return;
    locked.current = true;

    setFeedback('wrong');
    sound.wrong();
    setStats(s => ({ ...s, wrong: s.wrong + 1 }));

    await delay(1000);
    setFeedback(null);

    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(200);
      sound.victory();
      setPhase('result');
    } else {
      setQuestion(genQuestion());
    }
    locked.current = false;
  }, [mode, count, sound]);
```

3b. return 物件內，把

```js
    question, currentQ, feedback, handleAnswer,
```

改為

```js
    question, currentQ, feedback, handleAnswer, handleTimeout,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd hunter-learning && npx vitest run src/test/games.makeTen.useGame.test.js`
Expected: PASS（3 tests）。

- [ ] **Step 5: Modify `Game.jsx`**

5a. import 區加入：

```js
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
import TimeBar from '../../components/TimeBar';
```

5b. 把

```js
  const { mode = 'choose', count = 8, skipTeach } = location.state || {};
```

改為

```js
  const { mode = 'choose', count = 8, skipTeach, timed = false } = location.state || {};
  const timedActive = timed && mode === 'choose';
```

5c. 把

```js
    phase, stats, stars, title, elapsedSec,
  } = useGame({ mode, count });
```

改為

```js
    phase, stats, stars, title, elapsedSec,
  } = useGame({ mode, count });

  const { fraction } = useCountdown({
    seconds: TIMED_SECONDS,
    enabled: timedActive && !teaching && phase === 'playing',
    paused: feedback !== null,
    resetKey: currentQ,
    onExpire: handleTimeout,
  });
```

同時把 useGame 解構的第一行

```js
    question, currentQ, feedback, handleAnswer,
```

改為

```js
    question, currentQ, feedback, handleAnswer, handleTimeout,
```

（注意：`useCountdown` 必須在 `if (teaching)` early return 之前呼叫——hooks 順序是 `useState(teaching)` → `useGame` → `useCountdown`，本步驟的插入位置已保證這點。）

5d. onRetry，把

```js
        onRetry={() => navigate('/make-ten/play', { state: { mode, count, skipTeach: true } })}
```

改為

```js
        onRetry={() => navigate('/make-ten/play', { state: { mode, count, skipTeach: true, timed } })}
```

5e. 遊戲卡片內、`{mode === 'choose' ? (` 之前插入 TimeBar，把

```jsx
          {mode === 'choose' ? (
```

改為

```jsx
          {timedActive && (
            <div style={{ marginBottom: 14 }}>
              <TimeBar fraction={fraction} />
            </div>
          )}
          {mode === 'choose' ? (
```

- [ ] **Step 6: Modify `Settings.jsx`**

以下列完整內容覆寫 `hunter-learning/src/games/make-ten/Settings.jsx`：

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';

export default function MakeTenSettings() {
  const navigate = useNavigate();
  const [mode,  setMode]  = useState('choose');
  const [count, setCount] = useState(8);
  const [timed, setTimed] = useState(false);

  const countOptions = mode === 'choose'
    ? [
        { value: 8,  icon: '⚡', text: '8題',  sub: '輕鬆' },
        { value: 15, icon: '🔥', text: '15題', sub: '挑戰' },
      ]
    : [
        { value: 4,  icon: '⚡', text: '4對',  sub: '輕鬆' },
        { value: 8,  icon: '🔥', text: '8對',  sub: '挑戰' },
      ];

  function handleModeChange(m) {
    setMode(m);
    setCount(m === 'choose' ? 8 : 4);
  }

  const settings = [
    {
      label: '遊戲模式',
      options: [
        { value: 'choose', icon: '🎯', text: '選答案', sub: '4選1' },
        { value: 'match',  icon: '🔗', text: '配對',  sub: '找夥伴' },
      ],
      selected: mode,
      onChange: handleModeChange,
    },
    // 配對模式不支援限時,隱藏此列
    ...(mode === 'choose'
      ? [{ ...TIMED_SETTING, selected: timed, onChange: setTimed }]
      : []),
    {
      label: mode === 'choose' ? '題數' : '對數',
      options: countOptions,
      selected: count,
      onChange: setCount,
    },
  ];

  return (
    <SettingsPage
      title="湊十大師"
      icon="🔟"
      settings={settings}
      onStart={() => navigate('/make-ten/play', {
        state: { mode, count, timed: mode === 'choose' ? timed : false },
      })}
    />
  );
}
```

- [ ] **Step 7: Run full test suite**

Run: `cd hunter-learning && npm run test:run`
Expected: 全部 PASS。

- [ ] **Step 8: Commit**

```bash
cd hunter-learning
git add src/games/make-ten src/test/games.makeTen.useGame.test.js
git commit -m "Add 10s timed mode to make-ten choose mode

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: 奇偶偵探（odd-even，兩種模式）

**Files:**
- Modify: `hunter-learning/src/games/odd-even/Settings.jsx`
- Modify: `hunter-learning/src/games/odd-even/useGame.js`
- Modify: `hunter-learning/src/games/odd-even/Game.jsx`
- Test: Create `hunter-learning/src/test/games.oddEven.useGame.test.js`

**Interfaces:**
- Consumes: `useCountdown`/`TIMED_SECONDS`、`TimeBar`、`TIMED_SETTING`、`delay`（from `utils/math`，本 task 順帶把此檔的裸 `setTimeout` 換成 `delay` 以便測試 mock）。
- Produces: `useGame` 額外回傳 `handleTimeout`（identify：feedback='wrong' 顯示正確奇偶後前進；sort：視同送出且答錯，submitted 畫面標出所有應選卡片後前進）。navigation state 增加 `timed`。

備註：identify 模式 `feedback='wrong'` 時 IdentifyQuestion 會顯示正確的「奇數/偶數」標籤；sort 模式 `submitted=true` 時 NumberCard 會標出漏選（橘色 !）——「顯示正確答案」都由既有 UI 完成。

- [ ] **Step 1: Write the failing tests**

建立 `hunter-learning/src/test/games.oddEven.useGame.test.js`：

```js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame } from '../games/odd-even/useGame';

describe('useGame (odd-even) timed mode', () => {
  it('identify mode: handleTimeout counts wrong and advances', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 8 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.feedback).toBe(null);
  });

  it('identify mode: timeout on last question ends the game', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 1 }));
    await act(async () => { await result.current.handleTimeout(); });
    await waitFor(() => {
      expect(result.current.phase).toBe('result');
    });
  });

  it('sort mode: handleTimeout submits as wrong and advances', async () => {
    const { result } = renderHook(() => useGame({ mode: 'sort', difficulty: 'easy', count: 8 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.submitted).toBe(false);
    expect(result.current.sortResult).toBe(null);
  });

  it('regression: identify handleAnswer still works', async () => {
    const { result } = renderHook(() => useGame({ mode: 'identify', difficulty: 'easy', count: 8 }));
    const isOdd = result.current.number % 2 === 1;
    await act(async () => { await result.current.handleAnswer(isOdd ? 'odd' : 'even'); });
    expect(result.current.stats.correct).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd hunter-learning && npx vitest run src/test/games.oddEven.useGame.test.js`
Expected: timed 三個測試 FAIL（`handleTimeout is not a function`）；regression 測試會因裸 `setTimeout` 而慢（~1 秒）但 PASS。

- [ ] **Step 3: Modify `useGame.js`**

3a. import 區：檔案開頭

```js
import { useState, useRef, useCallback } from 'react';
import { useSound } from '../../hooks/useSound';
```

改為

```js
import { useState, useRef, useCallback } from 'react';
import { delay } from '../../utils/math';
import { useSound } from '../../hooks/useSound';
```

3b. handleAnswer 內，把

```js
    await new Promise(r => setTimeout(r, isCorrect ? 750 : 1300));
```

改為

```js
    await delay(isCorrect ? 750 : 1300);
```

3c. handleSubmit 內，把

```js
    await new Promise(r => setTimeout(r, 1400));
```

改為

```js
    await delay(1400);
```

3d. 在 handleSubmit 定義（`}, [sortQ, selected, submitted, currentQ, count, maxNum, sound]);`）之後、`const elapsedSec = ...` 之前插入：

```js
  // 限時模式:10 秒未作答 → 視同答錯。
  // identify:feedback='wrong' 會顯示正確的奇/偶標籤。
  // sort:視同送出且答錯,submitted 畫面會標出所有應選的卡片。
  const handleTimeout = useCallback(async () => {
    if (locked.current) return;

    if (mode === 'identify') {
      if (feedback !== null) return;
      locked.current = true;

      setFeedback('wrong');
      sound.wrong();
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));

      await delay(1300);

      const nextQ = currentQ + 1;
      if (nextQ >= count) {
        sound.victory();
        setPhase('result');
      } else {
        setCurrentQ(nextQ);
        setNumber(rand(1, maxNum));
        setFeedback(null);
      }
      locked.current = false;
      return;
    }

    // sort mode
    if (submitted) return;
    locked.current = true;

    setSubmitted(true);
    setSortResult('wrong');
    sound.wrong();
    setStats(s => ({ ...s, wrong: s.wrong + 1 }));

    await delay(1400);

    const nextQ = currentQ + 1;
    if (nextQ >= count) {
      sound.victory();
      setPhase('result');
    } else {
      setCurrentQ(nextQ);
      setSortQ(generateSortQuestion(maxNum));
      setSelected(new Set());
      setSubmitted(false);
      setSortResult(null);
    }
    locked.current = false;
  }, [mode, feedback, submitted, currentQ, count, maxNum, sound]);
```

3e. return 物件內，把

```js
    sortQ, selected, submitted, sortResult, handleToggle, handleSubmit,
```

改為

```js
    sortQ, selected, submitted, sortResult, handleToggle, handleSubmit,
    handleTimeout,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd hunter-learning && npx vitest run src/test/games.oddEven.useGame.test.js`
Expected: PASS（4 tests，全部快速完成——delay 已 mock）。

- [ ] **Step 5: Modify `Game.jsx`**

5a. import 區加入：

```js
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
import TimeBar from '../../components/TimeBar';
```

5b. 把

```js
  const { mode = 'identify', difficulty = 'easy', count = 8, skipTeach = false } = location.state || {};
```

改為

```js
  const { mode = 'identify', difficulty = 'easy', count = 8, skipTeach = false, timed = false } = location.state || {};
```

5c. 把

```js
  const game = useGame({ mode, difficulty, count });
  const { currentQ, phase, stats, elapsedSec, number, feedback, handleAnswer, sortQ, selected, submitted, sortResult, handleToggle, handleSubmit } = game;
```

改為

```js
  const game = useGame({ mode, difficulty, count });
  const { currentQ, phase, stats, elapsedSec, number, feedback, handleAnswer, sortQ, selected, submitted, sortResult, handleToggle, handleSubmit, handleTimeout } = game;

  const { fraction } = useCountdown({
    seconds: TIMED_SECONDS,
    enabled: timed && !teaching && phase === 'playing',
    paused: mode === 'identify' ? feedback !== null : submitted,
    resetKey: currentQ,
    onExpire: handleTimeout,
  });
```

5d. onRetry，把

```js
        onRetry={() => navigate('/odd-even/play', { state: { mode, difficulty, count, skipTeach: true } })}
```

改為

```js
        onRetry={() => navigate('/odd-even/play', { state: { mode, difficulty, count, skipTeach: true, timed } })}
```

5e. 進度條之後插入 TimeBar：把

```jsx
            {/* Question */}
            <AnimatePresence mode="wait">
```

改為

```jsx
            {timed && <TimeBar fraction={fraction} />}

            {/* Question */}
            <AnimatePresence mode="wait">
```

- [ ] **Step 6: Modify `Settings.jsx`**

以下列完整內容覆寫 `hunter-learning/src/games/odd-even/Settings.jsx`：

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';

export default function OddEvenSettings() {
  const navigate = useNavigate();
  const [mode,       setMode]       = useState('identify');
  const [difficulty, setDifficulty] = useState('easy');
  const [count,      setCount]      = useState(8);
  const [timed,      setTimed]      = useState(false);

  const settings = [
    {
      label: '遊戲模式',
      options: [
        { value: 'identify', icon: '🔢', text: '辨識',  sub: '判斷奇數或偶數' },
        { value: 'sort',     icon: '🗂️', text: '分類',  sub: '找出所有奇數或偶數' },
      ],
      selected: mode,
      onChange: setMode,
    },
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '⭐', text: '簡單', sub: '1 – 10' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '1 – 20' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    { ...TIMED_SETTING, selected: timed, onChange: setTimed },
    {
      label: '題數',
      options: [
        { value: 8,  icon: '⚡', text: '8 題' },
        { value: 15, icon: '📚', text: '15 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="奇偶小偵探"
      icon="🔢"
      settings={settings}
      onStart={() => navigate('/odd-even/play', { state: { mode, difficulty, count, timed } })}
    />
  );
}
```

- [ ] **Step 7: Run full test suite**

Run: `cd hunter-learning && npm run test:run`
Expected: 全部 PASS。

- [ ] **Step 8: Commit**

```bash
cd hunter-learning
git add src/games/odd-even src/test/games.oddEven.useGame.test.js
git commit -m "Add 10s timed mode to odd-even

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: 音符星球（note-staff，每個音符各 10 秒）

**Files:**
- Modify: `hunter-learning/src/games/note-staff/Settings.jsx`
- Modify: `hunter-learning/src/games/note-staff/useGame.js`
- Modify: `hunter-learning/src/games/note-staff/Game.jsx`
- Test: Create `hunter-learning/src/test/games.noteStaff.useGame.test.js`

**Interfaces:**
- Consumes: `useCountdown`/`TIMED_SECONDS`、`TimeBar`、`TIMED_SETTING`。
- Produces: `useGame` 內部把答題流程抽成 `resolve(isCorrect, value)`，`handleAnswer` 與新的 `handleTimeout` 共用；`handleTimeout` 把當前音符標為 wrong（`wrongValue` 保持 null → UI 只公布正確答案、不標錯誤按鍵）。navigation state 增加 `timed`。計時 resetKey 用 `` `${currentQ}-${noteIdx}` ``（每個音符各 10 秒）。

- [ ] **Step 1: Write the failing tests**

建立 `hunter-learning/src/test/games.noteStaff.useGame.test.js`：

```js
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), playNote: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

import { useGame } from '../games/note-staff/useGame';

describe('useGame (note-staff) timed mode', () => {
  it('handleTimeout marks the note wrong and advances the question', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 1, count: 10 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.stats.wrong).toBe(1);
    expect(result.current.currentQ).toBe(1);
    expect(result.current.wrongValue).toBe(null);
  });

  it('3-note mode: timeout advances to the next note within the question', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 3, count: 10 }));
    await act(async () => { await result.current.handleTimeout(); });
    expect(result.current.statuses[0]).toBe('wrong');
    expect(result.current.noteIdx).toBe(1);
    expect(result.current.currentQ).toBe(0);
  });

  it('regression: handleAnswer with the correct solfege counts correct', async () => {
    const { result } = renderHook(() =>
      useGame({ clefMode: 'treble', answerMode: 'name', noteCount: 1, count: 10 }));
    const correct = result.current.note.solfege;
    await act(async () => { await result.current.handleAnswer(correct); });
    expect(result.current.stats.correct).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd hunter-learning && npx vitest run src/test/games.noteStaff.useGame.test.js`
Expected: 前兩個 FAIL（`handleTimeout is not a function`），regression PASS。

- [ ] **Step 3: Modify `useGame.js` — 抽出 `resolve` 並新增 `handleTimeout`**

把整個 `handleAnswer`（從 `const handleAnswer = useCallback(async (value) => {` 到 `}, [answerMode, clefMode, count, noteCount, sound]);`）替換為：

```js
  // 共用的判定流程:handleAnswer(手動作答)與 handleTimeout(逾時)都走這裡。
  // value=null 表示逾時:不標示錯誤按鍵,只公布正確答案。
  const resolve = useCallback(async (isCorrect, value) => {
    const cur = notesRef.current[noteIdxRef.current];

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect && value != null) setWrongValue(value);

    setStatuses(prev => {
      const next = [...prev];
      next[noteIdxRef.current] = isCorrect ? 'correct' : 'wrong';
      return next;
    });

    if (isCorrect) {
      sound.playNote(cur.midi, 0.55);
    } else {
      sound.wrong();
    }

    setStats(s => ({
      ...s,
      ...(isCorrect ? { correct: s.correct + 1 } : { wrong: s.wrong + 1 }),
    }));

    await delay(isCorrect ? 600 : 1100);
    setFeedback(null);
    setWrongValue(null);

    const nextNoteIdx = noteIdxRef.current + 1;

    if (nextNoteIdx < noteCount) {
      // Still more notes in this question
      setNoteIdx(nextNoteIdx);
      locked.current = false;
      return;
    }

    // Question complete — show all results briefly then advance
    await delay(450);

    const newQ = currentQRef.current + 1;
    setCurrentQ(newQ);

    if (newQ >= count) {
      await delay(200);
      sound.victory();
      setPhase('result');
      locked.current = false;
      return;
    }

    const prevLastId = notesRef.current[notesRef.current.length - 1]?.id;
    const nextNotes = pickQuestion(clefMode, noteCount, prevLastId);
    setNotes(nextNotes);
    setStatuses(Array(noteCount).fill('pending'));
    setNoteIdx(0);
    notesRef.current = nextNotes;
    noteIdxRef.current = 0;

    locked.current = false;
  }, [clefMode, count, noteCount, sound]);

  const handleAnswer = useCallback((value) => {
    if (locked.current) return;
    locked.current = true;

    const cur = notesRef.current[noteIdxRef.current];
    const isCorrect = answerMode === 'name'
      ? value === cur.solfege
      : value === cur.midi;

    return resolve(isCorrect, value);
  }, [answerMode, resolve]);

  // 限時模式:10 秒未作答 → 該音符算錯
  const handleTimeout = useCallback(() => {
    if (locked.current) return;
    locked.current = true;
    return resolve(false, null);
  }, [resolve]);
```

return 物件內，把

```js
    feedback, wrongValue, handleAnswer,
```

改為

```js
    feedback, wrongValue, handleAnswer, handleTimeout,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd hunter-learning && npx vitest run src/test/games.noteStaff.useGame.test.js`
Expected: PASS（3 tests）。

- [ ] **Step 5: Modify `Game.jsx`**

5a. import 區加入：

```js
import TimeBar from '../../components/TimeBar';
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
```

5b. `NoteStaffGameInner` 內，把

```js
  const {
    clefMode   = 'treble',
    answerMode = 'name',
    noteCount  = 1,
    skipTeach,
  } = location.state || {};
```

改為

```js
  const {
    clefMode   = 'treble',
    answerMode = 'name',
    noteCount  = 1,
    skipTeach,
    timed      = false,
  } = location.state || {};
```

5c. 把

```js
    handleAnswer, stars, title, elapsedSec,
  } = useGame({ clefMode, answerMode, noteCount, count: COUNT });
```

改為

```js
    handleAnswer, handleTimeout, stars, title, elapsedSec,
  } = useGame({ clefMode, answerMode, noteCount, count: COUNT });

  const { fraction } = useCountdown({
    seconds: TIMED_SECONDS,
    enabled: timed && !teaching && phase === 'playing',
    paused: feedback !== null,
    resetKey: `${currentQ}-${noteIdx}`,
    onExpire: handleTimeout,
  });
```

5d. onRetry，把

```js
        onRetry={() => navigate('/note-staff/play', { state: { clefMode, answerMode, noteCount, skipTeach: true } })}
```

改為

```js
        onRetry={() => navigate('/note-staff/play', { state: { clefMode, answerMode, noteCount, skipTeach: true, timed } })}
```

5e. Header 與 Staff 之間插入 TimeBar：把

```jsx
          {/* Staff */}
          <AnimatePresence mode="wait">
```

改為

```jsx
          {timed && (
            <div style={{ marginBottom: 10 }}>
              <TimeBar fraction={fraction} />
            </div>
          )}

          {/* Staff */}
          <AnimatePresence mode="wait">
```

- [ ] **Step 6: Modify `Settings.jsx`**

以下列完整內容覆寫 `hunter-learning/src/games/note-staff/Settings.jsx`：

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';

export default function NoteStaffSettings() {
  const navigate = useNavigate();
  const [clefMode,   setClefMode]   = useState('treble');
  const [answerMode, setAnswerMode] = useState('name');
  const [noteCount,  setNoteCount]  = useState(1);
  const [timed,      setTimed]      = useState(false);

  const settings = [
    {
      label: '譜號',
      options: [
        { value: 'treble', icon: '𝄞', text: '高音譜',  sub: 'G clef' },
        { value: 'bass',   icon: '𝄢', text: '低音譜',  sub: 'F clef' },
        { value: 'mixed',  icon: '🎼', text: '混合',    sub: '兩種' },
      ],
      selected: clefMode,
      onChange: setClefMode,
    },
    {
      label: '作答方式',
      options: [
        { value: 'name',  icon: '🔤', text: '選音名',    sub: 'Do-Ti' },
        { value: 'piano', icon: '🎹', text: '點鋼琴鍵', sub: '找位置' },
      ],
      selected: answerMode,
      onChange: setAnswerMode,
    },
    {
      label: '一題幾個音符',
      options: [
        { value: 1, icon: '🎵', text: '1 個',  sub: '單音' },
        { value: 3, icon: '🎶', text: '3 個',  sub: '挑戰' },
      ],
      selected: noteCount,
      onChange: setNoteCount,
    },
    { ...TIMED_SETTING, selected: timed, onChange: setTimed },
  ];

  return (
    <SettingsPage
      title="音符星球"
      icon="🎼"
      settings={settings}
      onStart={() => navigate('/note-staff/play', { state: { clefMode, answerMode, noteCount, timed } })}
    />
  );
}
```

- [ ] **Step 7: Run full test suite**

Run: `cd hunter-learning && npm run test:run`
Expected: 全部 PASS。

- [ ] **Step 8: Commit**

```bash
cd hunter-learning
git add src/games/note-staff src/test/games.noteStaff.useGame.test.js
git commit -m "Add 10s timed mode to note-staff

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: 最終驗證

**Files:** 無新增/修改（僅驗證；若 lint/build 失敗則修復後 amend 對應 commit）。

**Interfaces:** 無。

- [ ] **Step 1: Run the full test suite**

Run: `cd hunter-learning && npm run test:run`
Expected: 全部 PASS，無 skip。

- [ ] **Step 2: Lint**

Run: `cd hunter-learning && npm run lint`
Expected: 無錯誤（warning 若非本次改動引入可忽略）。

- [ ] **Step 3: Production build**

Run: `cd hunter-learning && npm run build`
Expected: build 成功。

- [ ] **Step 4: Manual smoke test（如環境允許）**

Run: `cd hunter-learning && npm run dev`，逐一檢查：
1. 五個遊戲設定頁都出現「限時模式」列（湊十大師切到配對模式時該列消失）。
2. 選「限時挑戰」開始遊戲：題目上方有倒數條，剩 3 秒變紅閃爍。
3. 不作答等 10 秒：播錯誤音效、顯示正確答案、自動進下一題；結算畫面答錯 +1。
4. 選「悠閒模式」：無倒數條，行為與改動前相同。
5. 音符星球 3 音符模式：每個音符各自倒數 10 秒。
