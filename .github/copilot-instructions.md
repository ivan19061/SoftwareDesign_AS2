# AI Copilot Instructions for SoftwareDesign_AS1

## Project Overview
This is a full-stack image annotation web application using Express.js backend with SQLite database and TypeScript frontend. The system manages image uploads, labels, and annotations (image-to-label mappings).

**專案概述（繁體中文）**: 這是一個全堆疊影像標註網頁應用程式，使用 Express.js 後端、SQLite 資料庫和 TypeScript 前端。系統管理影像上傳、標籤和標註（影像到標籤的對應關係）。

## Architecture

### Data Model
Three-table schema in `src/db.ts`:
- **images**: Stores uploaded image metadata (filename, file_path, upload_time)
  - **繁體中文**: 儲存上傳的影像中繼資料（檔案名稱、檔案路徑、上傳時間）
- **labels**: Dictionary of available label names (cat, dog, car, etc.)
  - **繁體中文**: 可用標籤名稱的字典（貓、狗、汽車等）
- **annotations**: Many-to-many junction table linking images to labels with cascade delete
  - **繁體中文**: 連結影像和標籤的多對多交匯表，具有級聯刪除功能

Key constraint: `UNIQUE(image_id, label_id)` prevents duplicate label assignments per image.
- **繁體中文**: 關鍵限制：防止每個影像有重複的標籤分配

### Backend Stack (`src/server.ts`)
- **Framework**: Express.js on Node.js with TypeScript
  - **繁體中文**: 基於 Node.js 的 Express.js 框架，使用 TypeScript
- **File Handling**: Multer middleware handles file uploads to `uploads/` directory with:
  - **繁體中文**: Multer 中介軟體處理檔案上傳到 `uploads/` 目錄：
  - Unique naming: `image-{timestamp}.{ext}` to avoid collisions
    - **繁體中文**: 唯一命名：避免檔案覆蓋
  - MIME type filtering: JPG/PNG only
    - **繁體中文**: MIME 類型過濾：僅允許 JPG/PNG
  - 5MB size limit
    - **繁體中文**: 5MB 大小限制
- **Database**: SQLite3 with connection at `src/db.ts`
  - **繁體中文**: SQLite3 資料庫連線位於 `src/db.ts`
- **CORS**: Enabled for frontend-backend communication
  - **繁體中文**: 已啟用跨來源資源共用（前後端通訊）
- **Port**: 3000
  - **繁體中文**: 連接埠：3000

### API Endpoints
All endpoints in `src/server.ts` follow this pattern:

| 方法 | 路由 | 用途 |
|--------|-------|---------|
| POST | `/api/images` | 上傳影像、儲存中繼資料、返回 imageId |
| POST | `/api/annotations` | 將標籤連結到影像（如果需要會建立標籤） |
| GET | `/api/images` | 取得所有影像及合併標籤（GROUP_CONCAT） |
| DELETE | `/api/images/:id` | 刪除影像、標註和實體檔案 |
| DELETE | `/api/annotations` | 從影像中移除特定標籤 |

### Frontend (`public/`)
TypeScript client in `public/script.ts` interfaces with backend via `http://localhost:3000` base URL. Render workflows use fetched image data.
- **繁體中文**: `public/script.ts` 中的 TypeScript 用戶端透過 `http://localhost:3000` 基本 URL 與後端介接。渲染工作流程使用取得的影像資料。

## Key Patterns & Conventions

### Error Handling
- API returns `{ error: string }` for failures with appropriate HTTP status codes
  - **繁體中文**: API 返回含適當 HTTP 狀態碼的 `{ error: string }` 進行錯誤回應
- Validation happens before DB operations (input length checks, ID validation)
  - **繁體中文**: 在資料庫操作前進行驗證（輸入長度檢查、ID 驗證）
- File deletion errors are logged but don't block database cleanup
  - **繁體中文**: 記錄檔案刪除錯誤，但不阻止資料庫清理

### SQL Patterns
- **Parameter binding**: Always use `?` placeholders to prevent SQL injection (seen in all queries)
  - **繁體中文**: 始終使用 `?` 佔位符以防止 SQL 隱碼攻擊
- **Transaction-like operations**: Use sequential `db.run()` callbacks to ensure order (e.g., image deletion: fetch file path → delete file → delete annotations → delete image record)
  - **繁體中文**: 使用順序式 `db.run()` 回呼確保操作順序
