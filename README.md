# 每日讀書時間紀錄 - Next.js 版本

這是一個升級版的每日讀書時間追蹤應用程式，從原本的靜態 HTML + localStorage 升級為 Next.js + Vercel Postgres + Google OAuth 的雲端版本。

## 功能特色

### 核心功能（保留原有功能）
- 🌅 **上午時段 (8:00-12:00)** 計時功能
- ☀️ **下午時段 (13:00-19:00)** 計時功能  
- ⏱️ **即時計時器** 顯示與控制
- 📊 **每日統計** 顯示上午、下午及全日總時數
- 🗑️ **清除紀錄** 功能
- 📱 **響應式設計** 支援行動裝置

### 新增功能
- 🔐 **Google OAuth 登入** 安全認證
- ☁️ **雲端資料同步** 使用 Vercel Postgres
- 📱 **多裝置存取** 同一帳號可在不同裝置查看相同紀錄
- 🏖️ **請假功能** 可標記請假日並選填原因
- 👤 **個人化體驗** 每個用戶獨立的資料

## 技術架構

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **後端**: Next.js API Routes
- **資料庫**: Vercel Postgres + Prisma ORM
- **認證**: NextAuth.js + Google OAuth
- **部署**: Vercel Platform

## 開發設置

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境變數設置
複製 `.env.local` 並填入真實的環境變數：

```bash
# Database (Vercel Postgres)
POSTGRES_URL="your-postgres-url"
POSTGRES_PRISMA_URL="your-postgres-prisma-url"
POSTGRES_URL_NON_POOLING="your-postgres-url-non-pooling"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. 資料庫設置
```bash
# 生成 Prisma Client
npx prisma generate

# 推送資料庫 schema（在有資料庫連接時）
npx prisma db push
```

### 4. 本地開發
```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 部署到 Vercel

### 1. 連接 GitHub 儲存庫
- 在 Vercel 控制台導入此儲存庫
- 選擇 `nextjs` 分支

### 2. 設置 Vercel Postgres
- 在 Vercel 專案中新增 Postgres 資料庫
- 自動獲得所需的資料庫環境變數

### 3. 設置 Google OAuth
- 前往 [Google Cloud Console](https://console.cloud.google.com/)
- 創建新專案或選擇現有專案
- 啟用 Google+ API
- 創建 OAuth 2.0 憑證
- 設置授權重新導向 URI：`https://your-domain.vercel.app/api/auth/callback/google`

### 4. 設置環境變數
在 Vercel 專案設置中新增：
- `NEXTAUTH_SECRET`: 隨機字串
- `NEXTAUTH_URL`: 你的部署網域
- `GOOGLE_CLIENT_ID`: Google OAuth 客戶端 ID  
- `GOOGLE_CLIENT_SECRET`: Google OAuth 客戶端密鑰

### 5. 部署
- 推送程式碼到 `nextjs` 分支
- Vercel 會自動部署

### 6. 初始化資料庫
部署後，執行以下指令初始化資料庫：
```bash
npx prisma db push
```

## 原始功能對照

| 原始功能 | 新版實作 | 狀態 |
|---------|---------|------|
| localStorage 資料儲存 | Vercel Postgres | ✅ 已升級 |
| 計時器功能 | React Hooks + API | ✅ 保留 |
| 時段限制 | 前端驗證 | ✅ 保留 |
| 每日統計 | 即時計算 | ✅ 保留 |
| 清除功能 | API + 資料庫刪除 | ✅ 保留 |
| 響應式設計 | Tailwind CSS | ✅ 保留 |
| - | Google OAuth 登入 | ✅ 新增 |
| - | 請假功能 | ✅ 新增 |
| - | 多裝置同步 | ✅ 新增 |

## 資料庫結構

```sql
-- 使用者表
User {
  id: String (Primary Key)
  name: String?
  email: String (Unique)
  image: String?
  accounts: Account[]
  sessions: Session[]
  studySessions: StudySession[]
  leaveDays: LeaveDay[]
}

-- 學習紀錄表
StudySession {
  id: String (Primary Key)
  userId: String (Foreign Key)
  date: String (YYYY-MM-DD)
  period: String (morning/afternoon)
  startTime: DateTime
  endTime: DateTime  
  duration: Int (seconds)
}

-- 請假紀錄表
LeaveDay {
  id: String (Primary Key)
  userId: String (Foreign Key)
  date: String (YYYY-MM-DD, Unique)
  reason: String?
}
```

## 授權

MIT License - 請見 LICENSE 檔案了解詳情。
