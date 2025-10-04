// API 配置檔案

// 環境變數
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000");

// API 前綴
const ADMIN_API_PREFIX = "/api/v1/admin";

// API 端點配置
export const API_ENDPOINTS = {
  // 認證相關（管理員）
  AUTH: {
    LOGIN: `${ADMIN_API_PREFIX}/auth/login`,
    LOGOUT: `${ADMIN_API_PREFIX}/auth/logout`,
    REFRESH: `${ADMIN_API_PREFIX}/auth/refresh`,
    PROFILE: `${ADMIN_API_PREFIX}/auth/me`,
    CHANGE_PASSWORD: `${ADMIN_API_PREFIX}/auth/change-password`,
  },

  // 角色管理
  ROLES: {
    LIST: "/roles",
    CREATE: "/roles",
    DETAIL: (id: string) => `/roles/${id}`,
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    ASSIGN_PERMISSION: (id: string) => `/roles/${id}/assign-permission`,
    REVOKE_PERMISSION: (id: string) => `/roles/${id}/revoke-permission`,
    CHECK: "/roles/check",
    CHECK_MULTIPLE: "/roles/check-multiple",
  },

  // 權限管理
  PERMISSIONS: {
    LIST: "/permissions",
    CREATE: "/permissions",
    DETAIL: (id: string) => `/permissions/${id}`,
    UPDATE: (id: string) => `/permissions/${id}`,
    DELETE: (id: string) => `/permissions/${id}`,
    CHECK: "/permissions/check",
    CHECK_MULTIPLE: "/permissions/check-multiple",
  },

  // 資源管理（管理員）
  RESOURCES: {
    LIST: "/resources",
    CREATE: `${ADMIN_API_PREFIX}/resource/`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/resource/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/resource/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/resource/${id}`,
    RESTORE: (id: string) => `${ADMIN_API_PREFIX}/resource/restore/${id}`,
    CHANGE_SEQUENCE: `${ADMIN_API_PREFIX}/resource/change_sequence`,
    TREE: "/resources/tree",
    GROUPS: "/resources/groups",
    MENUS: `${ADMIN_API_PREFIX}/resource/menus`,
  },

  // 會議管理
  CONFERENCES: {
    LIST: "/conferences",
    CREATE: "/conferences",
    DETAIL: (id: string) => `/conferences/${id}`,
    UPDATE: (id: string) => `/conferences/${id}`,
    DELETE: (id: string) => `/conferences/${id}`,
    PUBLISH: (id: string) => `/conferences/${id}/publish`,
    CANCEL: (id: string) => `/conferences/${id}/cancel`,
    INSTRUCTORS: (id: string) => `/conferences/${id}/instructors`,
    PARTICIPANTS: (id: string) => `/conferences/${id}/participants`,
  },

  // 日誌管理
  LOGS: {
    LIST: "/logs",
    DETAIL: (id: string) => `/logs/${id}`,
    EXPORT: "/logs/export",
    CLEAR: "/logs/clear",
  },

  // 儀表板
  DASHBOARD: {
    STATS: "/dashboard/stats",
    CHARTS: "/dashboard/charts",
    RECENT_ACTIVITIES: "/dashboard/recent-activities",
  },

  // 通知
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/mark-read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // 檔案上傳
  UPLOAD: {
    FILE: "/upload/file",
    IMAGE: "/upload/image",
    AVATAR: "/upload/avatar",
  },
} as const;

// HTTP 狀態碼
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// 請求配置
export const REQUEST_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// 錯誤訊息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "網路連線錯誤，請檢查您的網路連線",
  TIMEOUT_ERROR: "請求超時，請稍後再試",
  UNAUTHORIZED: "未授權，請重新登入",
  FORBIDDEN: "權限不足，無法執行此操作",
  NOT_FOUND: "請求的資源不存在",
  SERVER_ERROR: "伺服器錯誤，請稍後再試",
  VALIDATION_ERROR: "資料驗證失敗",
  UNKNOWN_ERROR: "發生未知錯誤",
} as const;

// 快取配置
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 分鐘
  RESOURCES_TTL: 30 * 60 * 1000, // 30 分鐘
  ROLES_TTL: 10 * 60 * 1000, // 10 分鐘
  STATS_TTL: 2 * 60 * 1000, // 2 分鐘
} as const;
