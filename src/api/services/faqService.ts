import { httpClient } from "@/api";

// FAQ Category Types
export interface FaqCategoryBase extends Record<string, unknown> {
  id: string;
  name: string;
  remark?: string;
  sequence?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqCategoryDetail extends FaqCategoryBase {
  remark?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqCategoryList {
  categories: FaqCategoryBase[];
}

export interface FaqCategoryCreate {
  name: string;
  remark?: string;
  description?: string;
}

export type FaqCategoryUpdate = FaqCategoryCreate;

export interface FaqCategoryDelete {
  reason?: string;
  permanent?: boolean;
}

export interface BulkAction {
  ids: string[];
}

// FAQ Types
export interface FaqDetail extends Record<string, unknown> {
  id: string;
  question: string;
  answer: string;
  relatedLink?: string;
  remark?: string;
  description?: string;
  category?: FaqCategoryBase;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqItem extends Record<string, unknown> {
  id: string;
  question: string;
  relatedLink?: string;
  remark?: string;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: FaqItem[];
}

export interface FaqCreate {
  categoryId: string;
  question: string;
  answer: string;
  relatedLink?: string;
  remark?: string;
  description?: string;
}

export type FaqUpdate = FaqCreate;

export interface FaqDelete {
  reason?: string;
  permanent?: boolean;
}

// FAQ Category Service
export const faqCategoryService = {
  async getList(params?: { deleted?: boolean }) {
    return httpClient.get<FaqCategoryList>("/api/v1/admin/faq/category/list", params);
  },

  async getById(id: string) {
    return httpClient.get<FaqCategoryDetail>(`/api/v1/admin/faq/category/${id}`);
  },

  async create(payload: FaqCategoryCreate) {
    return httpClient.post<{ id: string }>("/api/v1/admin/faq/category", payload);
  },

  async update(id: string, payload: FaqCategoryUpdate) {
    return httpClient.put<void>(`/api/v1/admin/faq/category/${id}`, payload);
  },

  async remove(id: string, payload: FaqCategoryDelete) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/faq/category/${id}`, data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>("/api/v1/admin/faq/category/restore", { ids });
  },
};

// FAQ Service
export const faqService = {
  async getPages(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    descending?: boolean;
    deleted?: boolean;
    categoryId?: string;
  }) {
    return httpClient.get<FaqPagesResponse>("/api/v1/admin/faq/pages", params);
  },

  async getById(id: string) {
    return httpClient.get<FaqDetail>(`/api/v1/admin/faq/${id}`);
  },

  async create(payload: FaqCreate) {
    return httpClient.post<{ id: string }>("/api/v1/admin/faq/", payload);
  },

  async update(id: string, payload: FaqUpdate) {
    return httpClient.put<void>(`/api/v1/admin/faq/${id}`, payload);
  },

  async remove(id: string, payload: FaqDelete) {
    return httpClient.request<void>({ method: "DELETE", url: `/api/v1/admin/faq/${id}`, data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>("/api/v1/admin/faq/restore", { ids });
  },
};

export default faqService;

