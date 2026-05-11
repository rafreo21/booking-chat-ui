import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev ports are set explicitly via `npm run dev*` (`--port 5173` / `--port 5174`) so they always win.
 * Defaults here match those scripts if you run plain `vite` without `--port`.
 */
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    /** Fail fast instead of silently hopping to 5175+ (breaks cross-shell localhost links). */
    strictPort: true,
    /** Listen on all interfaces; helps localhost / LAN access for the restaurant shell. */
    host: true,
    watch: {
      usePolling: true,
      interval: 200,
    },
  },
})
