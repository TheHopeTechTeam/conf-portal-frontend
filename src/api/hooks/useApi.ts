// 通用 API Hook
import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError, ApiResponse, LoadingState } from "../types";

// Hook 配置選項
interface UseApiOptions<T> {
  // 是否自動執行
  autoExecute?: boolean;
  // 依賴項，當依賴項改變時重新執行
  dependencies?: any[];
  // 快取時間（毫秒）
  cacheTime?: number;
  // 是否啟用快取
  enableCache?: boolean;
  // 錯誤處理函數
  onError?: (error: ApiError) => void;
  // 成功處理函數
  onSuccess?: (data: T) => void;
  // 轉換回應資料
  transform?: (data: any) => T;
}

// 快取項目型別
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// 快取儲存
const cache = new Map<string, CacheItem<any>>();

// 清理過期的快取項目
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now - item.timestamp > item.ttl) {
      cache.delete(key);
    }
  }
};

// 定期清理快取
setInterval(cleanupCache, 60000); // 每分鐘清理一次

// 通用 API Hook
export function useApi<T = any>(apiCall: (...args: any[]) => Promise<ApiResponse<T>>, options: UseApiOptions<T> = {}) {
  const {
    autoExecute = false,
    dependencies = [],
    cacheTime = 5 * 60 * 1000, // 5 分鐘
    enableCache = false,
    onError,
    onSuccess,
    transform,
  } = options;

  // 狀態管理
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });
  const [data, setData] = useState<T | null>(null);

  // 快取鍵
  const cacheKey = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiCallRef = useRef(apiCall);

  // 更新 apiCall 引用
  apiCallRef.current = apiCall;

  // 生成快取鍵
  const generateCacheKey = useCallback((...args: any[]) => {
    const argsString = JSON.stringify(args);
    return `api_call_${argsString}`;
  }, []);

  // 執行 API 呼叫
  const execute = useCallback(
    async (...args: any[]) => {
      // 取消之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 建立新的 AbortController
      abortControllerRef.current = new AbortController();

      // 生成快取鍵
      cacheKey.current = generateCacheKey(...args);

      // 檢查快取
      if (enableCache && cache.has(cacheKey.current)) {
        const cachedItem = cache.get(cacheKey.current)!;
        if (Date.now() - cachedItem.timestamp < cachedItem.ttl) {
          setData(cachedItem.data);
          setState({ isLoading: false, error: null });
          onSuccess?.(cachedItem.data);
          return cachedItem.data;
        }
      }

      setState({ isLoading: true, error: null });

      try {
        const response = await apiCallRef.current(...args);

        // 檢查請求是否被取消
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        let resultData = response.data;

        // 應用資料轉換
        if (transform) {
          resultData = transform(resultData);
        }

        setData(resultData);
        setState({ isLoading: false, error: null });

        // 儲存到快取
        if (enableCache) {
          cache.set(cacheKey.current, {
            data: resultData,
            timestamp: Date.now(),
            ttl: cacheTime,
          });
        }

        onSuccess?.(resultData);
        return resultData;
      } catch (error) {
        // 檢查請求是否被取消
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const apiError = error as ApiError;
        setState({ isLoading: false, error: apiError });
        onError?.(apiError);
        throw apiError;
      }
    },
    [enableCache, cacheTime, onError, onSuccess, transform, generateCacheKey]
  );

  // 重新執行
  const refetch = useCallback(
    async (...args: any[]) => {
      // 清除快取
      if (enableCache && cacheKey.current) {
        cache.delete(cacheKey.current);
      }
      return execute(...args);
    },
    [execute, enableCache]
  );

  // 清除快取
  const clearCache = useCallback(() => {
    if (cacheKey.current) {
      cache.delete(cacheKey.current);
    }
  }, []);

  // 清除所有快取
  const clearAllCache = useCallback(() => {
    cache.clear();
  }, []);

  // 自動執行
  useEffect(() => {
    if (autoExecute) {
      execute();
    }

    // 清理函數
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoExecute, ...dependencies]);

  return {
    data,
    isLoading: state.isLoading,
    error: state.error,
    execute,
    refetch,
    clearCache,
    clearAllCache,
  };
}
