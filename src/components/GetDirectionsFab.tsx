import { MAPS_URL } from '../figma/assets'
import { GoogleMapsPin } from './GoogleMapsPin'

const fab =
  'group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-[33px] border border-white/50 bg-white/90 px-[18px] py-3 shadow-md backdrop-blur-md transition will-change-transform hover:bg-white hover:shadow-lg active:scale-[0.97] active:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 md:bottom-8 md:right-8'

const iconOnly =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white shadow-sm transition will-change-transform hover:border-[#303030]/30 hover:bg-neutral-50 active:scale-[0.98] active:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'

export function GetDirectionsFab() {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={fab}
    >
      <GoogleMapsPin />
      <span className="whitespace-nowrap text-[15px] font-semibold text-[#494949]">
        Get direction
      </span>
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
