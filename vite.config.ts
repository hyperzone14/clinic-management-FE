import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Add this line for proper routing
  server: {
    proxy: {
      // "/api": {
      //   target: "http://localhost:8080", // Backend server
      //   changeOrigin: true,
      //   secure: false,
      //   rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Removes '/api' prefix
      // },
      "/api": {
        target: "https://clinic-management-tdd-ee9f27f356d8.herokuapp.com", // Backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/api_LLM": {
        // target: "http://localhost:2000", // Backend server
        target: "https://medical-ai-api-d6f4a40b7b22.herokuapp.com", // Backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api_LLM/, ""),
      },
      "/api_Train": {
        // target: "http://localhost:8080", // Backend server
        target: "https://medical-predict-api-production.up.railway.app", // Backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api_Train/, ""),
      },
    },
  },
});
