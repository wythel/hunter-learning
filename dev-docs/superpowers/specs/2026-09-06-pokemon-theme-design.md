# Pokémon 主題全站換膚 — 設計

日期：2026-09-06

## 目標

把 Hunter Learning 從現有的「深空／星海」主題整體換成 Pokémon 主題，視覺方向為
**Pokédex 圖鑑機**：外殼紅、藍鏡頭、三顆燈號、內凹深色螢幕。

## 範圍

**純視覺換膚。** 只改視覺層，不動遊戲狀態、儲存或玩法。

不在範圍內：

- 捕捉／圖鑑收集等 meta 進度系統（需要新的 state 層與 localStorage，另案）
- 訓練家等級、徽章、進化
- 音效替換
- 任何 `useGame.js`、`data.js` 或遊戲規則的修改

「所有 `useGame` 測試維持全綠」是本案沒有越界的驗收指標。

## 視覺方向決策

三個方向做成實際 mockup 比較後選定：

| 方向 | 結果 |
|---|---|
| A 圖鑑機 | **採用** |
| B 明亮草原（道館風） | 否決 |
| C 夜間野外（沿用深色底） | 否決 |

否決 B 的原因是硬的，不是偏好：15 個遊戲內頁全部建立在深色底上，其中
`solar-system`、`moon-phases`、`polar-day` 是 three.js 3D 星空場景。換成亮色大廳會讓
「大廳 → 遊戲」出現明顯斷層，等於必須連遊戲內頁一起重畫，超出純換膚的範圍。

否決 C 的原因是寶可夢辨識度太低，達不到「整個 app 都是 Pokémon」的目標。

## 外框深度決策

**採用「只留頂條」。**

大廳／設定／結果三種外殼畫面包在完整圖鑑機裡；一進入遊戲，外框收合成一條約 26px
的紅色頂條，鏡頭與三顆燈號縮小保留在上面。

被否決的兩個選項：

- **只包外殼**：遊戲中完全沒有寶可夢氛圍，主題只覆蓋到一半。
- **全部都包**：上蓋加下方按鈕列吃掉約 15–18% 垂直空間，題目字級與作答按鈕都得縮小；
  3D 場景的三個遊戲會被壓得很擠。遊戲版面是 `height: 100dvh` 滿版，這個代價是實打實的。

選「只留頂條」的理由：26px 在手機約 700–850px 的視窗高度上約佔 3.5%，
是全包方案 15–18% 的五分之一，卻能把主題一路延續進遊戲畫面。

對 5 個已有返回鍵的遊戲，頂條取代舊元素，淨增加為零。對其餘 10 個遊戲是淨增加 26px，
但同時**補上目前不存在的返回鍵**——這些遊戲現在玩到一半沒有任何離開的 UI，
小朋友只能按瀏覽器上一頁。所以這 26px 換到的不只是主題延續，還有一個本來就缺的功能。

## 實測數據（決定圖片策略）

| 資源 | 單張大小 |
|---|---|
| `other/official-artwork/{id}.png`（475×475） | 115–200 KB |
| `other/home/{id}.png` | 77 KB |
| `other/dream-world/{id}.svg` | 14 KB |
| `pokemon/{id}.png`（96×96 經典 sprite） | **597 bytes** |

大廳要放 15 隻。全用 official-artwork 約 **2.1 MB**，手機開首頁明顯有感；
全用 96×96 sprite 約 **9 KB**。

96×96 點陣圖在此不是妥協——圖鑑機本來就是一台顯示 sprite 的裝置，點陣風格與主題相配。
卡片顯示尺寸 44px，96px 來源在 2x 螢幕下仍然銳利。

## 架構

### 設計 token

`src/index.css` 的 `:root` 新增圖鑑色票：

| token | 值 | 用途 |
|---|---|---|
| `--dex-red` | `#DC0A2D` | 外殼、頂條 |
| `--dex-red-dark` | `#8A0A20` | 外殼下緣陰影 |
| `--dex-screen` | `#26313D` | 螢幕內凹底 |
| `--dex-bezel` | `#3C4A58` | 螢幕邊框 |
| `--dex-gold` | `#FFD400` | 主要強調色（取代 `--teal`） |
| `--led-red` | `#FF5252` | 燈號 |
| `--led-yellow` | `#FFD400` | 燈號 |
| `--led-green` | `#3DDC84` | 燈號 |

