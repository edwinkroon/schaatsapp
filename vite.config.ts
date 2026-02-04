import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/vink": {
        target: "https://vinksite.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/vink/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Accept", "text/plain, */*");
            proxyReq.setHeader("Referer", "https://vinksite.com/");
          });
        },
      },
    },
  },
});
