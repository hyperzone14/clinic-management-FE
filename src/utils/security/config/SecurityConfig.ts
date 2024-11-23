// src/utils/security/config/SecurityConfig.ts

export const SecurityConfig = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  TOKEN_KEY: "auth_token",
  AUTH_HEADER: "Authorization",
  AUTH_PREFIX: "Bearer",
};
