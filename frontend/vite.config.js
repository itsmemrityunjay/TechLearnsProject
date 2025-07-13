import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  server: {
    proxy: {
      // Forward API requests to your backend server
      "/api": {
        target: "http://localhost:3000", // Change this to your actual backend URL and port
        changeOrigin: true,
        secure: false,
      },
      // Make sure uploads are also properly forwarded
      "/uploads": {
        target: "http://localhost:3000", // Change this to your actual backend URL and port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
