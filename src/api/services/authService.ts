// 認證服務
import { API_ENDPOINTS, HTTP_STATUS } from "@/api/config";
import type { ApiError, ApiResponse, TokenResponse } from "@/api/types";
import { IS_DEV, IS_SKIP_AUTH } from "@/config/env";
import type { AuthError, LoginCredentials, LoginResponse, User } from "@/types/auth";
import { notificationManager } from "@/utils/notificationManager";
import { httpClient } from "./httpClient";

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
  token: TokenResponse;
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
        const accessToken = response.data.token.accessToken;
        const refreshToken = response.data.token.refreshToken;
        const expiresAt = new Date(Date.now() + response.data.token.expiresIn * 1000).toISOString();

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
      // 處理 ApiError 並顯示通知
      if (error && typeof error === "object" && "code" in error && typeof (error as ApiError).code === "number") {
        const apiError = error as ApiError;
        this.showAuthErrorNotification(apiError, "login");
      }
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
        // 處理 ApiError，但在初始化階段可能不需要顯示通知（避免干擾）
        // 如果需要顯示，可以在呼叫方決定
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

      const response = await httpClient.post<TokenResponse>(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });

      if (response.success && response.data) {
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

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
      // 重新整理失敗，清理認證狀態並顯示通知
      if (error && typeof error === "object" && "code" in error && typeof (error as ApiError).code === "number") {
        const apiError = error as ApiError;
        this.showAuthErrorNotification(apiError, "refresh");
      }
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

  // 顯示認證錯誤通知
  private showAuthErrorNotification(error: ApiError, context: "login" | "profile" | "refresh" | "password" | "general" = "general"): void {
    const { code, message, details } = error;

    // 開發環境：在 console 顯示 debug_detail（如果有）
    if (IS_DEV && details?.debug_detail) {
      console.error("[AuthService] Debug Detail:", details.debug_detail);
      if (details.url) {
        console.error("[AuthService] Request URL:", details.url);
      }
    }

    let variant: "error" | "warning" = "error";
    let title = "認證錯誤";
    let description = message;
    let hideDuration = 4000;

    switch (code) {
      case HTTP_STATUS.UNAUTHORIZED:
        title = context === "login" ? "登入失敗" : "登入已過期";
        description = context === "login" ? message : "登入已過期，請重新登入";
        variant = "warning";
        hideDuration = 5000;

        // 401 錯誤時，如果不是登入場景，導向登入頁
        if (context !== "login") {
          // 延遲導向，讓通知先顯示
          setTimeout(() => {
            if (window.location.pathname !== "/signin") {
              window.location.href = "/signin";
            }
          }, 1500);
        }
        break;

      case HTTP_STATUS.FORBIDDEN:
        title = "權限不足";
        description = "您沒有權限執行此操作";
        variant = "warning";
        break;

      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        // 422 通常是驗證錯誤（如登入憑證錯誤）
        title = context === "login" ? "登入失敗" : "驗證失敗";
        description = message;
        variant = "error";
        break;

      case HTTP_STATUS.BAD_REQUEST:
        title = "請求錯誤";
        description = message;
        variant = "error";
        break;

      case HTTP_STATUS.NOT_FOUND:
        title = "資源不存在";
        description = message;
        variant = "warning";
        break;

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        title = "伺服器錯誤";
        description = "伺服器暫時無法處理請求，請稍後再試";
        variant = "error";
        break;

      default:
        if (code === 0) {
          // 網路錯誤（已在 httpClient 處理通知）
          return;
        }
        title = "發生錯誤";
        description = message || "認證過程中發生未知錯誤";
        variant = "error";
    }

    notificationManager.show({
      variant,
      title,
      description,
      position: "top-center",
      hideDuration,
    });
  }

  // 處理認證錯誤（轉換 ApiError 為 AuthError，保持向後兼容）
  private handleAuthError(error: unknown): AuthError {
    // 檢查是否為 ApiError（從 httpClient 拋出）
    if (error && typeof error === "object" && "code" in error && typeof (error as ApiError).code === "number") {
      const apiError = error as ApiError;

      if (apiError.code === HTTP_STATUS.UNAUTHORIZED) {
        this.clearAuth();
        return {
          code: "UNAUTHORIZED",
          message: "登入已過期，請重新登入",
          details: apiError.details,
        };
      }

      return {
        code: apiError.code.toString(),
        message: apiError.message || "認證過程中發生未知錯誤",
        details: apiError.details,
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

  // 請求重置密碼
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await httpClient.post<{ message: string }>(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
      return response;
    } catch (error) {
      // 處理錯誤並顯示通知
      if (error && typeof error === "object" && "code" in error && typeof (error as ApiError).code === "number") {
        const apiError = error as ApiError;
        this.showAuthErrorNotification(apiError, "password");
      }
      throw this.handleAuthError(error);
    }
  }

  // 使用 Token 重置密碼
  async resetPasswordWithToken(token: string, newPassword: string, newPasswordConfirm: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await httpClient.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM, {
        token,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      return response;
    } catch (error) {
      // 處理錯誤並顯示通知
      if (error && typeof error === "object" && "code" in error && typeof (error as ApiError).code === "number") {
        const apiError = error as ApiError;
        this.showAuthErrorNotification(apiError, "password");
      }
      throw this.handleAuthError(error);
    }
  }
}

// 建立全域認證服務實例
export const authService = new AuthService();

export default authService;
