/**
 * Optional split-shell URLs (two Vite processes / two origins). **Default: single dev server** —
 * guest + restaurant routes share `npm run dev` (e.g. http://localhost:5173).
 *
 * Enable split shells only if you need two origins: set `VITE_SPLIT_DEV_SHELLS=true` and both
 * `VITE_GUEST_APP_ORIGIN` + `VITE_RESTAURANT_APP_ORIGIN`, then run two `vite` processes on those ports.
 */
function trimOrigin(raw: string | undefined): string {
  return raw?.replace(/\/$/, '').trim() ?? ''
}

function normalizedOrigin(raw: string | undefined): string {
  const o = trimOrigin(raw)
  return o || (typeof window !== 'undefined' ? window.location.origin : '')
}

export function guestAppOrigin(): string {
  return normalizedOrigin(import.meta.env.VITE_GUEST_APP_ORIGIN)
}

export function restaurantAppOrigin(): string {
  return normalizedOrigin(import.meta.env.VITE_RESTAURANT_APP_ORIGIN)
}

function splitDevShells(): boolean {
  return import.meta.env.VITE_SPLIT_DEV_SHELLS === 'true'
}

/** Advanced: two separate `vite` processes / origins. Default dev uses one server only. */
export function isSplitDevShell(): boolean {
  return import.meta.env.DEV && splitDevShells()
}

/** Example origins documented for optional two-terminal setup — not used unless split shells are on. */
export const DEFAULT_LOCAL_GUEST_ORIGIN = 'http://localhost:5173'
export const DEFAULT_LOCAL_RESTAURANT_ORIGIN = 'http://localhost:5174'

/**
 * When split shells are enabled in dev: guest app origin. Otherwise empty (use relative `/`).
 */
export function devGuestShellOrigin(): string {
  if (!import.meta.env.DEV || !splitDevShells()) return ''
  return trimOrigin(import.meta.env.VITE_GUEST_APP_ORIGIN) || DEFAULT_LOCAL_GUEST_ORIGIN
}

/**
 * When split shells are enabled in dev: restaurant app origin. Otherwise empty (same server as guest).
 */
export function devRestaurantShellOrigin(): string {
  if (!import.meta.env.DEV || !splitDevShells()) return ''
  return trimOrigin(import.meta.env.VITE_RESTAURANT_APP_ORIGIN) || DEFAULT_LOCAL_RESTAURANT_ORIGIN
}

/** Guest booking home. Relative `/` unless split-shell env forces an absolute guest origin. */
export function guestBookingHomeHref(): string {
  const g = devGuestShellOrigin()
  return g ? `${g}/` : '/'
}

/** Restaurant login — always works on current origin unless split shells pin restaurant elsewhere. */
export function restaurantLoginHref(): string {
  const r = devRestaurantShellOrigin()
  return r ? `${r}/restaurant/login` : '/restaurant/login'
}

export function restaurantDashboardHref(): string {
  const r = devRestaurantShellOrigin()
  return r ? `${r}/restaurant/dashboard` : '/restaurant/dashboard'
}

/** Current browser origin — handy for dev UI copy (client-only). */
export function currentOriginHref(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}
