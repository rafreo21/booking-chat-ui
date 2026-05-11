import { useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GuestSeat, MenuItem } from '../../types/bookingCustomization'

type Props = {
  items: MenuItem[]
  activeSeat: GuestSeat
  maxSelectablePerSeat: number
  onToggleItem: (seatIndex: number, menuItemId: string, selected: boolean) => void
  /** When there are no tiles (PDF-only menu), link to the printable menu. */
  menuPdfUrl?: string
  menuTitle?: string
  /** Items per pagination page. Defaults to 4 (4×1 grid on desktop). */
  pageSize?: number
  /** True when the list is filtered by search — avoids showing the PDF empty state on zero matches. */
  searchActive?: boolean
  /** Guest hid dishes via allergy accordion — tuned empty-state copy. */
  allergyFilterActive?: boolean
}

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
  menuPdfUrl,
  menuTitle,
  pageSize = 4,
  searchActive = false,
  allergyFilterActive = false,
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

  const seatLabel = (
    <>
      Tap to add or remove for{' '}
      <span className="font-semibold text-foreground">
        Seat {activeSeat.seatIndex}
        {activeSeat.displayName.trim() &&
        activeSeat.displayName.trim() !== `Guest ${activeSeat.seatIndex}`
          ? ` (${activeSeat.displayName.trim()})`
          : ''}
      </span>
      .{' '}
      <span className="tabular-nums text-muted-foreground">
        {count}/{maxSelectablePerSeat} dishes
      </span>
    </>
  )

  return (
    <div className="space-y-3">
      {items.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="min-w-0 text-[13px] text-muted-foreground">{seatLabel}</p>
            {showPagination ? (
              <div
                className="flex shrink-0 items-center gap-2"
                role="navigation"
                aria-label="Menu pagination"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon />
                </Button>
                <span
                  className="min-w-[3.5rem] text-center text-xs font-semibold tabular-nums text-foreground"
                  aria-live="polite"
                >
                  {safePage} / {pageCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={safePage >= pageCount}
                  aria-label="Next page"
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            ) : null}
          </div>

          {atCap ? (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
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
                    className={cn(
                      'flex h-full w-full flex-col items-stretch justify-start rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-[colors,box-shadow,border-color,transform] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      selected
                        ? 'border-foreground bg-foreground text-background shadow-md press:bg-foreground/90'
                        : blocked
                          ? 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                          : 'border-border bg-card text-foreground shadow-xs press:border-foreground/50 press:bg-muted active:scale-[0.99]',
                    )}
                    onClick={() => {
                      if (blocked) return
                      onToggleItem(activeSeat.seatIndex, item.id, !selected)
                    }}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="block">{item.name}</span>
                      {price ? (
                        <span
                          className={cn(
                            'shrink-0 text-[13px] font-bold tabular-nums',
                            selected ? 'text-background' : 'text-foreground',
                          )}
                        >
                          {price}
                        </span>
                      ) : null}
                    </span>
                    {item.description ? (
                      <span
                        className={cn(
                          'mt-1 block text-xs font-normal',
                          selected ? 'text-background/80' : 'text-muted-foreground',
                        )}
                      >
                        {item.description}
                      </span>
                    ) : null}
                    {item.dietaryTags && item.dietaryTags.length > 0 ? (
                      <span className="mt-2 flex flex-wrap gap-1">
                        {item.dietaryTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selected ? 'secondary' : 'outline'}
                            className="text-[10px] uppercase tracking-wide"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

      {items.length === 0 ? (
        searchActive ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No dishes match your search — try different words or clear the search box.
          </p>
        ) : allergyFilterActive ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No dishes match your allergy selections in this category — clear allergy pills, choose another
            section, or use the official PDF and add details in{' '}
            <span className="font-semibold text-foreground">Notes</span>. Always confirm with staff on arrival.
          </p>
        ) : menuPdfUrl ? (
          <div className="space-y-3">
            <p className="text-[13px] text-muted-foreground">
              <span className="font-semibold text-foreground">Seat {activeSeat.seatIndex}</span>
              {activeSeat.displayName.trim() &&
              activeSeat.displayName.trim() !== `Guest ${activeSeat.seatIndex}`
                ? ` (${activeSeat.displayName.trim()})`
                : ''}
              {' — '}preferences from this menu go in Notes below.
            </p>
            <div className="rounded-xl border border-dashed border-border bg-muted/25 px-4 py-6 text-center dark:bg-muted/15">
            <p className="text-sm font-medium text-foreground">
              {menuTitle ? `${menuTitle} — PDF menu` : 'PDF menu'}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              There are no quick picks for this menu yet. Open the PDF to browse, then add details in{' '}
              <span className="font-semibold text-foreground">Notes for the restaurant</span>.
            </p>
            <Button variant="secondary" size="sm" className="mt-4 gap-2" asChild>
              <a href={menuPdfUrl} target="_blank" rel="noopener noreferrer">
                Open PDF
                <ExternalLinkIcon className="size-4 opacity-80" aria-hidden />
              </a>
            </Button>
          </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No dishes in this category yet.
          </p>
        )
      ) : null}
    </div>
  )
}
