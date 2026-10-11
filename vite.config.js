import react from '@vitejs/plugin-react'
import { env } from "node:process";
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";

const apiTarget = `http://127.0.0.1:${env.API_PORT ?? 3002}`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": apiTarget,
      "/songs": apiTarget,
      "/library": apiTarget,
    },
  },
});
