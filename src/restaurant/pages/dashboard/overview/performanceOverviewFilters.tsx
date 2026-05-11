import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { CalendarDaysIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  deriveComparisonDate,
  isSameDay,
  reportingRangeFromPreset,
  startOfDay,
  type BillsFilter,
  type ComparisonId,
  type DatePresetId,
  type PerformanceFiltersState,
} from '@/restaurant/pages/dashboard/overview/performanceFilterModel'
import { cn } from '@/lib/utils'

function formatRhsShort(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d)
}

function formatRhsLong(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

function formatDayMonth(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

function formatCustomOptionLabel(from: Date, to: Date): string {
  if (isSameDay(from, to)) return `Custom · ${formatDayMonth(from)}`
  return `Custom · ${formatDayMonth(from)} – ${formatDayMonth(to)}`
}

function normalizeRange(range: DateRange | undefined): { from: Date; to: Date } | null {
  if (!range?.from) return null
  const rawTo = range.to ?? range.from
  const a = startOfDay(range.from)
  const b = startOfDay(rawTo)
  return a <= b ? { from: a, to: b } : { from: b, to: a }
}

const DATE_OPTIONS: { id: Exclude<DatePresetId, 'custom'>; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This week' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-3-months', label: 'Last 3 months' },
]

const COMPARISON_LABELS: Record<ComparisonId, string> = {
  'prior-day': 'Prior to day',
  'prior-sunday': 'Prior to Sunday',
  'four-weeks': '4 weeks prior',
  'fifty-two-weeks': '52 weeks prior',
  'prior-year': 'Prior to year',
}

const nativeCompactBase = cn(
  'shrink-0 [&_select]:h-8 [&_select]:min-h-8 [&_select]:min-w-0 [&_select]:rounded-full [&_select]:border-border [&_select]:bg-background [&_select]:py-0 [&_select]:pl-2.5 [&_select]:pr-7 [&_select]:text-[11px] [&_select]:font-medium [&_select]:leading-tight [&_select]:text-foreground',
  '[&_[data-slot=native-select-icon]]:right-2 [&_[data-slot=native-select-icon]]:size-3.5',
)

const intrinsicNativePillClass = cn(
  nativeCompactBase,
  'w-fit max-w-[min(100%,90vw)] [&_select]:field-sizing-content',
)

const comparisonTriggerClass = cn(
  'h-8 min-h-8 w-fit max-w-[min(100%,90vw)] min-w-0 gap-1 shrink-0 rounded-full border-border bg-background px-2.5 py-0 text-[11px] font-medium text-foreground shadow-none',
  '[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:opacity-70',
)

/** Matches Menus “Channels” filter — muted label + value + chevron in a rounded control. */
const billsFilterTriggerClass = cn(
  'h-10 min-h-10 w-fit max-w-[min(100%,12rem)] shrink-0 items-center justify-start gap-1 rounded-xl border-border bg-background ps-3 pe-2 py-0 text-[13px] font-semibold text-foreground shadow-none',
  '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
)

function useTwoCalendarMonths(): boolean {
  const [two, setTwo] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width:640px)')
    function sync() {
      setTwo(mq.matches)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return two
}

export function PerformanceOverviewFilters({
  filters,
  onFiltersChange,
}: {
  filters: PerformanceFiltersState
  onFiltersChange: React.Dispatch<React.SetStateAction<PerformanceFiltersState>>
}) {
  const anchor = filters.rangeTo
  const twoMonths = useTwoCalendarMonths()
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(() => ({
    from: filters.rangeFrom,
    to: filters.rangeTo,
  }))

  React.useEffect(() => {
    if (calendarOpen) {
      setDraftRange({ from: filters.rangeFrom, to: filters.rangeTo })
    }
  }, [calendarOpen, filters.rangeFrom, filters.rangeTo])

  function applyDatePreset(preset: Exclude<DatePresetId, 'custom'>) {
    const { from, to } = reportingRangeFromPreset(preset)
    onFiltersChange((s) => ({
      ...s,
      datePreset: preset,
      rangeFrom: from,
      rangeTo: to,
    }))
    setCalendarOpen(false)
  }

  const dateSelectValue =
    filters.datePreset !== 'custom' ? `preset:${filters.datePreset}` : 'preset:custom'

  function onDateSelectChange(value: string) {
    if (!value.startsWith('preset:')) return
    const key = value.slice('preset:'.length)
    if (key === 'custom') {
      setCalendarOpen(true)
      onFiltersChange((s) => ({
        ...s,
        datePreset: 'custom',
      }))
      return
    }
    applyDatePreset(key as Exclude<DatePresetId, 'custom'>)
  }

  function applyCustomRange() {
    const next = normalizeRange(draftRange)
    if (!next) return
    onFiltersChange((s) => ({
      ...s,
      datePreset: 'custom',
      rangeFrom: next.from,
      rangeTo: next.to,
    }))
    setCalendarOpen(false)
  }

  const draftComplete = Boolean(draftRange?.from && draftRange?.to)

  const billsLabels: Record<BillsFilter, string> = {
    all: 'All',
    open: 'Open',
    closed: 'Closed',
  }

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverAnchor asChild>
          <div className="flex items-center gap-1">
            <NativeSelect
              size="sm"
              aria-label="Reporting period"
              className={intrinsicNativePillClass}
              value={dateSelectValue}
              onChange={(e) => onDateSelectChange(e.target.value)}
            >
              {DATE_OPTIONS.map((row) => (
                <NativeSelectOption key={row.id} value={`preset:${row.id}`}>
                  {row.label}
                </NativeSelectOption>
              ))}
              <NativeSelectOption value="preset:custom">
                {formatCustomOptionLabel(filters.rangeFrom, filters.rangeTo)}
              </NativeSelectOption>
            </NativeSelect>
            {filters.datePreset === 'custom' ? (
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="size-8 shrink-0 rounded-full border-border"
                aria-label="Choose date range"
                onClick={() => setCalendarOpen((o) => !o)}
              >
                <CalendarDaysIcon className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-max max-w-[calc(100vw-1rem)] p-3"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex w-max max-w-full flex-col gap-2">
            <p className="text-[13px] font-medium text-foreground">Custom date range</p>
            <Calendar
              mode="range"
              selected={draftRange}
              onSelect={setDraftRange}
              numberOfMonths={twoMonths ? 2 : 1}
              defaultMonth={draftRange?.from ?? filters.rangeFrom}
              className="rounded-lg border border-border p-1.5"
            />
            <div className="flex justify-end gap-2 border-t border-border pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCalendarOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={!draftComplete} onClick={applyCustomRange}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Select
        value={filters.comparisonId}
        onValueChange={(v) =>
          onFiltersChange((s) => ({
            ...s,
            comparisonId: v as ComparisonId,
          }))
        }
      >
        <SelectTrigger size="sm" aria-label="Comparison period" className={comparisonTriggerClass}>
          <SelectValue>
            <span className="truncate">
              vs · {COMPARISON_LABELS[filters.comparisonId]}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" position="popper" className="min-w-[240px]">
          <SelectGroup>
            <SelectLabel className="text-[11px]">Recent</SelectLabel>
            <SelectItem value="prior-day" textValue="Prior to day">
              <span className="flex w-full items-center justify-between gap-3 text-[13px]">
                <span className="font-medium">vs · Prior to day</span>
                <span className="text-[11px] font-normal text-muted-foreground tabular-nums">
                  {formatRhsShort(deriveComparisonDate(anchor, 'prior-day'))}
                </span>
              </span>
            </SelectItem>
            <SelectItem value="prior-sunday" textValue="Prior to Sunday">
              <span className="flex w-full items-center justify-between gap-3 text-[13px]">
                <span className="font-medium">vs · Prior to Sunday</span>
                <span className="text-[11px] font-normal text-muted-foreground tabular-nums">
                  {formatRhsShort(deriveComparisonDate(anchor, 'prior-sunday'))}
                </span>
              </span>
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel className="text-[11px]">Weeks</SelectLabel>
            <SelectItem value="four-weeks" textValue="4 weeks prior">
              <span className="flex w-full items-center justify-between gap-3 text-[13px]">
                <span className="font-medium">vs · 4 weeks prior</span>
                <span className="text-[11px] font-normal text-muted-foreground tabular-nums">
                  {formatRhsShort(deriveComparisonDate(anchor, 'four-weeks'))}
                </span>
              </span>
            </SelectItem>
            <SelectItem value="fifty-two-weeks" textValue="52 weeks prior">
              <span className="flex w-full items-center justify-between gap-3 text-[13px]">
                <span className="font-medium">vs · 52 weeks prior</span>
                <span className="text-[11px] font-normal text-muted-foreground tabular-nums">
                  {formatRhsLong(deriveComparisonDate(anchor, 'fifty-two-weeks'))}
                </span>
              </span>
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel className="text-[11px]">Year</SelectLabel>
            <SelectItem value="prior-year" textValue="Prior to year">
              <span className="flex w-full items-center justify-between gap-3 text-[13px]">
                <span className="font-medium">vs · Prior to year</span>
                <span className="text-[11px] font-normal text-muted-foreground tabular-nums">
                  {formatRhsLong(deriveComparisonDate(anchor, 'prior-year'))}
                </span>
              </span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={filters.billsFilter}
        onValueChange={(v) =>
          onFiltersChange((s) => ({
            ...s,
            billsFilter: v as BillsFilter,
          }))
        }
      >
        <SelectTrigger size="sm" aria-label="Bill status filter" className={billsFilterTriggerClass}>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 font-medium text-muted-foreground">Bills</span>
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent align="start" position="popper">
          {(['all', 'open', 'closed'] as const).map((key) => (
            <SelectItem key={key} value={key} textValue={`Bills ${billsLabels[key]}`}>
              {billsLabels[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
