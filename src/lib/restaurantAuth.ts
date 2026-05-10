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

export async function signOutRestaurant(): Promise<void> {
  await getSupabase()?.auth.signOut()
}
