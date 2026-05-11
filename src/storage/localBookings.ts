import { createOpaqueManageToken } from '../lib/manageToken'
import type { NewBookingInput, ReservationBookingMeta, SavedBooking } from './types'

const STORAGE_KEY = 'booking-chat-bookings'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function isLegacyBooking(x: unknown): x is Record<string, unknown> {
  if (!isRecord(x)) return false
  return (
    typeof x.id === 'string' &&
    typeof x.createdAt === 'string' &&
    typeof x.service === 'string' &&
    typeof x.dateIso === 'string' &&
    typeof x.time === 'string' &&
    typeof x.name === 'string' &&
    typeof x.email === 'string' &&
    (typeof (x as Record<string, unknown>).phone === 'string' ||
      (x as Record<string, unknown>).phone === undefined)
  )
}

function parseMeta(raw: unknown): ReservationBookingMeta | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const out: ReservationBookingMeta = {}
  if (typeof o.menuAvailabilityVersion === 'string') out.menuAvailabilityVersion = o.menuAvailabilityVersion
  if (typeof o.kitchenPrepNotes === 'string') out.kitchenPrepNotes = o.kitchenPrepNotes
  if (typeof o.occasionType === 'string') out.occasionType = o.occasionType
  if (typeof o.occasionNotes === 'string') out.occasionNotes = o.occasionNotes
  if (o.depositStatus === 'none' || o.depositStatus === 'pending' || o.depositStatus === 'paid') {
    out.depositStatus = o.depositStatus
  }
  return Object.keys(out).length ? out : undefined
}

export function normalizeBooking(x: Record<string, unknown>): SavedBooking {
  const g = x.guests
  const guests =
    typeof g === 'number' && !Number.isNaN(g) ? Math.max(0, Math.floor(g)) : 0
  const phone = typeof x.phone === 'string' ? x.phone : ''
  const manageToken =
    typeof x.manageToken === 'string' && x.manageToken.trim()
      ? x.manageToken.trim()
      : createOpaqueManageToken()
  return {
    id: x.id as string,
    manageToken,
    createdAt: x.createdAt as string,
    guests,
    service: x.service as string,
    dateIso: x.dateIso as string,
    time: x.time as string,
    name: x.name as string,
    email: x.email as string,
    phone,
    meta: parseMeta(x.meta),
  }
}

export function loadBookingsLocal(): SavedBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const legacyRows = parsed.filter(isLegacyBooking)
    const needsTokenPersist = legacyRows.some(
      (r) => typeof r.manageToken !== 'string' || !(r.manageToken as string).trim(),
    )
    const list = legacyRows.map(normalizeBooking)
    if (needsTokenPersist) saveBookingsLocal(list)
    return list
  } catch {
    return []
  }
}

export function saveBookingsLocal(list: SavedBooking[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addBookingLocal(input: NewBookingInput): SavedBooking {
  const row: SavedBooking = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    manageToken: createOpaqueManageToken(),
  }
  const next = [row, ...loadBookingsLocal()]
  saveBookingsLocal(next)
  return row
}

export function deleteBookingLocal(id: string): void {
  saveBookingsLocal(loadBookingsLocal().filter((b) => b.id !== id))
}

export function clearBookingsLocal(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getBookingByIdLocal(id: string): SavedBooking | null {
  return loadBookingsLocal().find((b) => b.id === id) ?? null
}

export function getBookingByManageTokenLocal(token: string): SavedBooking | null {
  return loadBookingsLocal().find((b) => b.manageToken === token) ?? null
}

function isValidImportedRow(x: unknown): x is Record<string, unknown> {
  return isLegacyBooking(x)
}

export function importBookingsFromJsonLocal(
  json: string,
  mode: 'replace' | 'merge',
): { ok: true; count: number } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'JSON must be an array of bookings.' }
    }
    const rows = parsed.filter(isValidImportedRow).map(normalizeBooking)
    if (rows.length === 0 && parsed.length > 0) {
      return { ok: false, error: 'No valid booking objects found.' }
    }
    if (mode === 'replace') {
      saveBookingsLocal(rows)
      return { ok: true, count: rows.length }
    }
    const existing = loadBookingsLocal()
    const byId = new Map(existing.map((b) => [b.id, b]))
    for (const r of rows) {
      byId.set(r.id, r)
    }
    const merged = Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    saveBookingsLocal(merged)
    return { ok: true, count: merged.length }
  } catch {
    return { ok: false, error: 'Invalid JSON.' }
  }
}

/** If localStorage is empty, copy seed from `public/bookings.json`. */
export async function hydrateFromPublicFileLocal(): Promise<void> {
  if (loadBookingsLocal().length > 0) return
  try {
    const res = await fetch('/bookings.json', { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as unknown
    if (!Array.isArray(data) || data.length === 0) return
    const rows = data.filter(isValidImportedRow).map(normalizeBooking)
    if (rows.length === 0) return
    saveBookingsLocal(rows)
  } catch {
    /* offline or missing file */
  }
}
