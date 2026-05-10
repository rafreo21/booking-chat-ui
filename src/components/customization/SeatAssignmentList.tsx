import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { GuestSeat } from '../../types/bookingCustomization'

type Props = {
  seats: GuestSeat[]
  activeSeatIndex: number
  onSelectSeat: (seatIndex: number) => void
  onSeatNameChange: (seatIndex: number, displayName: string) => void
}

export function SeatAssignmentList({
  seats,
  activeSeatIndex,
  onSelectSeat,
  onSeatNameChange,
}: Props) {
  const active = seats.find((s) => s.seatIndex === activeSeatIndex) ?? seats[0]

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">Seats</h3>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Tap a seat to add dishes. Names are optional.
        </p>
      </div>

      <div role="radiogroup" aria-label="Active seat" className="flex flex-wrap gap-2">
        {seats.map((s) => {
          const on = s.seatIndex === activeSeatIndex
          return (
            <Button
              key={s.seatIndex}
              type="button"
              role="radio"
              aria-checked={on}
              variant={on ? 'default' : 'outline'}
              size="lg"
              className={cn(
                'h-10 min-w-[4.5rem] rounded-full px-4 text-[13px] font-semibold',
                on && 'shadow-md',
              )}
              onClick={() => onSelectSeat(s.seatIndex)}
            >
              Seat {s.seatIndex}
            </Button>
          )
        })}
      </div>

      {active ? (
        <div className="grid gap-1.5">
          <Label
            htmlFor={`seat-name-${active.seatIndex}`}
            className="text-[13px] font-semibold"
          >
            Name for Seat {active.seatIndex}{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id={`seat-name-${active.seatIndex}`}
            type="text"
            autoComplete="name"
            placeholder={`e.g. ${active.displayName}`}
            value={active.displayName}
            onChange={(e) => onSeatNameChange(active.seatIndex, e.target.value)}
            maxLength={80}
            className="h-10"
          />
        </div>
      ) : null}
    </div>
  )
}
