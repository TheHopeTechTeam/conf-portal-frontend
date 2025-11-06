// 權限檢查的最佳實踐 Hook - 提供常用的權限檢查模式
import { useMemo } from "react";
import { usePermissions } from "../context/AuthContext";
import { usePermissionData } from "./usePermissionData";

export function usePermissionBestPractices() {
  const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } = usePermissions();
  const { permissions, roles } = usePermissionData();

  // 檢查是否為管理員
  const isAdmin = useMemo(() => {
    return hasRole("admin") || hasPermission("system:admin");
  }, [hasRole, hasPermission]);

  // 檢查是否為開發者
  const isDeveloper = useMemo(() => {
    return hasRole("developer") || hasPermission("dev:debug");
  }, [hasRole, hasPermission]);

  // 檢查是否有使用者管理權限
  const canManageUsers = useMemo(() => {
    return hasAnyPermission(["user:read", "user:write", "user:delete"]);
  }, [hasAnyPermission]);

  // 檢查是否有角色管理權限
  const canManageRoles = useMemo(() => {
    return hasAnyPermission(["role:read", "role:write", "role:delete"]);
  }, [hasAnyPermission]);

  // 檢查是否有權限管理權限
  const canManagePermissions = useMemo(() => {
    return hasAnyPermission(["permission:read", "permission:write"]);
  }, [hasAnyPermission]);

  // 檢查是否有會議管理權限
  const canManageConferences = useMemo(() => {
    return hasAnyPermission(["conference:read", "conference:write", "conference:delete"]);
  }, [hasAnyPermission]);

  // 檢查是否有 API Key 管理權限
  const canManageApiKeys = useMemo(() => {
    return hasAnyPermission(["api-key:read", "api-key:write", "api-key:delete"]);
  }, [hasAnyPermission]);

  // 檢查是否有日誌查看權限
  const canViewLogs = useMemo(() => {
    return hasPermission("log:read");
  }, [hasPermission]);

  // 檢查是否有儀表板查看權限
  const canViewDashboard = useMemo(() => {
    return hasPermission("dashboard:read");
  }, [hasPermission]);

  // 檢查是否有完整的管理權限
  const hasFullAdminAccess = useMemo(() => {
    return isAdmin && canManageUsers && canManageRoles && canManagePermissions;
  }, [isAdmin, canManageUsers, canManageRoles, canManagePermissions]);

  // 檢查是否有系統管理權限
  const hasSystemAccess = useMemo(() => {
    return hasPermission("system:admin") || isDeveloper;
  }, [hasPermission, isDeveloper]);

  // 檢查是否有讀取權限（通用）
  const hasReadAccess = useMemo(() => {
    return (resource: string) => hasPermission(`${resource}:read`);
  }, [hasPermission]);

  // 檢查是否有寫入權限（通用）
  const hasWriteAccess = useMemo(() => {
    return (resource: string) => hasPermission(`${resource}:write`);
  }, [hasPermission]);

  // 檢查是否有刪除權限（通用）
  const hasDeleteAccess = useMemo(() => {
    return (resource: string) => hasPermission(`${resource}:delete`);
  }, [hasPermission]);

  // 檢查是否有完整 CRUD 權限（通用）
  const hasFullAccess = useMemo(() => {
    return (resource: string) => {
      return hasAllPermissions([`${resource}:read`, `${resource}:write`, `${resource}:delete`]);
    };
  }, [hasAllPermissions]);

  // 獲取用戶的所有權限列表
  const getUserPermissions = useMemo(() => {
    return permissions.map((p) => `${p.resource}:${p.action}`);
  }, [permissions]);

  // 獲取用戶的所有角色列表
  const getUserRoles = useMemo(() => {
    return roles.map((r) => r.name);
  }, [roles]);

  // 檢查是否有特定資源的權限
  const hasResourcePermission = useMemo(() => {
    return (resource: string, action: string) => {
      return hasPermission(`${resource}:${action}`);
    };
  }, [hasPermission]);

  // 檢查是否有特定資源的多個權限
  const hasResourcePermissions = useMemo(() => {
    return (resource: string, actions: string[]) => {
      return hasAllPermissions(actions.map((action) => `${resource}:${action}`));
    };
  }, [hasAllPermissions]);

  // 檢查是否有特定資源的任一權限
  const hasAnyResourcePermission = useMemo(() => {
    return (resource: string, actions: string[]) => {
      return hasAnyPermission(actions.map((action) => `${resource}:${action}`));
    };
  }, [hasAnyPermission]);

  // 權限檢查工具函數
  const permissionUtils = {
    // 檢查是否為超級管理員
    isSuperAdmin: () => isAdmin && hasSystemAccess,

    // 檢查是否為內容管理員
    isContentManager: () => canManageConferences && canViewDashboard,

    // 檢查是否為系統管理員
    isSystemManager: () => canManageUsers && canManageRoles && canManagePermissions,

    // 檢查是否為一般使用者
    isRegularUser: () => !isAdmin && !isDeveloper && canViewDashboard,

    // 檢查是否為訪客
    isGuest: () => !isAdmin && !isDeveloper && !canViewDashboard,

    // 檢查是否有管理權限
    hasManagementAccess: () => canManageUsers || canManageRoles || canManagePermissions,

    // 檢查是否有系統級權限
    hasSystemLevelAccess: () => hasSystemAccess || isAdmin,

    // 檢查是否有應用級權限
    hasApplicationLevelAccess: () => canManageConferences || canManageApiKeys,

    // 檢查是否有用戶級權限
    hasUserLevelAccess: () => canViewDashboard || canViewLogs,
  };

  return {
    // 基本權限檢查
    isAdmin,
    isDeveloper,
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    canManageConferences,
    canManageApiKeys,
    canViewLogs,
    canViewDashboard,
    hasFullAdminAccess,
    hasSystemAccess,

    // 通用權限檢查
    hasReadAccess,
    hasWriteAccess,
    hasDeleteAccess,
    hasFullAccess,
    hasResourcePermission,
    hasResourcePermissions,
    hasAnyResourcePermission,

    // 用戶資料
    getUserPermissions,
    getUserRoles,

    // 權限檢查工具
    permissionUtils,

    // 原始權限檢查方法
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
  };
}
// 權限檢查的高階 Hook
export function usePermissionGuard() {
  const permissionChecks = usePermissionBestPractices();

  // 權限守衛函數
  const guard = {
    // 檢查並執行操作
    execute: (permission: string, action: () => void, fallback?: () => void) => {
      if (permissionChecks.hasPermission(permission)) {
        action();
      } else {
        fallback?.();
      }
    },

    // 檢查並返回布林值
    check: (permission: string): boolean => {
      return permissionChecks.hasPermission(permission);
    },

    // 檢查並返回條件渲染的布林值
    render: (permission: string): boolean => {
      return permissionChecks.hasPermission(permission);
    },

    // 檢查多個權限（全部符合）
    checkAll: (permissions: string[]): boolean => {
      return permissionChecks.hasAllPermissions(permissions);
    },

    // 檢查多個權限（任一符合）
    checkAny: (permissions: string[]): boolean => {
      return permissionChecks.hasAnyPermission(permissions);
    },

    // 檢查角色
    checkRole: (role: string): boolean => {
      return permissionChecks.hasRole(role);
    },

    // 檢查多個角色（全部符合）
    checkAllRoles: (roles: string[]): boolean => {
      return permissionChecks.hasAllRoles(roles);
    },

    // 檢查多個角色（任一符合）
    checkAnyRole: (roles: string[]): boolean => {
      return permissionChecks.hasAnyRole(roles);
    },
  };

  return {
    ...permissionChecks,
    guard,
  };
}
