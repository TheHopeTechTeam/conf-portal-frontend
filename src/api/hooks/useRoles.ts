import { roleService } from "@/api";
import type { Role } from "@/api/types";
import { useCallback, useEffect, useState } from "react";

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await roleService.list();
      if (res.success) {
        setRoles(res.data);
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

  return { roles, isLoading, error, refresh };
};

export default useRoles;