`--teal` 與現有的 `--c-*` 遊戲色**保留不刪**，避免尚未改到的地方直接失去顏色。
換膚完成後另開一次清理。

### 新增元件

**`src/components/DexFrame.jsx`**

完整圖鑑機外殼。結構由外而內：紅色外殼 → 上蓋（藍鏡頭＋三顆燈號＋右上編號）→
內凹螢幕（`--dex-screen`，`inset` 陰影＋上緣高光製造凹陷感）→ 下方按鈕列。

```
props: { children, dexNo }   // dexNo 顯示在上蓋右上，如 "No.015"
```

包裹 `Lobby`、`SettingsPage`、`ResultScreen`。`children` 直接放進螢幕區。

**`src/components/DexStrip.jsx`**

收合版頂條，高約 26px，背景 `--dex-red`。左側縮小的鏡頭與三顆燈號，右側放進度。

```
props: { onBack, progress, right }
```

`onBack` 讓整條左半部可點擊返回（取代現有返回鍵）；`progress` 顯示如「3 / 10」；
`right` 保留給計時模式插入 `<TimeBar>`。

已逐檔確認現況（`progress` 與 `right` 皆為選填，未給值時該側留白，不得因此撐高頂條）：

| 現況 | 數量 | 遊戲 |
|---|---|---|
| 有遊戲中返回鍵 | 5 | `make-ten`、`note-staff`、`odd-even`、`polar-day`、`symmetry` |
| 有「第 N / M 題」進度 | 8 | `clock-reading`、`column-math`、`english-match`、`make-ten`、`math-battle`（在 `BattleUI.jsx`）、`odd-even`、`symmetry`、`word-hunt` |

導入 `DexStrip` 時，這兩類既有元素要**移除舊的**，不能與頂條並存造成重複的返回鍵或重複的題號。
其餘遊戲則是首次獲得返回鍵。

注意 `math-battle` 的題號在 `BattleUI.jsx` 而非 `Game.jsx`，盤點時容易漏。

### 新增資料

**`src/utils/pokemonRoster.js`**

匯出 15 個遊戲對寶可夢的對應表，欄位 `{ path, id, name, color }`。
Lobby 與各遊戲共用同一份，避免兩處各寫一份而漂移。

### 修改 `src/utils/pokemon.js`

從單一函式擴成兩個，呼叫端依用途選擇：

```js
export const pokemonSprite  = (id) => `${BASE}/sprites/pokemon/${id}.png`;
export const pokemonArtwork = (id) => `${BASE}/sprites/pokemon/other/official-artwork/${id}.png`;
```

- **`pokemonSprite`** — 大廳卡片（44px）、`DexStrip` 圖示等小尺寸
- **`pokemonArtwork`** — 設定頁 hero、結果頁、`math-battle` 對戰雙方等大尺寸

`pokemonArtwork` 維持現有簽名與網址，所以 `math-battle/sprites.js` 與
`note-staff/sprites.js` 不需要改。

## 寶可夢對應表

每一隻都有具體理由，不是隨機挑選：

| 遊戲 | 寶可夢 | 圖鑑編號 | 理由 | 卡片色 |
|---|---|---|---|---|
| 算數大戰 | 皮卡丘 | 25 | 已在用 | `#F8D030` |
| 連鎖算數 | 三合一磁怪 | 82 | 三隻連在一起＝連鎖 | `#B8B8D0` |
| 學看時鐘 | 引夢貘人 | 97 | 手上拿的就是鐘擺 | `#B06AB3` |
| 英文配對 | 妙蛙種子 | 1 | 第一隻，入門感 | `#78C850` |
| 記憶翻牌 | 百變怪 | 132 | 變成對方＝配對 | `#C8A2E0` |
| 打地鼠 | 地鼠 | 50 | 字面上就是從洞裡冒出來的地鼠 | `#E0C068` |
| 對稱遊戲 | 巴大蝶 | 12 | 蝴蝶翅膀＝左右對稱 | `#7C6FE0` |
| 奇偶偵探 | 多邊獸 | 137 | 數位／數字生物 | `#4BC0D9` |
| 湊十大師 | 蛋蛋 | 102 | 一群蛋聚在一起＝湊 | `#F09A37` |
| 直式計算 | 大岩蛇 | 95 | 一節一節往上疊＝直式 | `#7A8CA0` |
| 音符星球 | 胖丁 | 39 | 已在用 | `#EE99AC` |
| 看圖認字 | 喵喵 | 52 | 動畫裡唯一會講人話的 | `#D9A441` |
| 月相星球 | 皮皮 | 35 | 月之石，來自月球 | `#9FB3E8` |
| 永晝永夜 | 太陽岩 | 338 | 太陽 | `#FF7043` |
| 太陽系 | 海星星 | 120 | 圖鑑敘述牠與星星通訊 | `#5AB4E8` |

