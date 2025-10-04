// API 模組入口檔案

// 型別定義
export * from "./types";

// 配置
export * from "./config";

// 服務
export * from "./services/httpClient";
export { default as httpClient } from "./services/httpClient";
export * from "./services/permissionService";
export { default as permissionService } from "./services/permissionService";
export * from "./services/resourceService";
export { default as resourceService } from "./services/resourceService";
export * from "./services/roleService";
export { default as roleService } from "./services/roleService";

// Hooks
export * from "./hooks/useApi";
export * from "./hooks/usePermissions";
export * from "./hooks/useResources";
export * from "./hooks/useRoles";

// 重新匯出常用型別
export type {
  ApiError,
  ApiResponse,
  Conference,
  DashboardStats,
  LoadingState,
  LogEntry,
  Notification,
  PaginatedResponse,
  Permission,
  QueryParams,
  Resource,
  ResourceGroup,
  Role,
} from "./types";
