import { AdminResourceType } from "../api/services/resourceService";

// 資源菜單項目（與 API 回應對應）
export interface ResourceMenuItem {
  id: string;
  pid: string | null | undefined;
  name: string;
  key: string;
  code: string;
  icon?: string;
  path?: string;
  type: AdminResourceType;
  description?: string;
  remark?: string;
  sequence: number;
}

// 創建資源請求
export interface CreateResourceRequest {
  pid?: string;
  name: string;
  key: string;
  code: string;
  icon: string;
  path: string;
  type: AdminResourceType;
  is_visible?: boolean;
  description?: string;
  remark?: string;
}

// 更新資源請求
export interface UpdateResourceRequest {
  name?: string;
  key?: string;
  code?: string;
  icon?: string;
  path?: string;
  type?: AdminResourceType;
  is_visible?: boolean;
  description?: string;
  remark?: string;
}

// 刪除資源請求
export interface DeleteResourceRequest {
  reason?: string;
  permanent?: boolean;
}

// 變更順序請求
export interface ChangeSequenceRequest {
  id: string;
  sequence: number;
  another_id: string;
  another_sequence: number;
}

// 樹狀節點
export interface ResourceTreeNode {
  id: string;
  pid: string | null | undefined;
  name: string;
  key: string;
  code: string;
  icon?: string;
  path?: string;
  type: AdminResourceType;
  description?: string;
  remark?: string;
  sequence: number;
  children: ResourceTreeNode[];
  level: number;
}

// 資源表單數據
export interface ResourceFormData {
  name: string;
  key: string;
  code: string;
  icon: string;
  path: string;
  type: AdminResourceType;
  description: string;
  remark: string;
  pid?: string;
}

// 表單驗證錯誤
export interface ResourceFormErrors {
  name?: string;
  key?: string;
  code?: string;
  icon?: string;
  path?: string;
  type?: string;
  description?: string;
  remark?: string;
  pid?: string;
}

// 批量操作
export interface BulkOperation {
  action: "create" | "update" | "delete";
  id?: string;
  data?: Partial<ResourceMenuItem>;
}

export interface BulkOperationsRequest {
  operations: BulkOperation[];
}
