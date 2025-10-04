import { httpClient } from "@/api";

export interface DemoDetailDto {
  id: string;
  name: string;
  remark?: string;
  age?: number;
  gender?: 0 | 1 | 2;
}

export interface DemoCreateDto {
  name: string;
  remark?: string;
  age?: number;
  gender?: 0 | 1 | 2;
}

export interface DemoUpdateDto extends DemoCreateDto {}

export interface DemoDeleteDto {
  reason?: string;
  permanent?: boolean;
}

export const demoService = {
  async create(payload: DemoCreateDto) {
    return httpClient.post<{ id: string }>("/api/v1/admin/demo", payload);
  },

  async update(id: string, payload: DemoUpdateDto) {
    return httpClient.put<void>(`/api/v1/admin/demo/${id}`, payload);
  },

  async remove(id: string, payload: DemoDeleteDto) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/demo/${id}`, data: payload });
  },
};

export default demoService;
