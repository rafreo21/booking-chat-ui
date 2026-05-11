/** Persisted on each reservation row — ops / kitchen / slot rules */
export type ReservationBookingMeta = {
  menuAvailabilityVersion?: string
  kitchenPrepNotes?: string
  depositStatus?: 'none' | 'pending' | 'paid'
  /** From optional occasion chips after time selection (`bookingOccasion` presets). */
  occasionType?: string
  /** Free-text notes when celebrating / specifying “Other”. */
  occasionNotes?: string
  [key: string]: unknown
}

export type SavedBooking = {
  id: string
  /** Opaque token for `/reservation/:token` preview links; editor at `/reservation/:token/customize`. */
  manageToken: string
  createdAt: string
  guests: number
  /** Legacy field; new restaurant bookings use "Restaurant". */
  service: string
  dateIso: string
  time: string
  name: string
  email: string
  phone: string
  meta?: ReservationBookingMeta
}

/** Input when creating a reservation — server assigns id / timestamps / manageToken on insert paths */
export type NewBookingInput = Omit<SavedBooking, 'id' | 'createdAt' | 'manageToken'>
