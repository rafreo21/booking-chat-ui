import type { SavedBooking } from '../storage'
import type { DiningCustomization } from '../types/bookingCustomization'
import { reservationManageAbsoluteUrl } from './reservationUrls'

export type DiningPreferencePayload = {
  event: 'dining_preference_saved'
  reservationId: string
  manageToken: string
  manageUrl: string
  customization: DiningCustomization
}

/** Optional CRM webhook from the browser (no secrets). Never throws. */
async function postClientOpsWebhook(payload: DiningPreferencePayload): Promise<void> {
  const opsUrl = import.meta.env.VITE_OPS_WEBHOOK_URL?.trim()
  if (!opsUrl) return
  try {
    await fetch(opsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.warn('[ops-webhook] client POST failed', e)
  }
}

/** Server route can attach secrets / forwarding; optional bearer matches sheets ingest. */
async function postServerIngest(payload: DiningPreferencePayload): Promise<void> {
  const url =
    import.meta.env.VITE_DINING_CUSTOMIZATION_API_URL?.trim() ||
    '/api/dining-customization'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = import.meta.env.VITE_BOOKING_INGEST_SECRET
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text()
      console.warn('[dining-customization-api] failed', res.status, text.slice(0, 200))
    }
  } catch (e) {
    console.warn('[dining-customization-api] request error', e)
  }
}

/** After a successful save — CRM sheet/webhook servers + optional browser webhook. */
export async function notifyDiningPreferenceSaved(
  booking: SavedBooking,
  customization: DiningCustomization,
): Promise<void> {
  const payload: DiningPreferencePayload = {
    event: 'dining_preference_saved',
    reservationId: booking.id,
    manageToken: booking.manageToken,
    manageUrl: reservationManageAbsoluteUrl(booking.manageToken),
    customization,
  }
  await Promise.all([postServerIngest(payload), postClientOpsWebhook(payload)])
}
