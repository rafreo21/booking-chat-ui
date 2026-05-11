import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingChatView } from '../booking/BookingChatView'
import { OnboardingScreen } from '../onboarding/OnboardingScreen'
import {
  guestBookingHomeHref,
  isSplitDevShell,
  restaurantDashboardHref,
  restaurantLoginHref,
  currentOriginHref,
} from '@/lib/appShell'

/**
 * Full-screen crossfade: chat sits under an onboarding curtain (~640ms ease).
 * Curtain stays opaque (`bg-muted`) so the chat surface doesn’t show through rounded corners.
 */
const curtainLayer =
  'absolute inset-0 z-[2] min-h-dvh overflow-hidden bg-muted transform-gpu transition-opacity duration-[640ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:duration-[180ms] motion-reduce:ease-linear'

export function HomePage() {
  const [chatPrimed, setChatPrimed] = useState(false)
  const [onboardingCoverOn, setOnboardingCoverOn] = useState(true)

  const goToChat = useCallback(() => {
    setChatPrimed(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOnboardingCoverOn(false))
    })
  }, [])

  const goToOnboarding = useCallback(() => {
    setOnboardingCoverOn(true)
  }, [])

  const guestUrl = guestBookingHomeHref()
  const restaurantLoginUrl = restaurantLoginHref()
  const restaurantDashboardUrl = restaurantDashboardHref()

  return (
    <div className="relative min-h-dvh overflow-hidden bg-muted/40">
      {chatPrimed ? (
        <div
          className={`absolute inset-0 z-[1] min-h-dvh${onboardingCoverOn ? ' pointer-events-none select-none' : ''}`}
          aria-hidden={onboardingCoverOn}
        >
          <BookingChatView onBack={goToOnboarding} />
        </div>
      ) : null}

      <div
        className={`${curtainLayer} ${
          onboardingCoverOn
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!onboardingCoverOn}
      >
        <OnboardingScreen onBookNow={goToChat} />
      </div>

      {import.meta.env.DEV ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto max-w-full rounded-2xl border border-border bg-card/95 px-4 py-2.5 text-center shadow-sm ring-1 ring-border backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Local dev · quick links
            </p>
            <p className="mt-0.5 max-w-[28rem] text-[10px] leading-snug text-muted-foreground">
              {isSplitDevShell()
                ? 'Split shells on — guest vs restaurant use different origins from env.'
                : `Same server as npm run dev (${currentOriginHref() || '…'}) — restaurant has no separate port.`}
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px]">
              <span className="text-muted-foreground">Guest:</span>
              {isSplitDevShell() ? (
                <a className="font-mono font-medium text-primary underline-offset-2 hover:underline" href={guestUrl}>
                  {guestUrl === '/' ? '/' : guestUrl.replace(/\/$/, '')}
                </a>
              ) : (
                <Link className="font-mono font-medium text-primary underline-offset-2 hover:underline" to="/">
                  /
                </Link>
              )}
              <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                ·
              </span>
              {isSplitDevShell() ? (
                <a
                  className="font-semibold text-foreground underline-offset-2 hover:underline"
                  href={restaurantLoginUrl}
                >
                  Restaurant login
                </a>
              ) : (
                <Link className="font-semibold text-foreground underline-offset-2 hover:underline" to="/restaurant/login">
                  Restaurant login
                </Link>
              )}
              <span className="text-muted-foreground">·</span>
              {isSplitDevShell() ? (
                <a
                  className="font-medium text-muted-foreground underline-offset-2 hover:underline"
                  href={restaurantDashboardUrl}
                >
                  Dashboard
                </a>
              ) : (
                <Link
                  className="font-medium text-muted-foreground underline-offset-2 hover:underline"
                  to="/restaurant/dashboard"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
