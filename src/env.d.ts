/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Same value as BOOKING_INGEST_SECRET on the server when you want a simple shared token. */
  readonly VITE_BOOKING_INGEST_SECRET?: string
  /** Full URL to sheets-append API for local dev (e.g. https://your-app.vercel.app/api/sheets-append). */
  readonly VITE_SHEETS_APPEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
