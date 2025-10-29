// 資源管理服務
import { API_ENDPOINTS } from "@/api";
import type { ApiResponse } from "@/api/types";
import { httpClient } from "./httpClient";

// 從 /admin/resource/menus 取得的項目型別（最小需求）
export enum AdminResourceType {
  SYSTEM = 0,
  GENERAL = 1,
}

export interface ResourceParent {
  id: string;
  name: string;
  key: string;
  code: string;
  icon?: string | null;
}

export interface ResourceMenuItem {
  id: string;
  pid?: string | null;
  name: string;
  key: string; // 對應前端元件的註冊鍵
  code: string;
  icon?: string | null; // 後端回傳的圖示識別碼
  path?: string | null;
  type: AdminResourceType;
  description?: string | null;
  remark?: string | null;
  sequence?: number;
  is_deleted?: boolean;
  is_visible?: boolean;
  parent?: ResourceParent | null;
  created_at?: string;
  updated_at?: string;
}

export interface ResourceMenusResponse {
  items: ResourceMenuItem[];
}

// 資源創建數據
export interface ResourceCreateData {
  name: string;
  key: string;
  code: string;
  path: string;
  icon: string;
  type: AdminResourceType;
  is_visible?: boolean;
  description?: string;
  remark?: string;
  pid?: string;
}

// 資源更新數據
export interface ResourceUpdateData {
  name?: string;
  key?: string;
  code?: string;
  path?: string;
  icon?: string;
  type?: AdminResourceType;
  is_visible?: boolean;
  description?: string;
  remark?: string;
  pid?: string;
}

// 資源排序數據
export interface ResourceChangeSequenceData {
  id: string;
  sequence: number;
  another_id: string;
  another_sequence: number;
}

// 刪除資源數據
export interface DeleteResourceData {
  reason?: string;
  permanent?: boolean;
}

// 資源服務類別
class ResourceService {
  // 取得資源列表（支援查詢已刪除/未刪除資源）
  async getResources(deleted: boolean = false): Promise<ApiResponse<ResourceMenusResponse>> {
    return httpClient.get<ResourceMenusResponse>(`${API_ENDPOINTS.RESOURCES.LIST}?deleted=${deleted}`);
  }

  // 取得單一資源詳情
  async getResource(id: string): Promise<ApiResponse<ResourceMenuItem>> {
    return httpClient.get<ResourceMenuItem>(API_ENDPOINTS.RESOURCES.DETAIL(id));
  }

  // 取得用戶權限選單（管理員）
  async getAdminMenus(): Promise<ApiResponse<ResourceMenusResponse>> {
    return httpClient.get<ResourceMenusResponse>(API_ENDPOINTS.RESOURCES.MENUS);
  }

  // 變更資源順序
  async changeSequence(data: ResourceChangeSequenceData): Promise<ApiResponse<void>> {
    return httpClient.post<void>(API_ENDPOINTS.RESOURCES.CHANGE_SEQUENCE, data);
  }

  // 建立資源
  async createResource(data: ResourceCreateData): Promise<ApiResponse<{ id: string; created_at: string; updated_at: string }>> {
    return httpClient.post<{ id: string; created_at: string; updated_at: string }>(API_ENDPOINTS.RESOURCES.CREATE, data);
  }

  // 更新資源
  async updateResource(id: string, data: ResourceUpdateData): Promise<ApiResponse<void>> {
    return httpClient.put<void>(API_ENDPOINTS.RESOURCES.UPDATE(id), data);
  }

  // 刪除資源
  async deleteResource(id: string, data?: DeleteResourceData): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.RESOURCES.DELETE(id), data);
  }

  // 恢復資源
  async restoreResource(id: string): Promise<ApiResponse<void>> {
    return httpClient.put<void>(API_ENDPOINTS.RESOURCES.RESTORE(id));
  }
}

// 建立全域資源服務實例
export const resourceService = new ResourceService();

export default resourceService;
