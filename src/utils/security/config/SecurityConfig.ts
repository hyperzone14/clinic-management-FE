// src/utils/security/config/SecurityConfig.ts

export const SecurityConfig = {
  API_URL:
    import.meta.env.VITE_API_URL ||
    "https://clinic-management-vdb.onrender.com", //https://clinic-management-vdb.onrender.com/api/doctor
  TOKEN_KEY: "auth_token",
  AUTH_HEADER: "Authorization",
  AUTH_PREFIX: "Bearer",
};
