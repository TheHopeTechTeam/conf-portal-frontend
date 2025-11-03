import { routeRegistry } from "../utils/route-registry";

// 導入所有路由模組
import { authRoutes } from "./modules/auth";
import { dashboardRoutes } from "./modules/dashboard";
import { demoRoutes } from "./modules/demo";
import { errorRoutes } from "./modules/errors";
import { generalMenusRoutes } from "./modules/Menus";
import { systemMenuRoutes } from "./modules/System";

// 全局初始化標誌
let isRoutesInitialized = false;

/**
 * 初始化路由系統
 * 註冊所有模組路由
 */
export function initializeRoutes(): void {
  // 防止重複初始化
  if (isRoutesInitialized) {
    console.log("路由系統已經初始化，跳過重複初始化");
    return;
  }

  // 註冊所有模組路由（開發環境額外加入 demo 模組）
  const modules = [authRoutes, dashboardRoutes, errorRoutes, systemMenuRoutes, generalMenusRoutes];
  if (process.env.NODE_ENV === "development") {
    modules.push(demoRoutes);
  }
  routeRegistry.registerModules(modules);

  console.log("路由系統初始化完成 - 已註冊所有模組");
  console.log("已註冊模組:", routeRegistry.getAllModules());

  // 開發環境下顯示詳細信息
  if (process.env.NODE_ENV === "development") {
    console.log("總路由數量:", routeRegistry.getAllRoutes().length);
    console.log("需要認證的路由數量:", routeRegistry.getAuthRequiredRoutes().length);

    // 顯示每個模組的路由數量
    routeRegistry.getAllModules().forEach((module) => {
      const routes = routeRegistry.getModuleRoutes(module);
      if (routes) {
        console.log(`模組 "${module}" 包含 ${routes.length} 個路由`);
      }
    });
  }

  // 標記為已初始化
  isRoutesInitialized = true;
}

/**
 * 獲取所有註冊的路由
 */
export function getAllRoutes() {
  return routeRegistry.getAllRoutes();
}

/**
 * 獲取指定模組的路由
 */
export function getModuleRoutes(module: string) {
  return routeRegistry.getModuleRoutes(module);
}

/**
 * 獲取需要認證的路由
 */
export function getAuthRequiredRoutes() {
  return routeRegistry.getAuthRequiredRoutes();
}

/**
 * 根據路徑獲取路由元數據
 */
export function getRouteMeta(path: string) {
  return routeRegistry.getRouteMeta(path);
}

/**
 * 檢查路徑是否已註冊
 */
export function isPathRegistered(path: string) {
  return routeRegistry.isPathRegistered(path);
}

// 導出路由註冊中心實例
export { routeRegistry };
