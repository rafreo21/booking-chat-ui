import type { SavedBooking } from '../storage'
import type { DiningCustomization, GuestSeat } from '../types/bookingCustomization'
import { buildDefaultSeats } from '../types/bookingCustomization'

/** Align saved seat rows with current guest count for a booking. */
export function reconcileGuestSeats(
  booking: SavedBooking,
  saved: DiningCustomization | null,
): GuestSeat[] {
  const n = Math.max(1, booking.guests)
  if (!saved || saved.seats.length !== n) {
    if (saved && saved.seats.length > 0) {
      return buildDefaultSeats(n).map((s, i) => ({
        ...s,
        displayName: saved.seats[i]?.displayName ?? s.displayName,
        selectedMenuItemIds: [...(saved.seats[i]?.selectedMenuItemIds ?? [])],
      }))
    }
    return buildDefaultSeats(n)
  }
  return saved.seats.map((s) => ({
    ...s,
    selectedMenuItemIds: [...s.selectedMenuItemIds],
  }))
}
