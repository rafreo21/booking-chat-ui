import { ASSETS } from './figma/assets'
import { GetDirectionsFab } from './components/GetDirectionsFab'

function StarRow({ filled }: { filled: number }) {
  return (
    <div className="flex gap-1" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className="size-4 shrink-0"
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
  'relative mx-auto inline-flex h-11 w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#303030] px-4 text-[13px] font-semibold leading-5 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_-1px_0_0_rgba(0,0,0,0.4)] transition will-change-transform hover:bg-[#3d3d3d] active:scale-[0.98] active:bg-[#252525] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'

type Props = {
  onBookNow: () => void
}

export function OnboardingScreen({ onBookNow }: Props) {
  return (
    <div className="relative min-h-dvh bg-[#ececec]">
      <div className="flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-[308px] rounded-2xl border border-white/30 bg-[#f3f3f3]/95 p-3 shadow-sm backdrop-blur-[14px]">
          <div className="relative overflow-hidden rounded-xl border border-white/30">
            <img
              src={ASSETS.hero}
              alt="Restaurant interior"
              className="aspect-[284/262] w-full object-cover"
            />
            <div className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-white/30 bg-[#0f0502]/95 backdrop-blur-md">
              <img
                src={ASSETS.logo}
                alt="Gilgamesh London"
                className="h-[15px] w-auto object-contain"
              />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/30 bg-white p-4 text-center shadow-sm backdrop-blur-[14px]">
            <h1 className="text-center text-[14px] font-semibold text-[#121212]">
              Gilgamesh London
            </h1>
            <p className="mt-1 text-[13px] leading-snug text-[#121212]/75">
              The finest contemporary Pan Asian cuisine. Restaurant, Bar, Late,
              Events. The ultimate destination dining.
            </p>
            <div className="mt-2 flex justify-center">
              <StarRow filled={4} />
            </div>
            <div className="mt-4">
              <button type="button" className={bookBtn} onClick={onBookNow}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <GetDirectionsFab />
    </div>
  )
}
