import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const PAGE_BG_CLASS =
  'min-h-dvh bg-muted/40 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]'

export const PAGE_SHELL_CLASS =
  'mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'

export function formatBookingDate(dateIso: string): string {
  if (!dateIso) return '—'
  try {
    const d = new Date(dateIso)
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function ReservationMessageCard({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta?: { to: string; label: string }
}) {
  return (
    <div className={PAGE_BG_CLASS}>
      <div className={PAGE_SHELL_CLASS}>
        <Card className="mx-auto mt-12 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl tracking-tight sm:text-2xl">{title}</CardTitle>
            <CardDescription className="text-[15px] leading-relaxed">{body}</CardDescription>
          </CardHeader>
          {cta ? (
            <CardContent>
              <Button asChild size="lg" className="h-11 px-5">
                <Link to={cta.to}>{cta.label}</Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>
      </div>
    </div>
  )
}

export function MissingReservationRef() {
  return (
    <ReservationMessageCard
      title="Missing reservation"
      body="This link is missing a reservation reference. Open it from your saved bookings or the email confirmation."
      cta={{ to: '/', label: 'Go home' }}
    />
  )
}

export function ReservationLoadingSkeleton() {
  return (
    <div className={PAGE_BG_CLASS}>
      <div className={PAGE_SHELL_CLASS}>
        <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-[60dvh] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
