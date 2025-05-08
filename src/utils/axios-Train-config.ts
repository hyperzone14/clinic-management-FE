// // src/utils/axios-config.ts
// import axios from "axios";

// // Create axios instance with custom config
// const api = axios.create({
//   // baseURL: "http://localhost:8080/api",
//   baseURL: "http://localhost:3000",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000, // 10 seconds
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Get token from localStorage
//     const token = localStorage.getItem("token");

//     // If token exists, add to headers
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Set Content-Type to multipart/form-data if FormData is being sent
//     if (config.data instanceof FormData) {
//       config.headers["Content-Type"] = "multipart/form-data";
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const errorDetails = {
//       message: error.response?.data?.message || "Unknown error occurred",
//       path: error.response?.data?.path || "",
//       timestamp: error.response?.data?.timestamp || "",
//       errorCode: error.response?.data?.errorCode || "",
//     };
//     // Handle 401 Unauthorized errors
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       // Redirect to login page or handle refresh token
//       window.location.href = "/error";
//     }
//     error.details = errorDetails;

//     return Promise.reject(error);
//   }
// );

// // API methods
// export const apiService = {
//   get: <T>(url: string) => api.get<T>(url).then((response) => response.data),
//   post: <T, D = unknown>(url: string, data: D) =>
//     api.post<T>(url, data).then((response) => response.data),
//   put: <T, D = unknown>(url: string, data: D) =>
//     api.put<T>(url, data).then((response) => response.data),
//   patch: <T, D = unknown>(url: string, data: D) =>
//     api.patch<T>(url, data).then((response) => response.data),
//   delete: <T>(url: string) =>
//     api.delete<T>(url).then((response) => response.data),
// };

// export default apiService;

// src/utils/axios-config.ts
// import axios from "axios";

// interface ApiErrorResponse {
//   error: string;
// }

// // Create axios instance with custom config
// const api = axios.create({
//   // Base URL without the api_LLM path
//   baseURL: "http://localhost:3000",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000, // 10 seconds
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     // Get token from localStorage
//     const token = localStorage.getItem("token");

//     // If token exists, add to headers
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Set Content-Type to multipart/form-data if FormData is being sent
//     if (config.data instanceof FormData) {
//       config.headers["Content-Type"] = "multipart/form-data";
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const errorDetails = {
//       message: error.response?.data?.message || "Unknown error occurred",
//       path: error.response?.data?.path || "",
//       timestamp: error.response?.data?.timestamp || "",
//       errorCode: error.response?.data?.errorCode || "",
//     };
//     // Handle 401 Unauthorized errors
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       // Redirect to login page or handle refresh token
//       window.location.href = "/error";
//     }
//     error.details = errorDetails;

//     return Promise.reject(error);
//   }
// );

// // API methods
// export const apiService = {
//   get: <T>(url: string) => api.get<T>(url).then((response) => response.data),
//   post: <T, D = unknown>(url: string, data: D) =>
//     api.post<T>(url, data).then((response) => response.data),
//   put: <T, D = unknown>(url: string, data: D) =>
//     api.put<T>(url, data).then((response) => response.data),
//   patch: <T, D = unknown>(url: string, data: D) =>
//     api.patch<T>(url, data).then((response) => response.data),
//   delete: <T>(url: string) =>
//     api.delete<T>(url).then((response) => response.data),

//   // Add specific method for predict endpoint with the correct path
//   predict: <T>(symptoms: string) =>
//     api
//       .post<T>("/api_Train/predict", { symptoms })
//       .then((response) => response.data),
// };

// export default apiService;

import axios, { AxiosError } from "axios";

// Custom error interface for API errors
interface ApiErrorResponse {
  success: boolean;
  message: string;
}

// Create axios instance with custom config
const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type to multipart/form-data if FormData is being sent
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Directly check if the response contains success: false
    // This handles cases where the API returns 200 OK but with error in body
    if (response.data && response.data.success === false) {
      const errorMessage = response.data.message || "Operation failed";
      const customError = new Error(errorMessage) as any;
      customError.details = {
        message: errorMessage,
        success: false,
      };
      return Promise.reject(customError);
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    // Initialize error details
    const errorDetails = {
      message: "Unknown error occurred",
      path: "",
      timestamp: "",
      errorCode: "",
      success: false,
    };

    // Handle normal error responses (4xx, 5xx)
    if (error.response) {
      // Extract error details from response data
      if (error.response.data) {
        // Handle API error format
        if (typeof error.response.data === "object") {
          // If response contains message field, use it
          if ("message" in error.response.data) {
            errorDetails.message =
              error.response.data.message || errorDetails.message;
          }
          // If response contains success field, use it
          if ("success" in error.response.data) {
            errorDetails.success = !!error.response.data.success;
          }
        }
      }

      // Extract additional error details
      errorDetails.path = error.response.config?.url || "";
      errorDetails.errorCode = error.response.status?.toString() || "";
    } else if (error.request) {
      // Request was made but no response received
      errorDetails.message = "No response received from server";
    } else {
      // Error setting up the request
      errorDetails.message = error.message || "Error setting up the request";
    }

    // Attach error details to error object
    (error as any).details = errorDetails;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login page or handle refresh token
      window.location.href = "/error";
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  get: <T>(url: string) => api.get<T>(url).then((response) => response.data),
  post: <T, D = unknown>(url: string, data: D) =>
    api.post<T>(url, data).then((response) => response.data),
  put: <T, D = unknown>(url: string, data: D) =>
    api.put<T>(url, data).then((response) => response.data),
  patch: <T, D = unknown>(url: string, data: D) =>
    api.patch<T>(url, data).then((response) => response.data),
  delete: <T>(url: string) =>
    api.delete<T>(url).then((response) => response.data),

  // Add specific method for predict endpoint with the correct path
  predict: <T>(symptoms: string) =>
    api
      .post<T>("/api_Train/predict", { symptoms })
      .then((response) => response.data),
};

export default apiService;
