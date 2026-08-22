# 月相星球 moon-phases — 設計 spec

## 目標
讓 Hunter 理解**為什麼月亮會有滿月、半月、新月**。核心觀念：月亮永遠有一半被太陽照亮，我們從地球看到的月相取決於月亮繞地球的**位置**。用「上帝俯視視角（因）」與「地球視角（果）」即時連動來傳達因果。

## 核心互動
- **探索沙盒**：畫面上方是俯視軌道圖（太陽在右發出平行光、地球在中央、月亮在圓形軌道上），下方是「從地球看到的」大月相盤 + 中文名稱。Hunter 拖動小月亮繞地球轉，下方月相盤與名稱**即時**更新。
- **挑戰關**：探索後按「準備好了」進入，答題得星星，用共用 `ResultScreen`。兩種題型混合：
  - **拖到正確位置**：給月相名（如「滿月」），把月亮拖到能產生該月相的軌道位置，落在容差區間內即算對。
  - **辨認月相**：月亮擺在某 canonical 角度，「這是什麼月相？」四選一。

## 全 SVG 繪製（不使用 emoji 承載教學）
- **上方小月亮**：SVG 圓，**右半亮、左半暗**（垂直分半），亮面恆朝右（朝太陽），無論拖到軌道哪個角度都一樣 —— 傳達「太陽只照一半，你只是換角度看」。
- **下方大月相盤**：SVG 依亮面比例**連續渲染**。暗盤 + 亮區，亮區由一條 terminator 弧（半橢圓）界定，其水平半徑隨角度變化；盈/虧決定亮面在左或右。
- **地球**：SVG 藍綠小圓。
- **太陽**：SVG 黃圓 + 數條由右向左的平行光線（光線本身具教學意義）。
- **視線**：地球到月亮的虛線，強化「從這個角度看過去」。

## 月相與難度（照 app 慣例 🌱/🔥）
- **簡單（3 相）**：新月、半月、滿月。
- **困難（5 相）**：再加 眉月、凸月。
- 幼兒版**不分上弦/下弦、盈/虧**：兩側半月都叫「半月」，兩側眉月都叫「眉月」，兩側凸月都叫「凸月」。名稱數量正好 3 / 5。
- 題數選項：5 / 8 / 10。

## 角度與月相數學（純函式，放 `data.js`）
軌道角 `φ ∈ [0,360)`，定義 `φ=0` 為新月（月亮在地球與太陽之間），`φ=180` 為滿月。太陽在右。

- `illuminatedFraction(φ)` = `(1 - cos(φ°)) / 2`
  - φ=0 → 0（新月，全暗）；φ=90 → 0.5（半月）；φ=180 → 1（滿月，全亮）；φ=270 → 0.5。
- `isWaxing(φ)` = `φ < 180`（盈，亮面在右；`φ>180` 虧，亮面在左）。用於月相盤亮面朝向。
- canonical 角度：
  - 新月 0°；半月 90° 與 270°；滿月 180°；眉月 45° 與 315°；凸月 135° 與 225°。
- `classifyPhase(φ, difficulty)`：**統一規則** —— 在「該難度啟用的名稱集合」對應的 canonical 角度中，回傳角距最近的那個名稱（角距用環狀差，min(|Δ|, 360-|Δ|)）。
  - 困難啟用集合的 canonical：新月 0；眉月 45,315；半月 90,270；凸月 135,225；滿月 180。
  - 簡單啟用集合的 canonical：新月 0；半月 90,270；滿月 180（眉月/凸月的角度自然被歸到最近的這三者）。
  - 挑戰「辨認題」擺位一律用 canonical 角度，確保分類無歧義。
- `angleMatchesPhase(φ, phaseKey, tol=25)`：φ 是否落在該 phase 任一 canonical 角度 ±tol 內（拖到正確位置的判定）。
- `PHASES`：`{ key, name, emojiHint }[]`（emojiHint 僅供選項/設定頁裝飾，遊戲區一律 SVG）。

## 檔案結構（照 `clock-reading` 五檔慣例）
- `src/games/moon-phases/Settings.jsx` — `SettingsPage` + settings 陣列：難度（🌱/🔥）、題數（5/8/10）。`onStart` → `navigate('/moon-phases/play', { state:{ difficulty, count } })`。
- `src/games/moon-phases/Game.jsx` — 解構 `location.state`（**皆給預設值**：`difficulty='easy'`、`count=8`）。三種畫面：沙盒 / 挑戰 / 結果（`ResultScreen`）。
- `src/games/moon-phases/useGame.js` — 狀態機：
  - 沙盒：`angle` 狀態 + `setAngle`。
  - 挑戰：`generateChallenge()`（隨機題型 + 目標月相 / canonical 擺位）、`handleDrop`（拖到位置判定）、`handleChoice`（辨認四選一）、`stats`、`currentQ/count`、`phase`（'sandbox'|'playing'|'result'）、星星計算（照現有 wrong/total 分級）。
  - 音效：`useSound`（correct/wrong/victory）；`useSpeech('zh-TW')` 在月相改變/答對時念名稱（選用，簡單接上）。
- `src/games/moon-phases/MoonSystem.jsx` — 雙視角 SVG 元件（類比 `ClockSVG.jsx`）：
  - props：`angle`、`onAngleChange`（拖曳，null 則唯讀）、`showSightline`、`showLabel`、挑戰用的 `promptPhase` 等。
  - 負責 pointer 拖曳 → atan2 換算角度、吸附到軌道圓。
  - 內含 `<MoonDisk illum waxing/>` 子繪製（大月相盤）與小月亮、地球、太陽、光線。
- `src/games/moon-phases/data.js` — 上述純函式 + `PHASES`。
- 註冊：
  - `src/App.jsx`：import + `/moon-phases`、`/moon-phases/play` 兩條 route。
  - `src/pages/Lobby.jsx`：一張卡 `{ path:'/moon-phases', icon:'🌙', title:'月相星球', desc:'認識月亮！', color:'#c0c8e0', glow:'rgba(192,200,224,0.32)' }`。

## 測試（`src/test/`）
- `games.moon-phases.phase.test.js`（純數學，不需 React）：
  - `illuminatedFraction`：0°→0、90°→0.5、180°→1、270°→0.5。
  - `classifyPhase`：canonical 角度回傳正確名稱；簡單/困難名稱集合正確。
  - `angleMatchesPhase`：滿月接受 ~180°、拒絕 90°；半月接受 90° 與 270°。
- `games.moon-phases.useGame.test.js`：
  - 挑戰題數 = count；答對 stats.correct++、答錯 wrong++。
  - 拖到正確位置 → 判對；拖到錯區間 → 判錯。
  - 辨認題四選一含正解；星星依 wrong/total 分級。

## 部署後續（不在本 spec 範圍，實作完成後執行）
`npm run build` → 清理 `docs/assets` 舊 hashed 檔 → commit/push（依 CLAUDE.md 部署流程）。
