import { ASSETS } from './figma/assets'
import { GetDirectionsIconLink } from './components/GetDirectionsFab'
import { VenueHeaderRating } from './components/VenueHeaderRating'
import { WIDGET_MAX_W } from './widgetLayout'

/** ~80% width via grid 1fr + auto; same 44px height as map; ~8px gap. */
const bookBtn =
  'inline-flex h-11 min-h-11 w-full min-w-0 items-center justify-center rounded-full bg-[#2c2c2c] px-4 text-[15px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition hover:bg-[#3d3d3d] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'

type Props = {
  onBookNow: () => void
}

export function OnboardingScreen({ onBookNow }: Props) {
  return (
    <div className="min-h-dvh bg-[var(--color-chat-bg)]">
      <div
        className={`mx-auto flex min-h-dvh w-full ${WIDGET_MAX_W} flex-col justify-center px-4 py-6 sm:px-5 sm:py-8`}
      >
        <article className="w-full overflow-hidden rounded-2xl border border-neutral-300/80 bg-[var(--color-chat-surface)] shadow-md">
          <div className="relative border-b border-neutral-200">
            <img
              src={ASSETS.hero}
              alt="Restaurant interior"
              className="aspect-[284/262] w-full object-cover"
            />
            <div className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-white/40 bg-[#0f0502] shadow-md backdrop-blur-sm">
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

          <div className="space-y-3 px-3 py-3.5 sm:px-4 sm:py-4">
            <header className="space-y-1.5 text-center">
              <h1 className="text-[1.375rem] font-bold leading-tight tracking-tight text-neutral-950 sm:text-2xl">
                Gilgamesh London
              </h1>
              <p className="w-full text-pretty text-[14px] leading-snug text-neutral-600 sm:text-[15px] sm:leading-relaxed">
                The finest contemporary Pan Asian cuisine. Restaurant, Bar, Late,
                Events. The ultimate destination dining.
              </p>
            </header>
            <VenueHeaderRating className="pt-0.5" />
            <div className="grid w-full grid-cols-[1fr_auto] items-stretch gap-2 pt-0.5">
              <button type="button" className={bookBtn} onClick={onBookNow}>
                Book Now
              </button>
              <GetDirectionsIconLink />
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
