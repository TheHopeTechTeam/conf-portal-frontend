import { API_ENDPOINTS, httpClient } from "@/api";

export enum NotificationMethod {
  PUSH = 0,
  EMAIL = 1,
}

export enum NotificationType {
  SYSTEM = 0,
  MULTIPLE = 1,
  INDIVIDUAL = 2,
}

export enum NotificationStatus {
  PENDING = 0,
  SENT = 1,
  FAILED = 2,
  DRY_RUN = 3,
}

export enum NotificationHistoryStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
}

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  url?: string;
  method: number;
  type: number;
  status: number;
  failure_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminNotificationPagesResponse {
  page: number;
  page_size: number;
  total: number;
  items: AdminNotificationItem[];
}

export interface AdminNotificationCreate {
  title: string;
  message: string;
  url?: string;
  method: NotificationMethod;
  type: NotificationType;
  dry_run?: boolean;
  user_ids?: string[];
}

export interface AdminNotificationHistoryItem {
  id: string;
  notification_id: string;
  device_id: string;
  message_id?: string;
  exception?: string;
  status: number;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
  user_email?: string;
  user_display_name?: string;
  user_phone_number?: string;
}

export interface AdminNotificationHistoryPagesResponse {
  page: number;
  page_size: number;
  total: number;
  items: AdminNotificationHistoryItem[];
}

export const notificationService = {
  async getPages(params: {
    page?: number;
    page_size?: number;
    order_by?: string;
    descending?: boolean;
    keyword?: string;
    deleted?: boolean;
    method?: number;
    type?: number;
    status?: number;
  }) {
    return httpClient.get<AdminNotificationPagesResponse>(API_ENDPOINTS.ADMIN_NOTIFICATION.PAGES, params);
  },

  async create(payload: AdminNotificationCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.ADMIN_NOTIFICATION.CREATE, {
      title: payload.title,
      message: payload.message,
      url: payload.url ?? undefined,
      method: payload.method,
      type: payload.type,
      dry_run: payload.dry_run ?? false,
      user_ids: payload.user_ids,
    });
  },

  /** 取得單一通知群組成員的 user id 列表 */
  async getGroupMemberIds(groupKey: string) {
    const res = await httpClient.get<{ user_ids: string[] }>(API_ENDPOINTS.ADMIN_NOTIFICATION.GROUP_MEMBERS(groupKey));
    return res.data?.user_ids ?? [];
  },

  /** 取得多個群組成員合併後的 user id 列表（去重） */
  async getGroupMembersBatch(groupKeys: string[]) {
    const res = await httpClient.post<{ user_ids: string[] }>(API_ENDPOINTS.ADMIN_NOTIFICATION.GROUP_MEMBERS_BATCH, {
      group_keys: groupKeys,
    });
    return res.data?.user_ids ?? [];
  },

  /** 取得票種列表（供群組發送選票種用） */
  async getTicketTypes() {
    const res = await httpClient.get<{ items: { id: string; name: string }[] }>(API_ENDPOINTS.ADMIN_NOTIFICATION.TICKET_TYPES);
    return res.data?.items ?? [];
  },

  async getHistoryPages(params: {
    page?: number;
    page_size?: number;
    order_by?: string;
    descending?: boolean;
    keyword?: string;
    deleted?: boolean;
    notification_id?: string;
    user_id?: string;
    status?: number;
  }) {
    return httpClient.get<AdminNotificationHistoryPagesResponse>(API_ENDPOINTS.ADMIN_NOTIFICATION_HISTORY.PAGES, params);
  },
};

export default notificationService;
