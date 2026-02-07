# TheHope Conference Portal - 前端系統

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.0-38B2AC.svg)](https://tailwindcss.com/)

## 專案概述

TheHope Conference Portal 是一個基於 React 19 和 TypeScript 的現代化會議管理系統前端應用程式。系統採用 RBAC (Role-Based Access Control) 權限管理，提供完整的會議管理、工作坊管理、講師管理等功能，並具備動態路由和權限控制機制。

## 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| **React** | 19.0.0 | 前端框架 |
| **TypeScript** | 5.7.2 | 類型安全 |
| **Vite** | 6.1.0 | 建構工具 |
| **React Router** | 7.1.5 | 路由管理 |
| **Tailwind CSS** | 4.0.0 | UI 框架 |
| **Axios** | 1.11.0 | HTTP 客戶端 |
| **React Icons** | 5.5.0 | 圖示庫 |
| **Context API** | - | 狀態管理 |

## 快速開始

### 環境需求

- Node.js 18.x 或更高版本（建議使用 Node.js 20.x）
- pnpm

### 安裝與啟動

1. **安裝依賴**

   ```bash
   pnpm install
   ```

2. **設定環境變數**

   ```bash
   # 建立環境變數檔案
   cp .env.example .env.local
   
   # 或手動建立 .env.local 檔案
   touch .env.local
   ```

3. **配置環境變數**

   ```env
   # API 配置
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_API_TIMEOUT=10000
   
   # 認證配置
   VITE_USE_MOCK_AUTH=true
   VITE_SKIP_AUTH=true
   
   # 應用程式配置
   VITE_APP_TITLE=Conference Portal
   VITE_APP_VERSION=1.0.0
   
   # 開發工具配置
   VITE_ENABLE_DEBUG=true
   VITE_LOG_LEVEL=info
   ```

4. **啟動開發伺服器**

   ```bash
   pnpm run dev
   ```

5. **訪問應用程式**

   開啟瀏覽器訪問 [http://localhost:5173](http://localhost:5173)

## 專案結構

```
src/
├── api/                    # API 服務層
│   ├── config/            # API 配置
│   ├── hooks/             # API Hooks
│   ├── services/          # API 服務
│   └── types/             # API 類型定義
├── components/            # React 組件
│   ├── auth/              # 認證相關組件
│   ├── common/            # 通用組件
│   ├── DataPage/          # 資料表格頁面組件
│   ├── Demo/              # 示範組件
│   ├── form/              # 表單組件
│   └── ui/                # UI 組件庫
├── context/               # React Context
│   ├── AuthContext.tsx    # 認證狀態管理
│   ├── MenuContext.tsx    # 選單狀態管理
│   ├── SidebarContext.tsx # 側邊欄狀態管理
│   └── ThemeContext.tsx   # 主題狀態管理
├── hooks/                 # 自定義 Hooks
├── layout/                # 佈局組件
├── pages/                 # 頁面組件
├── routes/                # 路由配置
├── types/                 # TypeScript 類型定義
└── utils/                 # 工具函數
```

## 開發指令

```bash
# 開發模式
pnpm run dev

# 建構生產版本
pnpm run build

# 預覽生產版本
pnpm run preview

# 程式碼檢查
pnpm run lint
```
