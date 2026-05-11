/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Same value as BOOKING_INGEST_SECRET on the server when you want a simple shared token. */
  readonly VITE_BOOKING_INGEST_SECRET?: string
  /** Full URL to sheets-append API for local dev (e.g. https://your-app.vercel.app/api/sheets-append). */
  readonly VITE_SHEETS_APPEND_URL?: string
  /** Public site origin for emails and CRM links (no trailing slash). Falls back to `window.location.origin`. */
  readonly VITE_PUBLIC_APP_ORIGIN?: string
  /** Menu catalog JSON URL (default `/menu.json`). */
  readonly VITE_MENU_URL?: string
  /** Max dishes each seat may select (default 8). */
  readonly VITE_MAX_DISHES_PER_SEAT?: string
  /** Optional browser POST target for CRM when preferences are saved (no secrets). */
  readonly VITE_OPS_WEBHOOK_URL?: string
  /** Override POST URL for `/api/dining-customization` (default `/api/dining-customization`). */
  readonly VITE_DINING_CUSTOMIZATION_API_URL?: string
  /** POST URL for transactional email API (default `/api/send-booking-email`). */
  readonly VITE_SEND_BOOKING_EMAIL_URL?: string
  /** When set, `/staff/prep` requires matching `?key=` query param. */
  readonly VITE_STAFF_PREP_SECRET?: string
  /** Supabase project URL — when set with anon key, bookings + dining prefs sync to Supabase */
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Optional guest-shell origin when restaurant build redirects into guest (default current origin). */
  readonly VITE_GUEST_APP_ORIGIN?: string
  /** Optional restaurant-shell origin when guest build redirects into restaurant (default current origin). */
  readonly VITE_RESTAURANT_APP_ORIGIN?: string
  /**
   * Set to `true` only when running **two** Vite dev servers on different ports.
   * Leave unset for normal local dev: one `npm run dev`, restaurant at `/restaurant/*` on the same host.
   */
  readonly VITE_SPLIT_DEV_SHELLS?: string
  /**
   * Restaurant dashboard only: allow entering any email to open `/restaurant/dashboard` without magic links or OAuth.
   * Production defaults **false**. Dev defaults **true** unless `VITE_RESTAURANT_EMAIL_LOGIN_BYPASS=false`.
   */
  readonly VITE_RESTAURANT_EMAIL_LOGIN_BYPASS?: string
  /**
   * If Supabase is configured but `reservations` insert fails, save bookings to localStorage instead.
   * Dev defaults **on** (`=false` surfaces errors). Production: off unless `=true`.
   */
  readonly VITE_BOOKING_FALLBACK_LOCAL_ON_ERROR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
