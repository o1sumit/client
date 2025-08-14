// Generic API response types and error interfaces

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationInfo;
}

// Pagination information for paginated responses
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API error interface
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Authentication response types
export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      role: "admin" | "user" | "manager";
      status: "active" | "inactive";
      accountId: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      role: "admin" | "user" | "manager";
      status: "active" | "inactive";
      accountId: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
}

export interface VerifyResponse {
  success: boolean;
  data?: {
    valid: boolean;
    user: {
      id: string;
      username: string;
      email: string;
      role: "admin" | "user" | "manager";
      status: "active" | "inactive";
      accountId: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  message: string;
}

// Legacy response types for backward compatibility
export interface LegacyAuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  message: string;
}

export interface LegacyProfileResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface LegacyVerifyResponse {
  valid: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

// HTTP request configuration interface
export interface RequestConfig {
  showToast?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}

// API endpoint configuration
export interface ApiEndpoint {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}
