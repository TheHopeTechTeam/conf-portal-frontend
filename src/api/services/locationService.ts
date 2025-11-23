import { httpClient } from "@/api";
import { FileGridItem } from "@/pages/Menus/File/types";

// Location Types
export interface LocationDetail extends Record<string, unknown> {
  id: string;
  name: string;
  address?: string;
  floor?: string;
  room_number?: string;
  latitude?: number;
  longitude?: number;
  remark?: string;
  description?: string;
  files?: FileGridItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationItem extends Record<string, unknown> {
  id: string;
  name: string;
  address?: string;
  floor?: string;
  roomNumber?: string;
  latitude?: number;
  longitude?: number;
  remark?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: LocationItem[];
}

export interface LocationCreate {
  name: string;
  address?: string;
  floor?: string;
  room_number?: string;
  latitude?: number;
  longitude?: number;
  remark?: string;
  description?: string;
  file_ids?: string[]; // 檔案 ID 陣列（用於圖片）
}

export type LocationUpdate = LocationCreate;

export interface LocationDelete {
  reason?: string;
  permanent?: boolean;
}

export interface BulkAction {
  ids: string[];
}

export interface LocationBase {
  id: string;
  name: string;
}

export interface LocationListResponse {
  items?: LocationBase[];
}

// Location Service
export const locationService = {
  async getPages(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    descending?: boolean;
    deleted?: boolean;
    roomNumber?: string;
  }) {
    return httpClient.get<LocationPagesResponse>("/api/v1/admin/location/pages", params);
  },

  async getList() {
    return httpClient.get<LocationListResponse>("/api/v1/admin/location/list");
  },

  async getById(id: string) {
    return httpClient.get<LocationDetail>(`/api/v1/admin/location/${id}`);
  },

  async create(payload: LocationCreate) {
    return httpClient.post<{ id: string }>("/api/v1/admin/location/", payload);
  },

  async update(id: string, payload: LocationUpdate) {
    return httpClient.put<void>(`/api/v1/admin/location/${id}`, payload);
  },

  async remove(id: string, payload: LocationDelete) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/location/${id}`, data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>("/api/v1/admin/location/restore", { ids });
  },
};

export default locationService;
