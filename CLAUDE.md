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
- `src/components/` — 共用 UI：`SettingsPage`、`OptionGroup`（設定選項按鈕）、`ResultScreen`、`GameLayout`、`StarField`、`TimeBar`。
- `src/hooks/` — `useSound`、`useSpeech`（TTS，帶語言碼如 `en-US`/`zh-TW`）、`useCountdown`（計時模式）、`useTimer`。
- `src/utils/` — `math.js`（含 Fisher–Yates `shuffle`、`delay`）、`scoring.js`（`calculateStars`/`getResultTitle`）、`timedSetting.js`（共用 `TIMED_SETTING` 開關）、`data/`（`words.js`、`confusables.js`、`cardPairs.js`）。

### 慣例（照抄現有遊戲即可）

- **難度選項**：`useState('easy')` + `settings` 加一組 `{ value:'easy'|'hard', icon:'🌱'|'🔥', text:'簡單'|'困難', sub }`，把 `difficulty` 併入 `navigate` 的 `state`，`Game.jsx` 解構後傳進 `useGame`。範例：`chain-math`、`word-hunt`、`english-match`。
- **看圖選字類**（`word-hunt`、`english-match`）：選項按鈕只顯示文字；`buildChoices(question, pool, difficulty)` 產生 4 選項。困難模式的干擾字來自 `src/utils/data/confusables.js`（`EN_CONFUSABLES` + `pickHardDistractors`）——拼字/發音相近的真實字，讓小朋友不能只靠拼音排除。中文模式查無相近字會自動退回隨機。**新增英文單字時記得在 `EN_CONFUSABLES` 補 ≥3 個相近字**——`utils.confusables.test.js` 會斷言字池每個英文字都有涵蓋。
- **計時模式**：`Settings` 展開 `TIMED_SETTING`，`Game` 用 `useCountdown` + `<TimeBar>`。

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

## 其他慣例

- Commit 訊息：英文祈使句、無 conventional-commit 前綴（例：`Add 3-note mode to note-staff game`）
- 測試在 `hunter-learning/src/test/`（vitest + @testing-library/react），命名如 `games.<name>.useGame.test.js`
- 改 UI 文案/樣式時同步更新對應的 UI 測試——它們斷言實際文字與 inline style
