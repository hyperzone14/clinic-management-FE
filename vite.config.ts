import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Add this line for proper routing
  server: {
    proxy: {
      "/api": {
        target: "https://clinic-management-vdb.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});