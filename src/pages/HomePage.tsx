import { useCallback, useState } from 'react'
import { BookingChatView } from '../BookingChatView'
import { OnboardingScreen } from '../OnboardingScreen'

/**
 * Full-screen crossfade: chat sits under an onboarding curtain (~640ms ease).
 * The curtain must stay **opaque** (`bg-muted`). `bg-muted/40` (or any alpha) lets the
 * mounted chat’s gray surfaces show through—often visible under the venue card’s
 * rounded bottom corners after Back from chat.
 */
const curtainLayer =
  'absolute inset-0 z-[2] min-h-dvh overflow-hidden bg-muted transform-gpu transition-opacity duration-[640ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:duration-[180ms] motion-reduce:ease-linear'

export function HomePage() {
  const [chatPrimed, setChatPrimed] = useState(false)
  /** When true, onboarding sits on top at full opacity; false = faded out, chat usable. */
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
    </div>
  )
}
