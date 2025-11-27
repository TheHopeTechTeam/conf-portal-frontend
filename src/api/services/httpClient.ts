// HTTP 客戶端服務 - 使用 axios
import type { ApiError, ApiResponse } from "@/api";
import { API_ENDPOINTS, ERROR_MESSAGES, REQUEST_CONFIG } from "@/api";
import { TokenResponse } from "@/api/types";
import { notificationManager } from "@/utils/notificationManager";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, HttpStatusCode } from "axios";

// 請求攔截器型別
type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

// HTTP 客戶端類別
class HttpClient {
  private axiosInstance: AxiosInstance;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: REQUEST_CONFIG.BASE_URL,
      timeout: REQUEST_CONFIG.TIMEOUT,
      headers: REQUEST_CONFIG.HEADERS,
    });

    // 設定預設攔截器
    this.setupDefaultInterceptors();
  }

  // 添加請求攔截器
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // 添加回應攔截器
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // 添加錯誤攔截器
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // 執行請求攔截器
  private async executeRequestInterceptors(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  // 執行回應攔截器
  private async executeResponseInterceptors(response: AxiosResponse): Promise<AxiosResponse> {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  // 執行錯誤攔截器
  private async executeErrorInterceptors(error: ApiError): Promise<ApiError> {
    let finalError = error;
    for (const interceptor of this.errorInterceptors) {
      finalError = await interceptor(finalError);
    }
    return finalError;
  }

  // 處理錯誤
  private handleError(error: AxiosError, showNotification: boolean = false): ApiError {
    if (error.code === "ECONNABORTED") {
      const apiError = {
        code: 408,
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
      };
      if (showNotification) {
        notificationManager.show({
          variant: "error",
          title: "請求超時",
          description: ERROR_MESSAGES.TIMEOUT_ERROR,
          position: "top-right",
        });
      }
      return apiError;
    }

    if (!error.response) {
      const apiError = {
        code: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      };
      if (showNotification) {
        notificationManager.show({
          variant: "error",
          title: "網路錯誤",
          description: ERROR_MESSAGES.NETWORK_ERROR,
          position: "top-right",
        });
      }
      return apiError;
    }

    const status = error.response.status;
    const message = (error.response.data as { message?: string })?.message || this.getErrorMessage(status);

    const apiError = {
      code: status,
      message,
      details: error.response.data,
    };

    // 對特定錯誤顯示通知
    if (showNotification) {
      this.showErrorNotification(status, message);
    }

    return apiError;
  }

  // 顯示錯誤通知
  private showErrorNotification(status: number, message: string): void {
    let variant: "error" | "warning" = "error";
    let title = "操作失敗";

    switch (status) {
      case HttpStatusCode.Unauthorized:
        // 401 錯誤通常會在 refresh token 失敗時處理，這裡不顯示
        return;
      case HttpStatusCode.Forbidden:
        title = "權限不足";
        variant = "warning";
        break;
      case HttpStatusCode.NotFound:
        title = "資源不存在";
        variant = "warning";
        break;
      case HttpStatusCode.InternalServerError:
        title = "伺服器錯誤";
        break;
      default:
        if (status >= 500) {
          title = "伺服器錯誤";
        } else if (status >= 400) {
          title = "請求錯誤";
          variant = "warning";
        }
    }

    notificationManager.show({
      variant,
      title,
      description: message,
      position: "top-right",
      hideDuration: 5000,
    });
  }

  // 根據狀態碼取得錯誤訊息
  private getErrorMessage(status: number): string {
    switch (status) {
      case HttpStatusCode.Unauthorized:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HttpStatusCode.Forbidden:
        return ERROR_MESSAGES.FORBIDDEN;
      case HttpStatusCode.NotFound:
        return ERROR_MESSAGES.NOT_FOUND;
      case HttpStatusCode.InternalServerError:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // 重試機制
  private async retryRequest(config: AxiosRequestConfig, attempt: number = 1): Promise<AxiosResponse> {
    try {
      return await this.axiosInstance.request(config);
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const isTimeout = axiosError.code === "ECONNABORTED";
      const isNetworkError = !axiosError.response;

      // 僅對網路/逾時/5xx 進行重試；對 4xx（如 401/403/404）不重試，避免延遲觸發 refresh 或放大客戶端錯誤
      const shouldRetry = isNetworkError || isTimeout || (typeof status === "number" && status >= 500);

      if (shouldRetry && attempt < REQUEST_CONFIG.RETRY_ATTEMPTS) {
        await this.delay(REQUEST_CONFIG.RETRY_DELAY);
        return this.retryRequest(config, attempt + 1);
      }
      throw error;
    }
  }

  // 延遲函數
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 通用請求方法
  async request<T = unknown>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const processedConfig = await this.executeRequestInterceptors(config);
      const response = await this.retryRequest(processedConfig);
      const processedResponse = await this.executeResponseInterceptors(response);

      return {
        success: true,
        data: processedResponse.data,
        code: processedResponse.status,
      };
    } catch (error) {
      // 判斷是否應該顯示通知（排除 refresh token 請求，避免重複通知）
      const shouldShowNotification = !this.isRefreshRequest(config);
      const apiError = this.handleError(error as AxiosError, shouldShowNotification);

      // 若為 401，嘗試使用 refresh token 重新取得 access token 並重試一次
      console.log("apiError", apiError);
      if (apiError.code === HttpStatusCode.Unauthorized && !this.isRefreshRequest(config)) {
        try {
          await this.getOrCreateRefreshPromise();

          // 成功刷新後，重試原始請求（會套用新的 Authorization 標頭）
          const retriedConfig = await this.executeRequestInterceptors(config);
          const retriedResponse = await this.retryRequest(retriedConfig);
          const processedRetryResponse = await this.executeResponseInterceptors(retriedResponse);

          return {
            success: true,
            data: processedRetryResponse.data,
            code: processedRetryResponse.status,
          };
        } catch (retryError) {
          // 刷新或重試仍失敗，清理並導回登入
          notificationManager.show({
            variant: "warning",
            title: "登入已過期",
            description: "請重新登入",
            position: "top-center",
            hideDuration: 5000,
          });
          this.clearAuthAndRedirect();
          const finalError = this.handleError(retryError as AxiosError);
          const processedFinalError = await this.executeErrorInterceptors(finalError);
          throw processedFinalError;
        }
      }

      const processedError = await this.executeErrorInterceptors(apiError);
      throw processedError;
    }
  }

  // GET 請求
  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "GET",
      url,
      params,
    });
  }

  // POST 請求
  async post<T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "POST",
      url,
      data,
    });
  }

  // PUT 請求
  async put<T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "PUT",
      url,
      data,
    });
  }

  // PATCH 請求
  async patch<T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "PATCH",
      url,
      data,
    });
  }

  // DELETE 請求（支援 body）
  async delete<T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "DELETE",
      url,
      data,
    });
  }

  // 檔案上傳
  async upload<T = unknown>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<T>({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // 設定預設攔截器
  private setupDefaultInterceptors(): void {
    // 預設請求攔截器 - 添加認證 token
    this.addRequestInterceptor(async (config) => {
      // 從 authService 獲取 token，它會根據 rememberMe 狀態決定從哪個存儲獲取
      const token = this.getTokenFromStorage();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });

    // 預設回應攔截器 - 處理認證過期
    this.addResponseInterceptor(async (response) => {
      return response;
    });

    // 預設錯誤攔截器 - 記錄錯誤
    this.addErrorInterceptor(async (error) => {
      console.error("API Error:", error);
      return error;
    });
  }

  // 判斷是否為 refresh token 請求
  private isRefreshRequest(config: AxiosRequestConfig): boolean {
    const url = typeof config.url === "string" ? config.url : "";
    return url === API_ENDPOINTS.AUTH.REFRESH;
  }

  // 建立或取得現有刷新流程 Promise（避免並行重複刷新）
  private async getOrCreateRefreshPromise(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.refreshAccessToken().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  // 呼叫後端以 refresh token 換取新的 access token
  private async refreshAccessToken(): Promise<string> {
    // 只有記住我模式才有 refresh token
    const storedRefreshToken = localStorage.getItem("refresh_token");

    if (!storedRefreshToken) {
      throw {
        code: HttpStatusCode.Unauthorized,
        message: "No refresh token available",
      } as ApiError;
    }

    // 直接使用 axiosInstance 呼叫 refresh 端點，避免套用 Authorization 標頭
    const response = await this.axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: storedRefreshToken,
    });

    const data = response.data as TokenResponse;
    const newAccessToken = data.accessToken;
    const newRefreshToken = data.refreshToken;

    if (!newAccessToken) {
      throw {
        code: HttpStatusCode.Unauthorized,
        message: "Failed to refresh access token",
      } as ApiError;
    }

    // 存儲新的 access token（記住我模式）
    localStorage.setItem("auth_token", newAccessToken);

    // 如果有新的 refresh token，也存儲起來
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken);
    }

    return newAccessToken;
  }

  // 從存儲獲取 token（支援 rememberMe）
  private getTokenFromStorage(): string | null {
    // 先檢查 sessionStorage（一般登入模式優先，避免被舊的 local token 蓋過）
    const sessionToken = sessionStorage.getItem("auth_token");
    if (sessionToken) return sessionToken;

    // 再檢查 localStorage（記住我模式）
    return localStorage.getItem("auth_token");
  }

  // 清空本地認證資訊並導向登入頁
  private clearAuthAndRedirect(): void {
    // 清理 localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("refresh_token_expiry");
    localStorage.removeItem("user_data");
    localStorage.removeItem("remember_me");

    // 清理 sessionStorage
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user_data");

    // 導向登入頁
    if (window.location.pathname !== "/signin") {
      window.location.href = "/signin";
    }
  }
}

// 建立全域 HTTP 客戶端實例
export const httpClient = new HttpClient();

export default httpClient;
