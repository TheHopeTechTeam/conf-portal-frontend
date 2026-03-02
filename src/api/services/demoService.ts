import { API_ENDPOINTS, httpClient } from "@/api";

export interface DemoDetail {
  id: string;
  name: string;
  remark?: string;
  age?: number;
  gender?: 0 | 1 | 2;
}

export interface DemoCreate {
  name: string;
  remark?: string;
  age?: number;
  gender?: 0 | 1 | 2;
}

export interface DemoUpdate extends DemoCreate {}

export interface DemoDelete {
  reason?: string;
  permanent?: boolean;
}

export interface DemoPagesParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  order_by?: string;
  descending?: boolean;
  deleted?: boolean;
}

export interface DemoPagesResponse {
  page: number;
  page_size: number;
  total: number;
  items?: DemoDetail[];
}

export const demoService = {
  async getPages(params: DemoPagesParams) {
    return httpClient.get<DemoPagesResponse>(API_ENDPOINTS.DEMOS.PAGES, params as Record<string, unknown>);
  },

  async create(payload: DemoCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.DEMOS.CREATE, payload);
  },

  async update(id: string, payload: DemoUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.DEMOS.UPDATE(id), payload);
  },

  async remove(id: string, payload: DemoDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.DEMOS.DELETE(id), data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>(API_ENDPOINTS.DEMOS.RESTORE, { ids });
  },
};

export default demoService;
