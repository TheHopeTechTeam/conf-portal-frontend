import { API_ENDPOINTS, httpClient } from "@/api";
import { FileGridItem } from "@/pages/Menus/File/types";

// Instructor Types
export interface InstructorDetail extends Record<string, unknown> {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  remark?: string;
  description?: string;
  imageUrl?: string[]; // 簽名 URL 陣列（從 API 文檔）
  files?: FileGridItem[]; // 文件資訊（用於編輯時獲取 fileIds，類似 Location）
  createdAt?: string;
  updatedAt?: string;
}

export interface InstructorItem extends Record<string, unknown> {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  remark?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstructorPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: InstructorItem[];
}

export interface InstructorListResponse {
  items?: InstructorItem[];
}

export interface InstructorCreate {
  name: string;
  title?: string;
  bio?: string;
  remark?: string;
  description?: string;
  fileIds?: string[]; // 檔案 ID 陣列（用於圖片）
}

export type InstructorUpdate = InstructorCreate;

export interface InstructorDelete {
  reason?: string;
  permanent?: boolean;
}

export interface BulkAction {
  ids: string[];
}

// Instructor Service
export const instructorService = {
  async getPages(params: {
    page?: number;
    page_size?: number;
    keyword?: string;
    order_by?: string;
    descending?: boolean;
    deleted?: boolean;
  }) {
    return httpClient.get<InstructorPagesResponse>(API_ENDPOINTS.INSTRUCTORS.PAGES, params);
  },

  async getById(id: string) {
    return httpClient.get<InstructorDetail>(API_ENDPOINTS.INSTRUCTORS.DETAIL(id));
  },

  async create(payload: InstructorCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.INSTRUCTORS.CREATE, payload);
  },

  async update(id: string, payload: InstructorUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.INSTRUCTORS.UPDATE(id), payload);
  },

  async remove(id: string, payload: InstructorDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.INSTRUCTORS.DELETE(id), data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>(API_ENDPOINTS.INSTRUCTORS.RESTORE, { ids });
  },

  async getList() {
    return httpClient.get<InstructorListResponse>(API_ENDPOINTS.INSTRUCTORS.LIST);
  },
};

export default instructorService;
