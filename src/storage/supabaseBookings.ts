import { getSupabase } from '../lib/supabaseClient'
import { normalizeBooking } from './localBookings'
import { createOpaqueManageToken } from '../lib/manageToken'
import type { NewBookingInput, ReservationBookingMeta, SavedBooking } from './types'

type ReservationRow = {
  id: string
  manage_token: string | null
  created_at: string
  guests: number
  service: string
  date_iso: string
  time: string
  name: string
  email: string
  phone: string
  meta: unknown | null
}

function metaFromDb(raw: unknown): ReservationBookingMeta | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const out: ReservationBookingMeta = {}
  if (typeof o.menuAvailabilityVersion === 'string') out.menuAvailabilityVersion = o.menuAvailabilityVersion
  if (typeof o.kitchenPrepNotes === 'string') out.kitchenPrepNotes = o.kitchenPrepNotes
  if (o.depositStatus === 'none' || o.depositStatus === 'pending' || o.depositStatus === 'paid') {
    out.depositStatus = o.depositStatus
  }
  return Object.keys(out).length ? out : undefined
}

function toRow(b: SavedBooking): ReservationRow {
  return {
    id: b.id,
    manage_token: b.manageToken,
    created_at: b.createdAt,
    guests: b.guests,
    service: b.service,
    date_iso: b.dateIso,
    time: b.time,
    name: b.name,
    email: b.email,
    phone: b.phone ?? '',
    meta: b.meta ?? {},
  }
}

function fromRow(r: ReservationRow): SavedBooking {
  /** Stable fallback before migration backfills `manage_token` (avoid random token per read). */
  const mt =
    typeof r.manage_token === 'string' && r.manage_token.trim()
      ? r.manage_token.trim()
      : r.id
  return {
    id: r.id,
    manageToken: mt,
    createdAt: r.created_at,
    guests: Math.max(0, Math.floor(r.guests)),
    service: r.service,
    dateIso: r.date_iso,
    time: r.time,
    name: r.name,
    email: r.email,
    phone: r.phone ?? '',
    meta: metaFromDb(r.meta),
  }
}

function mapDbError(e: unknown): Error {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as Error).message === 'string') {
    return e as Error
  }
  return new Error(String(e))
}

export async function loadBookingsSupabase(): Promise<SavedBooking[]> {
  const sb = getSupabase()
  if (!sb) return []
  const { data, error } = await sb
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw mapDbError(error)
  return ((data ?? []) as ReservationRow[]).map(fromRow)
}

export async function getBookingByIdSupabase(id: string): Promise<SavedBooking | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.from('reservations').select('*').eq('id', id).maybeSingle()
  if (error) throw mapDbError(error)
  if (!data) return null
  return fromRow(data as ReservationRow)
}

export async function getBookingByManageTokenSupabase(token: string): Promise<SavedBooking | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from('reservations')
    .select('*')
    .eq('manage_token', token)
    .maybeSingle()
  if (error) throw mapDbError(error)
  if (!data) return null
  return fromRow(data as ReservationRow)
}

export async function addBookingSupabase(input: NewBookingInput): Promise<SavedBooking> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase client unavailable')
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const createdAt = new Date().toISOString()
  const manage_token = createOpaqueManageToken()
  const row: ReservationRow = {
    id,
    manage_token,
    created_at: createdAt,
    guests: input.guests,
    service: input.service,
    date_iso: input.dateIso,
    time: input.time,
    name: input.name,
    email: input.email,
    phone: input.phone ?? '',
    meta: input.meta ?? {},
  }
  const { data, error } = await sb.from('reservations').insert(row).select('*').single()
  if (error) throw mapDbError(error)
  return fromRow(data as ReservationRow)
}

export async function deleteBookingSupabase(id: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const { error } = await sb.from('reservations').delete().eq('id', id)
  if (error) throw mapDbError(error)
}

export async function clearBookingsSupabase(): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const { error } = await sb.from('reservations').delete().gte('guests', 0)
  if (error) throw mapDbError(error)
}

export async function importBookingsFromJsonSupabase(
  json: string,
  mode: 'replace' | 'merge',
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase not configured.' }
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'JSON must be an array of bookings.' }
    }
    const rows: SavedBooking[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      if (
        typeof o.id === 'string' &&
        typeof o.createdAt === 'string' &&
        typeof o.service === 'string'
      ) {
        rows.push(normalizeBooking(o))
      }
    }
    if (rows.length === 0 && parsed.length > 0) {
      return { ok: false, error: 'No valid booking objects found.' }
    }
    if (mode === 'replace') {
      const { error: delErr } = await sb.from('reservations').delete().gte('guests', 0)
      if (delErr) throw mapDbError(delErr)
    }
    const chunkSize = 50
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize).map(toRow)
      const { error } = await sb.from('reservations').upsert(chunk, { onConflict: 'id' })
      if (error) throw mapDbError(error)
    }
    if (mode === 'replace') {
      return { ok: true, count: rows.length }
    }
    const all = await loadBookingsSupabase()
    return { ok: true, count: all.length }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Import failed.' }
  }
}