### 顏色分配的取捨

原本打算直接套官方屬性色，但官方只有 18 種屬性色，15 個遊戲會撞色——百變怪與多邊獸
同為一般系，大廳上兩張卡會分不出來。

**採用做法：以屬性色為基底，撞色者手動偏移色相**，確保 15 個在同一格線上可辨識。
例如引夢貘人由超能粉 `#F85888` 偏移為 `#B06AB3`，避開胖丁的妖精粉。

最終色直接存在 roster 裡，不在 runtime 計算。上表的值為初始建議，實作時對著真實的
2 欄格線微調——尤其四個暖黃系（皮卡丘、喵喵、地鼠、蛋蛋）與三個藍系（皮皮、海星星、
多邊獸）需要並排確認。

## 修改範圍

**新增**

- `src/components/DexFrame.jsx`
- `src/components/DexStrip.jsx`
- `src/utils/pokemonRoster.js`

**修改**

- `src/index.css` — 新增 token
- `src/pages/Lobby.jsx` — 包 `DexFrame`；卡片 emoji 換成 sprite；色票改讀 roster
- `src/components/SettingsPage.jsx` — 包 `DexFrame`；hero 換 artwork；開始按鈕改金色
- `src/components/ResultScreen.jsx` — 包 `DexFrame`
- `src/utils/pokemon.js` — 拆成兩個函式
- 14 個 `src/games/*/Game.jsx` — 各接一行 `<DexStrip>` 取代現有返回列
- `src/games/polar-day/PolarDay.jsx` — 同上。此遊戲的畫面檔名不是 `Game.jsx`，
  容易在盤點時漏掉

**不動**

- 所有 `useGame.js`、`data.js`、遊戲規則
- `components/StarField.jsx` — 被 20 個檔案引用、7 個測試檔提到。在圖鑑螢幕內，
  微弱星點讀起來就是「裝置正顯示夜間畫面」，維持原樣風險最低
- `components/OptionGroup.jsx`、`TimeBar.jsx`、`GameLayout.jsx` 的結構
- `math-battle/sprites.js`、`note-staff/sprites.js`

## 資料流

沒有新的狀態。`pokemonRoster.js` 是靜態常數，Lobby 與各遊戲直接 import。
`DexFrame` 與 `DexStrip` 都是無狀態的 presentational 元件，資料由 props 單向流入。

## 錯誤處理

圖片來自外部 CDN（`raw.githubusercontent.com`），必須容忍載入失敗：

- 每個 `<img>` 設固定 `width`／`height`，避免載入前後的 layout shift
- 大廳 15 張全部 `loading="lazy"`
- `onError` 時隱藏該 `<img>`，露出卡片底色與遊戲標題——標題與描述文字永遠不依賴圖片
  是否載入成功

## 測試

會變紅、需一併更新（斷言了實際文字與 inline style）：

- `test/pages.Lobby.test.jsx`
- `test/components.ResultScreen.test.jsx`
- `test/components.OptionGroup.test.jsx`

新增：

- `test/components.DexFrame.test.jsx` — 渲染 children、顯示 `dexNo`、三顆燈號存在
- `test/components.DexStrip.test.jsx` — `onBack` 被呼叫、`progress` 顯示、`right` slot 渲染

其餘 40 個測試檔應維持全綠。**任何 `useGame` 測試變紅都代表越界，必須回頭修正而不是
改測試。**

## 未解事項

無。

## 後續（不在本案）

- 收集圖鑑 meta 系統
- 音效替換
- 清理 `index.css` 中已無人使用的 `--teal` 與 `--c-*` token
