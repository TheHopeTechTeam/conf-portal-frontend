// 環境變數配置檔案
// 統一管理所有環境變數，避免在專案中直接使用 import.meta.env 或 process.env

/**
 * 應用程式環境類型
 * - development: 開發環境（npm run dev）
 * - staging: 預發布環境（npm run build:stg）
 * - production: 生產環境（npm run build）
 */
export type AppEnv = "development" | "staging" | "production" | "test";

/**
 * 應用程式環境配置
 */
export const ENV_CONFIG = {
  // 應用程式環境（使用 Vite 的 MODE，或從環境變數取得）
  // Vite 的 MODE 在構建時可以透過 --mode 參數指定
  // - npm run dev → MODE = "development"
  // - vite build --mode staging → MODE = "staging"
  // - vite build → MODE = "production" (預設)
  APP_ENV: (import.meta.env.MODE as AppEnv) || "development",

  // Node 環境（用於相容性，在瀏覽器中可能不可用）
  // 在 Vite 構建時，NODE_ENV 會自動設定：
  // - 開發模式：NODE_ENV = "development"
  // - 構建模式：NODE_ENV = "production"（無論 MODE 是什麼）
  NODE_ENV: import.meta.env.PROD ? "production" : "development",

  // APP Base
  APP_NAME: import.meta.env.VITE_APP_NAME || "TheHope Conf Portal",

  // API 配置
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "90000", 10), // 90 seconds

  // 認證配置
  SKIP_AUTH: import.meta.env.VITE_SKIP_AUTH === "true",

  // 應用程式配置
  APP_TITLE: import.meta.env.VITE_APP_TITLE || "Conference Portal",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // 開發工具配置
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === "true",
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "info",
} as const;

/**
 * 是否為開發環境
 */
export const IS_DEV = ENV_CONFIG.APP_ENV === "development";

/**
 * 是否為預發布環境（Staging）
 */
export const IS_STAGING = ENV_CONFIG.APP_ENV === "staging";

/**
 * 是否為生產環境
 */
export const IS_PROD = ENV_CONFIG.APP_ENV === "production";

/**
 * 是否為測試環境
 */
export const IS_TEST = ENV_CONFIG.APP_ENV === "test";

/**
 * 是否為生產構建（包括 staging 和 production）
 * 當 NODE_ENV === "production" 時，表示這是一個優化過的構建版本
 */
export const IS_PROD_BUILD = ENV_CONFIG.NODE_ENV === "production";

/**
 * 是否啟用跳過認證（僅在開發環境下有效）
 */
export const IS_SKIP_AUTH = IS_DEV && ENV_CONFIG.SKIP_AUTH;
