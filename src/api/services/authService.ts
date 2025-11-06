// 認證服務
import type { AuthError, LoginCredentials, LoginResponse, User } from "../../types/auth";
import { API_ENDPOINTS } from "../config";
import type { ApiResponse } from "../types";
import { httpClient } from "./httpClient";
import { IS_SKIP_AUTH } from "@/config/env";

// 後端回應型別（管理員認證 API）
interface AdminInfoResponse {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  permissions: string[];
  last_login_at?: string;
}

interface AdminLoginResponse {
  admin: AdminInfoResponse;
  token: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

// 將 AdminInfo 映射到本地 User 型別
function mapAdminToUser(admin: AdminInfoResponse): User {
  const nowIso = new Date().toISOString();
  return {
    id: admin.id,
    username: admin.display_name || admin.email,
    email: admin.email,
    firstName: undefined,
    lastName: undefined,
    avatar: "/images/user/default-avatar.jpg",
    status: "active",
    roles: admin.roles || [],
    permissions: admin.permissions || [],
    lastLoginAt: admin.last_login_at,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

// 認證服務類別
class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly USER_KEY = "user_data";
  private readonly REMEMBER_ME_KEY = "remember_me";
  private readonly REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  // 併發請求去重：確保同時間只會有一個 getCurrentUser() 真正打 API
  private inFlightCurrentUserPromise: Promise<ApiResponse<User>> | null = null;

  // 登入
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await httpClient.post<AdminLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.success && response.data) {
        // 映射回應至本地結構
        const user = mapAdminToUser(response.data.admin);
        const accessToken = response.data.token.access_token;
        const refreshToken = response.data.token.refresh_token;
        const expiresAt = new Date(Date.now() + response.data.token.expires_in * 1000).toISOString();

        // 先儲存 rememberMe 狀態
        this.setRememberMe(credentials.rememberMe || false);

        // 儲存認證資訊
        this.setToken(accessToken);

        // 清理相反存儲中的殘留 token/user，避免之後請求讀到舊 token
        if (credentials.rememberMe) {
          // 使用 localStorage，清掉 sessionStorage 殘留
          sessionStorage.removeItem(this.TOKEN_KEY);
          sessionStorage.removeItem(this.USER_KEY);
          sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
        } else {
          // 使用 sessionStorage，清掉 localStorage 殘留
          localStorage.removeItem(this.TOKEN_KEY);
          localStorage.removeItem(this.USER_KEY);
          // refresh_token 僅在 rememberMe 使用，確保不殘留
          localStorage.removeItem(this.REFRESH_TOKEN_KEY);
          localStorage.removeItem(`${this.REFRESH_TOKEN_KEY}_expiry`);
        }

        // 只有勾選 "Keep me logged in" 才存儲 refresh token
        if (refreshToken && credentials.rememberMe) {
          this.setRefreshToken(refreshToken);
        }

        this.setUser(user);

        return {
          success: true,
          data: {
            user,
            token: accessToken,
            refreshToken,
            expiresAt,
            rememberMe: credentials.rememberMe,
          },
          code: response.code,
        };
      }

      return {
        success: false,
        data: undefined as unknown as LoginResponse,
        code: response.code,
        error: response.error,
        message: response.message,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 登出
  async logout(): Promise<ApiResponse<void>> {
    try {
      const token = this.getToken();
      const refreshToken = this.getRefreshToken();
      if (token) {
        // 呼叫後端登出 API（傳遞 access_token 與 refresh_token）
        await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
          access_token: token,
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      // 即使後端登出失敗，也要清理本地狀態
      console.warn("Logout API call failed, but clearing local state:", error);
    } finally {
      // 清理本地認證狀態
      this.clearAuth();
    }

    return { success: true, data: undefined, code: 200 };
  }

  // 取得當前使用者資訊
  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (this.inFlightCurrentUserPromise) {
      return this.inFlightCurrentUserPromise;
    }

    this.inFlightCurrentUserPromise = (async () => {
      try {
        const response = await httpClient.get<AdminInfoResponse>(API_ENDPOINTS.AUTH.PROFILE);

        if (response.success && response.data) {
          // 更新本地使用者資訊
          const user = mapAdminToUser(response.data);
          this.setUser(user);
          return { success: true, data: user, code: response.code };
        }

        return {
          success: false,
          data: undefined as unknown as User,
          code: response.code,
          error: response.error,
          message: response.message,
        };
      } catch (error) {
        throw this.handleAuthError(error);
      } finally {
        // 清理 in-flight
        this.inFlightCurrentUserPromise = null;
      }
    })();

    return this.inFlightCurrentUserPromise;
  }

  // 重新整理 token
  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await httpClient.post<{ access_token: string; refresh_token: string; token_type: string; expires_in: number }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refresh_token: refreshToken }
      );

