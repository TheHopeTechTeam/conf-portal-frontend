import { AppRoute, ModuleRoute, RouteRegistry } from "../types/route";

class RouteRegistryManager {
  private registry: RouteRegistry = {};
  private registeredPaths: Set<string> = new Set();

  /**
   * 註冊模組路由
   * @param moduleRoute 模組路由配置
   */
  registerModule(moduleRoute: ModuleRoute): void {
    const { module, routes } = moduleRoute;

    // 檢查模組是否已存在，如果存在則先清除舊的路徑
    if (this.registry[module]) {
      console.warn(`Module "${module}" is already registered. Clearing old routes and re-registering...`);
      // 清除舊模組的路徑
      const oldRoutes = this.registry[module].routes;
      this.unregisterPaths(oldRoutes);
    }

    // 檢查路由路徑是否重複
    this.validateRoutes(routes);

    // 註冊模組
    this.registry[module] = moduleRoute;

    // 記錄所有路徑
    this.registerPaths(routes);
  }

  /**
   * 註冊多個模組
   * @param modules 模組路由配置陣列
   */
  registerModules(modules: ModuleRoute[]): void {
    modules.forEach((module) => this.registerModule(module));
  }

  /**
   * 獲取所有註冊的路由
   */
  getAllRoutes(): AppRoute[] {
    const allRoutes: AppRoute[] = [];

    Object.values(this.registry).forEach((moduleRoute) => {
      allRoutes.push(...moduleRoute.routes);
    });

    return allRoutes;
  }

  /**
   * 獲取指定模組的路由
   * @param module 模組名稱
   */
  getModuleRoutes(module: string): AppRoute[] | undefined {
    return this.registry[module]?.routes;
  }

  /**
   * 獲取所有模組
   */
  getAllModules(): string[] {
    return Object.keys(this.registry);
  }

  /**
   * 檢查路徑是否已註冊
   * @param path 路徑
   */
  isPathRegistered(path: string): boolean {
    return this.registeredPaths.has(path);
  }

  /**
   * 根據路徑獲取路由元數據
   * @param path 路徑
   */
  getRouteMeta(path: string): any {
    for (const moduleRoute of Object.values(this.registry)) {
      const route = this.findRouteByPath(moduleRoute.routes, path);
      if (route) {
        return route.meta;
      }
    }
    return null;
  }

  /**
   * 獲取需要認證的路由
   */
  getAuthRequiredRoutes(): AppRoute[] {
    const authRoutes: AppRoute[] = [];

    Object.values(this.registry).forEach((moduleRoute) => {
      moduleRoute.routes.forEach((route) => {
        if (route.meta?.requiresAuth) {
          authRoutes.push(route);
        }
      });
    });

    return authRoutes;
  }

  /**
   * 獲取模組元數據
   * @param module 模組名稱
   */
  getModuleMeta(module: string): any {
    return this.registry[module]?.meta;
  }

  /**
   * 獲取所有模組的元數據
   */
  getAllModulesMeta(): Record<string, any> {
    const meta: Record<string, any> = {};
    Object.keys(this.registry).forEach((module) => {
      meta[module] = this.registry[module]?.meta;
    });
    return meta;
  }

  /**
   * 清除所有註冊的路由
   */
  clear(): void {
    this.registry = {};
    this.registeredPaths.clear();
  }

  /**
   * 驗證路由路徑
   * @param routes 路由陣列
   */
  private validateRoutes(routes: AppRoute[]): void {
    routes.forEach((route) => {
      if (this.registeredPaths.has(route.path)) {
        // 在開發環境下，只顯示警告而不拋出錯誤
        if (process.env.NODE_ENV === "development") {
          console.warn(`Route path "${route.path}" is already registered. This might be due to React Strict Mode.`);
        } else {
          throw new Error(`Route path "${route.path}" is already registered`);
        }
      }

      if (route.children) {
        this.validateRoutes(route.children);
      }
    });
  }

  /**
   * 註冊路徑到集合中
   * @param routes 路由陣列
   */
  private registerPaths(routes: AppRoute[]): void {
    routes.forEach((route) => {
      this.registeredPaths.add(route.path);

      if (route.children) {
        this.registerPaths(route.children);
      }
    });
  }

  /**
   * 從集合中移除路徑
   * @param routes 路由陣列
   */
  private unregisterPaths(routes: AppRoute[]): void {
    routes.forEach((route) => {
      this.registeredPaths.delete(route.path);

      if (route.children) {
        this.unregisterPaths(route.children);
      }
    });
  }

  /**
   * 根據路徑查找路由
   * @param routes 路由陣列
   * @param path 路徑
   */
  private findRouteByPath(routes: AppRoute[], path: string): AppRoute | null {
    for (const route of routes) {
      if (route.path === path) {
        return route;
      }

      if (route.children) {
        const found = this.findRouteByPath(route.children, path);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * 獲取開發環境的額外路由
   */
  getDevRoutes(): AppRoute[] {
    if (process.env.NODE_ENV === "development") {
      // 開發環境可以添加額外的路由
      return [];
    }
    return [];
  }
}

// 創建單例實例
export const routeRegistry = new RouteRegistryManager();

// 導出類型
export type { AppRoute, ModuleRoute, RouteRegistry };
