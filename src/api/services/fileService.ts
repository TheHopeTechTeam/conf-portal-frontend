import { API_ENDPOINTS, httpClient } from "@/api";
import type { AxiosProgressEvent } from "axios";
import type {
  BatchFileUploadResponse,
  BulkDeleteRequest,
  BulkDeleteResponse,
  FilePagesParams,
  FilePagesResponse,
} from "@/pages/Menus/File/types";

export const fileService = {
  // 獲取檔案分頁列表
  async getPages(params: FilePagesParams) {
    return httpClient.get<FilePagesResponse>(API_ENDPOINTS.FILES.PAGES, params);
  },

  // 批量上傳檔案
  async batchUpload(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return httpClient.request<BatchFileUploadResponse>({
      method: "POST",
      url: API_ENDPOINTS.FILES.BATCH_UPLOAD,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 單檔上傳（支援進度回調）
  async uploadOne(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("file", file);

    return httpClient.request<{ id: string; duplicate?: boolean }>({
      method: "POST",
      url: API_ENDPOINTS.FILES.UPLOAD,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (evt: AxiosProgressEvent) => {
        if (!onProgress) return;
        const total = evt.total ?? file.size ?? 0;
        if (total > 0) {
          const percent = Math.round((evt.loaded * 100) / total);
          onProgress(Math.max(0, Math.min(100, percent)));
        }
      },
    });
  },

  // 批量刪除檔案
  async bulkDelete(payload: BulkDeleteRequest) {
    return httpClient.request<BulkDeleteResponse>({
      method: "DELETE",
      url: API_ENDPOINTS.FILES.BULK_DELETE,
      data: payload,
    });
  },
};

export default fileService;
