import { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import { authService } from "../api/services/authService";
import type { AuthState, LoginCredentials, User } from "../types/auth";
import { IS_SKIP_AUTH } from "@/config/env";

// 認證 Action 型別
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_CLEAR_ERROR" };

// 認證 Context 型別
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// 初始狀態
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true, // 初始設為 true，等待認證狀態確定
  error: null,
};

// 認證 Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload || null, // 空字串時設為 null
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };
    case "AUTH_CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// 建立 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider 元件
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化認證狀態
  useEffect(() => {
    const initializeAuth = async () => {
      // 開發模式：如果設定了跳過認證的環境變數，直接設定為已認證
      if (IS_SKIP_AUTH) {
        const devUser = authService.getUser();
        const devToken = authService.getToken();
        if (devUser && devToken) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: devUser, token: devToken },
          });
        }
        return;
      }

      if (authService.isAuthenticated()) {
        try {
          dispatch({ type: "AUTH_START" });
          const response = await authService.getCurrentUser();

          if (response.success && response.data) {
            const token = authService.getToken();
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: response.data, token: token || "" },
            });
          } else {
            dispatch({ type: "AUTH_FAILURE", payload: "無法取得使用者資訊" });
          }
        } catch (error) {
          // 初始化期間若短暫失敗，不立即視為未認證；保留當前狀態並允許後續 API 觸發刷新流程
          dispatch({ type: "AUTH_FAILURE", payload: "" });
        }
      } else {
        // 未認證：若完全沒有 AT 與 RT，直接標記為未認證且不呼叫 /auth/me
        const hasAccessToken = !!authService.getToken();
        const hasRefreshToken = !!authService.getRefreshToken();
        if (!hasAccessToken && !hasRefreshToken) {
          dispatch({ type: "AUTH_FAILURE", payload: "" });
          authService.clearAuth();
          return;
        }

        // 有 AT 或 RT：嘗試直接取得使用者，交由 httpClient 的 401 刷新機制處理一次刷新
        try {
          dispatch({ type: "AUTH_START" });
          const userResp = await authService.getCurrentUser();
          if (userResp.success && userResp.data) {
            const token = authService.getToken();
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: userResp.data, token: token || "" },
            });
          } else {
            dispatch({ type: "AUTH_FAILURE", payload: "" });
          }
        } catch {
          dispatch({ type: "AUTH_FAILURE", payload: "" });
        }
      }
    };

    initializeAuth();
  }, []);

  // 登入方法
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        // 從 authService 重新獲取 token，確保使用正確的存儲位置
        const token = authService.getToken();
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: response.data.user, token: token || "" },
        });
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: "登入失敗" });
      }
    } catch (error) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: error instanceof Error ? error.message : "登入失敗",
      });
    }
  };

  // 登出方法
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  // 清除錯誤
  const clearError = () => {
    dispatch({ type: "AUTH_CLEAR_ERROR" });
  };

  // 重新整理使用者資訊
  const refreshUser = async () => {
    if (!state.isAuthenticated) return;

    try {
      const response = await authService.getCurrentUser();

      if (response.success && response.data) {
        const token = authService.getToken();
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: response.data, token: token || "" },
        });
      }
    } catch (error) {
      console.warn("Failed to refresh user:", error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 使用認證 Context 的 Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
// 權限檢查 Hook
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
  };
}
