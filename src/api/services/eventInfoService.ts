import { API_ENDPOINTS, httpClient } from "@/api";

// Event Info Types
export interface EventInfoItem {
  id: string;
  title: string;
  startTime: string; // ISO-8601 instant from API (typically UTC `Z`); display uses `timezone`
  endTime: string;
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
  start_datetime: string; // Wall time in event zone with offset, e.g. 2026-05-01T08:00:00+0800
  end_datetime: string;
  timezone: string; // Timezone name (e.g., "Asia/Taipei")
  text_color: string;
  background_color: string;
  conference_id: string;
  remark?: string;
  description?: string;
}

export type EventInfoUpdate = EventInfoCreate;

// Event Info Service
export const eventInfoService = {
  async getList(conferenceId: string) {
    return httpClient.get<EventInfoList>(API_ENDPOINTS.EVENT_INFO.LIST(conferenceId));
  },

  async getById(id: string) {
    return httpClient.get<EventInfoDetail>(API_ENDPOINTS.EVENT_INFO.DETAIL(id));
  },

  async create(payload: EventInfoCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.EVENT_INFO.CREATE, payload);
  },

  async update(id: string, payload: EventInfoUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.EVENT_INFO.UPDATE(id), payload);
  },

  async remove(id: string) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.EVENT_INFO.DELETE(id) });
  },
};

export default eventInfoService;
