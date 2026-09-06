# Hunter Learning

小朋友學習遊戲網站。React app 原始碼在 `hunter-learning/`，所有指令（`npm run dev / test:run / lint / build`）都在該目錄下執行。

## 專案地圖（不用每次重新 explore）

技術棧：Vite + React + `react-router-dom`（**HashRouter**）+ Mantine + framer-motion，測試用 vitest + @testing-library/react。

- `src/App.jsx` — 所有路由；每個遊戲兩條 route：`/<game>`（設定頁）與 `/<game>/play`（遊戲頁）。新增遊戲要在這裡註冊 import + 兩條 `<Route>`。
- `src/pages/Lobby.jsx` — 首頁遊戲選單。
- `src/games/<game>/` — **每個遊戲固定四檔**：
  - `Settings.jsx` — 用共用 `SettingsPage` + `settings` 陣列宣告式產生選項，`onStart` 用 `navigate('/<game>/play', { state })` 帶設定進遊戲。
  - `Game.jsx` — 從 `location.state` 解構設定（**都給預設值**以向後相容），呼叫 `useGame`，渲染題目/選項/結果。
  - `useGame.js` — 遊戲邏輯 hook；純狀態機，題目與選項多半用 `useRef` + `useState` 在首次 render 建好。
  - `data.js` — 該遊戲的題庫（選填，有些遊戲吃 `src/utils/data/`）。
- `src/components/` — 共用 UI：`SettingsPage`、`OptionGroup`（設定選項按鈕）、`ResultScreen`、`GameLayout`、`StarField`、`TimeBar`、`DexFrame`、`DexStrip`（後兩者見下方主題章節）。
- `src/hooks/` — `useSound`、`useSpeech`（TTS，帶語言碼如 `en-US`/`zh-TW`）、`useCountdown`（計時模式）、`useTimer`。
- `src/utils/` — `math.js`（含 Fisher–Yates `shuffle`、`delay`）、`scoring.js`（`calculateStars`/`getResultTitle`）、`timedSetting.js`（共用 `TIMED_SETTING` 開關）、`pokemon.js`／`pokemonRoster.js`（見下方主題章節）、`data/`（`words.js`、`confusables.js`、`cardPairs.js`）。

### 慣例（照抄現有遊戲即可）

- **難度選項**：`useState('easy')` + `settings` 加一組 `{ value:'easy'|'hard', icon:'🌱'|'🔥', text:'簡單'|'困難', sub }`，把 `difficulty` 併入 `navigate` 的 `state`，`Game.jsx` 解構後傳進 `useGame`。範例：`chain-math`、`word-hunt`、`english-match`。
- **看圖選字類**（`word-hunt`、`english-match`）：選項按鈕只顯示文字；`buildChoices(question, pool, difficulty)` 產生 4 選項。困難模式的干擾字來自 `src/utils/data/confusables.js`（`EN_CONFUSABLES` + `pickHardDistractors`）——拼字/發音相近的真實字，讓小朋友不能只靠拼音排除。中文模式查無相近字會自動退回隨機。**新增英文單字時記得在 `EN_CONFUSABLES` 補 ≥3 個相近字**——`utils.confusables.test.js` 會斷言字池每個英文字都有涵蓋。
- **計時模式**：`Settings` 展開 `TIMED_SETTING`，`Game` 用 `useCountdown` + `<TimeBar>`。

## Pokémon 圖鑑機主題（2026-09 全站換膚）

全站視覺是一台紅色 Pokédex。設計與決策紀錄在 `dev-docs/superpowers/specs/2026-09-06-pokemon-theme-design.md`。

- **`DexFrame`** — 完整外殼（鏡頭＋三顆燈號＋內凹螢幕＋按鈕列），包住 `Lobby`／`SettingsPage`／`ResultScreen`。
  它是 `height:100dvh`，螢幕區 `overflow:'auto'`，**捲動由它負責**。被它包住的畫面用 `minHeight:'100%'`，
  **不要再加 `overflowY`**（會變兩條捲軸），也不要再加 `env(safe-area-inset-*)`（`DexFrame` 已經處理，重複會疊兩次）。
- **`DexStrip`** — 26px 紅色頂條，放在每個遊戲畫面 `<GameLayout>` 的第一個 child。
  `props: { onBack, progress?, right? }`；`right` 給計時模式塞 `<TimeBar>`。
  **26px 高度是 load-bearing**：遊戲畫面是 `height:100dvh` + `overflow:hidden`，頂條長高就會把遊戲擠出畫面。有測試守著。
