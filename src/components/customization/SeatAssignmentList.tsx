import type { GuestSeat } from '../../types/bookingCustomization'

type Props = {
  seats: GuestSeat[]
  activeSeatIndex: number
  onSelectSeat: (seatIndex: number) => void
  onSeatNameChange: (seatIndex: number, displayName: string) => void
}

const chip =
  'min-h-11 min-w-[4.5rem] shrink-0 rounded-full border px-3.5 text-[13px] font-semibold transition-[colors,box-shadow,border-color,transform] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1'

const chipOn =
  'border-neutral-950 bg-neutral-950 text-white shadow-md press:bg-neutral-800 active:scale-[0.98]'
const chipOff =
  'border-neutral-200 bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)] press:border-neutral-400 press:bg-neutral-200 active:scale-[0.98]'

const inputCls =
  'mt-2 w-full rounded-xl border-2 border-neutral-200 bg-white px-3 py-2.5 text-[15px] text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10'

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
        <h3 className="text-[15px] font-bold text-neutral-950">Seats</h3>
        <p className="mt-0.5 text-[13px] text-neutral-600">
          Tap a seat to add dishes. Names are optional.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {seats.map((s) => (
          <button
            key={s.seatIndex}
            type="button"
            className={`${chip} ${s.seatIndex === activeSeatIndex ? chipOn : chipOff}`}
            onClick={() => onSelectSeat(s.seatIndex)}
            aria-pressed={s.seatIndex === activeSeatIndex}
          >
            Seat {s.seatIndex}
          </button>
        ))}
      </div>
      {active ? (
        <div>
          <label
            htmlFor={`seat-name-${active.seatIndex}`}
            className="text-[13px] font-semibold text-neutral-700"
          >
            Name for Seat {active.seatIndex}{' '}
            <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            id={`seat-name-${active.seatIndex}`}
            type="text"
            autoComplete="name"
            placeholder={`e.g. ${active.displayName}`}
            value={active.displayName}
            onChange={(e) => onSeatNameChange(active.seatIndex, e.target.value)}
            className={inputCls}
            maxLength={80}
          />
        </div>
      ) : null}
    </div>
  )
}
