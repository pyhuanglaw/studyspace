# 每日讀書時間紀錄

這是一個基於 Next.js 的每日讀書時間追蹤應用程式，支援分享功能。

## 功能特色

- ⏰ **時間追蹤**: 分別記錄上午和下午的學習時段
- 📊 **統計分析**: 即時顯示每日學習統計
- 🔗 **分享功能**: 產生唯一分享連結，讓他人查看你的學習紀錄
- 👀 **唯讀檢視**: 透過分享連結查看的紀錄為唯讀模式
- 🔒 **隱私控制**: 隨時可以取消分享連結

## 技術架構

- **前端**: Next.js 15 + React + TypeScript + Tailwind CSS
- **後端**: Next.js API Routes
- **資料庫**: Vercel Postgres
- **部署**: Vercel

## 安裝與設定

1. 克隆專案
```bash
git clone <repository-url>
cd studyspace
```

2. 安裝依賴
```bash
npm install
```

3. 設定環境變數
```bash
cp .env.example .env.local
```
在 `.env.local` 中填入你的 Vercel Postgres 連接資訊。

4. 啟動開發伺服器
```bash
npm run dev
```

5. 開啟瀏覽器訪問 `http://localhost:3000`

## 如何使用

### 基本功能
1. 點擊「開始」按鈕開始計時
2. 點擊「停止」按鈕結束計時並記錄學習時段
3. 查看即時統計和歷史紀錄

### 分享功能
1. 點擊「產生分享連結」按鈕
2. 複製產生的連結分享給他人
3. 他人可透過連結查看你的學習紀錄（唯讀）
4. 隨時可點擊「取消分享」來停用連結

## 部署

推薦使用 Vercel 進行部署：

1. 將程式碼推送到 GitHub
2. 在 Vercel 中導入專案
3. 設定環境變數
4. 部署完成

## 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案。

## 授權

MIT License