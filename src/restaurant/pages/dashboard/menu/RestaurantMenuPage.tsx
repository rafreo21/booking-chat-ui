import { useCallback, useState } from 'react'

import { MenuSyncingLoading } from '@/restaurant/pages/dashboard/menu/MenuSyncingLoading'
import { RestaurantMenuHub, type MenuHubChoice } from '@/restaurant/pages/dashboard/menu/RestaurantMenuHub'
import { RestaurantMenusIndex } from '@/restaurant/pages/dashboard/menu/RestaurantMenusIndex'
import { RestaurantMenuUploadWizard } from '@/restaurant/pages/dashboard/menu/RestaurantMenuUploadWizard'

type ScreenState =
  | { kind: 'hub' }
  | { kind: 'wizard'; intent?: MenuHubChoice }
  | { kind: 'syncing' }
  | { kind: 'menus' }

export function RestaurantMenuPage() {
  const [screen, setScreen] = useState<ScreenState>({ kind: 'hub' })
  const [wizardKey, setWizardKey] = useState(0)

  const launchWizard = useCallback((intent: MenuHubChoice) => {
    setWizardKey((n) => n + 1)
    setScreen({ kind: 'wizard', intent })
  }, [])

  const goHub = useCallback(() => setScreen({ kind: 'hub' }), [])
  const goMenus = useCallback(() => setScreen({ kind: 'menus' }), [])
  const goSyncing = useCallback(() => setScreen({ kind: 'syncing' }), [])

  if (screen.kind === 'wizard') {
    return (
      <RestaurantMenuUploadWizard
        key={wizardKey}
        entryIntent={screen.intent}
        onExit={goHub}
        onFinish={goSyncing}
      />
    )
  }

  if (screen.kind === 'syncing') {
    return <MenuSyncingLoading onComplete={goMenus} />
  }

  if (screen.kind === 'menus') {
    return (
      <RestaurantMenusIndex
        onCreateMenu={() => {
          setWizardKey((n) => n + 1)
          setScreen({ kind: 'wizard' })
        }}
      />
    )
  }

  return <RestaurantMenuHub onChoose={launchWizard} />
}
