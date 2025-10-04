// 權限服務
import { API_ENDPOINTS } from "@/api";
import type { ApiResponse, Permission } from "@/api/types";
import { httpClient } from "./httpClient";

class PermissionService {
  async list(): Promise<ApiResponse<Permission[]>> {
    return httpClient.get<Permission[]>(API_ENDPOINTS.PERMISSIONS.LIST);
  }

  async create(data: Partial<Permission>): Promise<ApiResponse<Permission>> {
    return httpClient.post<Permission>(API_ENDPOINTS.PERMISSIONS.CREATE, data);
  }

  async update(id: string, data: Partial<Permission>): Promise<ApiResponse<Permission>> {
    return httpClient.put<Permission>(API_ENDPOINTS.PERMISSIONS.UPDATE(id), data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.PERMISSIONS.DELETE(id));
  }
}

export const permissionService = new PermissionService();
export default permissionService;
