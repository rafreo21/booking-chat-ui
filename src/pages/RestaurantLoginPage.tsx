import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { GoogleBrandIcon } from '@/components/restaurant/GoogleBrandIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth'
import { signInRestaurantWithGoogle } from '@/lib/restaurantAuth'

const errorMessages: Record<string, string> = {
  config: 'Sign-in is not available yet — Supabase environment variables are missing.',
  session: 'We could not finish signing you in. Try again.',
  auth: 'Google sign-in was cancelled or failed.',
  timeout: 'Sign-in took too long. Try again.',
}

export function RestaurantLoginPage() {
  const { user, loading, configured } = useRestaurantAuth()
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

  const banner = urlError ?? localError

  return (
    <div className="min-h-dvh bg-muted/40 px-4 py-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Card className="mx-auto w-full max-w-md shadow-sm ring-1 ring-border">
        <CardHeader className="space-y-1">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Restaurant</p>
          <CardTitle className="text-xl tracking-tight">Log in</CardTitle>
          <CardDescription className="text-[15px] leading-relaxed">
            Use your Google workspace or personal account to access your venue dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {banner ? (
            <div
              className="rounded-xl border border-destructive/35 bg-destructive/5 px-4 py-3 text-[13px] leading-snug text-foreground dark:bg-destructive/10"
              role="alert"
            >
              {banner}
            </div>
          ) : null}
          {!configured ? (
            <p className="text-[13px] leading-snug text-muted-foreground">
              Add <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_URL</code> and{' '}
              <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">VITE_SUPABASE_ANON_KEY</code>, enable the Google
              provider in Supabase Auth, and add this redirect URL:{' '}
              <code className="mt-1 block break-all rounded-md bg-muted px-1.5 py-1 text-xs">
                {typeof window !== 'undefined' ? `${window.location.origin}/restaurant/auth/callback` : '…/restaurant/auth/callback'}
              </code>
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full gap-3 text-[15px] font-semibold"
            disabled={!configured || pending}
            onClick={() => void onGoogle()}
          >
            {pending ? (
              <Loader2Icon className="size-5 animate-spin" aria-hidden />
            ) : (
              <GoogleBrandIcon className="size-5 shrink-0" />
            )}
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-center text-[13px] text-muted-foreground sm:text-left">
            New here?{' '}
            <Link to="/restaurant/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Create an account
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
