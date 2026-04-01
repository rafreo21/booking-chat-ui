import { MAPS_URL } from '../figma/assets'
import { GoogleMapsPin } from './GoogleMapsPin'

const fab =
  'group fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-40 flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-[15px] font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-50 hover:shadow-lg active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:py-3'

/** Square secondary — matches Book Now height & corner radius. */
const iconOnly =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'

export function GetDirectionsFab() {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={fab}
    >
      <GoogleMapsPin />
      <span className="whitespace-nowrap">Get direction</span>
    </a>
  )
}

/** Map pin only — pairs with Book Now on onboarding. */
export function GetDirectionsIconLink({
  className = '',
}: {
  className?: string
}) {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${iconOnly} ${className}`.trim()}
      aria-label="Open directions in Google Maps"
    >
      <GoogleMapsPin />
    </a>
  )
}