      if (response.success && response.data) {
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        this.setToken(newAccessToken);
        if (newRefreshToken) {
          this.setRefreshToken(newRefreshToken);
        }

        return { success: true, data: { token: newAccessToken, refreshToken: newRefreshToken }, code: response.code };
      }

      return {
        success: false,
        data: undefined as unknown as { token: string; refreshToken?: string },
        code: response.code,
        error: response.error,
        message: response.message,
      };
    } catch (error) {
      // 重新整理失敗，清理認證狀態
      this.clearAuth();
      throw this.handleAuthError(error);
    }
  }

  // 檢查認證狀態
  isAuthenticated(): boolean {
    // 開發模式：如果設定了跳過認證的環境變數，直接返回 true
    if (IS_SKIP_AUTH) {
      return true;
    }

    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // 取得 token（包含過期判斷與來源優先順序：session -> local）
  getToken(): string | null {
    // 開發模式：如果設定了跳過認證的環境變數，返回開發者 token
    if (IS_SKIP_AUTH) {
      return "dev_token_skip_auth_mode";
    }

    // 先檢查 sessionStorage（一般登入模式優先）
    const sessionToken = sessionStorage.getItem(this.TOKEN_KEY);
    if (sessionToken) return sessionToken;

    // 再檢查 localStorage（記住我模式）
    const localToken = localStorage.getItem(this.TOKEN_KEY);
    if (!localToken) return null;

    // optional: 若未保存 exp，直接返回 token（刷新邏輯在 httpClient）
    return localToken;
  }

  // 設定 token
  setToken(token: string): void {
    const rememberMe = this.getRememberMe();
    if (rememberMe) {
      // 記住我：使用 localStorage
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      // 一般登入：使用 sessionStorage
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // 取得重新整理 token
  getRefreshToken(): string | null {
    // 只有記住我模式才有 refresh token
    const rememberMe = this.getRememberMe();
    if (!rememberMe) return null;

    // 檢查是否過期
    const expiryTime = localStorage.getItem(`${this.REFRESH_TOKEN_KEY}_expiry`);
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      // 已過期，清理存儲
      this.clearAuth();
      return null;
    }

    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // 設定重新整理 token
  setRefreshToken(token: string): void {
    // 只有記住我模式才存儲 refresh token
    const rememberMe = this.getRememberMe();
    if (!rememberMe) return;

    // 使用 localStorage，設置過期時間
    const expiryTime = Date.now() + this.REMEMBER_ME_EXPIRY;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    localStorage.setItem(`${this.REFRESH_TOKEN_KEY}_expiry`, expiryTime.toString());
  }

  // 取得使用者資訊
  getUser(): User | null {
    // 先檢查 localStorage（記住我模式）
    let userData = localStorage.getItem(this.USER_KEY);

    // 再檢查 sessionStorage（一般登入模式）
    if (!userData) {
      userData = sessionStorage.getItem(this.USER_KEY);
    }

    return userData ? JSON.parse(userData) : null;
  }

  // 設定使用者資訊
  setUser(user: User): void {
    const rememberMe = this.getRememberMe();
    if (rememberMe) {
      // 記住我：使用 localStorage
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      // 一般登入：使用 sessionStorage
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  // 取得 rememberMe 狀態
  getRememberMe(): boolean {
    const stored = localStorage.getItem(this.REMEMBER_ME_KEY);
    return stored === "true";
  }

  // 設定 rememberMe 狀態
  setRememberMe(rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.REMEMBER_ME_KEY, "true");
    } else {
      localStorage.removeItem(this.REMEMBER_ME_KEY);
    }
  }

  // 清理認證狀態
  clearAuth(): void {
    // 清理 localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(`${this.REFRESH_TOKEN_KEY}_expiry`);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);

    // 清理 sessionStorage
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  // 處理認證錯誤
  private handleAuthError(error: unknown): AuthError {
    // 檢查是否為 HTTP 錯誤對象
    if (error && typeof error === "object" && "code" in error) {
      if ((error as { code?: number }).code === 401) {
        this.clearAuth();
        return {
          code: "UNAUTHORIZED",
          message: "登入已過期，請重新登入",
        };
      }

      return {
        code: (error as { code?: string }).code || "UNKNOWN_ERROR",
        message: (error as { message?: string }).message || "認證過程中發生未知錯誤",
        details: (error as { details?: Record<string, unknown> }).details,
      };
    }

    // 處理其他類型的錯誤
    return {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "認證過程中發生未知錯誤",
    };
  }

  // 檢查權限
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    return user.permissions.includes(permission);
  }

  // 檢查角色
  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    return user.roles.includes(role);
  }

  // 檢查多個權限（任一符合）
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  // 檢查多個權限（全部符合）
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  // 檢查多個角色（任一符合）
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  // 檢查多個角色（全部符合）
  hasAllRoles(roles: string[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }
}

// 建立全域認證服務實例
export const authService = new AuthService();

export default authService;
