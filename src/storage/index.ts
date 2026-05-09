export type { NewBookingInput, ReservationBookingMeta, SavedBooking } from './types'

import { isSupabaseConfigured } from '../lib/supabaseClient'
import {
  addBookingLocal,
  clearBookingsLocal,
  deleteBookingLocal,
  getBookingByIdLocal,
  getBookingByManageTokenLocal,
  hydrateFromPublicFileLocal,
  importBookingsFromJsonLocal,
  loadBookingsLocal,
} from './localBookings'
import {
  addBookingSupabase,
  clearBookingsSupabase,
  deleteBookingSupabase,
  getBookingByIdSupabase,
  getBookingByManageTokenSupabase,
  importBookingsFromJsonSupabase,
  loadBookingsSupabase,
} from './supabaseBookings'
import {
  deleteCustomizationLocal,
  loadCustomizationLocal,
  saveCustomizationLocal,
} from './customizationLocal'
import {
  loadCustomizationSupabase,
  saveCustomizationSupabase,
} from './supabaseCustomization'

/** All reservations, newest first */
export async function loadBookings() {
  if (isSupabaseConfigured()) return loadBookingsSupabase()
  return loadBookingsLocal()
}

export async function getBookingById(id: string) {
  if (isSupabaseConfigured()) return getBookingByIdSupabase(id)
  return getBookingByIdLocal(id)
}

export async function getBookingByManageToken(token: string) {
  if (isSupabaseConfigured()) return getBookingByManageTokenSupabase(token)
  return getBookingByManageTokenLocal(token)
}

/**
 * Resolve a route ref: prefer opaque `manageToken`, then legacy internal id.
 */
export async function resolveReservationPublicRef(ref: string) {
  const trimmed = ref.trim()
  if (!trimmed) return null
  const byToken = await getBookingByManageToken(trimmed)
  if (byToken) return byToken
  return getBookingById(trimmed)
}

export async function addBooking(input: Parameters<typeof addBookingLocal>[0]) {
  if (isSupabaseConfigured()) return addBookingSupabase(input)
  return addBookingLocal(input)
}

export async function deleteBooking(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteBookingSupabase(id)
    return
  }
  deleteCustomizationLocal(id)
  deleteBookingLocal(id)
}

export async function clearBookings(): Promise<void> {
  if (isSupabaseConfigured()) return clearBookingsSupabase()
  clearBookingsLocal()
}

export async function exportBookingsJson(): Promise<string> {
  const rows = await loadBookings()
  return JSON.stringify(rows, null, 2)
}

export async function importBookingsFromJson(
  json: string,
  mode: 'replace' | 'merge',
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (isSupabaseConfigured()) return importBookingsFromJsonSupabase(json, mode)
  return importBookingsFromJsonLocal(json, mode)
}

/** Skipped when Supabase is configured (bookings live in the cloud). */
export async function hydrateFromPublicFile(): Promise<void> {
  if (isSupabaseConfigured()) return
  return hydrateFromPublicFileLocal()
}

export async function loadCustomization(reservationId: string) {
  if (isSupabaseConfigured()) return loadCustomizationSupabase(reservationId)
  return loadCustomizationLocal(reservationId)
}

export async function saveCustomization(
  customization: Parameters<typeof saveCustomizationLocal>[0],
): Promise<void> {
  if (isSupabaseConfigured()) return saveCustomizationSupabase(customization)
  saveCustomizationLocal(customization)
}
