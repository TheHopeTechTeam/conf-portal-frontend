import { API_ENDPOINTS, httpClient } from "@/api";

// Workshop Types
export interface LocationBase {
  id: string;
  name: string;
}

export interface ConferenceBase {
  id: string;
  title: string;
}

export interface WorkshopDetail extends Record<string, unknown> {
  id: string;
  title: string;
  timezone: string;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  participantsLimit?: number;
  remark?: string;
  sequence: number;
  location: LocationBase;
  conference: ConferenceBase;
  description?: string;
}

export interface WorkshopItem extends Record<string, unknown> {
  id: string;
  title: string;
  timezone: string;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  participantsLimit?: number;
  remark?: string;
  sequence: number;
}

export interface WorkshopPageItem extends WorkshopItem {
  conferenceTitle?: string;
  locationName?: string;
  registeredCount: number;
}

export interface WorkshopPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: WorkshopPageItem[];
  prevItem?: { id: string; sequence: number };
  nextItem?: { id: string; sequence: number };
}

export interface WorkshopCreate {
  title: string;
  timezone: string;
  start_datetime: string; // ISO 8601 datetime (snake_case for API)
  end_datetime: string; // ISO 8601 datetime (snake_case for API)
  location_id: string; // snake_case for API
  conference_id: string; // snake_case for API
  participant_limit?: number; // snake_case for API
  remark?: string;
  description?: string;
}

export type WorkshopUpdate = WorkshopCreate;

export interface WorkshopDelete {
  reason?: string;
  permanent?: boolean;
}

export interface BulkAction {
  ids: string[];
}

export interface WorkshopChangeSequence {
  id: string;
  sequence: number;
  another_id: string; // snake_case for API
  another_sequence: number; // snake_case for API
}

export interface WorkshopInstructorBase {
  instructor_id: string; // snake_case for API
  is_primary: boolean; // snake_case for API
  sequence: number;
}

export interface WorkshopInstructorItem extends WorkshopInstructorBase {
  name: string;
  sequence: number; // float in response
}

export interface WorkshopInstructors {
  items: WorkshopInstructorItem[];
}

export interface WorkshopInstructorsUpdate {
  instructors: WorkshopInstructorBase[];
}

// Workshop Service
export const workshopService = {
  async getPages(params: {
    page?: number;
    page_size?: number; // snake_case for API
    keyword?: string;
    order_by?: string; // snake_case for API
    descending?: boolean;
    deleted?: boolean;
    is_active?: boolean; // snake_case for API
    location_id?: string; // snake_case for API
    conference_id?: string; // snake_case for API
    start_datatime?: string; // snake_case for API, ISO 8601 datetime
    end_datatime?: string; // snake_case for API, ISO 8601 datetime
  }) {
    return httpClient.get<WorkshopPagesResponse>(API_ENDPOINTS.WORKSHOPS.PAGES, params);
  },

  async getById(id: string) {
    return httpClient.get<WorkshopDetail>(API_ENDPOINTS.WORKSHOPS.DETAIL(id));
  },

  async create(payload: WorkshopCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.WORKSHOPS.CREATE, payload);
  },

  async update(id: string, payload: WorkshopUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.WORKSHOPS.UPDATE(id), payload);
  },

  async changeSequence(payload: WorkshopChangeSequence) {
    return httpClient.put<void>(API_ENDPOINTS.WORKSHOPS.CHANGE_SEQUENCE(payload.id), payload);
  },

  async getInstructors(workshopId: string) {
    return httpClient.get<WorkshopInstructors>(API_ENDPOINTS.WORKSHOPS.INSTRUCTORS(workshopId));
  },

  async updateInstructors(workshopId: string, payload: WorkshopInstructorsUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.WORKSHOPS.UPDATE_INSTRUCTORS(workshopId), payload);
  },

  async remove(id: string, payload: WorkshopDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.WORKSHOPS.DELETE(id), data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>(API_ENDPOINTS.WORKSHOPS.RESTORE, { ids });
  },
};

export default workshopService;
