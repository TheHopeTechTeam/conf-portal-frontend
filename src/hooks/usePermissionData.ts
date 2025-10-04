import { useCallback, useEffect, useState } from "react";
import type { Permission, Role } from "../types/auth";

interface PermissionData {
  permissions: Permission[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface UsePermissionDataReturn extends PermissionData {
  refreshPermissions: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

export function usePermissionData(): UsePermissionDataReturn {
  const [data, setData] = useState<PermissionData>({
    permissions: [],
    roles: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Stubs: no API calls
  const refreshPermissions = useCallback(async () => {
    setData((prev) => ({ ...prev, lastUpdated: Date.now() }));
  }, []);

  const checkPermission = useCallback((permission: string): boolean => {
    return false;
  }, []);

  const checkRole = useCallback((role: string): boolean => {
    return false;
  }, []);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return false;
  }, []);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return false;
  }, []);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return false;
  }, []);

  const hasAllRoles = useCallback((roles: string[]): boolean => {
    return false;
  }, []);

  useEffect(() => {
    // No-op initialization
  }, []);

  return {
    ...data,
    refreshPermissions,
    checkPermission,
    checkRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
  };
}

export function usePermissionCheck() {
  const { checkPermission, checkRole, hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } = usePermissionData();

  return {
    checkPermission,
    checkRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
  };
}
