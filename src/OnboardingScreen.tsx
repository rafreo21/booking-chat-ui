import { ASSETS } from './figma/assets'
import { GetDirectionsIconLink } from './components/GetDirectionsFab'

function StarRow({ filled }: { filled: number }) {
  return (
    <div className="flex gap-1 sm:gap-1.5" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className="size-5 shrink-0 sm:size-6"
          viewBox="0 0 24 24"
          fill={i < filled ? '#EAB308' : 'none'}
          stroke="#EAB308"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M12 3l2.09 4.26L19 8.27l-3.5 3.41L16.18 17 12 14.77 7.82 17 8.5 11.68 5 8.27l4.91-.01L12 3z" />
        </svg>
      ))}
    </div>
  )
}

const bookBtn =
  'relative inline-flex h-10 min-h-10 min-w-0 max-w-[200px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#303030] px-3 text-[13px] font-semibold leading-5 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_-1px_0_0_rgba(0,0,0,0.4)] transition will-change-transform hover:bg-[#3d3d3d] active:scale-[0.98] active:bg-[#252525] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 sm:h-11 sm:min-h-11 sm:w-[200px] sm:flex-none sm:px-4'

type Props = {
  onBookNow: () => void
}

export function OnboardingScreen({ onBookNow }: Props) {
  return (
    <div className="relative min-h-dvh bg-[#ececec]">
      <div className="flex min-h-dvh items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
        <div className="relative w-full max-w-[min(340px,calc(100vw-1.5rem))] rounded-xl border border-white/30 bg-[#f3f3f3]/95 p-2 shadow-sm backdrop-blur-[14px] sm:rounded-2xl sm:p-2.5">
          <div className="relative overflow-hidden rounded-lg border border-white/30 sm:rounded-xl">
            <img
              src={ASSETS.hero}
              alt="Restaurant interior"
              className="aspect-[284/262] max-h-[38vh] w-full object-cover sm:max-h-none"
            />
            <div className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full border border-white/30 bg-[#0f0502] backdrop-blur-[13px] sm:right-3 sm:top-3 sm:size-10">
              <div className="flex h-[15.33px] w-[22.5px] items-center justify-center overflow-hidden">
                <img
                  src={ASSETS.organizationLogo}
                  alt="Gilgamesh London"
                  width={23}
                  height={15}
                  className="max-h-full max-w-full object-contain object-center"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-lg border border-white/30 bg-white p-3 text-center shadow-sm backdrop-blur-[14px] sm:mt-3 sm:rounded-xl sm:p-3.5">
            <h1 className="text-center text-lg font-semibold leading-tight text-[#121212] sm:text-xl">
              Gilgamesh London
            </h1>
            <p className="mt-1 text-xs leading-snug text-[#121212]/75 sm:text-[13px]">
              The finest contemporary Pan Asian cuisine. Restaurant, Bar, Late,
              Events. The ultimate destination dining.
            </p>
            <div className="mt-1.5 flex justify-center sm:mt-2">
              <StarRow filled={4} />
            </div>
            <div className="mt-3 flex justify-center sm:mt-4">
              <div className="flex w-full max-w-[260px] flex-row flex-nowrap items-center justify-center gap-2 sm:max-w-none">
                <button type="button" className={bookBtn} onClick={onBookNow}>
                  Book Now
                </button>
                <GetDirectionsIconLink />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
