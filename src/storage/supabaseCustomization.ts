import { getSupabase } from '../lib/supabaseClient'
import type { DiningCustomization, GuestSeat } from '../types/bookingCustomization'

type DiningRow = {
  reservation_id: string
  updated_at: string
  guest_count: number
  seats: GuestSeat[]
  notes: string | null
}

function mapDbError(e: unknown): Error {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as Error).message === 'string') {
    return e as Error
  }
  return new Error(String(e))
}

export async function loadCustomizationSupabase(
  reservationId: string,
): Promise<DiningCustomization | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from('dining_customizations')
    .select('*')
    .eq('reservation_id', reservationId)
    .maybeSingle()
  if (error) throw mapDbError(error)
  if (!data) return null
  const row = data as DiningRow
  return {
    reservationId: row.reservation_id,
    updatedAt: row.updated_at,
    guestCount: row.guest_count,
    seats: Array.isArray(row.seats) ? row.seats : [],
    notes: row.notes ?? undefined,
  }
}

export async function saveCustomizationSupabase(c: DiningCustomization): Promise<void> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase client unavailable')
  const updatedAt = new Date().toISOString()
  const row = {
    reservation_id: c.reservationId,
    guest_count: c.guestCount,
    seats: c.seats,
    notes: c.notes ?? null,
    updated_at: updatedAt,
  }
  const { error } = await sb.from('dining_customizations').upsert(row, {
    onConflict: 'reservation_id',
  })
  if (error) throw mapDbError(error)
}

export async function deleteCustomizationSupabase(reservationId: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const { error } = await sb.from('dining_customizations').delete().eq('reservation_id', reservationId)
  if (error) throw mapDbError(error)
}
