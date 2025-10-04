import { ReactNode } from "react";

export interface RouteMeta {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  requiresAuth?: boolean;
  roles?: string[];
  permissions?: string[]; // 新增權限檢查支援
  breadcrumb?: string[];
  hidden?: boolean;
  order?: number;
  devOnly?: boolean; // 僅開發環境顯示
}

export interface AppRoute {
  path: string;
  element: ReactNode;
  meta?: RouteMeta;
  children?: AppRoute[];
}

export interface ModuleRoute {
  module: string;
  routes: AppRoute[];
  meta?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    order?: number;
  };
}

export interface RouteRegistry {
  [module: string]: ModuleRoute;
}

export interface RouteConfig {
  path: string;
  component: React.ComponentType<unknown>;
  meta?: RouteMeta;
  children?: RouteConfig[];
}
