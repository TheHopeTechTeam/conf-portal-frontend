import { API_ENDPOINTS, httpClient } from "@/api";

export interface DemoDetail {
  id: string;
  name: string;
  remark?: string;
  age?: number;
  gender?: 0 | 1 | 2 | 3;
}

export interface DemoCreate {
  name: string;
  remark?: string;
  age?: number;
  gender?: 0 | 1 | 2 | 3;
}

export interface DemoUpdate extends DemoCreate {}

export interface DemoDelete {
  reason?: string;
  permanent?: boolean;
}

export const demoService = {
  async create(payload: DemoCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.DEMOS.CREATE, payload);
  },

  async update(id: string, payload: DemoUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.DEMOS.UPDATE(id), payload);
  },

  async remove(id: string, payload: DemoDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.DEMOS.DELETE(id), data: payload });
  },
};

export default demoService;
