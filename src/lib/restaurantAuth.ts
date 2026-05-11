import { clearRestaurantBypassSession, notifyRestaurantBypassAuthChanged } from '@/lib/restaurantBypassAuth'
import { getSupabase } from '@/lib/supabaseClient'

export function restaurantAuthCallbackPath(): string {
  return '/restaurant/auth/callback'
}

export function restaurantGoogleRedirectUrl(): string {
  const origin =
    import.meta.env.VITE_PUBLIC_APP_ORIGIN?.replace(/\/$/, '').trim() ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  return `${origin}${restaurantAuthCallbackPath()}`
}

/** Starts Google OAuth via Supabase; browser navigates away on success. */
export async function signInRestaurantWithGoogle(): Promise<{ error: string } | undefined> {
  const supabase = getSupabase()
  if (!supabase) {
    return { error: 'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).' }
  }

  const redirectTo = restaurantGoogleRedirectUrl()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error) return { error: error.message }
  return undefined
}

/** Magic link for venue login — existing users only (see signup flow for new accounts). */
export async function sendRestaurantMagicLinkSignIn(email: string): Promise<{ error: string } | undefined> {
  const supabase = getSupabase()
  if (!supabase) {
    return { error: 'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).' }
  }

  const redirectTo = restaurantGoogleRedirectUrl()

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: false,
    },
  })

  if (error) return { error: error.message }
  return undefined
}

/** Magic link for venue sign-up — creates the auth user if allowed by your Supabase project. */
export async function sendRestaurantMagicLinkSignUp(email: string): Promise<{ error: string } | undefined> {
  const supabase = getSupabase()
  if (!supabase) {
    return { error: 'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).' }
  }

  const redirectTo = restaurantGoogleRedirectUrl()

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  })

  if (error) return { error: error.message }
  return undefined
}

export async function signOutRestaurant(): Promise<void> {
  clearRestaurantBypassSession()
  notifyRestaurantBypassAuthChanged()
  await getSupabase()?.auth.signOut()
}
