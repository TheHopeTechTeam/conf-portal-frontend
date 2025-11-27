import { API_ENDPOINTS, httpClient } from "@/api";

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
    page_size?: number;
    keyword?: string;
    order_by?: string;
    descending?: boolean;
    deleted?: boolean;
    share?: boolean;
  }) {
    return httpClient.get<TestimonyPagesResponse>(API_ENDPOINTS.TESTIMONIES.PAGES, params);
  },

  async getById(id: string) {
    return httpClient.get<TestimonyDetail>(API_ENDPOINTS.TESTIMONIES.DETAIL(id));
  },
};

export default testimonyService;
