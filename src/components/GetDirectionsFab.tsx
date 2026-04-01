import { MAPS_URL } from '../figma/assets'
import { GoogleMapsPin } from './GoogleMapsPin'

const btn =
  'group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-[33px] border border-white/50 bg-white/90 px-[18px] py-3 shadow-md backdrop-blur-md transition will-change-transform hover:bg-white hover:shadow-lg active:scale-[0.97] active:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 md:bottom-8 md:right-8'

export function GetDirectionsFab() {
  return (
    <a
      href={MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={btn}
    >
      <GoogleMapsPin />
      <span className="whitespace-nowrap text-[15px] font-semibold text-[#494949]">
        Get direction
      </span>
    </a>
  )
}
