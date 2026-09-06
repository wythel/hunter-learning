# Pokémon 圖鑑機主題全站換膚 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Hunter Learning 從深空主題換成 Pokédex 圖鑑機主題，不動任何遊戲邏輯。

**Architecture:** 新增兩個無狀態的 presentational 元件——`DexFrame`（完整外殼，包住大廳／設定／結果三種畫面）與 `DexStrip`（26px 收合頂條，進到遊戲畫面用）——外加一份靜態的 `pokemonRoster` 對應表。所有遊戲的視覺改動都透過這三者達成，遊戲內部的狀態機不動。

**Tech Stack:** Vite + React + react-router-dom (HashRouter) + Mantine + framer-motion；測試 vitest + @testing-library/react。

**Spec:** `dev-docs/superpowers/specs/2026-09-06-pokemon-theme-design.md`

## Global Constraints

- 所有指令都在 `hunter-learning/` 目錄下執行：`npm run test:run`、`npm run lint`、`npm run build`。
- **不得修改任何 `useGame.js`、`data.js` 或遊戲規則。** 所有 `games.*.useGame.test.js` 必須維持全綠——這是本案沒有越界的驗收指標。任何 `useGame` 測試變紅，必須回頭修正實作，**不得改測試**。
- **不得修改 `src/components/StarField.jsx`。** 它被 20 個檔案引用、7 個測試檔 mock。
- **不得把任何文件寫進 `docs/`。** 那是 Vite build 輸出兼 GitHub Pages 發佈根目錄，2026-07 曾因此弄掛 Pages build。開發文件一律放 `dev-docs/`。
- `index.css` 現有的 `--teal` 與 `--c-*` token **保留不刪**，避免尚未改到的地方失去顏色。
- 外部圖片一律附固定 `width`／`height` 與 `onError` 隱藏，文字內容不得依賴圖片載入成功。
- Commit 訊息用英文祈使句，無 conventional-commit 前綴（例：`Add DexFrame component`）。

---

## File Structure

**新增**

| 檔案 | 責任 |
|---|---|
| `src/utils/pokemonRoster.js` | 15 個遊戲對寶可夢的靜態對應表。唯一真實來源。 |
| `src/components/DexFrame.jsx` | 完整圖鑑機外殼，包住外殼類畫面。 |
| `src/components/DexStrip.jsx` | 26px 收合頂條，遊戲畫面用。 |
| `src/test/components.DexFrame.test.jsx` | |
| `src/test/components.DexStrip.test.jsx` | |
| `src/test/utils.pokemonRoster.test.js` | |

**修改**

| 檔案 | 改什麼 |
|---|---|
| `src/index.css` | 新增 `--dex-*`、`--led-*` token |
| `src/utils/pokemon.js` | 拆出 `pokemonSprite` |
| `src/pages/Lobby.jsx` | 包 `DexFrame`、emoji 換 sprite、色票讀 roster |
| `src/components/SettingsPage.jsx` | 包 `DexFrame`、hero 換 artwork、按鈕改金色 |
| `src/components/ResultScreen.jsx` | 包 `DexFrame` |
| 15 個遊戲畫面檔 | 接 `DexStrip`，移除重複的舊返回鍵／舊題號 |
| `src/test/pages.Lobby.test.jsx` | emoji 斷言改 sprite 斷言 |
| `src/test/components.OptionGroup.test.jsx` | teal 色碼斷言改金色 |

**不動**：所有 `useGame.js`、`data.js`、`StarField.jsx`、`GameLayout.jsx`、`TimeBar.jsx`、`math-battle/sprites.js`、`note-staff/sprites.js`。

---

## 遊戲盤點（已逐檔驗證，導入 DexStrip 時據此決定要移除什麼）

| 群組 | 遊戲 | 現況 | 導入時要做的事 |
|---|---|---|---|
| **A** | `make-ten`、`odd-even`、`symmetry` | 有返回鍵 + 有題號 | 兩者都移除，改由頂條提供 |
| **B** | `note-staff`、`polar-day` | 只有返回鍵 | 移除返回鍵；不給 `progress` |
| **C** | `clock-reading`、`column-math`、`english-match`、`word-hunt`、`math-battle`、`chain-math`、`moon-phases`、`solar-system` | 只有題號 | 移除題號；首次獲得返回鍵 |
| **D** | `math-mole`、`memory-flip` | 兩者皆無 | 純新增頂條 |

3 + 2 + 8 + 2 = 15，無重複無遺漏。

⚠️ `math-battle` 的題號在 `src/games/math-battle/BattleUI.jsx`，不在 `Game.jsx`。
⚠️ **`BattleUI.jsx` 是 `math-battle` 與 `chain-math` 共用的**（`chain-math/Game.jsx:7`
`import BattleUI from '../math-battle/BattleUI'`）。改它會同時影響兩個遊戲，所以兩者都在 Task 9。
⚠️ `moon-phases/Game.jsx:56` 與 `solar-system/Game.jsx:178` 的題號寫成 `{g.currentQ + 1}`，
用字面字串搜尋會漏掉。
⚠️ `polar-day` 的畫面檔是 `src/games/polar-day/PolarDay.jsx`，不叫 `Game.jsx`。

---

### Task 1: 設計 token、roster 與圖片函式

奠定後面所有任務的基礎。這個 task 結束時畫面外觀沒有任何變化——只是把資料與 token 就位。

