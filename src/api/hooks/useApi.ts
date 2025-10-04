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

// 分頁 API Hook
export function usePaginatedApi<T = any>(
  apiCall: (params: any) => Promise<ApiResponse<{ data: T[]; pagination: any }>>,
  options: UseApiOptions<{ data: T[]; pagination: any }> & {
    initialPage?: number;
    initialLimit?: number;
  } = {}
) {
  const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const apiResult = useApi(apiCall, {
    ...apiOptions,
    autoExecute: true,
    dependencies: [page, limit, search, filters],
  });

  const execute = useCallback(
    async (params?: any) => {
      const queryParams = {
        page,
        limit,
        search: search || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        ...params,
      };
      return apiResult.execute(queryParams);
    },
    [apiResult, page, limit, search, filters]
  );

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // 重置到第一頁
  }, []);

  const updateSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // 重置到第一頁
  }, []);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // 重置到第一頁
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  return {
    ...apiResult,
    execute,
    page,
    limit,
    search,
    filters,
    goToPage,
    changeLimit,
    updateSearch,
    updateFilters,
    clearFilters,
  };
}

// 樂觀更新 Hook
export function useOptimisticUpdate<T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  options: {
    onError?: (error: ApiError) => void;
    onSuccess?: (data: T) => void;
  } = {}
) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await apiCall(...args);
        options.onSuccess?.(result.data);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        options.onError?.(apiError);
        throw apiError;
      } finally {
        setIsUpdating(false);
      }
    },
    [apiCall, options]
  );

  return {
    execute,
    isUpdating,
    error,
  };
}
