// API 通用型別定義

// 基礎 API 回應型別
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: number;
}

// 分頁型別
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 錯誤型別
export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// 載入狀態型別
export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}

// 查詢參數型別
export interface QueryParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

// 檔案上傳型別
export interface FileUpload {
  file: File;
  progress?: number;
  status: "pending" | "uploading" | "success" | "error";
}

// 角色相關型別
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// 權限相關型別
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
}

// 資源相關型別
export interface Resource {
  id: string;
  code: string;
  name: string;
  path: string;
  icon: string;
  description: string;
  type: "module" | "resource" | "action";
  level: number;
  permissions?: string[];
  children?: Resource[];
}

export interface ResourceGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: Resource[];
}
// 會議相關型別
export interface Conference {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  maxParticipants: number;
  currentParticipants: number;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  instructors: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 日誌相關型別
export interface LogEntry {
  id: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  resource: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// 統計資料型別
export interface DashboardStats {
  totalResources: number;
  totalRoles: number;
  totalPermissions: number;
  totalConferences: number;

  systemHealth: "healthy" | "warning" | "critical";
  lastUpdated: string;
}

// 通知相關型別
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}