**Files:**
- Create: `src/utils/pokemonRoster.js`
- Create: `src/test/utils.pokemonRoster.test.js`
- Modify: `src/utils/pokemon.js`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: 無（第一個 task）
- Produces:
  - `POKEMON_ROSTER: Array<{ path: string, id: number, name: string, color: string }>`
  - `rosterByPath: Record<string, RosterEntry>`
  - `pokemonSprite(id: number) => string`
  - `pokemonArtwork(id: number) => string`（既有，簽名不變）
  - CSS 變數 `--dex-red`、`--dex-red-dark`、`--dex-screen`、`--dex-bezel`、`--dex-gold`、`--led-red`、`--led-yellow`、`--led-green`

- [ ] **Step 1: 寫失敗的測試**

建立 `src/test/utils.pokemonRoster.test.js`：

```js
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
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test:run -- utils.pokemonRoster`
Expected: FAIL — `Failed to resolve import "../utils/pokemonRoster"`

- [ ] **Step 3: 建立 roster**

`src/utils/pokemonRoster.js`：

```js
// 每個遊戲配一隻寶可夢。挑選理由見 spec；顏色以官方屬性色為基底，
// 撞色者手動偏移色相，確保大廳 15 張卡在同一格線上可辨識。
export const POKEMON_ROSTER = [
  { path: '/math-battle',   id: 25,  name: '皮卡丘',     color: '#F8D030' },
  { path: '/chain-math',    id: 82,  name: '三合一磁怪', color: '#B8B8D0' },
  { path: '/clock-reading', id: 97,  name: '引夢貘人',   color: '#B06AB3' },
  { path: '/english-match', id: 1,   name: '妙蛙種子',   color: '#78C850' },
  { path: '/memory-flip',   id: 132, name: '百變怪',     color: '#C8A2E0' },
  { path: '/math-mole',     id: 50,  name: '地鼠',       color: '#E0C068' },
  { path: '/symmetry',      id: 12,  name: '巴大蝶',     color: '#7C6FE0' },
  { path: '/odd-even',      id: 137, name: '多邊獸',     color: '#4BC0D9' },
  { path: '/make-ten',      id: 102, name: '蛋蛋',       color: '#F09A37' },
  { path: '/column-math',   id: 95,  name: '大岩蛇',     color: '#7A8CA0' },
  { path: '/note-staff',    id: 39,  name: '胖丁',       color: '#EE99AC' },
  { path: '/word-hunt',     id: 52,  name: '喵喵',       color: '#D9A441' },
  { path: '/moon-phases',   id: 35,  name: '皮皮',       color: '#9FB3E8' },
  { path: '/polar-day',     id: 338, name: '太陽岩',     color: '#FF7043' },
  { path: '/solar-system',  id: 120, name: '海星星',     color: '#5AB4E8' },
];

export const rosterByPath = Object.fromEntries(
  POKEMON_ROSTER.map(e => [e.path, e])
);
```

- [ ] **Step 4: 拆 pokemon.js**

`src/utils/pokemon.js` 整份替換為：

```js
// PokeAPI sprites repo 靜態 CDN(與 API JSON 回傳的網址相同)
const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// 經典 96x96 sprite,約 600 bytes。大廳卡片與頂條圖示用。
export const pokemonSprite = (id) => `${BASE}/${id}.png`;

// 官方 artwork,115-200KB。設定頁 hero、結果頁、對戰畫面等大尺寸用。
export const pokemonArtwork = (id) => `${BASE}/other/official-artwork/${id}.png`;
```

- [ ] **Step 5: 加 CSS token**

在 `src/index.css` 的 `:root` 區塊內，`--c-oddeven` 那行之後、`}` 之前插入：

```css

  /* ── Pokédex 圖鑑機 ── */
  --dex-red:      #DC0A2D;
  --dex-red-dark: #8A0A20;
  --dex-screen:   #26313D;
  --dex-bezel:    #3C4A58;
  --dex-gold:     #FFD400;
  --led-red:      #FF5252;
  --led-yellow:   #FFD400;
  --led-green:    #3DDC84;
```

- [ ] **Step 6: 執行測試確認通過**

Run: `npm run test:run -- utils.pokemonRoster`
Expected: PASS，10 個測試全過

- [ ] **Step 7: 確認沒有波及既有測試**

Run: `npm run test:run`
Expected: 全綠。`pokemonArtwork` 簽名沒變，`math-battle` 與 `note-staff` 的 sprites.js 不受影響。

- [ ] **Step 8: Commit**

```bash
git add src/utils/pokemonRoster.js src/utils/pokemon.js src/index.css src/test/utils.pokemonRoster.test.js
git commit -m "Add Pokemon roster, sprite helper and Pokedex design tokens"
```

---

### Task 2: DexFrame 元件

**Files:**
- Create: `src/components/DexFrame.jsx`
- Create: `src/test/components.DexFrame.test.jsx`

**Interfaces:**
- Consumes: Task 1 的 CSS 變數
- Produces: `<DexFrame dexNo="No.015">{children}</DexFrame>` — `dexNo` 選填，顯示在上蓋右上

- [ ] **Step 1: 寫失敗的測試**

`src/test/components.DexFrame.test.jsx`：

```jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DexFrame from '../components/DexFrame';

describe('DexFrame', () => {
  it('renders its children inside the screen', () => {
    render(<DexFrame><p>畫面內容</p></DexFrame>);
    expect(screen.getByText('畫面內容')).toBeInTheDocument();
  });

  it('renders the dexNo when given', () => {
    render(<DexFrame dexNo="No.015"><p>x</p></DexFrame>);
    expect(screen.getByText('No.015')).toBeInTheDocument();
  });

  it('omits the dexNo slot when not given', () => {
    render(<DexFrame><p>x</p></DexFrame>);
    expect(screen.queryByText(/^No\./)).not.toBeInTheDocument();
  });

  it('renders the lens and three LEDs', () => {
    const { container } = render(<DexFrame><p>x</p></DexFrame>);
    expect(container.querySelector('[data-dex="lens"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-dex="led"]')).toHaveLength(3);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test:run -- components.DexFrame`
