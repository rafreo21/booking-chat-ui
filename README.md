# Booking Chat UI

A small restaurant booking experience built with **React 19 + Vite + TypeScript + Tailwind v4**, with optional **Supabase** persistence and **Vercel serverless functions** for email and Google Sheets sync.

> **Latest release:** see [`CHANGELOG.md`](./CHANGELOG.md) for the full list of changes shipped on `main` (commit `35cff7e`).

## Recent updates

- **Manage reservation page** at `/reservation/:manageToken` — wide, responsive layout (`max-w-[1400px]`), sticky **Summary** sidebar on the right from `md:`, top-left back button, consistent shell across loading/error/loaded states.
- **Dining customization flow** — per-seat menu picker (2 → 3 → 4 column responsive grid), dietary badges, undo, and a live summary panel.
- **Staff prep page** at `/staff/prep` for upcoming reservations and seat-level selections.
- **Menu catalog** loaded from `public/menu.json` with a versioned in-app fallback (`MenuCatalogContext` + `useMenuCatalog`) so menus update without a redeploy.
- **Storage split** — `src/storage/` now has separate local and Supabase backends; opaque `manage_token` + `meta` migrations under `supabase/migrations/`.
- **Serverless endpoints** — `api/send-booking-email.ts` (Resend), `api/dining-customization.ts` (ops ingest), and cleanups to `api/sheets-append.ts`.
- **Vercel SPA routing fix** — `vercel.json` rewrites use a negative-lookahead so `/api/*` is no longer shadowed by `index.html`.
- **Onboarding ↔ chat layout parity** — shared class constants in `src/widgetLayout.ts`; tightened spacing on the success step in `BookingChatView.tsx`.
- **Repo hygiene** — `.gitignore` now excludes `.claude/` plugin scratch and local `.env*` files (keeping `.env.example`).

It includes:

- An **onboarding screen** and a **chat-style booking widget** (date → time → guests → name → confirm).
- A token-gated **Manage reservation** page where guests can customise their dining (per-seat menu choices, dietary badges, undo, summary sidebar).
- A **Staff prep** page that summarises upcoming reservations and seat-level selections.
- A **menu catalog** loaded from `public/menu.json` (with a versioned in-app fallback) so the menu can be updated without a redeploy.
- Local-first storage with **Supabase** as the source of truth when configured.
- Serverless endpoints for **booking confirmation emails**, **Google Sheets append**, and **dining customisation ingest**.

---

## Routes

| Path                       | Page                       | Notes                                                                             |
| -------------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| `/`                        | `HomePage`                 | Onboarding card → chat widget (`BookingChatView`).                                 |
| `/reservation/:manageToken`| `ManageReservationPage`    | Token-gated dining customisation. Wide, responsive layout with summary sidebar.   |
| `/staff/prep`              | `StaffPrepPage`            | Upcoming reservations + per-seat selections for kitchen/floor staff.              |

Vercel SPA routing is handled in `vercel.json` via a `rewrites` rule that excludes `/api/*` so serverless functions are not shadowed by `index.html`.

---

## Project structure

```
api/                          Vercel serverless functions (Node)
  sheets-append.ts              POST booking → Google Sheets (Apps Script or Sheets API)
  send-booking-email.ts         POST booking → Resend confirmation email
  dining-customization.ts       POST customisation → ops webhook / sheet
public/menu.json              Live menu catalog (versioned)
scripts/google-apps-script/   Drop-in Apps Script for the easy Sheets path
src/
  App.tsx                       Router shell
  BookingChatView.tsx           Chat-style booking flow
  widgetLayout.ts               Shared Tailwind class constants for onboarding + chat
  pages/
    HomePage.tsx
    ManageReservationPage.tsx
    StaffPrepPage.tsx
  components/
    BookingsLog.tsx
    customization/
      DiningCustomizationFlow.tsx
      SeatAssignmentList.tsx
      SeatMenuPicker.tsx
      MenuCategoryTabs.tsx
      CustomizationSummary.tsx
      BookingConfirmationCta.tsx
  menu/
    MenuCatalogContext.tsx      Loads /menu.json with mock fallback
    catalogTypes.ts
    useMenuCatalog.ts
  data/mockMenu.ts              Versioned in-app fallback menu
  storage/
    index.ts                    Picks Supabase or local backend
    supabaseBookings.ts
    supabaseCustomization.ts
    localBookings.ts
    customizationLocal.ts
    types.ts
  lib/
    manageToken.ts              Generate/parse opaque manage tokens
    reservationUrls.ts          Build /reservation/:token URLs
    supabaseClient.ts
    sendBookingEmail.ts
    diningPreferenceIngest.ts
  types/bookingCustomization.ts
supabase/migrations/
  001_reservations_and_dining.sql
  002_manage_token_meta.sql
```

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173 (or 5174 if 5173 is in use)
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve the production build locally
npm run lint
```

For the serverless functions to run locally, use `vercel dev` instead of `vite` (or set `VITE_SHEETS_APPEND_URL` to a deployed endpoint — see below).

---

## Environment variables

Copy `.env.example` to `.env` and fill in what you need. **All variables are optional**: with none set, the app runs fully client-side using local storage and the in-app menu fallback.

### Supabase (optional, recommended for production)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

When set, reservations and customisations are persisted in Supabase and the manage-token URL works across devices. Run the migrations in `supabase/migrations/` against your project to create the `reservations` and `dining_customizations` tables and the `manage_token` / `meta` columns.

### Booking confirmation emails (optional)

```
RESEND_API_KEY=
BOOKING_FROM_EMAIL="Restaurant <bookings@yourdomain.com>"
```

If unset, the `/api/send-booking-email` endpoint becomes a no-op and the UI silently skips sending.

### Google Sheets sync (optional)

The easy path is **Google Apps Script** — paste `scripts/google-apps-script/booking-append.gs` into your spreadsheet's Apps Script, deploy as a Web app, then set:

```
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_APPS_SCRIPT_SECRET=    # optional shared secret
```

Or use the **Sheets API + service account** path:

```
GOOGLE_SERVICE_ACCOUNT_JSON=  # full JSON, single line
GOOGLE_SHEET_ID=
GOOGLE_SHEET_RANGE=Sheet1!A:I
```

To require auth from the browser when calling `/api/sheets-append`:

```
BOOKING_INGEST_SECRET=
VITE_BOOKING_INGEST_SECRET=
```

For local dev without `vercel dev`:

```
VITE_SHEETS_APPEND_URL=https://your-project.vercel.app/api/sheets-append
```

---

## Deployment (Vercel)

1. Import the GitHub repo in Vercel.
2. Build command: `npm run build` · Output: `dist`.
3. Add env vars from the section above as needed.
4. `vercel.json` configures SPA rewrites that **exclude `/api/*`** so the serverless functions in `api/` work alongside client-side routes like `/reservation/:manageToken`.

---

## Notes

- The widget and onboarding share class constants in `src/widgetLayout.ts` so the chat card and onboarding card stay visually aligned.
- The customisation flow uses a CSS-grid two-column layout from `md:` (≥768px) with a sticky **Summary** sidebar on the right.
- The seat menu picker uses a 2 → 3 → 4 column responsive grid.
- The Manage page is wide (`max-w-[1400px]`) and renders the same shell in loading/error/loaded states so the back button and layout don't jump.
