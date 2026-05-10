import { useEffect, useState } from 'react'
import type { SavedBooking } from '../storage'
import { loadCustomization, resolveReservationPublicRef } from '../storage'
import type { DiningCustomization } from '../types/bookingCustomization'

export function useReservationRouteLoad(publicRef: string | null) {
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reservation, setReservation] = useState<SavedBooking | null>(null)
  const [customization, setCustomization] = useState<DiningCustomization | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!publicRef) {
      setLoadStatus('error')
      setLoadError('Missing reservation reference.')
      setReservation(null)
      setCustomization(null)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const r = await resolveReservationPublicRef(publicRef)
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
  }, [publicRef])

  return { loadStatus, reservation, customization, loadError }
}