Expected: FAIL — `Failed to resolve import "../components/DexFrame"`

- [ ] **Step 3: 實作 DexFrame**

`src/components/DexFrame.jsx`：

```jsx
// 圖鑑機外殼:上蓋(鏡頭 + 三顆燈號 + 編號)、內凹螢幕、下方按鈕列。
// 純視覺,無狀態。包住大廳/設定/結果三種外殼畫面。
const LEDS = ['var(--led-red)', 'var(--led-yellow)', 'var(--led-green)'];

export default function DexFrame({ children, dexNo }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--dex-red)',
      padding: '10px 9px',
      paddingTop: 'max(10px, env(safe-area-inset-top))',
      paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 上蓋 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px 10px', flex: 'none' }}>
        <div
          data-dex="lens"
          style={{
            width: 30, height: 30, borderRadius: '50%', flex: 'none',
            background: 'radial-gradient(circle at 32% 30%, #bfe9ff, #1a76d2 60%, #0b3c78)',
            border: '3px solid #f2f2f2',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
        {LEDS.map((c, i) => (
          <div
            key={i}
            data-dex="led"
            style={{
              width: 10, height: 10, borderRadius: '50%', flex: 'none',
              background: c, border: '1px solid rgba(0,0,0,0.25)',
            }}
          />
        ))}
        {dexNo && (
          <div style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 900,
            color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px',
          }}>
            {dexNo}
          </div>
        )}
      </div>

      {/* 內凹螢幕 */}
      <div style={{
        flex: 1,
        background: 'var(--dex-screen)',
        border: '1px solid var(--dex-bezel)',
        borderRadius: 16,
        boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.5), 0 -2px 0 rgba(255,255,255,0.18)',
        // auto,不是 hidden:仍然裁切到圓角,但內容超出時可捲動。
        // flex:1 的項目若設 overflow:hidden,其自動最小尺寸會歸零,
        // 螢幕會被釘死在 (100dvh - 上蓋 - 按鈕列),過長的內容直接消失且沒有捲軸。
        overflow: 'auto',
        position: 'relative',
      }}>
        {children}
      </div>

      {/* 下方按鈕列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px 0', flex: 'none' }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, background: '#1F6FD0', boxShadow: '0 2px 0 rgba(0,0,0,0.3)' }} />
        <div style={{ width: 18, height: 18, borderRadius: 4, background: '#C8102E', boxShadow: '0 2px 0 rgba(0,0,0,0.3)' }} />
        <div style={{ marginLeft: 'auto', width: 52, height: 10, borderRadius: 5, background: 'rgba(0,0,0,0.28)' }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npm run test:run -- components.DexFrame`
Expected: PASS，4 個測試全過

- [ ] **Step 5: Commit**

```bash
git add src/components/DexFrame.jsx src/test/components.DexFrame.test.jsx
git commit -m "Add DexFrame shell component"
```

---

### Task 3: DexStrip 元件

**Files:**
- Create: `src/components/DexStrip.jsx`
- Create: `src/test/components.DexStrip.test.jsx`

**Interfaces:**
- Consumes: Task 1 的 CSS 變數
- Produces: `<DexStrip onBack={fn} progress="3 / 10" right={node} />`
  - `onBack` 必填，點擊左半部觸發
  - `progress` 選填字串
  - `right` 選填 ReactNode（計時模式放 `<TimeBar>`）
  - 未給 `progress` 與 `right` 時該側留白，**高度不變**

- [ ] **Step 1: 寫失敗的測試**

`src/test/components.DexStrip.test.jsx`：

```jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DexStrip from '../components/DexStrip';

describe('DexStrip', () => {
  it('calls onBack when the back control is clicked', () => {
    const onBack = vi.fn();
    render(<DexStrip onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders progress when given', () => {
    render(<DexStrip onBack={vi.fn()} progress="3 / 10" />);
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('renders the right slot when given', () => {
    render(<DexStrip onBack={vi.fn()} right={<span>計時</span>} />);
    expect(screen.getByText('計時')).toBeInTheDocument();
  });

  it('renders the lens and three LEDs', () => {
    const { container } = render(<DexStrip onBack={vi.fn()} />);
    expect(container.querySelector('[data-dex="lens"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-dex="led"]')).toHaveLength(3);
  });

  // 空的 progress/right 不得撐高頂條 —— 遊戲畫面是 100dvh,每一 px 都算
  it('keeps a fixed height with no progress and no right slot', () => {
    const { container } = render(<DexStrip onBack={vi.fn()} />);
    expect(container.firstChild.style.height).toBe('26px');
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test:run -- components.DexStrip`
Expected: FAIL — `Failed to resolve import "../components/DexStrip"`

- [ ] **Step 3: 實作 DexStrip**

`src/components/DexStrip.jsx`：

