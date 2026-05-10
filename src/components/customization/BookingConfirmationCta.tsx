import { Button } from '@/components/ui/button'

type Props = {
  /** Opaque token shown on the confirmation card (not the internal row id). */
  manageToken: string
  guests: number
  dateLabel: string
  timeLabel: string
  onCustomize: () => void
  onSkip: () => void
}

const shell =
  'relative z-[1] flex h-[min(400px,52svh)] min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 shadow-sm ring-1 ring-border sm:h-[min(460px,56svh)]'

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
        <p className="text-center text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your table is booked
        </p>
        <h2
          id="post-booking-custom-heading"
          className="mt-2 text-center text-[1.125rem] font-bold leading-snug text-foreground sm:text-[1.25rem]"
        >
          Want to help us prepare for your arrival?
        </h2>
        <p className="mx-auto mt-2 max-w-[28rem] text-center text-[14px] leading-relaxed text-muted-foreground">
          You can pre-select dishes for your table now, or do this later.{' '}
          <span className="font-medium text-foreground">This step is optional.</span>
        </p>
        <dl className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 border-y border-border py-3 text-[13px] text-muted-foreground">
          <div>
            <dt className="inline font-medium text-muted-foreground">Guests </dt>
            <dd className="inline font-semibold text-foreground">{guests}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-muted-foreground">Date </dt>
            <dd className="inline font-semibold text-foreground">{dateLabel}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-muted-foreground">Time </dt>
            <dd className="inline font-semibold text-foreground">{timeLabel}</dd>
          </div>
        </dl>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          Reference{' '}
          <span className="font-mono font-medium text-foreground">{manageToken.slice(0, 12)}…</span>
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-full text-[15px] font-semibold"
            onClick={onCustomize}
          >
            Customize your dining experience
          </Button>
          <p className="text-center text-[13px] font-medium leading-snug text-muted-foreground">
            Pre-select dishes for your table · Help us prepare for your arrival
          </p>
          <Button type="button" variant="ghost" size="lg" className="h-11 w-full rounded-full text-[15px] font-semibold" onClick={onSkip}>
            Maybe later — I&apos;m done
          </Button>
        </div>
      </div>
    </section>
  )
}
