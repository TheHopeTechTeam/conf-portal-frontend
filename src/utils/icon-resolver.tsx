import React from "react";
import * as MdIcons from "react-icons/md";

// 根據後端給的 icon 字串，解析對應的 Material Design React Icon
// 規則：
// 1) 若是明確的 Md* 名稱，直接取用（如 "MdSettings"）
// 2) 常見別名（如 "settings"、"users" 等）嘗試映射到合適的 Md* 圖標
// 3) 取不到則回傳一個預設圖示

const aliasMap: Record<string, keyof typeof MdIcons> = {
  settings: "MdSettings",
  bell: "MdNotifications",
  calendar: "MdCalendarToday",
  users: "MdGroup",
  user: "MdPerson",
  lock: "MdLock",
  home: "MdHome",
  dashboard: "MdDashboard",
  menu: "MdMenu",
  list: "MdList",
  folder: "MdFolder",
  role: "MdAdminPanelSettings",
  permission: "MdSecurity",
  resource: "MdWidgets",
};

export function resolveIcon(iconName?: string | null): React.ReactNode {
  const fallback: React.ReactNode = React.createElement(MdIcons.MdOutlineApps);
  if (!iconName) return fallback;

  // 明確 Md* 名稱
  if (iconName.startsWith("Md") && iconName in MdIcons) {
    const Comp = (MdIcons as any)[iconName] as React.ComponentType<any>;
    return React.createElement(Comp);
  }

  // 嘗試 alias
  const key = iconName.toLowerCase();
  const mapped = aliasMap[key];
  if (mapped && mapped in MdIcons) {
    const Comp = (MdIcons as any)[mapped] as React.ComponentType<any>;
    return React.createElement(Comp);
  }

  return fallback;
}