```jsx
// 圖鑑機外殼的收合版:遊戲進行中只留這條 26px 頂條,
// 保留鏡頭與三顆燈號當作主題延續,同時提供返回與進度。
const LEDS = ['var(--led-red)', 'var(--led-yellow)', 'var(--led-green)'];

export default function DexStrip({ onBack, progress, right }) {
  return (
    <div style={{
      height: 26, flex: 'none',
      background: 'var(--dex-red)',
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '0 10px',
    }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="返回"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span
          data-dex="lens"
          style={{
            width: 14, height: 14, borderRadius: '50%', display: 'block',
            background: 'radial-gradient(circle at 32% 30%, #bfe9ff, #1a76d2 60%, #0b3c78)',
            border: '1.5px solid #f2f2f2',
          }}
        />
        {LEDS.map((c, i) => (
          <span
            key={i}
            data-dex="led"
            style={{
              width: 6, height: 6, borderRadius: '50%', display: 'block',
              background: c, border: '1px solid rgba(0,0,0,0.25)',
            }}
          />
        ))}
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {progress && (
          <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>
            {progress}
          </span>
        )}
        {right}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npm run test:run -- components.DexStrip`
Expected: PASS，5 個測試全過

- [ ] **Step 5: Commit**

```bash
git add src/components/DexStrip.jsx src/test/components.DexStrip.test.jsx
git commit -m "Add DexStrip collapsed top bar component"
```

---

### Task 4: 大廳換膚

**Files:**
- Modify: `src/pages/Lobby.jsx`
- Modify: `src/test/pages.Lobby.test.jsx`

**Interfaces:**
- Consumes: `DexFrame`（Task 2）、`POKEMON_ROSTER`／`rosterByPath`（Task 1）、`pokemonSprite`（Task 1）
- Produces: 無（畫面終點）

- [ ] **Step 1: 先改測試，讓它描述新行為**

`src/test/pages.Lobby.test.jsx` 中，把 `renders game icons` 這個測試整段替換為：

```jsx
  it('renders a pokemon sprite for every game', () => {
    const { container } = renderLobby();
    const sprites = container.querySelectorAll('img[data-pokemon]');
    expect(sprites).toHaveLength(15);
  });

  it('points each sprite at the small classic sprite url', () => {
    const { container } = renderLobby();
    const first = container.querySelector('img[data-pokemon]');
    expect(first.getAttribute('src')).toMatch(
      /sprites\/pokemon\/\d+\.png$/
    );
  });

  it('gives every sprite fixed dimensions to avoid layout shift', () => {
    const { container } = renderLobby();
    for (const img of container.querySelectorAll('img[data-pokemon]')) {
      expect(img.getAttribute('width')).toBe('44');
      expect(img.getAttribute('height')).toBe('44');
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });
```

同一檔案的 `renders all game titles` 測試補上三個原本漏測的遊戲，確保 15 個都在：

```jsx
    expect(screen.getByText('月相星球')).toBeInTheDocument();
    expect(screen.getByText('永晝永夜')).toBeInTheDocument();
    expect(screen.getByText('太陽系')).toBeInTheDocument();
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test:run -- pages.Lobby`
Expected: FAIL — `expected 0 to be 15`（還沒有 `img[data-pokemon]`）

- [ ] **Step 3: 改 Lobby**

在 `src/pages/Lobby.jsx` 頂部的 import 區加入：

```jsx
import DexFrame from '../components/DexFrame';
import { rosterByPath } from '../utils/pokemonRoster';
import { pokemonSprite, pokemonArtwork } from '../utils/pokemon';
```

`pokemonArtwork` 是給下面標題列的皮卡丘用的（大尺寸），`pokemonSprite` 給 15 張卡片（小尺寸）。

`GAMES` 陣列**保留 path／title／desc，刪掉 icon／color／glow**，顏色改從 roster 取。
在 `GameCard` 內把顏色來源換掉，並用 sprite 取代 emoji：

```jsx
function GameCard({ game, index, onPlay }) {
  const { id, color } = rosterByPath[game.path];
  const rgb = hexToRgb(color);
  return (
    <motion.button
      /* 動畫與版面 props 維持原樣,只改下面兩處 */
      style={{ /* …原樣,但 border/boxShadow 內的 game.color、game.glow 改用 color、rgb… */ }}
    >
      {/* 原本的 emoji div 換成: */}
      <img
        data-pokemon
        src={pokemonSprite(id)}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        style={{ imageRendering: 'pixelated', position: 'relative', zIndex: 1 }}
      />

      {/* 標題的 color: game.color 改成 color */}
    </motion.button>
  );
}
```

`glow` 原本是硬編的 rgba 字串，現在由 `rgb` 算出，把 `boxShadow` 改為：

```jsx
boxShadow: `0 4px 24px rgba(${rgb},0.32), 0 1px 0 rgba(255,255,255,0.04) inset`,
```

最後把整個 return 的最外層 `<div>` 包進 `DexFrame`：

```jsx
export default function Lobby() {
  const navigate = useNavigate();
  return (
    <DexFrame dexNo="No.015">
      <div style={{ /* …原本的外層 div style,只把 minHeight:'100dvh' 改成 minHeight:'100%' … */ }}>
        {/* …原本內容不變… */}
      </div>
    </DexFrame>
  );
}
```

標題列的 🚀 換成皮卡丘 artwork（大尺寸用 `pokemonArtwork`），漸層標題改為圖鑑金：

```jsx
background: 'linear-gradient(100deg, var(--dex-gold), #FF6B6B 55%, #4DABF7)',
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npm run test:run -- pages.Lobby`
Expected: PASS

- [ ] **Step 5: 目視確認**

Run: `npm run dev`，開 `http://localhost:5173/#/`
確認：15 張卡都有 sprite、顏色兩兩可分辨、外殼沒有把格線擠變形、手機寬度（375px）下可正常捲動。

