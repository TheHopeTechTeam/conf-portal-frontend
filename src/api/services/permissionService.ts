// 權限服務
import { API_ENDPOINTS } from "@/api";
import type {
  ApiResponse,
  PermissionCreate,
  PermissionDelete,
  PermissionDetail,
  PermissionListItem,
  PermissionPage,
  PermissionUpdate,
} from "@/api/types";
import { httpClient } from "./httpClient";

interface PermissionQueryParams {
  page?: number;
  page_size?: number;
  order_by?: string;
  descending?: boolean;
  keyword?: string;
  deleted?: boolean;
  is_active?: boolean;
}

class PermissionService {
  async pages(params: PermissionQueryParams = {}): Promise<ApiResponse<PermissionPage>> {
    return httpClient.get<PermissionPage>(API_ENDPOINTS.PERMISSIONS.PAGES, params);
  }

  async list(): Promise<ApiResponse<{ items: PermissionListItem[] }>> {
    return httpClient.get<{ items: PermissionListItem[] }>(API_ENDPOINTS.PERMISSIONS.LIST);
  }

  async getById(id: string): Promise<ApiResponse<PermissionDetail>> {
    return httpClient.get<PermissionDetail>(API_ENDPOINTS.PERMISSIONS.DETAIL(id));
  }

  async create(data: PermissionCreate): Promise<ApiResponse<{ id: string }>> {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.PERMISSIONS.CREATE, data);
  }

  async update(id: string, data: PermissionUpdate): Promise<ApiResponse<void>> {
    return httpClient.put<void>(API_ENDPOINTS.PERMISSIONS.UPDATE(id), data);
  }

  async remove(id: string, data: PermissionDelete): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.PERMISSIONS.DELETE(id), { data });
  }

  async restore(ids: string[]): Promise<ApiResponse<void>> {
    return httpClient.put<void>(API_ENDPOINTS.PERMISSIONS.RESTORE, { ids });
  }
}

export const permissionService = new PermissionService();
export default permissionService;
