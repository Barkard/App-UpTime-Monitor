export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiMeta {
  timestamp: string;
  pagination?: Pagination;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: string[];
  };
  meta: { timestamp: string; path: string };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: ApiMeta;
}