**這一步要停下來檢查 spec 提到的撞色風險**：四個暖黃系（皮卡丘 `#F8D030`、喵喵 `#D9A441`、地鼠 `#E0C068`、蛋蛋 `#F09A37`）與三個藍系（皮皮 `#9FB3E8`、海星星 `#5AB4E8`、多邊獸 `#4BC0D9`）在真實格線上是否還分得出來。分不出來就回 `pokemonRoster.js` 調色，測試會保證 15 色仍然唯一。

- [ ] **Step 6: Commit**

```bash
git add src/pages/Lobby.jsx src/test/pages.Lobby.test.jsx
git commit -m "Re-skin lobby as Pokedex screen with pokemon sprites"
```

---

### Task 5: 設定頁換膚

**Files:**
- Modify: `src/components/SettingsPage.jsx`
- Modify: `src/components/OptionGroup.jsx`
- Modify: `src/test/components.OptionGroup.test.jsx`

**Interfaces:**
- Consumes: `DexFrame`（Task 2）
- Produces: 無（畫面終點）

`SettingsPage` 的 `icon` prop 目前是 emoji 字串，15 個 `Settings.jsx` 都在傳。**保持這個 prop 不變**——改動 15 個呼叫端不屬於本 task，且 `icon` 仍會顯示在圖鑑螢幕上。

- [ ] **Step 1: 先改測試**

`src/test/components.OptionGroup.test.jsx` 第 63 與 71 行的 teal 斷言改為圖鑑金。整段測試替換為：

```jsx
  it('highlights the selected option with the dex gold border', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    const easyBtn = screen.getByText('簡單').closest('button');
    expect(easyBtn.style.border).toMatch(/rgba?\(255, 212, 0/);
  });

  it('does not highlight unselected options', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    const hardBtn = screen.getByText('困難').closest('button');
    expect(hardBtn.style.border).not.toMatch(/rgba?\(255, 212, 0/);
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm run test:run -- components.OptionGroup`
Expected: FAIL — 選中的 border 仍是 `rgba(18, 184, 134, …)`

- [ ] **Step 3: 改 OptionGroup 選中色**

在 `src/components/OptionGroup.jsx` 中，把選中狀態的 `rgba(18,184,134,…)` 全部換成 `rgba(255,212,0,…)`，保持 alpha 值不變（`#FFD400` = `255,212,0`）。文字色若用 `#12b886` 一併換成 `var(--dex-gold)`。

- [ ] **Step 4: 執行測試確認通過**

Run: `npm run test:run -- components.OptionGroup`
Expected: PASS

- [ ] **Step 5: 改 SettingsPage**

加 import：

```jsx
import DexFrame from '../components/DexFrame';
```

把最外層 `<div>` 包進 `<DexFrame>`，該 div 的 `minHeight:'100dvh'` 改為 `minHeight:'100%'`。

⚠️ **不要另外加 `overflowY:'auto'`** —— 捲動由 `DexFrame` 的螢幕區負責（它是 `overflow:'auto'`），
這裡再加一層會變成巢狀捲動、出現兩條捲軸。用 `minHeight` 而非 `height`，
短內容才會維持置中，長內容則交給外層螢幕捲動。

標題漸層與開始按鈕的 teal 換成圖鑑金：

```jsx
// 標題
background: 'linear-gradient(135deg, var(--dex-gold), #FFA400)',

// 開始按鈕
background: 'linear-gradient(135deg, #FFD400 0%, #FFAA00 60%, #FF8C00 100%)',
color: '#3A2A00',
boxShadow: '0 6px 32px rgba(255,212,0,0.45), 0 2px 8px rgba(255,170,0,0.25)',
```

按鈕文字 `🚀 開始遊戲！` 改為 `▶ 開始挑戰！`。

- [ ] **Step 6: 全套測試**

Run: `npm run test:run`
Expected: 全綠

- [ ] **Step 7: Commit**

```bash
git add src/components/SettingsPage.jsx src/components/OptionGroup.jsx src/test/components.OptionGroup.test.jsx
git commit -m "Re-skin settings page in Pokedex shell"
```

---

### Task 6: 結果頁換膚

**Files:**
- Modify: `src/components/ResultScreen.jsx`

**Interfaces:**
- Consumes: `DexFrame`（Task 2）
- Produces: 無（畫面終點）

`src/test/components.ResultScreen.test.jsx` 只斷言 grayscale 濾鏡與 props 文字，**不受換色影響，預期不用改**。若真的變紅，是改壞了星星渲染，回頭修實作而不是改測試。

- [ ] **Step 1: 先跑一次確認目前是綠的**

Run: `npm run test:run -- components.ResultScreen`
Expected: PASS（作為改動前的基準）

- [ ] **Step 2: 改 ResultScreen**

加 import：

```jsx
import DexFrame from '../components/DexFrame';
```

最外層 `<div>` 包進 `<DexFrame>`，該 div 的 `minHeight:'100dvh'` 改為 `minHeight:'100%'`。

⚠️ **不要另外加 `overflowY:'auto'`** —— 捲動由 `DexFrame` 的螢幕區負責，再加一層會出現兩條捲軸。

內層卡片的 `background: 'rgba(10,22,38,0.95)'` 改為 `rgba(22,29,37,0.95)`，`border` 改為 `1px solid var(--dex-bezel)`，讓它坐在圖鑑螢幕上時層次分明。

`TIER` 表維持不變——金／銀／銅本來就符合圖鑑徽章的語彙。

- [ ] **Step 3: 執行測試確認仍然通過**

Run: `npm run test:run -- components.ResultScreen`
Expected: PASS，與 Step 1 相同

- [ ] **Step 4: Commit**

```bash
git add src/components/ResultScreen.jsx
git commit -m "Re-skin result screen in Pokedex shell"
```

