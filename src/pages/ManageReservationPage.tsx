import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SavedBooking } from '../storage'
import { loadCustomization, resolveReservationPublicRef } from '../storage'
import type { DiningCustomization } from '../types/bookingCustomization'
import { DiningCustomizationFlow } from '../components/customization/DiningCustomizationFlow'
import { AiChatbotLogo } from '../components/AiChatbotLogo'

/**
 * Manage / customize reservation page.
 *
 * Independent of the booking AI chat (which lives at "/" and is intentionally
 * widget-sized at max-w-sm). This page is a real desktop layout: wide shell,
 * two-column grid (form + sticky Summary) on tablet+, stacks on phones.
 */

const PAGE_BG_CLASS =
  'min-h-dvh bg-muted/40 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]'

const PAGE_SHELL_CLASS =
  'mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'

function formatBookingDate(dateIso: string): string {
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

function StatusCard({
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

function MissingReservation() {
  return (
    <StatusCard
      title="Missing reservation"
      body="This link is missing a reservation reference. Open it from your saved bookings or the email confirmation."
      cta={{ to: '/', label: 'Go home' }}
    />
  )
}

function LoadingState() {
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

function ManageReservationLoaded({ reservationId }: { reservationId: string }) {
  const navigate = useNavigate()

  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reservation, setReservation] = useState<SavedBooking | null>(null)
  const [customization, setCustomization] = useState<DiningCustomization | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const r = await resolveReservationPublicRef(reservationId)
        const c = r ? await loadCustomization(r.id) : null
        if (cancelled) return
        setReservation(r)
        setCustomization(c)
        setLoadStatus(r ? 'ready' : 'error')
        setLoadError(r ? null : 'Reservation not found.')
      } catch (e) {
        if (cancelled) return
        setReservation(null)
        setCustomization(null)
        setLoadStatus('error')
        setLoadError(e instanceof Error ? e.message : 'Failed to load reservation.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reservationId])

  if (loadStatus === 'loading') {
    return <LoadingState />
  }

  if (loadStatus === 'error' || !reservation) {
    return (
      <StatusCard
        title="Reservation not found"
        body={
          loadError ??
          "We couldn't find a booking for this link. Check the URL or start a new reservation."
        }
        cta={{ to: '/', label: 'Start a new booking' }}
      />
    )
  }

  return (
    <div className={PAGE_BG_CLASS}>
      <div className={PAGE_SHELL_CLASS}>
        <div className="flex flex-col gap-4 md:gap-6">
          <Button
            type="button"
            variant="ghost"
            size="default"
            className="-ml-2 h-9 w-fit self-start gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeftIcon />
            Back
          </Button>

          <Card>
            <CardHeader className="gap-0 space-y-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Manage reservation
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <CardTitle className="text-lg sm:text-xl">{reservation.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {reservation.guests} guest{reservation.guests === 1 ? '' : 's'} ·{' '}
                      {formatBookingDate(reservation.dateIso)} · {reservation.time || '—'}
                    </CardDescription>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    Manage code · {reservation.manageToken.slice(0, 10)}…
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <AiChatbotLogo sizePx={48} />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="px-4 py-5 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10">
              <DiningCustomizationFlow
                key={`${reservation.id}:${customization?.updatedAt ?? 'none'}`}
                reservation={reservation}
                initialCustomization={customization}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ManageReservationPage() {
  const { reservationId: reservationIdParam } = useParams<{ reservationId: string }>()
  const reservationId = reservationIdParam
    ? decodeURIComponent(reservationIdParam)
    : null

  if (!reservationId) {
    return <MissingReservation />
  }

  return <ManageReservationLoaded reservationId={reservationId} />
}
