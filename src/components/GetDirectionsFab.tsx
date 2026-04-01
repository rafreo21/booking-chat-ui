import { MAPS_URL } from '../figma/assets'
import { GoogleMapsPin } from './GoogleMapsPin'

const fab =
  'group fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-40 flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-3 py-2 text-sm shadow-md backdrop-blur-md transition will-change-transform hover:bg-white hover:shadow-lg active:scale-[0.97] active:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 sm:bottom-5 sm:right-5 sm:gap-2 sm:rounded-[33px] sm:px-[18px] sm:py-3 md:bottom-8 md:right-8'

const iconOnly =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white shadow-sm transition will-change-transform hover:border-[#303030]/30 hover:bg-neutral-50 active:scale-[0.98] active:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 sm:h-11 sm:w-11'

export function GetDirectionsFab() {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={fab}
    >
      <GoogleMapsPin />
      <span className="whitespace-nowrap text-[13px] font-semibold text-[#494949] sm:text-[15px]">
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