- **`utils/pokemonRoster.js`** — 15 個遊戲對寶可夢的唯一真實來源（`path`／`id`／中文名／卡片色）。
  **新增遊戲時必須補一筆**，否則 `Lobby` 會在 `rosterByPath[path]` 解構時整頁白掉。
  `utils.pokemonRoster.test.js` 硬寫了 15 組對照，改配對要連測試一起改（刻意的）。
- **`utils/pokemon.js`** — `pokemonSprite(id)` 是 96×96 經典 sprite（約 600 bytes，大廳卡片與小圖示用）；
  `pokemonArtwork(id)` 是官方 artwork（115–200KB，hero 與對戰畫面用）。大廳 15 張若用 artwork 會是 2.1MB，別換。

**teal 的處理原則**：`#12b886` 在這個專案有兩種用途，換膚時只換了其中一種。
**品牌色**（主要按鈕、標題、裝飾漸層、`TimeBar`）已改成圖鑑金 `--dex-gold`；
**語意色**（答對、配對成功、打勾）**刻意保留 teal**——綠色代表「正確」是通用慣例，
改成金色會同時破壞慣例又和外框主色撞色。動到顏色時先分清楚是哪一種。

**已知未完成**：4 個遊戲的 `Teaching.jsx` 和 3 個訂正畫面（`ChoiceReview`／`KeypadReview`／note-staff 的 `NoteReview`）
還沒進外殼，主題在那裡會中斷。另外設定頁內容較長時，「開始挑戰」會被推到圖鑑螢幕的可視範圍外
（14 頁中約 10 頁，最糟 266px），而圓角螢幕裡的捲動沒有視覺提示——要修的話應該把開始鍵釘在底部，或加捲動提示漸層。

## ⚠️ docs/ 是 GitHub Pages 發佈根目錄——不要放任何文件進去

`docs/` 是 Vite 的 build 輸出（`vite.config.js` 的 `outDir: '../docs'`），推上 main 後由 GitHub Pages 直接發佈。

**曾發生的事故（2026-07）**：spec/plan 等 Markdown 文件被放進 `docs/superpowers/`，GitHub Pages 的 Jekyll 嘗試渲染文件中的 JSX `{{ ... }}`，被當成未閉合的 Liquid 變數，整個 Pages build 掛掉。

規則：
- 內部開發文件（spec、plan、筆記）一律放 `dev-docs/`，**絕不放 `docs/`**
- `docs/.nojekyll` 必須保留——它讓 Pages 跳過 Jekyll 直接服務靜態檔
- `docs/` 裡的東西只能由 `npm run build` 產生

## 部署流程

```bash
cd hunter-learning
npm run build        # 輸出到 ../docs
cd ..
# 刪掉 docs/assets/ 中新 index.html 沒有引用的舊 hashed 檔案
git add -A && git commit && git push   # push 到 main 即部署
```

Vite 不會清空 outDir（在專案外），舊的 `docs/assets/index-*.js` 會累積，部署時記得清理。

⚠️ **清理時不能只看 `index.html`**。它只直接引用進入點的 JS 與 CSS；lazy 載入的路由 chunk
（`PolarDay-*.js`）和它 import 的貼圖是寫在**建置後的 JS 裡面**的。只照 `index.html` 刪，
build 看起來正常但 3D 場景會在執行期壞掉。正確做法是遞移追蹤：進入點 JS → 裡面提到的 chunk → chunk 裡提到的貼圖。

⚠️ **`hunter-learning/docs/` 是一份被誤 commit 的舊建置輸出**（692K，很早以前就在了），
和真正的發佈根目錄 `docs/` 並存。在 `hunter-learning/` 底下執行 `ls docs` 會看到錯的目錄。要刪。

## 其他慣例

- Commit 訊息：英文祈使句、無 conventional-commit 前綴（例：`Add 3-note mode to note-staff game`）
- 測試在 `hunter-learning/src/test/`（vitest + @testing-library/react），命名如 `games.<name>.useGame.test.js`
- 改 UI 文案/樣式時同步更新對應的 UI 測試——它們斷言實際文字與 inline style
- **`npm run lint` 本來就有 275 個 problems（272 errors）**，散在既有遊戲檔裡。
  標準是「不要比 275 多」，不是「零錯誤」。其中大量 `'motion' is defined but never used`
  是誤報——這個專案的 flat ESLint config 沒有 `jsx-uses-vars`，認不得 `<motion.div>` 這種用法，**不要把 import 刪掉**。
- 用瀏覽器目視驗證時注意：**面板隱藏時 `requestAnimationFrame` 會暫停**，framer-motion 的進場動畫會凍結在
  `opacity: 0`，畫面看起來像是空的。那是量測環境的假象，不是 bug——先把面板叫到前景再截圖。
