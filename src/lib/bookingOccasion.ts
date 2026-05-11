/** Optional booking occasion captured on the contact step (stored on `SavedBooking.meta`). */

export type OccasionTypeId =
  | ''
  | 'birthday'
  | 'graduation'
  | 'dinner_date'
  | 'party'
  | 'get_together'
  | 'wedding'
  | 'business'
  | 'other'

/** Presets shown after “Prefer not to say”. */
export const OCCASION_SELECT_PRESETS: { value: Exclude<OccasionTypeId, ''>; label: string }[] = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding', label: 'Wedding / reception' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'dinner_date', label: 'Dinner date' },
  { value: 'party', label: 'Party / celebration' },
  { value: 'get_together', label: 'Get-together / catch-up' },
  { value: 'business', label: 'Business meal' },
  { value: 'other', label: 'Other' },
]

export function isOccasionTypeId(value: string): value is Exclude<OccasionTypeId, ''> {
  return OCCASION_SELECT_PRESETS.some((p) => p.value === value)
}

export function occasionPresetLabel(type: Exclude<OccasionTypeId, ''>): string {
  return OCCASION_SELECT_PRESETS.find((p) => p.value === type)?.label ?? type
}

/** Chips after time selection (horizontal scroll). “Specify occasion” opens typed entry (same role as Other). */
export const OCCASION_CHAT_CHIPS: { value: OccasionTypeId; label: string }[] = [
  { value: '', label: 'Prefer not to say' },
  ...OCCASION_SELECT_PRESETS.filter((p) => p.value !== 'other'),
]

export function occasionSummaryLine(type: OccasionTypeId, notesRaw: string): string | null {
  const notes = notesRaw.trim()
  if (!type) return notes.length ? notes : null
  const label = occasionPresetLabel(type)
  if (!notes.length) return label
  return `${label} — ${notes}`
}

export function occasionSummaryFromMeta(meta?: {
  occasionType?: unknown
  occasionNotes?: unknown
}): string | null {
  const t = typeof meta?.occasionType === 'string' ? meta.occasionType.trim() : ''
  const n = typeof meta?.occasionNotes === 'string' ? meta.occasionNotes : ''
  const type = t && isOccasionTypeId(t) ? t : ''
  return occasionSummaryLine(type, n)
}
