// 檔案相關的統一類型定義

// 檔案項目（用於顯示在網格中）
export interface FileItem {
  id: string;
  url: string;
  name: string;
  size?: number;
  uploadedAt?: string;
}

// API 返回的檔案項目
export interface FileGridItem {
  id: string;
  originalName: string;
  key: string;
  storage: string;
  bucket: string;
  region: string;
  contentType?: string;
  extension?: string;
  sizeBytes?: number;
  url?: string;
}

// 檔案分頁響應
export interface FilePagesResponse {
  page: number;
  pageSize: number;
  total: number;
  items: FileGridItem[];
}

// 檔案上傳響應
export interface FileUploadResponse {
  id: string;
  duplicate?: boolean;
}

// 批量上傳響應
export interface UUIDBaseModel {
  id: string;
}

export interface FailedUploadFile {
  filename: string;
  error: string;
}

export interface BatchFileUploadResponse {
  uploaded_files: UUIDBaseModel[];
  failed_files: FailedUploadFile[];
}

// 批量刪除請求
export interface BulkDeleteRequest {
  ids: string[];
}

// 批量刪除響應
export interface FileBase {
  id: string;
  originalName: string;
  key: string;
  storage: string;
  bucket: string;
  region: string;
  contentType?: string;
  extension?: string;
  sizeBytes?: number;
}

export interface BulkDeleteResponse {
  success_count: number;
  failed_items?: FileBase[] | null;
}

// 排序選項
export type SortOrder = "name_asc" | "name_desc" | "date_asc" | "date_desc" | "size_asc" | "size_desc";

// 檔案分頁查詢參數
export interface FilePagesParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  orderBy?: string;
  descending?: boolean;
}

