# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

_Nothing yet._

---

## 35cff7e — Manage page + customization flow, menu catalog, Supabase + Vercel polish

**Date:** 2026-05-09 · **Branch:** `main` · **Range:** `babd50f..35cff7e`
**Stats:** 43 files changed, +2993 / −232.

### Added

- **`/reservation/:manageToken` — Manage reservation page** (`src/pages/ManageReservationPage.tsx`)
  - Wide responsive shell (`max-w-[1400px]`, fluid horizontal padding from `px-4` → `xl:px-16`).
  - Reservation summary header card (name, party size, date, time).
  - Top-left **Back** button rendered at the page level (not inside the form column) so it stays flush with the shell.
  - Consistent `PAGE_BG_CLASS` / `PAGE_SHELL_CLASS` reused in loading and error states (`StatusCard`) so the layout doesn't jump.
- **Dining customization flow** (`src/components/customization/`)
  - `DiningCustomizationFlow.tsx` — main form, two-column CSS grid from `md:` (≥768px) with a sticky **Summary** sidebar on the right and a sticky save footer.
  - `SeatAssignmentList.tsx`, `SeatMenuPicker.tsx` — per-seat pickers; menu grid scales 2 → 3 → 4 columns at `sm` / `lg` / `xl`.
  - `MenuCategoryTabs.tsx`, `CustomizationSummary.tsx`, `BookingConfirmationCta.tsx`.
  - Dietary badges, per-seat max enforcement, and undo.
- **`/staff/prep` — Staff prep page** (`src/pages/StaffPrepPage.tsx`) summarising upcoming reservations and per-seat selections.
- **Menu catalog** (`public/menu.json`, `src/menu/`, `src/data/mockMenu.ts`)
  - `MenuCatalogContext` + `useMenuCatalog` load `/menu.json` with a versioned in-app fallback (`menuAvailabilityVersion`).
  - Menus can be updated without a redeploy.
- **Supabase storage backend** (`src/storage/`, `src/lib/supabaseClient.ts`)
  - `storage/index.ts` chooses Supabase when env is configured, otherwise local.
  - `storage/supabaseBookings.ts`, `storage/supabaseCustomization.ts`, `storage/types.ts`, `storage/customizationLocal.ts`.
  - SQL migrations:
    - `supabase/migrations/001_reservations_and_dining.sql`
    - `supabase/migrations/002_manage_token_meta.sql` (opaque `manage_token` + `meta`).
- **Opaque manage tokens** (`src/lib/manageToken.ts`, `src/lib/reservationUrls.ts`) for shareable/cross-device manage links.
- **Serverless endpoints** (`api/`)
  - `api/send-booking-email.ts` — booking confirmation via Resend; no-op when `RESEND_API_KEY` is unset.
  - `api/dining-customization.ts` — POST customisation to ops webhook / sheet.
- **Helper libs** — `src/lib/sendBookingEmail.ts`, `src/lib/diningPreferenceIngest.ts`.
- **Type contracts** — `src/types/bookingCustomization.ts`.
- **Documentation** — replaced the default Vite template `README.md` with real project docs covering routes, structure, env vars, and deployment; added this `CHANGELOG.md`.

### Changed

- **Onboarding ↔ chat layout parity** (`src/widgetLayout.ts`, `src/BookingChatView.tsx`)
  - Shared Tailwind class constants so the chat card and onboarding card stay aligned.
  - Tightened the success-step spacing (reduced `pb-[max(10rem,…)]` to `pb-[max(1rem,env(safe-area-inset-bottom))]`).
  - Back button now sits as a static element at the top of the column (no `sticky` / `z-50`) so it lines up with the centred card.
- **Vercel SPA routing** (`vercel.json`)
  - Replaced `routes`-based config with `rewrites` using a negative-lookahead — `/((?!api/).*) → /index.html`.
  - Direct loads of `/reservation/:manageToken` no longer 404, and `/api/*` is no longer shadowed by `index.html`.
- **Storage refactor** — `src/storage.ts` (single file) split into `src/storage/` package; old file renamed to `src/storage/localBookings.ts`.
- **Sheets append** (`api/sheets-append.ts`, `src/syncBookingToSheets.ts`, `scripts/google-apps-script/booking-append.gs`) — small cleanups and alignment with the shared lib helpers.
- **App router** (`src/App.tsx`) — wired up new pages (`HomePage`, `ManageReservationPage`, `StaffPrepPage`).
- **Bookings log** (`src/components/BookingsLog.tsx`) — minor polish.
- **Env types** (`src/env.d.ts`) — declarations for new `VITE_*` and serverless env vars.

### Removed

- `src/storage.ts` (renamed/split into `src/storage/`).

### Fixed

- 404s when deep-linking to client-side routes on Vercel (fixed via `vercel.json` rewrite).
- `/api/*` requests being served `index.html` instead of running the function (same fix).
- Manage page rendering narrow on desktop and the summary appearing below the form instead of beside it (lowered the two-column breakpoint to `md:` and widened the page shell).
- Back button not appearing flush at the top-left of the manage page (lifted out of the form column to the page level).

### Repo hygiene

- `.gitignore` now excludes `.claude/` plugin scratch and local `.env*` files (`!.env.example` kept).
