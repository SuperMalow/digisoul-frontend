import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

import path from "path";

const __dirname = path.resolve();

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../backend/digisoul/static/frontend"),
    emptyOutDir: true,
  },
  // 清除 console.log
  esbuild: {
    // drop: ['console'],
  },
});
