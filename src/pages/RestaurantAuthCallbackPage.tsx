import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'
import { getSupabase } from '@/lib/supabaseClient'

/**
 * OAuth redirect target. Supabase restores the session from the URL hash/query;
 * we forward the user to the dashboard once a session exists.
 */
export function RestaurantAuthCallbackPage() {
  const navigate = useNavigate()
  const [hint, setHint] = useState('Completing sign-in…')

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      navigate('/restaurant/login?error=config', { replace: true })
      return
    }

    let cancelled = false
    let finished = false

    const done = (to: string) => {
      if (cancelled || finished) return
      finished = true
      navigate(to, { replace: true })
    }

    const check = () => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) done('/restaurant')
      })
    }

    check()
    const interval = window.setInterval(check, 200)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        done('/restaurant')
      }
    })

    const slow = window.setTimeout(() => setHint('Still working…'), 4000)

    const timeout = window.setTimeout(() => {
      clearInterval(interval)
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) done('/restaurant')
        else done('/restaurant/login?error=session')
      })
    }, 12000)

    return () => {
      cancelled = true
      clearInterval(interval)
      clearTimeout(slow)
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-muted/40 px-4">
      <Loader2Icon className="size-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-[14px] text-muted-foreground">{hint}</p>
      <span className="sr-only">Completing authentication</span>
    </div>
  )
}
