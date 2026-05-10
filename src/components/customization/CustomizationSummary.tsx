import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useMenuCatalog } from '../../menu/useMenuCatalog'
import type { GuestSeat } from '../../types/bookingCustomization'

type Props = {
  seats: GuestSeat[]
}

export function CustomizationSummary({ seats }: Props) {
  const { getMenuItemById } = useMenuCatalog()
  const totalPicks = seats.reduce((acc, s) => acc + s.selectedMenuItemIds.length, 0)
  const seatsWithPicks = seats.filter((s) => s.selectedMenuItemIds.length > 0)

  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold tracking-tight">Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {totalPicks === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No dishes selected yet — add a few preferences so the kitchen can prepare. You can leave
            this empty if you prefer.
          </p>
        ) : (
          <ul className="space-y-3">
            {seatsWithPicks.map((seat, i) => {
              const nameLabel =
                seat.displayName.trim() && seat.displayName.trim() !== `Guest ${seat.seatIndex}`
                  ? seat.displayName.trim()
                  : `Seat ${seat.seatIndex}`
              return (
                <li key={seat.seatIndex} className="space-y-1.5">
                  {i > 0 ? <Separator className="my-2" /> : null}
                  <p className="text-[13px] font-semibold text-foreground">{nameLabel}</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {seat.selectedMenuItemIds.map((id) => {
                      const item = getMenuItemById(id)
                      return (
                        <li key={id} className="flex flex-wrap items-center gap-1.5">
                          <span className="text-foreground">{item?.name ?? id}</span>
                          {item?.dietaryTags?.length
                            ? item.dietaryTags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-[10px] uppercase tracking-wide"
                                >
                                  {tag}
                                </Badge>
                              ))
                            : null}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
