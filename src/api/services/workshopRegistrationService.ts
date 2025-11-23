import { httpClient } from "@/api";
import { userService, type UserDetail } from "./userService";
import { workshopService, type WorkshopDetail } from "./workshopService";

// Workshop Registration Types
export interface WorkshopBase {
  id: string;
  title: string;
}

export interface UserBase {
  id: string;
  phoneNumber?: string;
  email?: string;
  displayName?: string;
}

export interface WorkshopRegistrationDetail {
  id: string;
  workshop: WorkshopBase;
  user: UserBase;
}

export interface WorkshopRegistrationPageItem extends Record<string, unknown> {
  id: string;
  workshopTitle?: string;
  userEmail?: string;
  userDisplayName?: string;
  registeredAt: string; // ISO 8601 datetime
  unregisteredAt?: string; // ISO 8601 datetime
}

export interface WorkshopRegistrationPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: WorkshopRegistrationPageItem[];
}

export interface WorkshopRegistrationCreate {
  workshop_id: string; // snake_case for API
  user_id: string; // snake_case for API
}

export interface WorkshopRegistrationDelete {
  reason?: string;
  permanent?: boolean;
}

// Workshop Registration Service
export const workshopRegistrationService = {
  async getPages(params: {
    page?: number;
    page_size?: number; // snake_case for API
    keyword?: string;
    order_by?: string; // snake_case for API
    descending?: boolean;
    deleted?: boolean;
    workshop_id?: string; // snake_case for API
    user_id?: string; // snake_case for API
    is_registered?: boolean; // snake_case for API
  }) {
    return httpClient.get<WorkshopRegistrationPagesResponse>("/api/v1/admin/workshop_registration/pages", params);
  },

  async getById(id: string) {
    return httpClient.get<WorkshopRegistrationDetail>(`/api/v1/admin/workshop_registration/${id}`);
  },

  async create(payload: WorkshopRegistrationCreate) {
    return httpClient.post<{ id: string }>("/api/v1/admin/workshop_registration/", payload);
  },

  async unregister(id: string) {
    return httpClient.post<void>(`/api/v1/admin/workshop_registration/${id}/unregister`);
  },

  async remove(id: string, payload: WorkshopRegistrationDelete) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/workshop_registration/${id}`, data: payload });
  },
};

// Re-export workshop and user services for convenience
export { userService, workshopService };
export type { UserDetail, WorkshopDetail };

export default workshopRegistrationService;
