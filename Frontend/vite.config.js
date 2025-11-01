import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Listen on all addresses (required for Docker)
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required for hot-reload in Docker
    },
  },
})
