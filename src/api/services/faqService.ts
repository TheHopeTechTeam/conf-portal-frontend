import { API_ENDPOINTS, httpClient } from "@/api";

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
    return httpClient.get<FaqCategoryList>(API_ENDPOINTS.FAQ_CATEGORIES.LIST, params);
  },

  async getById(id: string) {
    return httpClient.get<FaqCategoryDetail>(API_ENDPOINTS.FAQ_CATEGORIES.DETAIL(id));
  },

  async create(payload: FaqCategoryCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.FAQ_CATEGORIES.CREATE, payload);
  },

  async update(id: string, payload: FaqCategoryUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.FAQ_CATEGORIES.UPDATE(id), payload);
  },

  async remove(id: string, payload: FaqCategoryDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.FAQ_CATEGORIES.DELETE(id), data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>(API_ENDPOINTS.FAQ_CATEGORIES.RESTORE, { ids });
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
    return httpClient.get<FaqPagesResponse>(API_ENDPOINTS.FAQS.PAGES, params);
  },

  async getById(id: string) {
    return httpClient.get<FaqDetail>(API_ENDPOINTS.FAQS.DETAIL(id));
  },

  async create(payload: FaqCreate) {
    return httpClient.post<{ id: string }>(API_ENDPOINTS.FAQS.CREATE, payload);
  },

  async update(id: string, payload: FaqUpdate) {
    return httpClient.put<void>(API_ENDPOINTS.FAQS.UPDATE(id), payload);
  },

  async remove(id: string, payload: FaqDelete) {
    return httpClient.request<void>({ method: "DELETE", url: API_ENDPOINTS.FAQS.DELETE(id), data: payload });
  },

  async restore(ids: string[]) {
    return httpClient.put<void>(API_ENDPOINTS.FAQS.RESTORE, { ids });
  },
};

export default faqService;

