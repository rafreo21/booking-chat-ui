import type { SavedBooking } from './storage'

/**
 * POSTs a completed booking to `/api/sheets-append` (Vercel).
 * Never throws; logs on failure. Local `npm run dev`: use `vercel dev` or set VITE_SHEETS_APPEND_URL to your deployed site.
 */
export async function syncBookingToSheets(row: SavedBooking): Promise<void> {
  const url =
    import.meta.env.VITE_SHEETS_APPEND_URL?.trim() || '/api/sheets-append'

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = import.meta.env.VITE_BOOKING_INGEST_SECRET
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: row.id,
        createdAt: row.createdAt,
        guests: row.guests,
        service: row.service,
        dateIso: row.dateIso,
        time: row.time,
        name: row.name,
        email: row.email,
        phone: row.phone,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.warn('[sheets] append failed', res.status, text)
    }
  } catch (e) {
    console.warn('[sheets] request error', e)
  }
}
