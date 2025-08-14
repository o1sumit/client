import type { ApiResponse } from "../types/api";

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "react-hot-toast";

// Use VITE_ prefixed environment variables
export const baseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/";

const instance = axios.create({
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Response unwrapper utility function for consistent API response handling
export const unwrapApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T>>,
): T => {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  throw new ApiError(response.data.message || "API request failed");
};

// Custom error class for API errors
export class ApiError extends Error {
  public code?: string;
  public details?: unknown;
  public status?: number;

  constructor(
    message: string,
    code?: string,
    details?: unknown,
    status?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

// Enhanced response interceptor with proper error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const showToast = error?.config?.headers?.showToast !== false;

    // Handle authentication errors
    if (status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      if (showToast) {
        toast.error("Authentication failed. Please log in again.");
      }
      // Redirect to login page
      window.location.href = "/login";

      return Promise.reject(
        new ApiError(
          "Authentication failed",
          "AUTH_ERROR",
          error.response?.data,
          status,
        ),
      );
    }

    // Handle different error types
    if (status >= 400) {
      const errorMessage = getErrorMessage(error.response?.data);

      if (showToast && error?.config?.method !== "get") {
        if (status === 429) {
          toast.error("Request limit exceeded. Please try again later.");
        } else if (status >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (status >= 400 && status < 500) {
          toast.error(errorMessage);
        }
      }

      return Promise.reject(
        new ApiError(
          errorMessage,
          error.response?.data?.code,
          error.response?.data,
          status,
        ),
      );
    }

    // Handle network errors
    if (error.message === "Network Error") {
      if (showToast) {
        toast.error("Network error. Please check your connection.");
      }

      return Promise.reject(
        new ApiError("Network error", "NETWORK_ERROR", error, 0),
      );
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      if (showToast) {
        toast.error("Request timeout. Please try again.");
      }

      return Promise.reject(
        new ApiError("Request timeout", "TIMEOUT_ERROR", error, 0),
      );
    }

    return Promise.reject(error);
  },
);

// Helper function to extract error message from response
const getErrorMessage = (data: any): string => {
  if (typeof data?.message === "string") {
    return data.message;
  }
  if (typeof data === "string") {
    return data;
  }
  if (typeof data?.response === "string") {
    return data.response;
  }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors[0].message || data.errors[0];
  }

  return "An error occurred";
};

export const REQUEST_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

export const REQUEST_CONTENT_TYPE = {
  JSON: "application/json",
  MULTIPART: "multipart/form-data",
};

export const doFetch = async (
  url: string,
  method: string = REQUEST_METHODS.GET,
  body: any = {},
  otherOptions?: {
    contentType?: string;
    showToast?: boolean;
  } & AxiosRequestConfig,
) => {
  const { contentType, signal, showToast, ...others } = otherOptions ?? {};
  const apiUrl = `${baseUrl}/api/${url}`;
  const options = {
    ...others,
    url: apiUrl,
    method,
    credentials: "include",
    headers: {
      "Content-Type": contentType ?? REQUEST_CONTENT_TYPE.JSON,
    } as any,
  } as any;

  const token = localStorage.getItem("token");

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (showToast !== undefined) {
    options.headers.showToast = showToast;
  }

  // signal to cancel request
  if (signal) {
    options.signal = signal;
  }

  if (contentType?.includes("json")) {
    options.data = JSON.stringify(body);
  } else {
    options.data = body;
  }
  // console.log(options.headers);

  const response = await instance(options);

  return response;
};
