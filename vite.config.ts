import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // macOS fsevents sometimes misses edits made by external tools (agents, sync).
    // Polling is slightly heavier but keeps HMR reliable in this workspace.
    watch: {
      usePolling: true,
      interval: 200,
    },
  },
})
