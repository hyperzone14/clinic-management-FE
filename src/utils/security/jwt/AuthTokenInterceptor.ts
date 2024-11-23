// src/utils/security/jwt/AuthTokenInterceptor.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { JwtUtils } from "./JwtUtils";
import { SecurityConfig } from "../config/SecurityConfig";
import store from "../../../redux/store";
import { logout } from "../../../redux/slices/authSlice";

export const setupAuthTokenInterceptor = () => {
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = JwtUtils.getToken();

      if (token && config.url?.includes("/api/authz/")) {
        config.headers[SecurityConfig.AUTH_HEADER] = JwtUtils.getAuthHeader();
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        JwtUtils.removeToken();
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};
