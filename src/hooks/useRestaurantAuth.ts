import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient'

export function useRestaurantAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    configured: isSupabaseConfigured(),
  }
}
