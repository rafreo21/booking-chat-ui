import type { DiningCustomization } from '../types/bookingCustomization'

const STORAGE_KEY = 'booking-chat-dining-customizations'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function isGuestSeat(x: unknown): x is DiningCustomization['seats'][number] {
  if (!isRecord(x)) return false
  const allergensOk =
    x.avoidAllergens === undefined ||
    (Array.isArray(x.avoidAllergens) && x.avoidAllergens.every((id) => typeof id === 'string'))
  return (
    typeof x.seatIndex === 'number' &&
    typeof x.displayName === 'string' &&
    Array.isArray(x.selectedMenuItemIds) &&
    x.selectedMenuItemIds.every((id) => typeof id === 'string') &&
    allergensOk
  )
}

function isDiningCustomization(x: unknown): x is DiningCustomization {
  if (!isRecord(x)) return false
  return (
    typeof x.reservationId === 'string' &&
    typeof x.updatedAt === 'string' &&
    typeof x.guestCount === 'number' &&
    Array.isArray(x.seats) &&
    x.seats.every(isGuestSeat) &&
    (x.notes === undefined || typeof x.notes === 'string')
  )
}

function loadMap(): Record<string, DiningCustomization> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!isRecord(parsed)) return {}
    const out: Record<string, DiningCustomization> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (isDiningCustomization(v) && v.reservationId === k) out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

function saveMap(m: Record<string, DiningCustomization>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m))
}

export function loadCustomizationLocal(reservationId: string): DiningCustomization | null {
  const m = loadMap()
  return m[reservationId] ?? null
}

export function saveCustomizationLocal(customization: DiningCustomization): void {
  const m = loadMap()
  m[customization.reservationId] = {
    ...customization,
    updatedAt: new Date().toISOString(),
  }
  saveMap(m)
}

export function deleteCustomizationLocal(reservationId: string): void {
  const m = loadMap()
  delete m[reservationId]
  saveMap(m)
}
