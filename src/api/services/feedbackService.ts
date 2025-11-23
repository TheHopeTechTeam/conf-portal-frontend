import { API_ENDPOINTS, httpClient } from "@/api";

export enum FeedbackStatus {
  PENDING = 0, // 待處理
  REVIEW = 1, // 審查中
  DISCUSSION = 2, // 討論中
  ACCEPTED = 3, // 已接受
  DONE = 4, // 已完成
  REJECTED = 5, // 已拒絕
  ARCHIVED = 6, // 已歸檔
}

export interface FeedbackDetail extends Record<string, unknown> {
  id: string;
  name: string;
  email?: string;
  status: FeedbackStatus;
  message?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackUpdate {
  remark?: string;
  description?: string;
  status: FeedbackStatus;
}

export interface FeedbackPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: FeedbackDetail[];
}

export const feedbackService = {
  async getPages(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    descending?: boolean;
    deleted?: boolean;
    status?: FeedbackStatus;
  }) {
    return httpClient.get<FeedbackPagesResponse>(API_ENDPOINTS.FEEDBACKS.PAGES, params);
  },

  async getById(id: string) {
    return httpClient.get<FeedbackDetail>(API_ENDPOINTS.FEEDBACKS.DETAIL(id));
  },

  async update(id: string, payload: FeedbackUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.FEEDBACKS.UPDATE(id), payload);
  },
};

export default feedbackService;
