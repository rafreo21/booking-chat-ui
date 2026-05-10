import { Link, Navigate } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { GoogleBrandIcon } from '@/components/restaurant/GoogleBrandIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth'
import { signInRestaurantWithGoogle } from '@/lib/restaurantAuth'

export function RestaurantSignupPage() {
  const { user, loading, configured } = useRestaurantAuth()
  const [pending, setPending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const onGoogle = useCallback(async () => {
    setLocalError(null)
    setPending(true)
    const err = await signInRestaurantWithGoogle()
    setPending(false)
    if (err) setLocalError(err.error)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/restaurant" replace />
  }

  return (
    <div className="min-h-dvh bg-muted/40 px-4 py-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Card className="mx-auto w-full max-w-md shadow-sm ring-1 ring-border">
        <CardHeader className="space-y-1">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Restaurant</p>
          <CardTitle className="text-xl tracking-tight">Create your account</CardTitle>
          <CardDescription className="text-[15px] leading-relaxed">
            Sign in with Google once — we&apos;ll create your restaurant profile on first visit. You can invite staff later
            from the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {localError ? (
            <div
              className="rounded-xl border border-destructive/35 bg-destructive/5 px-4 py-3 text-[13px] leading-snug text-foreground dark:bg-destructive/10"
              role="alert"
            >
              {localError}
            </div>
          ) : null}
          {!configured ? (
            <p className="text-[13px] leading-snug text-muted-foreground">
              Configure Supabase (see login page) before restaurant accounts can be created.
            </p>
          ) : null}
          <Button
            type="button"
            variant="default"
            size="lg"
            className="h-12 w-full gap-3 text-[15px] font-semibold"
            disabled={!configured || pending}
            onClick={() => void onGoogle()}
          >
            {pending ? (
              <Loader2Icon className="size-5 animate-spin text-primary-foreground" aria-hidden />
            ) : (
              <GoogleBrandIcon className="size-5 shrink-0" />
            )}
            Continue with Google
          </Button>
          <p className="text-center text-[12px] leading-snug text-muted-foreground">
            By continuing you agree to use Google according to your organisation&apos;s policies. We only receive your email
            and basic profile to identify your venue account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-center text-[13px] text-muted-foreground sm:text-left">
            Already have an account?{' '}
            <Link to="/restaurant/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/">Back to booking</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
