export type { NewBookingInput, ReservationBookingMeta, SavedBooking } from './types'

import type { SavedBooking } from './types'

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

/**
 * When a Supabase `reservations` insert fails (RLS, missing table, etc.), fall back to localStorage
 * so the confirm flow still succeeds. On by default in dev; production requires explicit opt-in.
 */
function shouldFallbackBookingToLocalOnSupabaseError(): boolean {
  const v = import.meta.env.VITE_BOOKING_FALLBACK_LOCAL_ON_ERROR?.trim().toLowerCase()
  if (v === 'false' || v === '0') return false
  if (v === 'true' || v === '1') return true
  return import.meta.env.DEV
}

/** All reservations, newest first — merges cloud rows with any browser-local fallback bookings (same manage token wins cloud row). */
export async function loadBookings() {
  if (!isSupabaseConfigured()) return loadBookingsLocal()
  let remote: SavedBooking[] = []
  try {
    remote = await loadBookingsSupabase()
  } catch {
    remote = []
  }
  const local = loadBookingsLocal()
  const merged = new Map<string, SavedBooking>()
  for (const b of local) merged.set(b.manageToken, b)
  for (const b of remote) merged.set(b.manageToken, b)
  return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getBookingById(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const row = await getBookingByIdSupabase(id)
      if (row) return row
    } catch {
      /* table missing / RLS etc. */
    }
  }
  return getBookingByIdLocal(id)
}

export async function getBookingByManageToken(token: string) {
  if (isSupabaseConfigured()) {
    try {
      const row = await getBookingByManageTokenSupabase(token)
      if (row) return row
    } catch {
      /* network / permissions */
    }
  }
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
  if (!isSupabaseConfigured()) return addBookingLocal(input)
  try {
    return await addBookingSupabase(input)
  } catch (e) {
    if (shouldFallbackBookingToLocalOnSupabaseError()) {
      console.warn(
        '[booking] Supabase reservation insert failed; saving locally instead. Fix `reservations` table + RLS or set VITE_BOOKING_FALLBACK_LOCAL_ON_ERROR=false to surface errors.',
        e,
      )
      return addBookingLocal(input)
    }
    throw e
  }
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
  if (!isSupabaseConfigured()) return loadCustomizationLocal(reservationId)
  try {
    const cloud = await loadCustomizationSupabase(reservationId)
    if (cloud) return cloud
  } catch {
    /* missing dining_customizations table / RLS */
  }
  return loadCustomizationLocal(reservationId)
}

export async function saveCustomization(
  customization: Parameters<typeof saveCustomizationLocal>[0],
): Promise<void> {
  if (!isSupabaseConfigured()) {
    saveCustomizationLocal(customization)
    return
  }
  try {
    await saveCustomizationSupabase(customization)
  } catch (e) {
    console.warn('[dining] Supabase customization save failed; stored locally.', e)
    saveCustomizationLocal(customization)
  }
}
