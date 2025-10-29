// 路由過濾管理器 - 負責啟動時的路由過濾和動態路由重建
import { createBrowserRouter, Navigate } from "react-router";
import type { ResourceMenuItem } from "../api/services/resourceService";
import { FullPageLoading } from "../components/common/LoadingSpinner";
import AppLayout from "../layout/AppLayout";
import { getAllRoutes } from "../routes";
import type { Permission, Role, User } from "../types/auth";
import type { AppRoute } from "../types/route";
import { resolveRouteElementByKey } from "./component-registry";
import { resolveIcon } from "./icon-resolver";
import { filterRoutesByAuth, getPublicRoutes } from "./route-filter";

// 路由過濾狀態
interface RouteFilterState {
  isInitialized: boolean;
  isFiltering: boolean;
  filteredRoutes: AppRoute[];
  publicRoutes: AppRoute[];
  error: string | null;
  lastFilterTime: number | null;
  isAuthenticated: boolean;
}

// 路由過濾選項
interface RouteFilterOptions {
  isAuthenticated: boolean;
  user: User | null;
  permissions: Permission[];
  roles: Role[];
  menus?: ResourceMenuItem[] | null;
  forceRefresh?: boolean;
}

class RouteFilterManager {
  private state: RouteFilterState = {
    isInitialized: false,
    isFiltering: false,
    filteredRoutes: [],
    publicRoutes: [],
    error: null,
    lastFilterTime: null,
    isAuthenticated: false,
  };

  private listeners: Set<(state: RouteFilterState) => void> = new Set();

  private buildRoutesFromMenus(items: ResourceMenuItem[]): AppRoute[] {
    // 只轉成第一層可路由；若要支援巢狀，這裡可擴充 group/pid 架構
    return items
      .filter((it) => !!it.path)
      .map<AppRoute>((it) => ({
        path: it.path!,
        element: resolveRouteElementByKey(it.key),
        meta: {
          title: it.name,
          icon: resolveIcon(it.icon || undefined).icon,
          requiresAuth: true,
          order: it.sequence ? Math.floor(it.sequence) : undefined,
        },
      }));
  }

  // 初始化路由過濾
  async initializeRoutes(options: RouteFilterOptions): Promise<void> {
    try {
      this.setState({ isFiltering: true, error: null });

      // 獲取所有靜態路由
      const allRoutes = getAllRoutes();

      // 分離公開路由
      const publicRoutes = getPublicRoutes(allRoutes);

      let filteredRoutes: AppRoute[] = [];

      if (options.isAuthenticated) {
        // 已認證：使用傳入的菜單資料或回退到靜態路由
        if (options.menus && Array.isArray(options.menus)) {
          const dynamicRoutes = this.buildRoutesFromMenus(options.menus);
          // 合併靜態受保護路由（若仍需）與動態路由，避免重複 path 可在此去重
          const staticProtected = filterRoutesByAuth(allRoutes, true, options.user, options.permissions, options.roles).filter(
            (r) => r.meta?.requiresAuth !== false
          );
          const merged = [...staticProtected, ...dynamicRoutes];
          // 簡單去重 by path（以動態為準）
          const seen = new Set<string>();
          filteredRoutes = merged
            .reverse()
            .filter((r) => {
              if (seen.has(r.path)) return false;
              seen.add(r.path);
              return true;
            })
            .reverse();
        } else {
          // 沒有菜單資料時，回退到僅靜態受保護路由
          filteredRoutes = filterRoutesByAuth(allRoutes, true, options.user, options.permissions, options.roles);
        }
      } else {
        // 未認證時只顯示公開路由
        filteredRoutes = publicRoutes;
      }

      this.setState({
        isInitialized: true,
        isFiltering: false,
        filteredRoutes,
        publicRoutes,
        lastFilterTime: Date.now(),
        isAuthenticated: options.isAuthenticated,
      });

      console.log(`🔧 Routes filtered: ${filteredRoutes.length} accessible routes`);
    } catch (error) {
      console.error("Failed to initialize routes:", error);
      this.setState({
        isFiltering: false,
        error: error instanceof Error ? error.message : "Failed to initialize routes",
      });
    }
  }

  // 重新過濾路由（用於權限變更後）
  async refreshRoutes(options: RouteFilterOptions): Promise<void> {
    console.log("🔄 Refreshing routes...");
    await this.initializeRoutes({ ...options, forceRefresh: true });
  }

