import { httpClient } from "@/api";

// Event Info Types
export interface EventInfoItem {
  id: string;
  title: string;
  startTime: string; // ISO 8601 format without timezone (e.g., "2024-01-01T09:00:00")
  endTime: string; // ISO 8601 format without timezone (e.g., "2024-01-01T10:00:00")
  timezone: string; // Timezone name (e.g., "Asia/Taipei")
  textColor: string;
  backgroundColor: string;
}

export interface EventInfoList {
  items?: EventInfoItem[];
}

export interface EventInfoDetail extends EventInfoItem {
  remark?: string;
  description?: string;
  conference: {
    id: string;
    title: string;
  };
}

export interface EventInfoCreate {
  title: string;
  startTime: string; // ISO 8601 format without timezone (e.g., "2024-01-01T09:00:00")
  endTime: string; // ISO 8601 format without timezone (e.g., "2024-01-01T10:00:00")
  timezone: string; // Timezone name (e.g., "Asia/Taipei")
  textColor: string;
  backgroundColor: string;
  conferenceId: string;
  remark?: string;
  description?: string;
}

export type EventInfoUpdate = EventInfoCreate;

// Event Info Service
export const eventInfoService = {
  async getList(conferenceId: string) {
    return httpClient.get<EventInfoList>(`/api/v1/admin/event_info/${conferenceId}/list`);
  },

  async getById(id: string) {
    return httpClient.get<EventInfoDetail>(`/api/v1/admin/event_info/${id}`);
  },

  async create(payload: EventInfoCreate) {
    return httpClient.post<{ id: string }>("/api/v1/admin/event_info/", payload);
  },

  async update(id: string, payload: EventInfoUpdate) {
    return httpClient.put<void>(`/api/v1/admin/event_info/${id}`, payload);
  },

  async remove(id: string) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/event_info/${id}` });
  },
};

export default eventInfoService;
