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

/** 6×7 grid for a visible month (leading/trailing days from adjacent months). */
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

  let nextY = y
  let nextM = m + 1
  if (nextM > 11) {
    nextM = 0
    nextY += 1
  }
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({ day: new Date(nextY, nextM, nextDay, 12, 0, 0, 0), inMonth: false })
    nextDay++
  }

  return cells
}

const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

type Props = {
  /** Fired when user picks a selectable day (single tap — same as choosing a chip). */
  onSelectDate: (d: Date) => void
  /** Clear / dismiss back to quick picks without booking. */
  onClear: () => void
}

/**
 * Notion-inspired month calendar: top field, month nav, grid, footer Clear.
 */
export function NotionStyleDatePicker({ onSelectDate, onClear }: Props) {
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

  const [fieldPreview, setFieldPreview] = useState(() =>
    new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  )

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
    setFieldPreview(
      new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    )
  }

  const isSelectable = (d: Date) => {
    const s = startOfDay(d)
    return s >= today && s <= maxDate
  }

  const handleDayClick = (d: Date, inMonth: boolean) => {
    if (!isSelectable(d)) return
    setFieldPreview(
      d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    )
    if (!inMonth) {
      const nm = new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0)
      setViewMonth(nm)
    }
    onSelectDate(d)
  }

  return (
    <div className="mx-auto w-full max-w-[20rem] rounded-xl border border-neutral-200/90 bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      <div
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[15px] font-medium text-neutral-900 shadow-sm"
        aria-hidden
      >
        {fieldPreview}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[15px] font-semibold text-neutral-900">{monthYearLabel}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToday}
            className="rounded-md px-2 py-1 text-[13px] font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goPrevMonth}
            className="flex size-8 items-center justify-center rounded-md text-neutral-600 transition hover:bg-neutral-100"
            aria-label="Previous month"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            className="flex size-8 items-center justify-center rounded-md text-neutral-600 transition hover:bg-neutral-100"
            aria-label="Next month"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
        {WEEK.map((w) => (
          <div
            key={w}
            className="py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400"
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
              className={`relative mx-auto flex size-9 items-center justify-center rounded-md text-[14px] font-medium transition ${
                !inMonth
                  ? sel
                    ? 'text-neutral-600'
                    : 'text-neutral-300'
                  : 'text-neutral-900'
              } ${
                sel
                  ? 'hover:bg-neutral-100 active:bg-[#2383e2] active:text-white'
                  : 'cursor-not-allowed opacity-40'
              } ${isToday && sel ? 'ring-2 ring-rose-300 ring-offset-0' : ''} `}
            >
              {num}
            </button>
          )
        })}
      </div>

      <div className="mt-3 border-t border-neutral-100 pt-2">
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] font-medium text-neutral-500 hover:text-neutral-800"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
