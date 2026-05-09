import { useMenuCatalog } from '../../menu/useMenuCatalog'
import type { GuestSeat } from '../../types/bookingCustomization'

type Props = {
  seats: GuestSeat[]
}

export function CustomizationSummary({ seats }: Props) {
  const { getMenuItemById } = useMenuCatalog()
  const totalPicks = seats.reduce((acc, s) => acc + s.selectedMenuItemIds.length, 0)

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-[15px] font-bold text-neutral-950">Summary</h3>
      {totalPicks === 0 ? (
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
          No dishes selected yet — add a few preferences so the kitchen can prepare. You can leave this empty if you
          prefer.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {seats.map((seat) => {
            if (seat.selectedMenuItemIds.length === 0) return null
            const nameLabel =
              seat.displayName.trim() && seat.displayName.trim() !== `Guest ${seat.seatIndex}`
                ? seat.displayName.trim()
                : `Seat ${seat.seatIndex}`
            return (
              <li key={seat.seatIndex} className="border-t border-neutral-100 pt-3 first:border-t-0 first:pt-0">
                <p className="text-[13px] font-bold text-neutral-900">{nameLabel}</p>
                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[14px] text-neutral-700">
                  {seat.selectedMenuItemIds.map((id) => {
                    const item = getMenuItemById(id)
                    return (
                      <li key={id}>
                        {item?.name ?? id}
                        {item?.dietaryTags?.length ? (
                          <span className="ml-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                            ({item.dietaryTags.join(', ')})
                          </span>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
