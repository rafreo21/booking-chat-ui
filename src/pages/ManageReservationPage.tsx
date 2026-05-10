import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DiningCustomizationFlow } from '../components/customization/DiningCustomizationFlow'
import { AiChatbotLogo } from '../components/AiChatbotLogo'
import { useReservationRouteLoad } from '../hooks/useReservationRouteLoad'
import {
  MissingReservationRef,
  PAGE_BG_CLASS,
  PAGE_SHELL_CLASS,
  ReservationLoadingSkeleton,
  ReservationMessageCard,
  formatBookingDate,
} from './reservationShell'

/**
 * Full dining customization editor — `/reservation/:token/customize`.
 * Landing / email links use `/reservation/:token` (preview) first.
 */

function ManageReservationLoaded({ reservationId }: { reservationId: string }) {
  const navigate = useNavigate()

  const { loadStatus, reservation, customization, loadError } = useReservationRouteLoad(reservationId)

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

  return (
    <div className={PAGE_BG_CLASS}>
      <div className={PAGE_SHELL_CLASS}>
        <div className="flex flex-col gap-4 md:gap-6">
          <Button
            type="button"
            variant="ghost"
            size="default"
            className="-ml-2 h-9 w-fit self-start gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
            Back
          </Button>

          <Card>
            <CardHeader className="gap-0 space-y-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Manage reservation
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <CardTitle className="text-lg sm:text-xl">{reservation.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {reservation.guests} guest{reservation.guests === 1 ? '' : 's'} ·{' '}
                      {formatBookingDate(reservation.dateIso)} · {reservation.time || '—'}
                    </CardDescription>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    Manage code · {reservation.manageToken.slice(0, 10)}…
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <AiChatbotLogo />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="px-4 py-5 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10">
              <DiningCustomizationFlow
                key={`${reservation.id}:${customization?.updatedAt ?? 'none'}`}
                reservation={reservation}
                initialCustomization={customization}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function ManageReservationPage() {
  const { reservationId: reservationIdParam } = useParams<{ reservationId: string }>()
  const reservationId = reservationIdParam ? decodeURIComponent(reservationIdParam) : null

  if (!reservationId) {
    return <MissingReservationRef />
  }

  return <ManageReservationLoaded reservationId={reservationId} />
}
