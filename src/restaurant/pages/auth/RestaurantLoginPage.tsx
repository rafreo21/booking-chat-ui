import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { LoginForm } from '@/components/login-form'
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth'
import {
  sendRestaurantMagicLinkSignIn,
  signInRestaurantWithGoogle,
} from '@/lib/restaurantAuth'
import {
  isRestaurantEmailBypassEnabled,
  setRestaurantBypassSession,
} from '@/lib/restaurantBypassAuth'
import { guestBookingHomeHref } from '@/lib/appShell'

const errorMessages: Record<string, string> = {
  config: 'Sign-in is not available yet — Supabase environment variables are missing.',
  session: 'We could not finish signing you in. Try again.',
  auth: 'Google sign-in was cancelled or failed.',
  timeout: 'Sign-in took too long. Try again.',
}

export function RestaurantLoginPage() {
  const navigate = useNavigate()
  const { user, loading, configured, emailBypassEnabled } = useRestaurantAuth()
  const [params] = useSearchParams()
  const code = params.get('error')?.trim() ?? ''
  const urlError = code ? errorMessages[code] ?? 'Something went wrong. Try again.' : null

  const [pending, setPending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const onGoogle = useCallback(async () => {
    setLocalError(null)
    setPending(true)
    const err = await signInRestaurantWithGoogle()
    setPending(false)
    if (err) setLocalError(err.error)
  }, [])

  const onEmailMagicLink = useCallback(
    async (email: string) => {
      if (isRestaurantEmailBypassEnabled()) {
        setRestaurantBypassSession(email.trim())
        navigate('/restaurant/dashboard', { replace: true })
        return undefined
      }
      return sendRestaurantMagicLinkSignIn(email)
    },
    [navigate],
  )

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/restaurant/dashboard" replace />
  }

  const banner = urlError ?? localError
  const callbackOrigin =
    typeof window !== 'undefined' ? `${window.location.origin}/restaurant/auth/callback` : '…/restaurant/auth/callback'

  const configHint = !configured && !emailBypassEnabled ? (
    <>
      Add <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_URL</code> and{' '}
      <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_ANON_KEY</code>, enable the Google provider in
      Supabase Auth, and add this redirect URL:{' '}
      <code className="mt-2 block break-all rounded-md bg-muted px-1.5 py-1 text-xs">{callbackOrigin}</code>
    </>
  ) : undefined

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          title="Log in to venue console"
          description={
            <>
              Enter your email for a magic link, or use Google — both reach the same venue dashboard once you&apos;re approved.
            </>
          }
          signupLink={
            <>
              Don&apos;t have an account?{' '}
              <Link to="/restaurant/signup">Sign up</Link>
            </>
          }
          banner={banner ?? undefined}
          configHint={configHint}
          onEmailMagicLink={onEmailMagicLink}
          emailDisabled={!configured && !emailBypassEnabled}
          onGoogleContinue={() => void onGoogle()}
          googleDisabled={!configured}
          googlePending={pending}
          footerNote={
            <>
              Magic links and Google sign-in are subject to your organisation&apos;s policies.{' '}
              <a href={guestBookingHomeHref()} className="font-medium text-foreground">
                Back to guest booking
              </a>
            </>
          }
        />
      </div>
    </div>
  )
}
