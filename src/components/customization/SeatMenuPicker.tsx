import { useEffect, useMemo, useState } from 'react'
import type { GuestSeat, MenuItem } from '../../types/bookingCustomization'

type Props = {
  items: MenuItem[]
  activeSeat: GuestSeat
  maxSelectablePerSeat: number
  onToggleItem: (seatIndex: number, menuItemId: string, selected: boolean) => void
  /** Items per pagination page. Defaults to 4 (4×1 grid). */
  pageSize?: number
}

const pill =
  'rounded-xl border-2 px-3 py-2.5 text-left text-[14px] font-semibold transition-[colors,box-shadow,border-color,transform] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

const badgeCls =
  'rounded-full border border-neutral-400/80 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-700'

const arrowBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-[14px] font-semibold text-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-[colors,border-color] duration-200 ease-out press:border-neutral-400 press:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

function formatPrice(priceCents: number | undefined): string | null {
  if (typeof priceCents !== 'number' || !Number.isFinite(priceCents)) return null
  return gbp.format(priceCents / 100)
}

export function SeatMenuPicker({
  items,
  activeSeat,
  maxSelectablePerSeat,
  onToggleItem,
  pageSize = 4,
}: Props) {
  const count = activeSeat.selectedMenuItemIds.length
  const atCap = count >= maxSelectablePerSeat

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [items])

  const safePage = Math.min(Math.max(1, page), pageCount)
  const startIndex = (safePage - 1) * pageSize
  const visibleItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize],
  )

  const showPagination = pageCount > 1
  const canPrev = safePage > 1
  const canNext = safePage < pageCount

  const seatLabel = (
    <>
      Tap to add or remove for{' '}
      <span className="font-semibold text-neutral-900">
        Seat {activeSeat.seatIndex}
        {activeSeat.displayName.trim() &&
        activeSeat.displayName.trim() !== `Guest ${activeSeat.seatIndex}`
          ? ` (${activeSeat.displayName.trim()})`
          : ''}
      </span>
      .{' '}
      <span className="tabular-nums text-neutral-500">
        {count}/{maxSelectablePerSeat} dishes
      </span>
    </>
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="min-w-0 text-[13px] text-neutral-600">{seatLabel}</p>
        {showPagination ? (
          <div
            className="flex shrink-0 items-center gap-2"
            role="navigation"
            aria-label="Menu pagination"
          >
            <button
              type="button"
              className={arrowBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              aria-label="Previous page"
            >
              <span aria-hidden>←</span>
            </button>
            <span
              className="tabular-nums text-[12px] font-semibold text-neutral-700"
              aria-live="polite"
            >
              {safePage} / {pageCount}
            </span>
            <button
              type="button"
              className={arrowBtn}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={!canNext}
              aria-label="Next page"
            >
              <span aria-hidden>→</span>
            </button>
          </div>
        ) : null}
      </div>
      {atCap ? (
        <p className="text-[12px] font-medium text-amber-900">
          Maximum dishes reached for this seat — remove one to add another.
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {visibleItems.map((item) => {
          const selected = activeSeat.selectedMenuItemIds.includes(item.id)
          const blocked = !selected && atCap
          const price = formatPrice(item.priceCents)
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selected}
                aria-disabled={blocked}
                disabled={blocked}
                className={
                  pill +
                  ' h-full w-full ' +
                  (selected
                    ? ' border-neutral-950 bg-neutral-950 text-white shadow-md press:bg-neutral-800 active:scale-[0.99]'
                    : blocked
                      ? ' cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                      : ' border-neutral-200 bg-white text-neutral-950 shadow-[0_1px_3px_rgba(0,0,0,0.06)] press:border-neutral-400 press:bg-neutral-200 active:scale-[0.99]')
                }
                onClick={() => {
                  if (blocked) return
                  onToggleItem(activeSeat.seatIndex, item.id, !selected)
                }}
              >
                <span className="block">{item.name}</span>
                {price ? (
                  <span
                    className={
                      'mt-1 block tabular-nums text-[13px] font-bold ' +
                      (selected ? 'text-white' : 'text-neutral-900')
                    }
                  >
                    {price}
                  </span>
                ) : null}
                {item.description ? (
                  <span
                    className={
                      'mt-1 block text-[12px] font-normal ' +
                      (selected ? 'text-white/85' : 'text-neutral-600')
                    }
                  >
                    {item.description}
                  </span>
                ) : null}
                {item.dietaryTags && item.dietaryTags.length > 0 ? (
                  <span className="mt-2 flex flex-wrap gap-1">
                    {item.dietaryTags.map((tag) => (
                      <span key={tag} className={badgeCls}>
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-[14px] text-neutral-600">
          No dishes in this category yet.
        </p>
      ) : null}
    </div>
  )
}