---

### Task 7: 導入 DexStrip — A 組（有返回鍵 + 有題號）

**Files:**
- Modify: `src/games/make-ten/Game.jsx:387`
- Modify: `src/games/odd-even/Game.jsx:305`
- Modify: `src/games/symmetry/Game.jsx:128`

**Interfaces:**
- Consumes: `DexStrip`（Task 3）
- Produces: 這三個遊戲確立的接法，Task 8–10 照抄

- [ ] **Step 1: 改 make-ten**

`src/games/make-ten/Game.jsx` 加 import：

```jsx
import DexStrip from '../../components/DexStrip';
```

在 `<GameLayout>` 內、所有內容之前插入頂條：

```jsx
<DexStrip
  onBack={() => navigate('/make-ten')}
  progress={mode === 'match'
    ? `${matchCount} / ${count} 對`
    : `第 ${currentQ + 1} / ${count} 題`}
  right={timedActive ? <TimeBar fraction={fraction} /> : undefined}
/>
```

⚠️ 這個遊戲有**兩種模式**，兩件事因此不能照抄其他遊戲：

1. **進度字串依模式而異** — `choose` 模式是「第 N / M 題」（第 86 行），
   `match` 模式是「{matchCount} / {count} 對」（第 198 行）。用單一字串會讓其中一種模式顯示錯誤數字。
2. **時間條要用 `timedActive` 而非 `timed`** — 第 281 行
   `const timedActive = timed && mode === 'choose'`，倒數計時只在 choose 模式啟用。
   用 `timed` 會在 match 模式顯示一條永遠不動的時間條。

`mode`、`matchCount`、`currentQ`、`count`、`timedActive`、`fraction` 都已在主元件作用域內（第 280–298 行）。

然後**刪掉**第 387 行附近的 `← 設定` 按鈕整塊，以及第 86 行與第 198 行兩處進度顯示。
若 `TimeBar` 原本另外渲染在別處，一併刪掉那塊，避免出現兩條時間條。

- [ ] **Step 2: 跑 make-ten 測試**

Run: `npm run test:run -- games.makeTen`
Expected: PASS。`useGame` 測試必須全綠——變紅代表動到邏輯了。

- [ ] **Step 3: 改 odd-even**

同樣加 import，在 `<GameLayout>` 內最前面插入：

```jsx
<DexStrip
  onBack={() => navigate('/')}
  progress={`第 ${currentQ + 1} / ${count} 題`}
/>
```

刪掉第 305 行附近的 `← 大廳` 按鈕整塊，以及原本的題號顯示。

- [ ] **Step 4: 改 symmetry**

同樣加 import，插入：

```jsx
<DexStrip
  onBack={() => navigate('/')}
  progress={`第 ${currentQ + 1} / ${count} 題`}
/>
```

刪掉第 128 行附近的 `← 大廳` 按鈕整塊，以及原本的題號顯示。

- [ ] **Step 5: 跑三個遊戲的測試**

Run: `npm run test:run -- games.makeTen games.oddEven games.symmetry`
Expected: 全綠

- [ ] **Step 6: 目視確認**

`npm run dev`，三個遊戲各玩一題。確認：只有一個返回鍵、只有一組題號、頂條沒有把版面壓爆、返回鍵去對地方（make-ten 回設定頁，另兩個回大廳）。

- [ ] **Step 7: Commit**

```bash
git add src/games/make-ten/Game.jsx src/games/odd-even/Game.jsx src/games/symmetry/Game.jsx
git commit -m "Add DexStrip to make-ten, odd-even and symmetry"
```

---

### Task 8: 導入 DexStrip — B 組（只有返回鍵）

**Files:**
- Modify: `src/games/note-staff/Game.jsx:362`
- Modify: `src/games/polar-day/PolarDay.jsx:144`

**Interfaces:**
- Consumes: `DexStrip`（Task 3）
- Produces: 無

這兩個遊戲沒有題號，**不傳 `progress`**——Task 3 的測試已保證這不會撐高頂條。

- [ ] **Step 1: 改 note-staff**

`src/games/note-staff/Game.jsx` 加 import：

```jsx
import DexStrip from '../../components/DexStrip';
```

在遊戲畫面的 `<GameLayout>` 內最前面插入：

```jsx
<DexStrip onBack={() => navigate('/note-staff')} />
```

刪掉第 362 行附近的 `← 設定` 按鈕整塊。

⚠️ 這個檔案還有第 251 行的 `← 返回結算`，那是**訂正模式**的按鈕，不是遊戲中的返回鍵，**不要刪**。

- [ ] **Step 2: 跑 note-staff 測試**

Run: `npm run test:run -- games.noteStaff`
Expected: PASS

- [ ] **Step 3: 改 polar-day**

`src/games/polar-day/PolarDay.jsx` 加 import：

```jsx
import DexStrip from '../../components/DexStrip';
```

在最外層容器內最前面插入：

```jsx
<DexStrip onBack={() => navigate('/')} />
```

刪掉第 144 行的 `← 大廳` 按鈕整塊。

⚠️ 這是 three.js 3D 場景。插入頂條後確認 canvas 的高度計算沒有溢出——若 canvas 用 `100dvh` 硬寫，要改成填滿剩餘空間（父層 flex column + `flex:1`）。

- [ ] **Step 4: 跑 polar-day 測試**

Run: `npm run test:run -- games.polarDay`
Expected: PASS

- [ ] **Step 5: 目視確認**

`npm run dev`，兩個遊戲各進去一次。polar-day 特別確認 3D 場景沒有被頂條推出畫面或出現捲軸。

