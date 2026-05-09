type Props = {
  /** Opaque token shown on the confirmation card (not the internal row id). */
  manageToken: string
  guests: number
  dateLabel: string
  timeLabel: string
  onCustomize: () => void
  onSkip: () => void
}

const btnPrimary =
  'w-full min-h-[48px] rounded-full bg-neutral-950 px-4 text-[15px] font-semibold text-white shadow-sm transition-[colors,box-shadow,transform] duration-200 ease-out press:bg-neutral-700 press:shadow-md active:bg-neutral-900 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'

const btnGhost =
  'w-full min-h-[44px] rounded-full border border-transparent px-4 text-[15px] font-semibold text-neutral-700 transition-colors duration-200 ease-out press:bg-neutral-100 active:bg-neutral-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2'

const shell =
  'relative z-[1] flex h-[min(400px,52svh)] min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50/80 shadow-sm sm:h-[min(460px,56svh)]'

const scrollBody =
  'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 [-webkit-overflow-scrolling:touch] touch-pan-y sm:px-5 sm:pb-6 sm:pt-5'

/**
 * Post-booking optional CTA — reassuring copy, non-blocking.
 * Outer shell clips rounded corners; inner body scrolls (Safari-friendly flex + min-h-0 pattern).
 */
export function BookingConfirmationCta({
  manageToken,
  guests,
  dateLabel,
  timeLabel,
  onCustomize,
  onSkip,
}: Props) {
  return (
    <section className={shell} aria-labelledby="post-booking-custom-heading">
      <div className={scrollBody}>
        <p className="text-center text-[13px] font-semibold uppercase tracking-wide text-neutral-500">
          Your table is booked
        </p>
        <h2
          id="post-booking-custom-heading"
          className="mt-2 text-center text-[1.125rem] font-bold leading-snug text-neutral-950 sm:text-[1.25rem]"
        >
          Want to help us prepare for your arrival?
        </h2>
        <p className="mx-auto mt-2 max-w-[28rem] text-center text-[14px] leading-relaxed text-neutral-600">
          You can pre-select dishes for your table now, or do this later.{' '}
          <span className="font-medium text-neutral-800">This step is optional.</span>
        </p>
        <dl className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 border-y border-neutral-200/80 py-3 text-[13px] text-neutral-600">
          <div>
            <dt className="inline font-medium text-neutral-500">Guests </dt>
            <dd className="inline font-semibold text-neutral-900">{guests}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-neutral-500">Date </dt>
            <dd className="inline font-semibold text-neutral-900">{dateLabel}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-neutral-500">Time </dt>
            <dd className="inline font-semibold text-neutral-900">{timeLabel}</dd>
          </div>
        </dl>
        <p className="mt-3 text-center text-[12px] text-neutral-500">
          Reference{' '}
          <span className="font-mono font-medium text-neutral-700">{manageToken.slice(0, 12)}…</span>
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button type="button" className={btnPrimary} onClick={onCustomize}>
            Customize your dining experience
          </button>
          <p className="text-center text-[13px] font-medium leading-snug text-neutral-600">
            Pre-select dishes for your table · Help us prepare for your arrival
          </p>
          <button type="button" className={btnGhost} onClick={onSkip}>
            Maybe later — I&apos;m done
          </button>
        </div>
      </div>
    </section>
  )
}
