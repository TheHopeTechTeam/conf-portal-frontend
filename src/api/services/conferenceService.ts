import { API_ENDPOINTS, httpClient } from "@/api";

// Conference Types
export interface LocationBase {
  id: string;
  name: string;
}

export interface ConferenceDetail extends Record<string, unknown> {
  id: string;
  title: string;
  timezone: string;
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
  timezone: string;
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
  timezone: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  is_active?: boolean;
  location_id?: string;
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
  instructor_id: string;
  is_primary?: boolean;
  sequence: number;
  name: string;
}

export interface ConferenceInstructors {
  items: ConferenceInstructorItem[];
}

export interface ConferenceInstructorBase {
  instructor_id: string;
  is_primary?: boolean;
  sequence: number;
}

export interface ConferenceInstructorsUpdate {
  instructors: ConferenceInstructorBase[];
}

export interface ConferenceBase {
  id: string;
  title: string;
}

export interface ConferenceListResponse {
  items?: ConferenceBase[];
}

// Conference Service
export const conferenceService = {
  async getPages(params: {
    page?: number;
    page_size?: number;
    keyword?: string;
    order_by?: string;
    descending?: boolean;
    deleted?: boolean;
    is_active?: boolean;
  }) {
    return httpClient.get<ConferencePagesResponse>(API_ENDPOINTS.CONFERENCES.PAGES, params);
  },

  async getList() {
    return httpClient.get<ConferenceListResponse>(API_ENDPOINTS.CONFERENCES.LIST);
  },

  async getById(id: string) {
    return httpClient.get<ConferenceDetail>(API_ENDPOINTS.CONFERENCES.DETAIL(id));
  },

  async getActive() {
    return httpClient.get<ConferenceItem>(API_ENDPOINTS.CONFERENCES.ACTIVE);
  },

  async create(payload: ConferenceCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.CONFERENCES.CREATE, payload);
  },

  async update(id: string, payload: ConferenceUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.CONFERENCES.UPDATE(id), payload);
  },

  async getInstructors(conferenceId: string) {
    return httpClient.get<ConferenceInstructors>(API_ENDPOINTS.CONFERENCES.INSTRUCTORS(conferenceId));
  },

  async updateInstructors(id: string, payload: ConferenceInstructorsUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.CONFERENCES.UPDATE_INSTRUCTORS(id), payload);
  },

  async remove(id: string, payload: ConferenceDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.CONFERENCES.DELETE(id), data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>(API_ENDPOINTS.CONFERENCES.RESTORE, { ids });
  },
};

export default conferenceService;
