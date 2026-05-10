import { CheckCircle2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type Props = {
  /** Opaque token shown on the confirmation card (not the internal row id). */
  manageToken: string
  guests: number
  dateLabel: string
  timeLabel: string
  onCustomize: () => void
  onSkip: () => void
}

/**
 * Post-booking optional CTA — reassuring copy, non-blocking.
 * Lays out inline in the chat scroll area (no outer card); separators divide sections.
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
    <section className="w-full space-y-0" aria-labelledby="post-booking-custom-heading">
      <div className="flex flex-col items-center gap-2 px-0 pt-1">
        <CheckCircle2Icon
          className="size-10 shrink-0 text-emerald-600 dark:text-emerald-500"
          aria-hidden
        />
        <p className="text-center text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your table is booked
        </p>
        <h2
          id="post-booking-custom-heading"
          className="mt-1 text-center text-[1.125rem] font-bold leading-snug text-foreground sm:text-[1.25rem]"
        >
          Want to help us prepare for your arrival?
        </h2>
        <p className="mx-auto max-w-[28rem] text-center text-[14px] leading-relaxed text-muted-foreground">
          You can pre-select dishes for your table now, or do this later.{' '}
          <span className="font-medium text-foreground">This step is optional.</span>
        </p>
      </div>

      <Separator className="my-4" />

      <dl className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[13px] text-muted-foreground">
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

      <Separator className="my-4" />

      <p className="text-center text-[12px] text-muted-foreground">
        Reference{' '}
        <span className="font-mono font-medium text-foreground">{manageToken.slice(0, 12)}…</span>
      </p>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2.5">
        <Button type="button" size="lg" className="w-full whitespace-normal py-2 text-center leading-snug" onClick={onCustomize}>
          Customize your dining experience
        </Button>
        <p className="text-center text-[13px] font-medium leading-snug text-muted-foreground">
          Pre-select dishes for your table · Help us prepare for your arrival
        </p>
        <Button type="button" variant="ghost" size="lg" className="w-full whitespace-normal py-2 text-center leading-snug" onClick={onSkip}>
          Maybe later — I&apos;m done
        </Button>
      </div>
    </section>
  )
}
