import type { User } from '@supabase/supabase-js'

const STORAGE_KEY = 'booking-chat-ui.restaurant-bypass-session'

/** Stable id so dashboard can tell demo sessions from real Supabase users. */
export const RESTAURANT_BYPASS_USER_ID = '00000000-0000-4000-8000-000000000001'

type BypassPayload = { email: string }

/**
 * Email-only “instant login” for demos (no magic link).
 * - Dev (`npm run dev`): on unless `VITE_RESTAURANT_EMAIL_LOGIN_BYPASS=false`.
 * - Production: off unless `VITE_RESTAURANT_EMAIL_LOGIN_BYPASS=true`.
 */
export function isRestaurantEmailBypassEnabled(): boolean {
  const explicit = import.meta.env.VITE_RESTAURANT_EMAIL_LOGIN_BYPASS?.trim().toLowerCase()
  if (explicit === 'false' || explicit === '0') return false
  if (explicit === 'true' || explicit === '1') return true
  return import.meta.env.DEV
}

export function isRestaurantBypassUser(user: User | null | undefined): boolean {
  return user?.id === RESTAURANT_BYPASS_USER_ID
}

export function setRestaurantBypassSession(email: string): void {
  const trimmed = email.trim()
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ email: trimmed } satisfies BypassPayload))
}

export function clearRestaurantBypassSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function getRestaurantBypassEmail(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as BypassPayload
    return typeof p.email === 'string' && p.email.includes('@') ? p.email : null
  } catch {
    return null
  }
}

export function createRestaurantBypassUser(email: string): User {
  const local = email.split('@')[0] ?? 'Venue'
  return {
    id: RESTAURANT_BYPASS_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { full_name: local, name: local },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    factors: [],
  } as User
}

/** Real Supabase session wins; otherwise optional demo email session from storage. */
export function mergeSupabaseOrBypassUser(sessionUser: User | null): User | null {
  if (sessionUser) return sessionUser
  const bypassEmail = isRestaurantEmailBypassEnabled() ? getRestaurantBypassEmail() : null
  return bypassEmail ? createRestaurantBypassUser(bypassEmail) : null
}

export const RESTAURANT_BYPASS_AUTH_EVENT = 'restaurant-bypass-auth-change'

export function notifyRestaurantBypassAuthChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(RESTAURANT_BYPASS_AUTH_EVENT))
}
