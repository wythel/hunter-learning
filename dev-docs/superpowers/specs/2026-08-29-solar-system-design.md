# 太陽系 / 八大行星 遊戲設計

**遊戲代號**：`solar-system` · **Lobby icon**：🪐 · **主色**：`#ffa94d`（土星橘）

## 目標

讓 Hunter 學會三件事，交錯出題：
1. 八大行星的**名字**
2. 行星**離太陽的順序**（水金地火木土天海）
3. 行星的**特徵**（最大、有光環…）

## 檔案結構（照 codebase 四檔慣例 + 一個星球元件）

- `src/games/solar-system/Settings.jsx` — 難度 + 題數，`onStart` 用 `navigate('/solar-system/play', { state })`
- `src/games/solar-system/Game.jsx` — 從 `location.state` 解構（都給預設值），呼叫 `useGame`，渲染探索/三題型/結算
- `src/games/solar-system/useGame.js` — 純狀態機；`buildChallenge(difficulty, idx)` 決定性出題（測試可重現）
- `src/games/solar-system/data.js` — 8 行星資料 + 出題 helper
- `src/games/solar-system/Planet.jsx` — 純 CSS 畫的星球元件（漸層圓 + 土星光環 + 木星條紋等）
- 註冊：`App.jsx` 加 import + 兩條 `<Route>`（`/solar-system`、`/solar-system/play`）；`Lobby.jsx` 的 `GAMES` 加一張卡

## 行星資料（data.js）

每顆：`{ key, name(中), en(英), order(1–8), feature(一句中文), css(渲染參數) }`

| order | key | name | en | feature |
|---|---|---|---|---|
| 1 | mercury | 水星 | Mercury | 最小、離太陽最近 |
| 2 | venus | 金星 | Venus | 最熱的行星 |
| 3 | earth | 地球 | Earth | 有生命、我們的家 |
| 4 | mars | 火星 | Mars | 紅色星球 |
| 5 | jupiter | 木星 | Jupiter | 最大的行星 |
| 6 | saturn | 土星 | Saturn | 有美麗的光環 |
| 7 | uranus | 天王星 | Uranus | 側躺著轉 |
| 8 | neptune | 海王星 | Neptune | 最遠、最藍 |

## CSS 星球渲染（Planet.jsx）

純 CSS，無外部圖檔。每顆用 radial-gradient 上色；特殊裝飾：土星加橢圓光環（絕對定位的 border ellipse），木星加水平條紋，火星偏紅，地球藍綠，海王星/天王星藍。元件吃 `planetKey` + `size` props，探索、題目、排序都共用同一元件。

## 三種題型（`idx % 3`）

- `0 → identify`（認名字）：顯示一顆星球 → 四選一選**名字**（中文為主、下方小字英文）
- `1 → order`（排順序）：見難度
- `2 → feature`（猜特徵）：顯示特徵卡文字 → 四選一選**行星**

四選一題（identify / feature）：一定含正解；干擾選項——簡單取隨機其他行星，困難取**相鄰 order 的行星**（較難排除）。答對用 `useSpeech` 唸出中文名（`zh-TW`）。

### 排順序題型

- **簡單 = 插缺口**：太陽系已排好、隨機留一個空位，下方給正確行星（可混 1–2 個干擾），拖正確那顆填入缺口即算對。
- **困難 = 完整排序**：8 顆打亂，全部拖到正確位置才算對。
- 用 framer-motion 拖曳；落點以最近的槽吸附。判定：每個槽的行星 `order` 皆正確。

## 設定（Settings.jsx，沿用慣例）

- **難度**：`{ value:'easy', icon:'🌱', text:'簡單', sub:'插缺口·好排除' }` / `{ value:'hard', icon:'🔥', text:'困難', sub:'完整排序·干擾相近' }`
- **題數**：6 / 9 / 12（3 的倍數讓三題型均衡），預設 9

## 探索模式（開場，像 moon-phases sandbox）

進 `/play` 先進 `phase:'explore'`：8 顆行星排成一列/弧形太陽系，點任一顆 → `useSpeech` 唸中文名 + 顯示特徵卡（中文名 + 英文小字 + 一句特徵）。按「開始挑戰」→ `phase:'playing'`，`loadQuestion(0)`。

## 狀態機（useGame.js，照 moon-phases 形狀）

- `phase`: `'explore' | 'playing' | 'result'`
- `buildChallenge(difficulty, idx)`：依 `idx % 3` 回傳 `{ kind, ... }`，決定性（同 idx 同結果，測試可重現）
- 計分 `stats {correct, wrong}`、答題後 `delay` 再進下一題（答對 900ms / 答錯 1100ms）
- `locked` ref 防連點；答完 `currentQ+1`，達 `count` → `phase:'result'`
- 星星：沿用既有 `calculateStars` / 標題邏輯（照 moon-phases）

## 結算

沿用共用 `ResultScreen` + `scoring.js` 的星星與標題。

## 測試（src/test/games.solar-system.useGame.test.js）

- `buildChallenge` 對三種 `idx % 3` 各回傳正確 `kind`，且決定性可重現
- identify / feature 題正解永遠在 `choices` 內
- 困難模式干擾選項取相鄰 order
- 答對 `correct+1`、答錯 `wrong+1`；達 `count` → `phase:'result'`
- order 題判定：正確排列算對、錯排算錯

## 不做（YAGNI）

- 計時模式（先不加，之後可用 `TIMED_SETTING` 擴充）
- 行星大小比較題（本次三題型已涵蓋三個學習目標）
- 真實貼圖／3D
