import type { ReservationBookingMeta, SavedBooking } from '../storage/types'

/** Persisted booking row shape — operational metadata lives on `SavedBooking.meta`. */
export type Reservation = SavedBooking

/** Alias for kitchen/slot/menu versioning fields shared with `SavedBooking.meta`. */
export type ReservationMeta = ReservationBookingMeta

/** Category ids are JSON-driven (see `public/menu.json`). Keep stable across deploys. */
export type MenuCategoryId = string

export interface MenuCategory {
  id: MenuCategoryId
  label: string
  /** Sort order in UI */
  order: number
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  categoryId: MenuCategoryId
  /** Short labels for chips (e.g. vegan, gluten-free). */
  dietaryTags?: string[]
  priceCents?: number
  allergens?: string[]
}

/** One physical seat / place setting at the table */
export interface GuestSeat {
  /** 1-based index matching guest count */
  seatIndex: number
  /** Optional friendly label, e.g. "Raphael" */
  displayName: string
  selectedMenuItemIds: string[]
}

/** Snapshot stored against a reservation */
export interface DiningCustomization {
  reservationId: string
  updatedAt: string
  guestCount: number
  seats: GuestSeat[]
  notes?: string
}

export function emptySeat(seatIndex: number): GuestSeat {
  return {
    seatIndex,
    displayName: `Guest ${seatIndex}`,
    selectedMenuItemIds: [],
  }
}

export function buildDefaultSeats(guestCount: number): GuestSeat[] {
  const n = Math.max(1, Math.floor(guestCount))
  return Array.from({ length: n }, (_, i) => emptySeat(i + 1))
}
