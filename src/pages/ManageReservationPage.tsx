import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { SavedBooking } from '../storage'
import { loadCustomization, resolveReservationPublicRef } from '../storage'
import type { DiningCustomization } from '../types/bookingCustomization'
import { DiningCustomizationFlow } from '../components/customization/DiningCustomizationFlow'

/**
 * Manage / customize reservation page.
 *
 * Independent of the booking AI chat (which lives at "/" and is intentionally
 * widget-sized at max-w-sm). This page is a real desktop layout: wide shell,
 * two-column grid (form + sticky Summary) on tablet+, stacks on phones.
 */

const PAGE_BG_CLASS =
  'min-h-dvh bg-[var(--color-chat-bg)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]'

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
        <div className="mx-auto mt-12 w-full max-w-2xl rounded-2xl border border-neutral-300 bg-white p-6 shadow-md sm:p-8">
          <h1 className="text-[1.25rem] font-bold text-neutral-950 sm:text-[1.5rem]">{title}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{body}</p>
          {cta ? (
            <Link
              to={cta.to}
              className="mt-5 inline-block rounded-full bg-neutral-950 px-5 py-2.5 text-[15px] font-semibold text-white press:bg-neutral-800"
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
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
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3">
          <div
            className="size-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-950"
            aria-hidden
          />
          <p className="text-[15px] font-medium text-neutral-700">Loading reservation…</p>
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
          <button
            type="button"
            onClick={() => navigate('/')}
            className="-ml-2 inline-flex w-fit items-center gap-1 self-start rounded-full px-3 py-1.5 text-[14px] font-semibold text-neutral-700 transition-colors press:bg-neutral-200/70 press:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </button>

          <div className="rounded-2xl border border-neutral-300 bg-white px-4 py-5 shadow-md sm:px-6 sm:py-6 md:px-8 md:py-7">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">
              Manage reservation
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-[18px] font-bold text-neutral-950 sm:text-[20px]">
                {reservation.name}
              </p>
              <p className="text-[14px] text-neutral-600">
                {reservation.guests} guest{reservation.guests === 1 ? '' : 's'} ·{' '}
                {formatBookingDate(reservation.dateIso)} · {reservation.time || '—'}
              </p>
            </div>
            <p className="mt-2 font-mono text-[12px] text-neutral-500">
              Manage code · {reservation.manageToken.slice(0, 10)}…
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-300 bg-[var(--color-chat-surface)] px-4 py-5 shadow-md sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10">
            <DiningCustomizationFlow
              key={`${reservation.id}:${customization?.updatedAt ?? 'none'}`}
              reservation={reservation}
              initialCustomization={customization}
            />
          </div>
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
