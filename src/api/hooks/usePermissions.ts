import { permissionService } from "@/api";
import type { Permission } from "@/api/types";
import { useCallback, useEffect, useState } from "react";

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await permissionService.list();
      if (res.success) {
        setPermissions(res.data);
      } else {
        setError(res.message || "載入失敗");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { permissions, isLoading, error, refresh };
};

export default usePermissions;
