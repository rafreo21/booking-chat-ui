import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import {
  mergeSupabaseOrBypassUser,
  RESTAURANT_BYPASS_AUTH_EVENT,
  isRestaurantEmailBypassEnabled,
} from '@/lib/restaurantBypassAuth'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient'

export function useRestaurantAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      const supabase = getSupabase()

      if (!supabase) {
        if (!cancelled) {
          setUser(mergeSupabaseOrBypassUser(null))
          setLoading(false)
        }
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      setUser(mergeSupabaseOrBypassUser(session?.user ?? null))
      setLoading(false)
    }

    void sync()

    const onBypass = () => void sync()
    window.addEventListener(RESTAURANT_BYPASS_AUTH_EVENT, onBypass)

    const supabase = getSupabase()
    let subscription: { unsubscribe: () => void } | undefined
    if (supabase) {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange(() => void sync())
      subscription = sub
    }

    return () => {
      cancelled = true
      window.removeEventListener(RESTAURANT_BYPASS_AUTH_EVENT, onBypass)
      subscription?.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    configured: isSupabaseConfigured(),
    emailBypassEnabled: isRestaurantEmailBypassEnabled(),
  }
}
