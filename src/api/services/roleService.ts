// 角色服務（對齊後端 Admin Role API）
import { API_ENDPOINTS } from "@/api";
import type { ApiResponse } from "@/api/types";
import { httpClient } from "./httpClient";

export interface RolePermissionItem {
  id: string;
  resourceName: string;
  displayName: string;
  code: string;
}

export interface RolePageItem extends Record<string, unknown> {
  id: string;
  code: string;
  name?: string;
  isActive: boolean;
  createAt?: string;
  createdBy?: string;
  updateAt?: string;
  updatedBy?: string;
  deleteReason?: string;
  description?: string;
  remark?: string;
  permissions: RolePermissionItem[];
}

export interface RolePagesResponse {
  page: number;
  page_size: number;
  total: number;
  items?: RolePageItem[];
}

export interface RoleCreate {
  code: string;
  name?: string;
  isActive?: boolean;
  description?: string;
  remark?: string;
  permissions?: string[]; // permission IDs
}

export type RoleUpdate = RoleCreate;

export interface RoleDelete {
  reason?: string;
  permanent?: boolean;
}

export interface RolePermissionAssign {
  permissionIds: string[];
}

class RoleService {
  async getPages(params: {
    page?: number;
    page_size?: number;
    keyword?: string;
    order_by?: string;
    descending?: boolean;
    deleted?: boolean;
  }): Promise<ApiResponse<RolePagesResponse>> {
    return httpClient.get<RolePagesResponse>(API_ENDPOINTS.ROLES.PAGES, params);
  }

  async getById(id: string): Promise<ApiResponse<RolePageItem>> {
    return httpClient.get<RolePageItem>(API_ENDPOINTS.ROLES.DETAIL(id));
  }

  async create(payload: RoleCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.ROLES.CREATE, payload);
  }

  async update(id: string, payload: RoleUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.ROLES.UPDATE(id), payload);
  }

  async remove(id: string, payload: RoleDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.ROLES.DELETE(id), data: payload });
  }

  async restore(id: string) {
    return httpClient.put<void>(API_ENDPOINTS.ROLES.RESTORE(id));
  }

  async assignPermissions(id: string, payload: RolePermissionAssign) {
    return httpClient.post<void>(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id), payload);
  }
}

export const roleService = new RoleService();
export default roleService;
