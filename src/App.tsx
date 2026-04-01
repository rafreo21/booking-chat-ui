import { useState } from 'react'
import { BookingChatView } from './BookingChatView'
import { OnboardingScreen } from './OnboardingScreen'

export default function App() {
  const [screen, setScreen] = useState<'onboarding' | 'chat'>('onboarding')

  return screen === 'onboarding' ? (
    <OnboardingScreen onBookNow={() => setScreen('chat')} />
  ) : (
    <BookingChatView onBack={() => setScreen('onboarding')} />
  )
}