- [ ] **Step 6: Commit**

```bash
git add src/games/note-staff/Game.jsx src/games/polar-day/PolarDay.jsx
git commit -m "Add DexStrip to note-staff and polar-day"
```

---

### Task 9: 導入 DexStrip — C 組（只有題號，首次獲得返回鍵）

**Files:**
- Modify: `src/games/clock-reading/Game.jsx:67`
- Modify: `src/games/column-math/Game.jsx`
- Modify: `src/games/english-match/Game.jsx:96`
- Modify: `src/games/word-hunt/Game.jsx`
- Modify: `src/games/math-battle/Game.jsx`
- Modify: `src/games/math-battle/BattleUI.jsx`（**math-battle 與 chain-math 共用**）
- Modify: `src/games/chain-math/Game.jsx`
- Modify: `src/games/moon-phases/Game.jsx`
- Modify: `src/games/solar-system/Game.jsx`

**Interfaces:**
- Consumes: `DexStrip`（Task 3）
- Produces: 無

- [ ] **Step 1: 改 clock-reading、column-math、english-match、word-hunt**

四個檔案同樣處理。各自加 import：

```jsx
import DexStrip from '../../components/DexStrip';
```

在 `<GameLayout>` 內最前面插入（`onBack` 一律回該遊戲的設定頁）：

```jsx
<DexStrip
  onBack={() => navigate('/clock-reading')}
  progress={`第 ${currentQ + 1} / ${count} 題`}
/>
```

路徑逐檔替換：`/clock-reading`、`/column-math`、`/english-match`、`/word-hunt`。

各自刪掉原本渲染 `第 {currentQ + 1} / {count} 題` 的那一塊（clock-reading 在第 67 行、english-match 在第 96 行；另兩個檔用 `grep -n "第 {currentQ"` 定位）。

- [ ] **Step 2: 跑這四個遊戲的測試**

Run: `npm run test:run -- games.clockReading games.columnMath games.englishMatch games.wordHunt`
Expected: 全綠

- [ ] **Step 3: 改 math-battle**

`src/games/math-battle/Game.jsx` 加 import 並在 `<GameLayout>` 內最前面插入：

```jsx
<DexStrip
  onBack={() => navigate('/math-battle')}
  progress={`第 ${currentQ + 1} / ${count} 題`}
  right={timed ? <TimeBar fraction={fraction} /> : undefined}
/>
```

同時刪掉 `Game.jsx` 中原本 `{timed && (<div style={{ padding: '0 16px 6px' }}><TimeBar fraction={fraction} /></div>)}` 那塊——時間條移進頂條了，留著會有兩條。

⚠️ 題號在 `src/games/math-battle/BattleUI.jsx` 第 43 行，不在 `Game.jsx`。

⚠️ **只刪第 43 行的文字題號，`currentQ` 與 `count` 兩個 prop 必須保留。**
`BattleUI.jsx:11` 用它們算進度*條*（`const progress = count > 0 ? currentQ / count : 0`），
移除 props 會讓兩個遊戲的進度條卡在 0。

- [ ] **Step 4: 改 chain-math（與 BattleUI 同一個 commit）**

`chain-math/Game.jsx:7` 是 `import BattleUI from '../math-battle/BattleUI'` ——
**這個元件是兩個遊戲共用的**，所以上一步刪掉題號也同時影響 chain-math。
兩者必須在同一個 commit 內改完，否則會有一段時間 chain-math 沒有題號。

`src/games/chain-math/Game.jsx` 加 import，並在 `<GameLayout>` 內最前面插入：

```jsx
<DexStrip
  onBack={() => navigate('/chain-math')}
  progress={`第 ${currentQ + 1} / ${count} 題`}
  right={timed ? <TimeBar fraction={fraction} /> : undefined}
/>
```

同時刪掉 `Game.jsx` 中原本獨立渲染 `<TimeBar>` 的那塊，避免兩條時間條。

- [ ] **Step 5: 改 moon-phases 與 solar-system**

兩者的題號寫成 `{g.currentQ + 1}`（`moon-phases/Game.jsx:56`、`solar-system/Game.jsx:178`），
用字面字串搜尋會漏掉。各自加 import 並插入頂條，路徑分別為 `/moon-phases`、`/solar-system`：

```jsx
<DexStrip
  onBack={() => navigate('/moon-phases')}
  progress={`第 ${g.currentQ + 1} / ${count} 題`}
/>
```

然後刪掉原本那行題號。

⚠️ 這兩個都是 three.js 3D 場景，插入頂條後確認 canvas 沒有溢出——
若 canvas 高度硬寫 `100dvh`，改成父層 flex column + `flex:1` 填滿剩餘空間。

- [ ] **Step 6: 跑全部八個遊戲的測試**

Run: `npm run test:run -- games.clockReading games.columnMath games.englishMatch games.wordHunt games.mathBattle games.chainMath games.moon-phases games.solar-system`
Expected: 全綠。注意 `test/games.mathBattle.BattleUI.test.jsx` 可能斷言了題號——若變紅，該測試斷言的是被刻意移除的 UI，更新測試是正確的；但任何 `useGame` 測試變紅就代表動到邏輯，必須回頭修實作。

- [ ] **Step 7: 目視確認**

`npm run dev`，八個遊戲各玩一題。確認只有一組題號、math-battle 與 chain-math 各只有一條時間條、兩個 3D 場景沒有捲軸或被裁切。

- [ ] **Step 8: Commit**

