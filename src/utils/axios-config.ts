// src/utils/axios-config.ts
import axios from "axios";

// Create axios instance with custom config
const api = axios.create({
  baseURL: "https://clinic-management-vdb.onrender.com/api", //https://clinic-management-vdb.onrender.com/api/doctor
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

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
  delete: <T>(url: string) =>
    api.delete<T>(url).then((response) => response.data),
};

export default apiService;
