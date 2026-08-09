# Hunter Learning

小朋友學習遊戲網站。React app 原始碼在 `hunter-learning/`，所有指令（`npm run dev / test:run / lint / build`）都在該目錄下執行。

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
