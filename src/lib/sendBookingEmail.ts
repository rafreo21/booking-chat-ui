import type { SavedBooking } from '../storage'
import { reservationManageAbsoluteUrl } from './reservationUrls'

/** POST transactional email with manage link (Resend on server). Never throws. */
export async function sendBookingConfirmationEmail(booking: SavedBooking): Promise<void> {
  const url =
    import.meta.env.VITE_SEND_BOOKING_EMAIL_URL?.trim() || '/api/send-booking-email'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = import.meta.env.VITE_BOOKING_INGEST_SECRET
  if (token) headers.Authorization = `Bearer ${token}`

  const manageUrl = reservationManageAbsoluteUrl(booking.manageToken)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        guestEmail: booking.email,
        guestName: booking.name,
        manageUrl,
        guests: booking.guests,
        dateIso: booking.dateIso,
        time: booking.time,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.warn('[booking-email] failed', res.status, text.slice(0, 200))
    }
  } catch (e) {
    console.warn('[booking-email] request error', e)
  }
}
