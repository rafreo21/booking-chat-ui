import type { GuestSeat, MenuItem } from '../../types/bookingCustomization'

type Props = {
  items: MenuItem[]
  activeSeat: GuestSeat
  maxSelectablePerSeat: number
  onToggleItem: (seatIndex: number, menuItemId: string, selected: boolean) => void
}

const pill =
  'rounded-xl border-2 px-3 py-2.5 text-left text-[14px] font-semibold transition-[colors,box-shadow,border-color,transform] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

const badgeCls =
  'rounded-full border border-neutral-400/80 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-700'

export function SeatMenuPicker({
  items,
  activeSeat,
  maxSelectablePerSeat,
  onToggleItem,
}: Props) {
  const count = activeSeat.selectedMenuItemIds.length
  const atCap = count >= maxSelectablePerSeat

  return (
    <div className="space-y-2">
      <p className="text-[13px] text-neutral-600">
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
      </p>
      {atCap ? (
        <p className="text-[12px] font-medium text-amber-900">
          Maximum dishes reached for this seat — remove one to add another.
        </p>
      ) : null}
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const selected = activeSeat.selectedMenuItemIds.includes(item.id)
          const blocked = !selected && atCap
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selected}
                aria-disabled={blocked}
                disabled={blocked}
                className={
                  pill +
                  ' w-full ' +
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
                {item.description ? (
                  <span
                    className={
                      'mt-0.5 block text-[12px] font-normal ' +
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
