import { ChevronDownIcon } from 'lucide-react'
import { Collapsible } from 'radix-ui'
import { cn } from '@/lib/utils'
import {
  ALLERGEN_FILTER_OPTIONS,
  type AllergenFilterId,
} from '../../menu/allergenFilters'
import { PILL_CHOICE_BUTTON_CLASS } from './pillTabStyles'

type Props = {
  /** e.g. "Seat 2 · Alex" — scopes allergies to this guest. */
  seatContextLine?: string
  selectedIds: AllergenFilterId[]
  onToggle: (id: AllergenFilterId) => void
  onClearAll: () => void
}

export function MenuAllergenAccordion({
  seatContextLine,
  selectedIds,
  onToggle,
  onClearAll,
}: Props) {
  const selected = new Set(selectedIds)

  return (
    <Collapsible.Root
      defaultOpen={false}
      className="group rounded-xl border border-border bg-muted/35 dark:bg-muted/25"
    >
      <Collapsible.Trigger className="flex w-full items-start justify-between gap-3 rounded-xl px-4 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-foreground">Allergies</span>
          {seatContextLine || selectedIds.length > 0 ? (
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {seatContextLine ? (
                <span className="shrink-0 text-[12px] font-medium text-foreground">{seatContextLine}</span>
              ) : null}
              {selectedIds.length > 0 ? (
                <div
                  className={cn(
                    'flex min-w-0 flex-wrap items-center gap-1.5',
                    'hidden group-data-[state=closed]:flex group-data-[state=open]:hidden',
                  )}
                >
                  {selectedIds.map((id) => {
                    const label = ALLERGEN_FILTER_OPTIONS.find((o) => o.id === id)?.label ?? id
                    return (
                      <span
                        key={id}
                        className="inline-flex max-w-[min(100%,12rem)] truncate rounded-full border border-primary/30 bg-primary/12 px-2 py-0.5 text-[11px] font-semibold leading-tight text-foreground dark:bg-primary/18"
                      >
                        {label}
                      </span>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
          <span
            className={cn(
              'mt-1 block text-[12px] leading-snug text-muted-foreground',
              selectedIds.length > 0 && 'hidden group-data-[state=open]:block',
            )}
          >
            Optional — applies to this guest&apos;s dish list below. Dishes that may contain selected
            allergens are hidden. Always confirm with staff; matching uses menu text when allergen data is
            incomplete.
          </span>
        </span>
        <ChevronDownIcon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="border-t border-border/60 px-4 pb-4 pt-3 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Allergens to avoid">
          {ALLERGEN_FILTER_OPTIONS.map(({ id, label }) => {
            const on = selected.has(id)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                className={cn(
                  PILL_CHOICE_BUTTON_CLASS,
                  'max-w-[min(100%,14rem)] whitespace-normal text-center text-[12px] leading-snug sm:text-[13px]',
                  on &&
                    'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground',
                )}
                onClick={() => onToggle(id)}
              >
                {label}
              </button>
            )
          })}
        </div>
        {selectedIds.length > 0 ? (
          <button
            type="button"
            className="mt-3 text-[12px] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={onClearAll}
          >
            Clear all
          </button>
        ) : null}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
