import { MdDeveloperMode, MdWarning } from "react-icons/md";

export default function DevModeIndicator() {
  // 檢查是否為開發模式且啟用了跳過認證
  const isDevMode = process.env.NODE_ENV === "development" && import.meta.env.VITE_SKIP_AUTH === "true";

  if (!isDevMode) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
        <MdDeveloperMode className="text-lg" />
        <span className="text-sm font-medium">開發模式</span>
        <MdWarning className="text-lg" />
      </div>
    </div>
  );
}

// 開發模式狀態 Hook
export function useDevMode() {
  const isDevMode = process.env.NODE_ENV === "development" && import.meta.env.VITE_SKIP_AUTH === "true";

  return {
    isDevMode,
    devUser: isDevMode
      ? {
          username: "developer",
          roles: ["admin", "manager", "developer"],
          permissions: [
            "user:read",
            "user:write",
            "user:delete",
            "role:read",
            "role:write",
            "role:delete",
            "permission:read",
            "permission:write",
            "conference:read",
            "conference:write",
            "conference:delete",

            "log:read",
            "dashboard:read",
            "system:admin",
            "dev:debug",
          ],
        }
      : null,
  };
}
