# Deploy 計畫

## 選擇：GitHub Pages（免費、與 git 流程整合）

---

## 一次性設定

### 1. 在 GitHub 建立 repo

```bash
# 在 GitHub 網站手動建立一個新 repo，例如 hunter-learning
# 建完後執行：
git remote add origin https://github.com/<你的帳號>/hunter-learning.git
git push -u origin main
```

### 2. 開啟 GitHub Pages

- 進入 repo → Settings → Pages
- Source 選 **Deploy from a branch**
- Branch 選 `main`，資料夾選 `/ (root)`
- 儲存

幾分鐘後網站就會上線，網址：
```
https://<你的帳號>.github.io/hunter-learning/
```

遊戲網址：
```
https://<你的帳號>.github.io/hunter-learning/games/math-battle/
```

---

## 日後更新流程

每次改完程式，只要：

```bash
git add .
git commit -m "說明改了什麼"
git push
```

GitHub Pages 會在 1~2 分鐘內自動更新。

---

## 待做：首頁入口

目前 `index.html`（根目錄）不存在，直接訪問根網址會顯示 404。
新增遊戲累積後，建一個根目錄的 `index.html` 作為遊戲大廳（卡片列表）。

---

## 備選方案：Netlify（更懶的方式）

不想設定 GitHub Pages 的話，可以直接拖拉資料夾：
1. 前往 netlify.com → Add new site → Deploy manually
2. 把整個 `Hunter_Learning` 資料夾拖進去
3. 自動上線，會得到一個 `xxx.netlify.app` 網址
4. 缺點：要手動重新拖拉才能更新

---

## 自訂網域（選配）

如果之後想用自己的網域（例如 `hunter.example.com`）：
- GitHub Pages 和 Netlify 都支援自訂網域
- 在平台設定 CNAME，在 DNS 加一筆記錄即可
