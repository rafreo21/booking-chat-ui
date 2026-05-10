import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GuestSeat } from '../../types/bookingCustomization'
import { PILL_TAB_TRIGGER_CLASS, PILL_TABS_LIST_CLASS } from './pillTabStyles'

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

      <Tabs
        value={String(activeSeatIndex)}
        onValueChange={(v) => onSelectSeat(Number.parseInt(v, 10))}
        className="w-full min-w-0"
      >
        <TabsList className={PILL_TABS_LIST_CLASS} aria-label="Active seat">
          {seats.map((s) => (
            <TabsTrigger
              key={s.seatIndex}
              value={String(s.seatIndex)}
              className={PILL_TAB_TRIGGER_CLASS}
            >
              Seat {s.seatIndex}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {active ? (
        <div className="grid gap-1.5">
          <Label htmlFor={`seat-name-${active.seatIndex}`} className="text-[13px] font-semibold">
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
