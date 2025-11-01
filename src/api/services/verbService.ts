import { API_ENDPOINTS } from "@/api";
import type { ApiResponse } from "@/api/types";
import { httpClient } from "./httpClient";

export interface VerbItem {
  id: string;
  displayName: string;
  action: string; // e.g., create/read/update/delete/list/get
}

export interface VerbListResponse {
  items: VerbItem[];
}

class VerbService {
  async list(): Promise<ApiResponse<VerbListResponse>> {
    return httpClient.get<VerbListResponse>(API_ENDPOINTS.VERBS.LIST);
  }
}

export const verbService = new VerbService();
export default verbService;
