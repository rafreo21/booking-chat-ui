export type DatePresetId =
  | 'today'
  | 'this-week'
  | 'this-month'
  | 'last-3-months'
  | 'custom'

export type ComparisonId =
  | 'prior-day'
  | 'prior-sunday'
  | 'four-weeks'
  | 'fifty-two-weeks'
  | 'prior-year'

export type BillsFilter = 'all' | 'open' | 'closed'

export type PerformanceFiltersState = {
  datePreset: DatePresetId
  /** Inclusive reporting range start (start of local day). */
  rangeFrom: Date
  /** Inclusive reporting range end (start of local day). */
  rangeTo: Date
  comparisonId: ComparisonId
  billsFilter: BillsFilter
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

/** Canonical inclusive reporting window for built-in presets (relative to `ref`, usually today). */
export function reportingRangeFromPreset(
  preset: Exclude<DatePresetId, 'custom'>,
  ref = new Date(),
): { from: Date; to: Date } {
  const to = startOfDay(ref)

  switch (preset) {
    case 'today':
      return { from: to, to }

    case 'this-week': {
      const dowMon0 = (to.getDay() + 6) % 7
      const from = new Date(to)
      from.setDate(from.getDate() - dowMon0)
      const start = startOfDay(from)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return { from: start, to: startOfDay(end) }
    }

    case 'this-month': {
      const from = startOfDay(new Date(to.getFullYear(), to.getMonth(), 1))
      return { from, to }
    }

    case 'last-3-months': {
      const from = startOfDay(new Date(to.getFullYear(), to.getMonth() - 2, 1))
      return { from, to }
    }

    default:
      return { from: to, to }
  }
}

/** Anchor comparisons to the end of the selected reporting window. */
export function deriveComparisonDate(rangeEnd: Date, comparisonId: ComparisonId): Date {
  const a = startOfDay(rangeEnd)
  switch (comparisonId) {
    case 'prior-day': {
      const x = new Date(a)
      x.setDate(x.getDate() - 1)
      return x
    }
    case 'prior-sunday': {
      const x = new Date(a)
      const dow = x.getDay()
      x.setDate(x.getDate() - (dow === 0 ? 7 : dow))
      return x
    }
    case 'four-weeks': {
      const x = new Date(a)
      x.setDate(x.getDate() - 28)
      return startOfDay(x)
    }
    case 'fifty-two-weeks': {
      const x = new Date(a)
      x.setDate(x.getDate() - 7 * 52)
      return startOfDay(x)
    }
    case 'prior-year': {
      const x = new Date(a)
      x.setFullYear(x.getFullYear() - 1)
      return startOfDay(x)
    }
  }
}
