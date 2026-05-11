import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { SignupForm } from '@/components/signup-form'
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth'
import {
  sendRestaurantMagicLinkSignUp,
  signInRestaurantWithGoogle,
} from '@/lib/restaurantAuth'
import {
  isRestaurantEmailBypassEnabled,
  setRestaurantBypassSession,
} from '@/lib/restaurantBypassAuth'
import { guestBookingHomeHref } from '@/lib/appShell'

export function RestaurantSignupPage() {
  const navigate = useNavigate()
  const { user, loading, configured, emailBypassEnabled } = useRestaurantAuth()
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
      return sendRestaurantMagicLinkSignUp(email)
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

  const configHint = !configured && !emailBypassEnabled ? (
    <>
      Add <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_URL</code> and{' '}
      <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_ANON_KEY</code>, enable Google in Supabase Auth,
      then use <Link to="/restaurant/login">Log in</Link>.
    </>
  ) : undefined

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm
          title="Create your venue account"
          description={
            <>
              Use your work email for a magic link or Google — we&apos;ll create your venue profile on first successful sign-in.
              Invite staff later from the dashboard.
            </>
          }
          signinLink={
            <>
              Already have an account?{' '}
              <Link to="/restaurant/login">Sign in</Link>
            </>
          }
          banner={localError ?? undefined}
          configHint={configHint}
          onEmailMagicLink={onEmailMagicLink}
          emailDisabled={!configured && !emailBypassEnabled}
          onGoogleContinue={() => void onGoogle()}
          googleDisabled={!configured}
          googlePending={pending}
          footerNote={
            <>
              We only use your email and basic profile to create your venue account.{' '}
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