- **INSERT OR IGNORE**: Used in annotations to handle duplicate label attempts idempotently
  - **繁體中文**: 在標註中使用以冪等地處理重複標籤嘗試

### TypeScript Conventions
- Define request/response body types as inline `interface` (e.g., `AnnotationBody`, `ImageWithLabels`)
  - **繁體中文**: 將請求/回應主體類型定義為內聯 `interface`
- Type middleware parameters: `(req: Request, res: Response)`
  - **繁體中文**: 為中介軟體參數進行類型標註
- Use explicit `function (err)` callbacks with typed database generics like `db.all<ImageWithLabels[]>`
  - **繁體中文**: 使用具型別的資料庫泛型搭配明確的回呼函式

### File Upload Naming
Generated filenames follow pattern: `image-{Date.now()}.{extension}`. This ensures uniqueness but note: timestamps are client-side only—separate uploads within same millisecond could theoretically collide (mitigated by unique DB constraint on filename).
- **繁體中文**: 生成的檔案名稱遵循 `image-{Date.now()}.{extension}` 模式。確保唯一性，但時間戳只是客戶端產生——理論上同一毫秒內的上傳可能會衝突（透過資料庫唯一性限制進行緩解）

## Development Workflow

### Build/Run
- **Build**: TypeScript compilation (tsconfig.json likely in use)
  - **繁體中文**: TypeScript 編譯（可能使用 tsconfig.json）
- **Run**: `npm start` or direct Node.js invocation of compiled JS
  - **繁體中文**: 執行：`npm start` 或直接呼叫已編譯的 JS
- **Database**: SQLite file at project root (`db.sqlite3`)
  - **繁體中文**: 資料庫：專案根目錄中的 SQLite 檔案

### When Modifying
1. **API changes**: Always update both schema (if needed) and type definitions
   - **繁體中文**: API 變更：始終同時更新架構（如需要）和型別定義
2. **Database schema**: Use `db.serialize()` for consistent initialization order in `src/db.ts`
   - **繁體中文**: 資料庫架構：在 `src/db.ts` 中使用 `db.serialize()` 確保初始化順序一致
3. **Frontend integration**: Ensure fetch URLs match backend routes; CORS is enabled
   - **繁體中文**: 前端整合：確保 fetch URL 與後端路由相符；CORS 已啟用
4. **File operations**: Remember physical file deletion is asynchronous and may fail—don't assume success
   - **繁體中文**: 檔案操作：記住實體檔案刪除是非同步的且可能失敗——不要假設成功

## Important Implementation Details

- **Group Concat Aggregation**: `GET /api/images` uses `GROUP_CONCAT(l.name, ', ')` to join multiple labels into a single string. Frontend must parse this if splitting is needed.
  - **繁體中文**: 分組串接：`GET /api/images` 使用 `GROUP_CONCAT(l.name, ', ')` 將多個標籤連結成單一字串。如需要分割，前端必須解析此字串
- **Cascade Delete**: Foreign key constraints auto-delete annotations when images/labels are removed—explicit deletion in code is redundant but safe for clarity.
  - **繁體中文**: 級聯刪除：當影像/標籤被移除時，外鍵限制自動刪除標註——程式碼中的明確刪除是冗餘的但保持清晰無妨
- **Unique Filename Constraint**: `filename TEXT NOT NULL UNIQUE` in images table prevents re-uploads with same name; multer's timestamp naming sidesteps this.
  - **繁體中文**: 唯一檔案名稱限制：images 表中的 `filename TEXT NOT NULL UNIQUE` 防止同名重新上傳；multer 的時間戳命名規避此問題
- **Static File Serving**: `/uploads` route serves image files directly to browsers; file_path stored in DB should match actual filesystem path.
  - **繁體中文**: 靜態檔案提供：`/uploads` 路由直接提供影像檔案給瀏覽器；資料庫中儲存的 file_path 應與實際檔案系統路徑相符

## Common Modifications
- **Adding new label types**: Insert into labels table; frontend must handle rendering
  - **繁體中文**: 新增標籤類型：插入 labels 表；前端必須處理渲染
- **Changing upload constraints**: Modify fileFilter function and multer limits in `src/server.ts`
  - **繁體中文**: 變更上傳限制：修改 `src/server.ts` 中的 fileFilter 函式和 multer 限制
- **New image metadata fields**: Add columns to images table, update GET endpoint, update frontend types
  - **繁體中文**: 新增影像中繼資料欄位：將欄位新增至 images 表、更新 GET 端點、更新前端類型
