import { httpClient } from "@/api";

export interface UserDetail {
  id: string;
  phone_number: string;
  email: string;
  verified: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  last_login_at?: string;
  display_name?: string;
  gender?: number; // 0: 未知, 1: 男性, 2: 女性, 3: 其他
  is_ministry: boolean;
  created_at?: string;
  updated_at?: string;
  remark?: string;
}

export interface UserCreate {
  phone_number: string;
  email: string;
  verified?: boolean;
  is_active?: boolean;
  is_superuser?: boolean;
  is_admin?: boolean;
  display_name?: string;
  gender?: number;
  is_ministry?: boolean;
  remark?: string;
}

export type UserUpdate = UserCreate;

export interface UserDelete {
  reason?: string;
  permanent?: boolean;
}

export interface UserBulkDelete {
  ids: string[];
}

export interface UserPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number; // API 可能返回 pageSize 或 page_size
  page_size?: number; // API 可能返回 pageSize 或 page_size
  total: number;
  items?: UserDetail[];
}

export const userService = {
  async getPages(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    descending?: boolean;
    deleted?: boolean;
    is_active?: boolean;
    is_superuser?: boolean;
    is_admin?: boolean;
    is_ministry?: boolean;
  }) {
    return httpClient.get<UserPagesResponse>("/api/v1/admin/user/pages", params);
  },

  async getById(id: string) {
    return httpClient.get<UserDetail>(`/api/v1/admin/user/${id}`);
  },

  async create(payload: UserCreate) {
    return httpClient.post<{ id: string }>("/api/v1/admin/user/", payload);
  },

  async update(id: string, payload: UserUpdate) {
    return httpClient.put<void>(`/api/v1/admin/user/${id}`, payload);
  },

  async remove(id: string, payload: UserDelete) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/user/${id}`, data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>("/api/v1/admin/user/restore", { ids });
  },
};

export default userService;
