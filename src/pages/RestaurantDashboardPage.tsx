import { Link, Navigate } from 'react-router-dom'
import { Loader2Icon, LogOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth'
import { signOutRestaurant } from '@/lib/restaurantAuth'

export function RestaurantDashboardPage() {
  const { user, loading, configured } = useRestaurantAuth()

  if (!configured) {
    return <Navigate to="/restaurant/login?error=config" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/restaurant/login" replace />
  }

  const email = user.email ?? 'Signed in'
  const name =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    email

  return (
    <div className="min-h-dvh bg-muted/40 px-4 py-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Card className="mx-auto w-full max-w-lg shadow-sm ring-1 ring-border">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Restaurant</p>
            <CardTitle className="text-xl tracking-tight">Dashboard</CardTitle>
            <CardDescription className="text-[15px] leading-relaxed">
              Signed in as <span className="font-medium text-foreground">{name}</span>
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => void signOutRestaurant()}
          >
            <LogOutIcon className="size-4" aria-hidden />
            Sign out
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 pt-6">
          <dl className="space-y-2 text-[14px]">
            <div>
              <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{email}</dd>
            </div>
          </dl>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Venue settings, reservations, and prep tools will appear here as they are connected to your account.
          </p>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link to="/">Open guest booking</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
