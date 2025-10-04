// 認證相關型別定義
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  roles: string[];
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  rememberMe?: boolean;
}

export interface Permission {
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

// 權限檢查工具型別
export type PermissionCheck = (permission: string) => boolean;
export type RoleCheck = (role: string) => boolean;

// 認證錯誤型別
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
