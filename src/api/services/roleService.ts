// 角色服務
import { API_ENDPOINTS } from "@/api";
import type { ApiResponse, Role } from "@/api/types";
import { httpClient } from "./httpClient";

class RoleService {
  async list(): Promise<ApiResponse<Role[]>> {
    return httpClient.get<Role[]>(API_ENDPOINTS.ROLES.LIST);
  }

  async create(data: Partial<Role>): Promise<ApiResponse<Role>> {
    return httpClient.post<Role>(API_ENDPOINTS.ROLES.CREATE, data);
  }

  async update(id: string, data: Partial<Role>): Promise<ApiResponse<Role>> {
    return httpClient.put<Role>(API_ENDPOINTS.ROLES.UPDATE(id), data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.ROLES.DELETE(id));
  }
}

export const roleService = new RoleService();
export default roleService;
