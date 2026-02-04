import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Schaatsapp",
        short_name: "Schaatsapp",
        description: "Schaatsdata-overzicht - rondetijden, records en statistieken",
        theme_color: "#0a1628",
        background_color: "#0a1628",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "nl",
        orientation: "any",
        categories: ["sports", "utilities"],
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
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
