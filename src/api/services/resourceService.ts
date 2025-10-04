// 資源管理服務
import { API_ENDPOINTS } from "@/api";
import type { ApiResponse, Resource } from "@/api/types";
import { httpClient } from "./httpClient";

// 從 /admin/resource/menus 取得的項目型別（最小需求）
export enum AdminResourceType {
  SYSTEM = 0,
  GENERAL = 1,
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
}

export interface ResourceMenusResponse {
  items: ResourceMenuItem[];
}

// 資源服務類別
class ResourceService {
  // 取得用戶權限選單（管理員）
  async getAdminMenus(): Promise<ApiResponse<ResourceMenusResponse>> {
    return httpClient.get<ResourceMenusResponse>(API_ENDPOINTS.RESOURCES.MENUS);
  }

  // 變更資源順序
  async changeSequence(data: any): Promise<ApiResponse<void>> {
    return httpClient.post<void>(API_ENDPOINTS.RESOURCES.CHANGE_SEQUENCE, data);
  }

  // 建立資源
  async createResource(data: Partial<Resource>): Promise<ApiResponse<Resource>> {
    return httpClient.post<Resource>(API_ENDPOINTS.RESOURCES.CREATE, data);
  }

  // 更新資源
  async updateResource(id: string, data: Partial<Resource>): Promise<ApiResponse<Resource>> {
    return httpClient.put<Resource>(API_ENDPOINTS.RESOURCES.UPDATE(id), data);
  }

  // 刪除資源
  async deleteResource(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(API_ENDPOINTS.RESOURCES.DELETE(id));
  }
}

// 建立全域資源服務實例
export const resourceService = new ResourceService();

export default resourceService;
