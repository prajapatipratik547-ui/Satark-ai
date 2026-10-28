import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = `http://localhost:${process.env.PORT ?? "8080"}`;

export default defineConfig({
  root: "src/web",
  plugins: [react()],
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
    target: "es2022",
  },
  server: {
    proxy: {
      "/api": apiTarget,
      "/healthz": apiTarget,
    },
  },
});
