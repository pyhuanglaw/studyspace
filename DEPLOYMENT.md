# 部署指南

## Vercel 部署步驟

### 1. 準備工作

確保你有以下準備：
- GitHub 帳號
- Google Cloud Console 帳號
- Vercel 帳號

### 2. Google OAuth 設置

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 Google+ API 或 Google People API
4. 前往「APIs & Services」> 「Credentials」
5. 點擊「Create Credentials」> 「OAuth 2.0 Client IDs」
6. 選擇「Web application」
7. 設置授權重新導向 URI：
   - 開發環境：`http://localhost:3000/api/auth/callback/google`
   - 生產環境：`https://your-domain.vercel.app/api/auth/callback/google`
8. 記錄 Client ID 和 Client Secret

### 3. 部署到 Vercel

1. 將程式碼推送到 GitHub 的 `nextjs` 分支
2. 登入 [Vercel](https://vercel.com)
3. 點擊「New Project」
4. 選擇你的 GitHub repository
5. 選擇 `nextjs` 分支作為部署分支
6. Vercel 會自動偵測到 Next.js 專案

### 4. 設置 Vercel Postgres

1. 在 Vercel 專案控制台中，前往「Storage」頁籤
2. 點擊「Create Database」
3. 選擇「Postgres」
4. 輸入資料庫名稱（例如：studyspace-db）
5. 選擇區域（建議選擇離用戶最近的區域）
6. 點擊「Create」

### 5. 設置環境變數

在 Vercel 專案設置中的「Environment Variables」添加：

```
NEXTAUTH_SECRET=你的隨機密鑰字串
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=你的Google客戶端ID
GOOGLE_CLIENT_SECRET=你的Google客戶端密鑰
```

注意：資料庫相關的環境變數會在創建 Postgres 資料庫時自動設置。

### 6. 初始化資料庫

部署完成後，需要初始化資料庫結構：

1. 在 Vercel 專案控制台中，前往「Functions」頁籤
2. 進入任一個 serverless function 的終端機
3. 執行：`npx prisma db push`

或者在本地環境中：
1. 設置相同的環境變數
2. 執行：`npx prisma db push`

### 7. 更新 Google OAuth 重新導向 URI

部署完成後，更新 Google Cloud Console 中的授權重新導向 URI：
- 新增：`https://your-actual-domain.vercel.app/api/auth/callback/google`

### 8. 測試部署

1. 訪問你的 Vercel 網址
2. 測試 Google 登入功能
3. 測試計時器功能
4. 測試請假功能
5. 測試資料同步

## 環境變數說明

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `NEXTAUTH_SECRET` | NextAuth.js 密鑰 | 隨機字串 |
| `NEXTAUTH_URL` | 應用程式網址 | https://your-app.vercel.app |
| `GOOGLE_CLIENT_ID` | Google OAuth 客戶端 ID | 從 Google Cloud Console 獲得 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 客戶端密鑰 | 從 Google Cloud Console 獲得 |
| `POSTGRES_URL` | Postgres 連接字串 | 自動設置 |
| `POSTGRES_PRISMA_URL` | Prisma 連接字串 | 自動設置 |
| `POSTGRES_URL_NON_POOLING` | 非連接池 URL | 自動設置 |

## 故障排除

### 常見問題

1. **登入後出現錯誤**
   - 檢查 Google OAuth 重新導向 URI 設置
   - 確認環境變數正確設置

2. **資料無法儲存**
   - 確認資料庫已正確初始化
   - 檢查 Prisma schema 是否已推送

3. **計時器不同步**
   - 這是正常現象，計時器狀態不會跨裝置同步
   - 只有完成的學習紀錄會同步

### 聯絡支援

如遇到問題，請檢查：
1. Vercel 部署日誌
2. 瀏覽器開發者工具的 Network 和 Console 頁籤
3. Vercel Functions 日誌