```bash
git add src/games/clock-reading/Game.jsx src/games/column-math/Game.jsx src/games/english-match/Game.jsx src/games/word-hunt/Game.jsx src/games/math-battle/Game.jsx src/games/math-battle/BattleUI.jsx src/games/chain-math/Game.jsx src/games/moon-phases/Game.jsx src/games/solar-system/Game.jsx
git commit -m "Add DexStrip to games that only had a question counter"
```

---

### Task 10: 導入 DexStrip — D 組（純新增）

**Files:**
- Modify: `src/games/math-mole/Game.jsx`
- Modify: `src/games/memory-flip/Game.jsx`

**Interfaces:**
- Consumes: `DexStrip`（Task 3）
- Produces: 無

這兩個遊戲既無返回鍵也無題號，**沒有東西要刪**，只是純新增頂條。
（原本這組還有 `chain-math`、`moon-phases`、`solar-system`，但它們其實都有題號，已移到 Task 9。）

- [ ] **Step 1: 兩個檔案各加頂條**

各自加 import：

```jsx
import DexStrip from '../../components/DexStrip';
```

在 `<GameLayout>` 內最前面插入，路徑逐檔替換：

```jsx
<DexStrip onBack={() => navigate('/math-mole')} />
```

路徑：`/math-mole`、`/memory-flip`。

這兩個遊戲都沒有逐題的題號概念（打地鼠是限時打擊、記憶翻牌是配對），
**不要硬湊 `progress`**——留白即可，Task 3 的測試已保證這不會撐高頂條。

- [ ] **Step 2: 跑這兩個遊戲的測試**

Run: `npm run test:run -- games.mathMole games.memoryFlip`
Expected: 全綠

- [ ] **Step 3: 目視確認**

`npm run dev`，兩個遊戲各進去一次，確認頂條沒有壓到遊戲區。

- [ ] **Step 4: Commit**

```bash
git add src/games/math-mole/Game.jsx src/games/memory-flip/Game.jsx
git commit -m "Add DexStrip to remaining games"
```

---

### Task 11: 全站驗證與部署

**Files:**
- Modify: `docs/`（由 `npm run build` 產生，不手動編輯）

**Interfaces:**
- Consumes: Task 1–10 全部
- Produces: 無

- [ ] **Step 1: 全套測試**

Run: `npm run test:run`
Expected: 全綠。**逐一確認所有 `games.*.useGame.test.js` 都是綠的**——這是「沒動到遊戲邏輯」的驗收指標。

- [ ] **Step 2: Lint**

Run: `npm run lint`

⚠️ **這個專案本來就有 275 個 lint problems（272 errors、3 warnings）**，散在 40 個既有遊戲檔裡。
驗收標準是「**沒有比 baseline 增加**」，不是「零錯誤」——不要去清理既有的 272 個，那不在本案範圍。

Expected: 總數維持 275。若變多，逐一檢查新增的那幾筆，特別注意刪除題號後留下的未使用變數
（`currentQ`、`count`）。

- [ ] **Step 3: 逐一走訪 15 個遊戲**

Run: `npm run dev`，在 375px 寬度下逐一開啟 15 個遊戲，各玩至少一題到結果頁。

檢查清單（每個遊戲）：
- 頂條在，鏡頭與三顆燈號可見
- 沒有重複的返回鍵、沒有重複的題號、沒有重複的時間條
- 返回鍵去對地方
- 內容沒有被頂條擠出畫面、沒有非預期的捲軸
- 結果頁在圖鑑外殼裡正常顯示

- [ ] **Step 4: Build**

```bash
npm run build
```

- [ ] **Step 5: 清理舊的 hashed 資產**

Vite 不會清空 `docs/`（在專案外），舊的 `docs/assets/index-*.js` 會累積。
比對 `docs/index.html` 實際引用的檔名，刪掉 `docs/assets/` 中沒被引用的舊檔。

確認 `docs/.nojekyll` 仍然存在——它讓 Pages 跳過 Jekyll。

- [ ] **Step 6: Commit 並部署**

```bash
cd ..
git add -A
git commit -m "Build: deploy Pokemon theme"
git push
```

推上 main 即由 GitHub Pages 發佈。

---

## Self-Review

**Spec 覆蓋檢查**

| Spec 章節 | 對應 Task |
|---|---|
| 設計 token | Task 1 Step 5 |
| `DexFrame` | Task 2 |
| `DexStrip` | Task 3 |
| `pokemonRoster` | Task 1 Step 3 |
| `pokemon.js` 拆分 | Task 1 Step 4 |
| 寶可夢對應表 15 筆 | Task 1 Step 3 |
| 顏色撞色微調 | Task 4 Step 5（對著真實格線調） |
| 圖片策略（小圖／大圖） | Task 1 Step 4、Task 4 Step 3 |
| 錯誤處理（固定尺寸、lazy、onError） | Task 4 Step 1 測試 + Step 3 實作 |
| 15 個遊戲導入頂條 | Task 7–10（3 + 2 + 8 + 2 = 15 ✓） |
| 測試更新 | Task 4 Step 1、Task 5 Step 1 |
| 不動 `useGame` | Global Constraints + Task 11 Step 1 |

15 個遊戲分組加總為 15，無遺漏、無重複。

**已知偏離 spec 之處**

Spec 預測 `components.ResultScreen.test.jsx` 會變紅。實際檢查後該檔只斷言 grayscale 濾鏡與 props 文字，不受換色影響，因此 Task 6 改為「先確認基準為綠，改完仍須是綠」。實際會紅的是 `pages.Lobby.test.jsx`（emoji 斷言）與 `components.OptionGroup.test.jsx`（teal 色碼斷言）兩個檔。
