import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CustomizationSummary } from '../components/customization/CustomizationSummary'
import { loadCustomization, resolveReservationPublicRef } from '../storage'
import type { SavedBooking } from '../storage'
import type { DiningCustomization } from '../types/bookingCustomization'

export function StaffPrepPage() {
  const [params] = useSearchParams()
  const ref = params.get('ref')?.trim() ?? ''
  const key = params.get('key')?.trim() ?? ''
  const secret = import.meta.env.VITE_STAFF_PREP_SECRET?.trim()

  const denied = Boolean(secret && key !== secret)
  const missingRef = !ref

  type Loaded = {
    booking: SavedBooking
    customization: DiningCustomization | null
  }

  const shouldFetch = !denied && !missingRef
  const [payload, setPayload] = useState<Loaded | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(shouldFetch)

  useEffect(() => {
    if (!shouldFetch) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setLoading(true)
      setPayload(null)
      setNotFound(false)
    })

    void (async () => {
      const b = await resolveReservationPublicRef(ref)
      if (cancelled) return
      if (!b) {
        setNotFound(true)
        setPayload(null)
        setLoading(false)
        return
      }
      const c = await loadCustomization(b.id)
      if (cancelled) return
      setPayload({ booking: b, customization: c })
      setNotFound(false)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [ref, shouldFetch])

  if (denied) {
    return (
      <div className="min-h-dvh bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
          <h1 className="text-lg font-bold text-neutral-950">Staff prep</h1>
          <p className="mt-2 text-[15px] text-neutral-600">
            Add the correct <code className="rounded bg-neutral-100 px-1">key</code> query parameter matching{' '}
            <code className="rounded bg-neutral-100 px-1">VITE_STAFF_PREP_SECRET</code>.
          </p>
          <Link to="/" className="mt-4 inline-block font-semibold text-neutral-950 underline">
            Home
          </Link>
        </div>
      </div>
    )
  }

  if (missingRef) {
    return (
      <div className="min-h-dvh bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
          <h1 className="text-lg font-bold text-neutral-950">Staff prep</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
            Pass <code className="rounded bg-neutral-100 px-1">ref</code> with the guest&apos;s reservation manage token
            (or legacy internal id).
          </p>
          <p className="mt-3 font-mono text-[13px] text-neutral-500">
            Example: /staff/prep?ref=YOUR_TOKEN
          </p>
          <Link to="/" className="mt-4 inline-block font-semibold text-neutral-950 underline">
            Home
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-neutral-100">
        <div
          className="size-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-950"
          aria-hidden
        />
        <p className="text-[15px] text-neutral-700">Loading prep sheet…</p>
      </div>
    )
  }

  if (notFound || !payload) {
    return (
      <div className="min-h-dvh bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
          <h1 className="text-lg font-bold text-neutral-950">Reservation not found</h1>
          <p className="mt-2 text-[15px] text-neutral-600">
            No booking matches this ref. Check the token or try the internal id for legacy rows.
          </p>
          <Link to="/" className="mt-4 inline-block font-semibold text-neutral-950 underline">
            Home
          </Link>
        </div>
      </div>
    )
  }

  const { booking, customization } = payload

  const prepNotes =
    typeof booking.meta?.kitchenPrepNotes === 'string' ? booking.meta.kitchenPrepNotes.trim() : ''

  return (
    <div className="min-h-dvh bg-neutral-100 px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <header className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Kitchen / floor</p>
          <h1 className="mt-1 text-xl font-bold text-neutral-950">{booking.name}</h1>
          <p className="mt-1 text-[15px] text-neutral-700">
            {booking.guests} guest{booking.guests === 1 ? '' : 's'} · {booking.time || '—'}
          </p>
          <p className="mt-2 font-mono text-[12px] text-neutral-500">
            Token <span className="font-semibold text-neutral-800">{booking.manageToken.slice(0, 14)}…</span>
          </p>
          {prepNotes ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">Kitchen notes (meta)</p>
              <p className="mt-1 whitespace-pre-wrap text-[14px] text-amber-950">{prepNotes}</p>
            </div>
          ) : null}
        </header>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-neutral-950">Guest dining customization</h2>
          {customization?.notes ? (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-600">Guest notes</p>
              <p className="mt-1 whitespace-pre-wrap text-[14px] text-neutral-900">{customization.notes}</p>
            </div>
          ) : (
            <p className="mt-3 text-[14px] text-neutral-600">No dining customization saved yet.</p>
          )}
          {customization?.seats?.length ? (
            <div className="mt-4">
              <CustomizationSummary seats={customization.seats} />
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-neutral-950 p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">Raw JSON</p>
          <pre className="mt-2 max-h-[40vh] overflow-auto text-[11px] leading-relaxed text-emerald-100">
            {JSON.stringify({ booking, customization }, null, 2)}
          </pre>
        </section>

        <Link to="/" className="text-center text-[14px] font-semibold text-neutral-700 underline">
          ← Home
        </Link>
      </div>
    </div>
  )
}
