import Blank from "@/pages/Blank";
import Dashboard from "@/pages/Dashboard";
import ResourceManagement from "@/pages/System/ResourceManagement";
import UserManagement from "@/pages/System/UserManagement";
import RoleManagement from "@/pages/System/RoleManagement";
import React from "react";

// 註冊可路由的元件，鍵值對應後端資源的 key
const componentRegistry: Record<string, React.ComponentType> = {
  // Dashboard - 主要首頁
  DASHBOARD: Dashboard,

  // System 模組
  SYSTEM: Blank, // 系統首頁佔位

  // 用戶管理
  SYSTEM_USER: UserManagement,

  // 角色管理
  SYSTEM_ROLE: RoleManagement,

  // 權限管理
  SYSTEM_PERMISSION: Blank,

  // 資源管理
  SYSTEM_RESOURCE: ResourceManagement,

  // 會議管理範例
  CONFERENCE: Blank,
};

function normalizeKey(key: string): string {
  return key?.trim();
}

export function resolveRouteElementByKey(key: string): React.ReactElement {
  const normalizedKey = normalizeKey(key);
  const Component = componentRegistry[normalizedKey];

  if (Component) {
    return React.createElement(Component);
  }

  // 如果找不到對應的組件，返回預設的 Blank 組件
  // console.warn(`Component not found for key: "${key}", using Blank component`);
  return React.createElement(Blank);
}

export type {};