  // 創建路由配置
  createRouteConfig(): ReturnType<typeof createBrowserRouter> {
    const { filteredRoutes, isInitialized, isFiltering, error, isAuthenticated } = this.state;

    if (!isInitialized || isFiltering) {
      // 載入中或未初始化時，返回載入路由
      return createBrowserRouter([
        {
          path: "*",
          element: <FullPageLoading text="初始化路由中..." />,
        },
      ]);
    }

    if (error) {
      // 錯誤時，返回錯誤路由
      return createBrowserRouter([
        {
          path: "*",
          element: (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">路由初始化失敗</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  重新載入
                </button>
              </div>
            </div>
          ),
        },
      ]);
    }

    const config: Array<{
      path: string;
      element: React.ReactNode;
      children?: Array<{
        path?: string;
        index?: boolean;
        element: React.ReactNode;
      }>;
    }> = [];

    // 未認證時，只創建公開路由和重導向規則
    if (!isAuthenticated) {
      // 添加公開路由（如 /signin），但排除通配符路由
      const publicRoutes = filteredRoutes.filter((route) => route.meta?.requiresAuth === false && route.path !== "*");

      config.push(
        ...publicRoutes.map((route) => ({
          path: route.path,
          element: route.element,
        }))
      );

      // 添加重導向規則 - 所有其他路徑都重導向到 /signin
      config.push({ path: "/", element: <Navigate to="/signin" replace /> });
      config.push({ path: "*", element: <Navigate to="/signin" replace /> });

      return createBrowserRouter(config);
    }

    // 已認證時，創建完整的路由配置
    const layoutRoutes = filteredRoutes.filter((route) => route.meta?.requiresAuth !== false);
    const standaloneRoutes = filteredRoutes.filter((route) => route.meta?.requiresAuth === false);

    // 如果有需要 Layout 的路由，創建 Layout 路由
    if (layoutRoutes.length > 0) {
      config.push({
        path: "/",
        element: <AppLayout />,
        children: layoutRoutes.map((route) => {
          if (route.path === "/") {
            return {
              index: true,
              element: route.element,
            };
          }
          return {
            path: route.path,
            element: route.element,
          };
        }),
      });
    }

    // 添加獨立路由（不需要 Layout）
    config.push(
      ...standaloneRoutes.map((route) => ({
        path: route.path,
        element: route.element,
      }))
    );

    // 已認證時，確保根路徑有對應的 Dashboard
    if (isAuthenticated && layoutRoutes.length > 0) {
      // 檢查是否已經有根路徑的配置
      const hasRootRoute = config.some((route) => route.children && route.children.some((child) => child.index === true));
      if (!hasRootRoute) {
        // 如果沒有根路徑，添加一個默認的 Dashboard
        const dashboardRoute = layoutRoutes.find((route) => route.path === "/");
        if (dashboardRoute && config[0] && Array.isArray(config[0].children)) {
          config[0].children.unshift({
            index: true,
            element: dashboardRoute.element,
          });
        }
      }
    }

    // 已認證時，若使用者仍在登入頁，導向根路徑
    if (isAuthenticated) {
      config.push({ path: "/signin", element: <Navigate to="/" replace /> });
    }

    // 已認證時添加 404 路由
    config.push({
      path: "*",
      element: (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">頁面不存在</h1>
            <p className="text-gray-500 mb-4">您訪問的頁面不存在或您沒有權限訪問</p>
            <button onClick={() => window.history.back()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              返回上一頁
            </button>
          </div>
        </div>
      ),
    });

    return createBrowserRouter(config);
  }

  // 檢查路徑是否可訪問
  isPathAccessible(path: string): boolean {
    const { filteredRoutes } = this.state;
    return filteredRoutes.some((route) => route.path === path);
  }

  // 獲取可訪問的路徑列表
  getAccessiblePaths(): string[] {
    const { filteredRoutes } = this.state;
    return filteredRoutes.map((route) => route.path);
  }

  // 獲取過濾狀態
  getState(): RouteFilterState {
    return { ...this.state };
  }

  // 訂閱狀態變更
  subscribe(listener: (state: RouteFilterState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // 設置狀態
  private setState(updates: Partial<RouteFilterState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // 通知監聽器
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error("Error in route filter listener:", error);
      }
    });
  }

  // 重置狀態
  reset(): void {
    this.state = {
      isInitialized: false,
      isFiltering: false,
      filteredRoutes: [],
      publicRoutes: [],
      error: null,
      lastFilterTime: null,
      isAuthenticated: false,
    };
    this.notifyListeners();
  }
}

// 建立全域路由過濾管理器實例
export const routeFilterManager = new RouteFilterManager();

// 路由過濾 Hook
export function useRouteFilter() {
  const [state, setState] = useState(routeFilterManager.getState());

  useEffect(() => {
    const unsubscribe = routeFilterManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    refreshRoutes: routeFilterManager.refreshRoutes.bind(routeFilterManager),
    isPathAccessible: routeFilterManager.isPathAccessible.bind(routeFilterManager),
    getAccessiblePaths: routeFilterManager.getAccessiblePaths.bind(routeFilterManager),
  };
}

// 導入必要的 React hooks
import { useEffect, useState } from "react";
