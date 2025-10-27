import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// Configuration for GitHub Pages deployment
// Repository: lgcosmo/hazard_islands
// URL: https://lgcosmo.github.io/hazard_islands/
export default defineConfig({
  base: '/hazard_islands/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true,
  },
});

