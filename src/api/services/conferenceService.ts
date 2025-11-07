import { httpClient } from "@/api";

// Conference Types
export interface LocationBase {
  id: string;
  name: string;
}

export interface ConferenceDetail extends Record<string, unknown> {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive?: boolean;
  remark?: string;
  description?: string;
  location?: LocationBase;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConferenceItem extends Record<string, unknown> {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive?: boolean;
  remark?: string;
  description?: string;
  locationName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConferencePagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: ConferenceItem[];
}

export interface ConferenceCreate {
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive?: boolean;
  locationId?: string;
  remark?: string;
  description?: string;
}

export type ConferenceUpdate = ConferenceCreate;

export interface ConferenceDelete {
  reason?: string;
  permanent?: boolean;
}

export interface BulkAction {
  ids: string[];
}

export interface ConferenceInstructorItem {
  instructorId: string;
  isPrimary?: boolean;
  sequence: number;
}

export interface ConferenceInstructorsUpdate {
  instructors: ConferenceInstructorItem[];
}

// Conference Service
export const conferenceService = {
  async getPages(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    descending?: boolean;
    deleted?: boolean;
    isActive?: boolean;
  }) {
    return httpClient.get<ConferencePagesResponse>("/api/v1/admin/conference/pages", params);
  },

  async getById(id: string) {
    return httpClient.get<ConferenceDetail>(`/api/v1/admin/conference/${id}`);
  },

  async create(payload: ConferenceCreate) {
    return httpClient.post<{ id: string }>("/api/v1/admin/conference/", payload);
  },

  async update(id: string, payload: ConferenceUpdate) {
    return httpClient.put<void>(`/api/v1/admin/conference/${id}`, payload);
  },

  async updateInstructors(id: string, payload: ConferenceInstructorsUpdate) {
    return httpClient.put<void>(`/api/v1/admin/conference/instructors/${id}`, payload);
  },

  async remove(id: string, payload: ConferenceDelete) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/conference/${id}`, data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>("/api/v1/admin/conference/restore", { ids });
  },
};

export default conferenceService;

