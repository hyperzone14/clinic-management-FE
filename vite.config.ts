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
    },
  },
});
