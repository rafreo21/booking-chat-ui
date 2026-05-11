import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { guestAppOrigin, restaurantAppOrigin } from '@/lib/appShell'

export function RedirectToRestaurantShell() {
  const loc = useLocation()
  const target = `${restaurantAppOrigin()}${loc.pathname}${loc.search}${loc.hash}`

  useLayoutEffect(() => {
    window.location.replace(target)
  }, [target])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-muted/40 px-4">
      <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-[14px] text-muted-foreground">Opening restaurant console…</p>
    </div>
  )
}

export function RedirectToGuestShell() {
  const loc = useLocation()
  const target = `${guestAppOrigin()}${loc.pathname}${loc.search}${loc.hash}`

  useLayoutEffect(() => {
    window.location.replace(target)
  }, [target])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-muted/40 px-4">
      <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-[14px] text-muted-foreground">Opening guest booking…</p>
    </div>
  )
}
