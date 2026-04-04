import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Minimum rows: leading pad + month days, then only enough trailing next-month
 * days to finish the last row (no extra full week unless the month needs it).
 */
function buildMonthCells(viewMonth: Date): { day: Date; inMonth: boolean }[] {
  const y = viewMonth.getFullYear()
  const m = viewMonth.getMonth()
  const first = new Date(y, m, 1, 12, 0, 0, 0)
  const startPad = first.getDay()
  const totalDays = daysInMonth(y, m)
  const cells: { day: Date; inMonth: boolean }[] = []

  const prevMonthLast = new Date(y, m, 0)
  const prevYear = prevMonthLast.getFullYear()
  const prevMon = prevMonthLast.getMonth()
  const prevDays = prevMonthLast.getDate()

  for (let i = 0; i < startPad; i++) {
    const dayNum = prevDays - startPad + i + 1
    cells.push({
      day: new Date(prevYear, prevMon, dayNum, 12, 0, 0, 0),
      inMonth: false,
    })
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: new Date(y, m, d, 12, 0, 0, 0), inMonth: true })
  }

  const remainder = cells.length % 7
  if (remainder !== 0) {
    const pad = 7 - remainder
    let nextY = y
    let nextM = m + 1
    if (nextM > 11) {
      nextM = 0
      nextY += 1
    }
    let nextDay = 1
    for (let p = 0; p < pad; p++) {
      cells.push({ day: new Date(nextY, nextM, nextDay, 12, 0, 0, 0), inMonth: false })
      nextDay++
    }
  }

  return cells
}

const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

type Props = {
  /** Fired when user picks a selectable day (single tap — same as choosing a chip). */
  onSelectDate: (d: Date) => void
  /** Merged onto root; use `w-full` in host so it tracks chat column width. */
  className?: string
}

/**
 * Month calendar for inline chat/footer use: no floating card — fills parent width.
 */
export function NotionStyleDatePicker({ onSelectDate, className = '' }: Props) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const maxDate = useMemo(() => {
    const x = new Date()
    x.setFullYear(x.getFullYear() + 1)
    x.setHours(23, 59, 59, 999)
    return startOfDay(x)
  }, [])

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(12, 0, 0, 0)
    return d
  })

  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth])

  const monthYearLabel = viewMonth.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  const goPrevMonth = () => {
    setViewMonth((vm) => new Date(vm.getFullYear(), vm.getMonth() - 1, 1, 12, 0, 0, 0))
  }

  const goNextMonth = () => {
    setViewMonth((vm) => new Date(vm.getFullYear(), vm.getMonth() + 1, 1, 12, 0, 0, 0))
  }

  const goToday = () => {
    const n = new Date()
    n.setDate(1)
    n.setHours(12, 0, 0, 0)
    setViewMonth(n)
  }

  const isSelectable = (d: Date) => {
    const s = startOfDay(d)
    return s >= today && s <= maxDate
  }

  const handleDayClick = (d: Date, inMonth: boolean) => {
    if (!isSelectable(d)) return
    if (!inMonth) {
      const nm = new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0)
      setViewMonth(nm)
    }
    onSelectDate(d)
  }

  return (
    <div className={`w-full min-w-0 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-neutral-100 pb-2.5">
        <span className="text-[15px] font-semibold text-neutral-900">{monthYearLabel}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToday}
            className="rounded-md px-2 py-1 text-[13px] font-medium text-neutral-600 transition-colors duration-200 ease-out press:bg-neutral-200 press:text-neutral-900 active:bg-neutral-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goPrevMonth}
            className="flex size-8 items-center justify-center rounded-md text-neutral-600 transition-colors duration-200 ease-out press:bg-neutral-200 active:bg-neutral-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1"
            aria-label="Previous month"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            className="flex size-8 items-center justify-center rounded-md text-neutral-600 transition-colors duration-200 ease-out press:bg-neutral-200 active:bg-neutral-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1"
            aria-label="Next month"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>

      <div className="mt-2.5 grid w-full grid-cols-7 gap-x-0.5 gap-y-1 text-center sm:gap-x-1">
        {WEEK.map((w) => (
          <div
            key={w}
            className="py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400 sm:text-[11px]"
          >
            {w}
          </div>
        ))}
        {cells.map(({ day, inMonth }, i) => {
          const sel = isSelectable(day)
          const isToday = sameDay(day, today)
          const num = day.getDate()
          return (
            <button
              key={`${day.toISOString()}-${i}`}
              type="button"
              disabled={!sel}
              onClick={() => handleDayClick(day, inMonth)}
              className={`relative mx-auto flex aspect-square w-full max-w-11 min-h-0 min-w-0 items-center justify-center rounded-full text-[13px] font-medium transition-colors duration-150 sm:text-[14px] ${
                !sel
                  ? 'cursor-not-allowed text-neutral-300 opacity-40'
                  : isToday
                    ? 'bg-neutral-950 text-white press:bg-neutral-700 press:shadow-[0_2px_8px_rgba(0,0,0,0.25)] active:!bg-neutral-900 active:!text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950'
                    : `${
                        !inMonth ? 'text-neutral-600' : 'text-neutral-900'
                      } press:bg-neutral-200 active:!bg-neutral-950 active:!text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1`
              }`}
            >
              {num}
            </button>
          )
        })}
      </div>
    </div>
  )
}
