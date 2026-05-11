/**
 * Booking submit failures (network, payment gateway, etc.).
 * Throw `BookingSubmissionError` from storage or payment code so the UI can show targeted copy.
 */

export type BookingFailureReason = 'network' | 'payment'

export class BookingSubmissionError extends Error {
  readonly reason: BookingFailureReason

  constructor(message: string, reason: BookingFailureReason) {
    super(message)
    this.name = 'BookingSubmissionError'
    this.reason = reason
  }
}

export function getBookingFailureReason(error: unknown): BookingFailureReason {
  if (error instanceof BookingSubmissionError) return error.reason
  const msg =
    error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  if (/payment|card|declined|gateway|stripe|apple\s*pay|google\s*pay/i.test(msg)) {
    return 'payment'
  }
  /** Everything else maps here — includes Supabase/HTTP/API failures (often mislabeled “network” in UI copy). */
  return 'network'
}
