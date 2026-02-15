// API 配置檔案
import { ENV_CONFIG } from "@/config/env";

// 環境變數
const API_BASE_URL = ENV_CONFIG.API_BASE_URL;
const API_TIMEOUT = ENV_CONFIG.API_TIMEOUT; // 90 seconds

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
    REQUEST_PASSWORD_RESET: `${ADMIN_API_PREFIX}/auth/password_reset/request`,
    RESET_PASSWORD_CONFIRM: `${ADMIN_API_PREFIX}/auth/password_reset/confirm`,
  },

  // 角色管理（管理員）
  ROLES: {
    PAGES: `${ADMIN_API_PREFIX}/role/pages`,
    LIST: `${ADMIN_API_PREFIX}/role/list`,
    CREATE: `${ADMIN_API_PREFIX}/role`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/role/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/role/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/role/${id}`,
    RESTORE: (id: string) => `${ADMIN_API_PREFIX}/role/restore/${id}`,
    ASSIGN_PERMISSIONS: (id: string) => `${ADMIN_API_PREFIX}/role/${id}/permissions`,
  },

  // 權限管理
  PERMISSIONS: {
    PAGES: `${ADMIN_API_PREFIX}/permission/pages`,
    LIST: `${ADMIN_API_PREFIX}/permission/list`,
    CREATE: `${ADMIN_API_PREFIX}/permission`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/permission/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/permission/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/permission/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/permission/restore`,
    CHECK: "/permissions/check",
    CHECK_MULTIPLE: "/permissions/check-multiple",
  },

  // 操作（Verb）管理
  VERBS: {
    LIST: `${ADMIN_API_PREFIX}/verb/list`,
  },

  // 資源管理（管理員）
  RESOURCES: {
    LIST: `${ADMIN_API_PREFIX}/resource/list`,
    CREATE: `${ADMIN_API_PREFIX}/resource`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/resource/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/resource/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/resource/${id}`,
    RESTORE: (id: string) => `${ADMIN_API_PREFIX}/resource/restore/${id}`,
    CHANGE_SEQUENCE: `${ADMIN_API_PREFIX}/resource/change_sequence`,
    CHANGE_PARENT: (id: string) => `${ADMIN_API_PREFIX}/resource/change_parent/${id}`,
    TREE: "/resources/tree",
    GROUPS: "/resources/groups",
    MENUS: `${ADMIN_API_PREFIX}/resource/menus`,
  },

  // 會議管理
  CONFERENCES: {
    PAGES: `${ADMIN_API_PREFIX}/conference/pages`,
    LIST: `${ADMIN_API_PREFIX}/conference/list`,
    CREATE: `${ADMIN_API_PREFIX}/conference`,
    ACTIVE: `${ADMIN_API_PREFIX}/conference/active`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/conference/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/conference/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/conference/${id}`,
    INSTRUCTORS: (id: string) => `${ADMIN_API_PREFIX}/conference/instructors/${id}`,
    UPDATE_INSTRUCTORS: (id: string) => `${ADMIN_API_PREFIX}/conference/instructors/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/conference/restore`,
  },

  // 工作坊管理
  WORKSHOPS: {
    PAGES: `${ADMIN_API_PREFIX}/workshop/pages`,
    CREATE: `${ADMIN_API_PREFIX}/workshop`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/workshop/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/workshop/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/workshop/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/workshop/restore`,
    CHANGE_SEQUENCE: (id: string) => `${ADMIN_API_PREFIX}/workshop/${id}/sequence`,
    INSTRUCTORS: (id: string) => `${ADMIN_API_PREFIX}/workshop/instructors/${id}`,
    UPDATE_INSTRUCTORS: (id: string) => `${ADMIN_API_PREFIX}/workshop/instructors/${id}`,
  },

  // 工作坊報名管理
  WORKSHOP_REGISTRATIONS: {
    PAGES: `${ADMIN_API_PREFIX}/workshop_registration/pages`,
    CREATE: `${ADMIN_API_PREFIX}/workshop_registration`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/workshop_registration/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/workshop_registration/${id}`,
    UNREGISTER: (id: string) => `${ADMIN_API_PREFIX}/workshop_registration/${id}/unregister`,
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

  // 用戶管理（管理員）
  USER: {
    PAGES: `${ADMIN_API_PREFIX}/user/pages`,
    LIST: `${ADMIN_API_PREFIX}/user/list`,
    LIST_WITH_DEVICE_TOKEN: `${ADMIN_API_PREFIX}/user/list-with-device-token`,
    CREATE: `${ADMIN_API_PREFIX}/user`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/user/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/user/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/user/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/user/restore`,
    ME: `${ADMIN_API_PREFIX}/user/me`,
    UPDATE_ME: `${ADMIN_API_PREFIX}/user/me`,
    BIND_ROLE: (id: string) => `${ADMIN_API_PREFIX}/user/${id}/bind_role`,
    ROLES: (id: string) => `${ADMIN_API_PREFIX}/user/${id}/roles`,
  },

  // 講師管理
  INSTRUCTORS: {
    PAGES: `${ADMIN_API_PREFIX}/instructor/pages`,
    LIST: `${ADMIN_API_PREFIX}/instructor/list`,
    CREATE: `${ADMIN_API_PREFIX}/instructor`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/instructor/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/instructor/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/instructor/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/instructor/restore`,
  },

  // 地點管理
  LOCATIONS: {
    PAGES: `${ADMIN_API_PREFIX}/location/pages`,
    LIST: `${ADMIN_API_PREFIX}/location/list`,
    CREATE: `${ADMIN_API_PREFIX}/location`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/location/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/location/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/location/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/location/restore`,
  },

  // 活動資訊管理
  EVENT_INFO: {
    LIST: (conferenceId: string) => `${ADMIN_API_PREFIX}/event_info/${conferenceId}/list`,
    CREATE: `${ADMIN_API_PREFIX}/event_info`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/event_info/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/event_info/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/event_info/${id}`,
  },

  // 檔案管理
  FILES: {
    PAGES: `${ADMIN_API_PREFIX}/file/pages`,
    UPLOAD: `${ADMIN_API_PREFIX}/file/upload`,
    BATCH_UPLOAD: `${ADMIN_API_PREFIX}/file/batch_upload`,
    BULK_DELETE: `${ADMIN_API_PREFIX}/file/bulk`,
  },

  // FAQ 分類管理
  FAQ_CATEGORIES: {
    LIST: `${ADMIN_API_PREFIX}/faq/category/list`,
    CREATE: `${ADMIN_API_PREFIX}/faq/category`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/faq/category/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/faq/category/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/faq/category/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/faq/category/restore`,
  },

  // FAQ 管理
  FAQS: {
    PAGES: `${ADMIN_API_PREFIX}/faq/pages`,
    CREATE: `${ADMIN_API_PREFIX}/faq`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/faq/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/faq/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/faq/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/faq/restore`,
  },

  // 見證管理
  TESTIMONIES: {
    PAGES: `${ADMIN_API_PREFIX}/testimony/pages`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/testimony/${id}`,
  },

  // 示範管理
  DEMOS: {
    CREATE: `${ADMIN_API_PREFIX}/demo`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/demo/${id}`,
    DELETE: (id: string) => `${ADMIN_API_PREFIX}/demo/${id}`,
    RESTORE: `${ADMIN_API_PREFIX}/demo/restore`,
  },

  // 意見回饋管理
  FEEDBACKS: {
    PAGES: `${ADMIN_API_PREFIX}/feedback/pages`,
    DETAIL: (id: string) => `${ADMIN_API_PREFIX}/feedback/${id}`,
    UPDATE: (id: string) => `${ADMIN_API_PREFIX}/feedback/${id}`,
  },

  // 管理員通知（Comms）
  ADMIN_NOTIFICATION: {
    PAGES: `${ADMIN_API_PREFIX}/notification/pages`,
    CREATE: `${ADMIN_API_PREFIX}/notification`,
    GROUP_MEMBERS: (groupKey: string) => `${ADMIN_API_PREFIX}/notification-group/${groupKey}/members`,
    GROUP_MEMBERS_BATCH: `${ADMIN_API_PREFIX}/notification-group/members`,
    TICKET_TYPES: `${ADMIN_API_PREFIX}/notification-group/ticket-types`,
  },

  // 管理員通知歷史
  ADMIN_NOTIFICATION_HISTORY: {
    PAGES: `${ADMIN_API_PREFIX}/notification/history/pages`,
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
