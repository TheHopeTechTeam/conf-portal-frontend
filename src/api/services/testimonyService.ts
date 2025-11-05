import { httpClient } from "@/api";

export interface TestimonyDetail extends Record<string, unknown> {
  id: string;
  name: string;
  phoneNumber?: string;
  share: boolean;
  message?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonyPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: TestimonyDetail[];
}

export const testimonyService = {
  async getPages(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    descending?: boolean;
    deleted?: boolean;
    share?: boolean;
  }) {
    return httpClient.get<TestimonyPagesResponse>("/api/v1/admin/testimony/pages", params);
  },

  async getById(id: string) {
    return httpClient.get<TestimonyDetail>(`/api/v1/admin/testimony/${id}`);
  },
};

export default testimonyService;

