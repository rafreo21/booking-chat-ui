import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, CreditCardIcon, PencilLineIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AiChatbotLogo } from '../components/AiChatbotLogo'
import { CustomizationSummary } from '../components/customization/CustomizationSummary'
import { useReservationRouteLoad } from '../hooks/useReservationRouteLoad'
import { reconcileGuestSeats } from '../lib/reconcileGuestSeats'
import { reservationCustomizePath } from '../lib/reservationUrls'
import {
  MissingReservationRef,
  PAGE_BG_CLASS,
  PAGE_SHELL_CLASS,
  ReservationLoadingSkeleton,
  ReservationMessageCard,
  formatBookingDate,
} from './reservationShell'

const MEAL_PAYMENT_URL = import.meta.env.VITE_MEAL_PAYMENT_URL?.trim()

export function ReservationPreviewPage() {
  const { reservationId: reservationIdParam } = useParams<{ reservationId: string }>()
  const publicRef = reservationIdParam ? decodeURIComponent(reservationIdParam) : null
  const navigate = useNavigate()
  const [payInfoOpen, setPayInfoOpen] = useState(false)

  const { loadStatus, reservation, customization, loadError } = useReservationRouteLoad(publicRef)

  if (!publicRef) {
    return <MissingReservationRef />
  }

  if (loadStatus === 'loading') {
    return <ReservationLoadingSkeleton />
  }

  if (loadStatus === 'error' || !reservation) {
    return (
      <ReservationMessageCard
        title="Reservation not found"
        body={
          loadError ??
          "We couldn't find a booking for this link. Check the URL or start a new reservation."
        }
        cta={{ to: '/', label: 'Start a new booking' }}
      />
    )
  }

  const customizeTo = reservationCustomizePath(reservation.manageToken)
  const previewSeats = reconcileGuestSeats(reservation, customization)

  return (
    <div className={PAGE_BG_CLASS}>
      <div className={PAGE_SHELL_CLASS}>
        <div className="flex flex-col gap-4 md:gap-6">
          <Button
            type="button"
            variant="ghost"
            size="default"
            className="-ml-2 h-9 w-fit self-start gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeftIcon />
            Back
          </Button>

          <Card>
            <CardHeader className="gap-0 space-y-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Your reservation
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <CardTitle className="text-lg sm:text-xl">{reservation.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {reservation.guests} guest{reservation.guests === 1 ? '' : 's'} ·{' '}
                      {formatBookingDate(reservation.dateIso)} · {reservation.time || '—'}
                    </CardDescription>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    Choose how you&apos;d like to continue — prepay when available, or adjust dish
                    preferences for each guest.
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <AiChatbotLogo />
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10">
            <div className="flex min-w-0 flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg tracking-tight">Dining experience preview</CardTitle>
                  <CardDescription className="text-[14px] leading-relaxed">
                    A quick snapshot of saved preferences. Select{' '}
                    <span className="font-medium text-foreground">Edit dining experience</span> to
                    change dishes, seats, or notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CustomizationSummary seats={previewSeats} />

                  {customization?.notes?.trim() ? (
                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-muted/15">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Notes for the restaurant
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {customization.notes.trim()}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {MEAL_PAYMENT_URL ? (
                      <Button size="lg" className="h-12 min-w-[200px] gap-2 text-[15px] font-semibold" asChild>
                        <a href={MEAL_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
                          <CreditCardIcon className="size-4" aria-hidden />
                          Pay for whole meal
                        </a>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="lg"
                        className="h-12 min-w-[200px] gap-2 text-[15px] font-semibold"
                        onClick={() => setPayInfoOpen(true)}
                      >
                        <CreditCardIcon className="size-4" aria-hidden />
                        Pay for whole meal
                      </Button>
                    )}
                    <Button size="lg" variant="secondary" className="h-12 min-w-[200px] gap-2 text-[15px] font-semibold" asChild>
                      <Link to={customizeTo}>
                        <PencilLineIcon className="size-4" aria-hidden />
                        Edit dining experience
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <aside className="lg:sticky lg:top-4 lg:self-start" aria-label="Quick tips">
              <Card className="border-dashed bg-muted/20 dark:bg-muted/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">From your email</CardTitle>
                  <CardDescription className="text-[13px] leading-relaxed">
                    This page opens when you use your confirmation link. You can return here anytime
                    from the same URL — updates sync after you save on the edit screen.
                  </CardDescription>
                </CardHeader>
              </Card>
            </aside>
          </div>
        </div>
      </div>

      <Dialog open={payInfoOpen} onOpenChange={setPayInfoOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay for your meal</DialogTitle>
            <DialogDescription className="text-[14px] leading-relaxed">
              Online prepayment isn&apos;t available here yet. The restaurant will share payment options
              by email, or you can complete payment when you arrive.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
