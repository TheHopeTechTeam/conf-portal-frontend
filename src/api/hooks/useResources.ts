import { resourceService } from "@/api";
import type { Resource } from "@/api/types";
import { useCallback, useEffect, useState } from "react";

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await resourceService.getAdminMenus();
      if (res.success) {
        // 從管理員選單回應轉換為 Resource[] 的最小型別
        // 這裡僅示意，實務上可擴充
        setResources([]);
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

  return { resources, isLoading, error, refresh };
};

export default useResources;
