import { useCallback, useState } from 'react'
import { BookingChatView } from './BookingChatView'
import { OnboardingScreen } from './OnboardingScreen'

/**
 * Apple-style full-screen crossfade: chat under a fading onboarding layer
 * (overlapping opacity, not mount-then-enter). ~640ms + smooth ease.
 */
const curtainLayer =
  'absolute inset-0 z-[2] min-h-dvh transform-gpu transition-opacity duration-[640ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:duration-[180ms] motion-reduce:ease-linear'

export default function App() {
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
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-chat-bg)]">
      {chatPrimed ? (
        <div className="absolute inset-0 z-[1] min-h-dvh">
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
