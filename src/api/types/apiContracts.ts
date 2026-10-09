/**
 * Bwana Standardized API Response Contracts (v1)
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: ApiMeta;
  error?: ApiError;
  timestamp: string;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filtersApplied?: Record<string, any>;
  executionTimeMs?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
  requestId?: string;
}

export interface PaginatedQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

export function createSuccessResponse<T>(
  data: T,
  meta?: ApiMeta,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Array<{ field?: string; message: string }>
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
      requestId: `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    },
    timestamp: new Date().toISOString(),
  };
}
