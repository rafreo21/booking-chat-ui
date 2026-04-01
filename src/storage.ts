export type SavedBooking = {
  id: string
  createdAt: string
  service: string
  dateIso: string
  time: string
  name: string
  email: string
}

const STORAGE_KEY = 'booking-chat-bookings'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function isValidBooking(x: unknown): x is SavedBooking {
  if (!isRecord(x)) return false
  return (
    typeof x.id === 'string' &&
    typeof x.createdAt === 'string' &&
    typeof x.service === 'string' &&
    typeof x.dateIso === 'string' &&
    typeof x.time === 'string' &&
    typeof x.name === 'string' &&
    typeof x.email === 'string'
  )
}

export function loadBookings(): SavedBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidBooking)
  } catch {
    return []
  }
}

export function saveBookings(list: SavedBooking[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addBooking(
  input: Omit<SavedBooking, 'id' | 'createdAt'>,
): SavedBooking {
  const row: SavedBooking = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  const next = [row, ...loadBookings()]
  saveBookings(next)
  return row
}

export function deleteBooking(id: string): void {
  saveBookings(loadBookings().filter((b) => b.id !== id))
}

export function clearBookings(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportBookingsJson(): string {
  return JSON.stringify(loadBookings(), null, 2)
}

export function importBookingsFromJson(
  json: string,
  mode: 'replace' | 'merge',
): { ok: true; count: number } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'JSON must be an array of bookings.' }
    }
    const rows = parsed.filter(isValidBooking)
    if (rows.length === 0 && parsed.length > 0) {
      return { ok: false, error: 'No valid booking objects found.' }
    }
    if (mode === 'replace') {
      saveBookings(rows)
      return { ok: true, count: rows.length }
    }
    const existing = loadBookings()
    const byId = new Map(existing.map((b) => [b.id, b]))
    for (const r of rows) {
      byId.set(r.id, r)
    }
    const merged = Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    saveBookings(merged)
    return { ok: true, count: merged.length }
  } catch {
    return { ok: false, error: 'Invalid JSON.' }
  }
}

/** If localStorage is empty, copy seed from `public/bookings.json` (e.g. committed on GitHub). */
export async function hydrateFromPublicFile(): Promise<void> {
  if (loadBookings().length > 0) return
  try {
    const res = await fetch('/bookings.json', { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as unknown
    if (!Array.isArray(data) || data.length === 0) return
    const rows = data.filter(isValidBooking)
    if (rows.length === 0) return
    saveBookings(rows)
  } catch {
    /* offline or missing file */
  }
}
