import { IS_DEV } from "@/config/env";
import type { Permission, Role, User } from "../types/auth";
import type { AppRoute } from "../types/route";

// 路由過濾選項
interface RouteFilterOptions {
  isAuthenticated: boolean;
  user: User | null;
  permissions: Permission[];
  roles: Role[];
}

// 檢查路由是否可訪問
function canAccessRoute(route: AppRoute, options: RouteFilterOptions): boolean {
  const { isAuthenticated, user, permissions, roles } = options;
  const { meta } = route;

  // 非開發環境過濾 devOnly 路由
  if (meta?.devOnly && !IS_DEV) {
    return false;
  }

  // 如果路由明確標示不需要認證，則允許訪問
  if (meta?.requiresAuth === false) {
    return true;
  }

  // 如果路由需要認證但用戶未登入，則拒絕訪問
  const routeRequiresAuth = meta?.requiresAuth === true || meta?.requiresAuth === undefined;
  if (routeRequiresAuth && !isAuthenticated) {
    return false;
  }

  // 如果用戶已登入，檢查角色和權限
  if (isAuthenticated) {
    // 優先使用權限資料進行檢查
    if (permissions.length > 0 || roles.length > 0) {
      // 檢查角色權限
      if (meta?.roles && meta.roles.length > 0) {
        const hasRequiredRole = meta.roles.some((role) => roles.some((r) => r.name === role));
        if (!hasRequiredRole) {
          return false;
        }
      }

      // 檢查權限（如果路由有定義 permissions）
      if (meta?.permissions && meta.permissions.length > 0) {
        const hasRequiredPermission = meta.permissions.some((permission) =>
          permissions.some((p) => p.resource + ":" + p.action === permission)
        );
        if (!hasRequiredPermission) {
          return false;
        }
      }
    } else if (user) {
      // 回退到使用者資料進行檢查
      // 檢查角色權限
      if (meta?.roles && meta.roles.length > 0) {
        const hasRequiredRole = meta.roles.some((role) => user.roles.includes(role));
        if (!hasRequiredRole) {
          return false;
        }
      }

      // 檢查權限（如果路由有定義 permissions）
      if (meta?.permissions && meta.permissions.length > 0) {
        const hasRequiredPermission = meta.permissions.some((permission) => user.permissions.includes(permission));
        if (!hasRequiredPermission) {
          return false;
        }
      }
    }
  }

  return true;
}

// 遞迴過濾路由
function filterRoutesRecursive(routes: AppRoute[], options: RouteFilterOptions): AppRoute[] {
  return routes
    .map((route) => {
      // 檢查當前路由是否可訪問
      if (!canAccessRoute(route, options)) {
        return null;
      }

      // 如果有子路由，遞迴過濾
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterRoutesRecursive(route.children, options);

        // 如果所有子路由都被過濾掉，且當前路由沒有 element，則也過濾掉
        if (filteredChildren.length === 0 && !route.element) {
          return null;
        }

        return {
          ...route,
          children: filteredChildren,
        };
      }

      return route;
    })
    .filter((route): route is AppRoute => route !== null);
}

// 主要的路由過濾函數
export function filterRoutesByAuth(
  routes: AppRoute[],
  isAuthenticated: boolean,
  user: User | null,
  permissions: Permission[] = [],
  roles: Role[] = []
): AppRoute[] {
  const options: RouteFilterOptions = {
    isAuthenticated,
    user,
    permissions,
    roles,
  };

  return filterRoutesRecursive(routes, options);
}

// 獲取公開路由（不需要認證的路由）
export function getPublicRoutes(routes: AppRoute[]): AppRoute[] {
  return routes.filter((route) => route.meta?.requiresAuth === false);
}

// 獲取需要認證的路由
export function getAuthRequiredRoutes(routes: AppRoute[]): AppRoute[] {
  return routes.filter((route) => route.meta?.requiresAuth !== false);
}

// 檢查路徑是否可訪問
export function isPathAccessible(
  path: string,
  routes: AppRoute[],
  isAuthenticated: boolean,
  user: User | null,
  permissions: Permission[] = [],
  roles: Role[] = []
): boolean {
  const findRouteByPath = (routeList: AppRoute[], targetPath: string): AppRoute | null => {
    for (const route of routeList) {
      if (route.path === targetPath) {
        return route;
      }
      if (route.children) {
        const found = findRouteByPath(route.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const route = findRouteByPath(routes, path);
  if (!route) return false;

  return canAccessRoute(route, { isAuthenticated, user, permissions, roles });
}

// 獲取用戶可訪問的所有路徑
export function getAccessiblePaths(
  routes: AppRoute[],
  isAuthenticated: boolean,
  user: User | null,
  permissions: Permission[] = [],
  roles: Role[] = []
): string[] {
  const paths: string[] = [];

  const collectPaths = (routeList: AppRoute[]) => {
    routeList.forEach((route) => {
      if (canAccessRoute(route, { isAuthenticated, user, permissions, roles })) {
        paths.push(route.path);
      }
      if (route.children) {
        collectPaths(route.children);
      }
    });
  };

  collectPaths(routes);
  return paths;
}

// 檢查模組是否可訪問（模組下至少有一個可訪問的路由）
export function isModuleAccessible(
  moduleRoutes: AppRoute[],
  isAuthenticated: boolean,
  user: User | null,
  permissions: Permission[] = [],
  roles: Role[] = []
): boolean {
  return moduleRoutes.some((route) => canAccessRoute(route, { isAuthenticated, user, permissions, roles }));
}
