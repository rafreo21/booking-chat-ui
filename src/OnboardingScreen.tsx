import { AiChatbotLogo } from './components/AiChatbotLogo'
import { OnboardingHeroCarousel } from './components/OnboardingHeroCarousel'
import { ONBOARDING_HERO_SLIDES } from './figma/assets'
import { GetDirectionsIconLink } from './components/GetDirectionsFab'
import { VenueHeaderRating } from './components/VenueHeaderRating'
import {
  WIDGET_FRAME_HEIGHT_CLASS,
  WIDGET_PAGE_SHELL_CLASS,
  WIDGET_STACK_COLUMN_CLASS,
  WIDGET_TOP_ROW_SPACER_CLASS,
} from './widgetLayout'

/** ~80% width via grid 1fr + auto; same 44px height as map; ~8px gap. */
const bookBtn =
  'inline-flex h-11 min-h-11 w-full min-w-0 items-center justify-center rounded-full bg-[#2c2c2c] px-4 text-[15px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition hover:bg-[#3d3d3d] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'

type Props = {
  onBookNow: () => void
}

export function OnboardingScreen({ onBookNow }: Props) {
  return (
    <div className="relative min-h-dvh bg-[var(--color-chat-bg)]">
      <div className={WIDGET_PAGE_SHELL_CLASS}>
        <div className={WIDGET_STACK_COLUMN_CLASS}>
          <div className={WIDGET_TOP_ROW_SPACER_CLASS} aria-hidden="true">
            <span className="inline-block size-11 shrink-0" />
          </div>
          <article
            className={`flex w-full flex-col overflow-hidden rounded-2xl border border-neutral-300/80 bg-[var(--color-chat-surface)] shadow-md ${WIDGET_FRAME_HEIGHT_CLASS}`}
          >
            <div className="relative min-h-0 flex-1 border-b border-neutral-200">
              <OnboardingHeroCarousel slides={ONBOARDING_HERO_SLIDES} className="h-full min-h-[9.5rem]" />
              <div className="pointer-events-none absolute left-3 top-3 z-20">
                <AiChatbotLogo />
              </div>
            </div>

            <div className="shrink-0 space-y-2.5 px-3 py-3 sm:space-y-3 sm:px-4 sm:py-3.5">
              <header className="space-y-1 text-center sm:space-y-1.5">
                <h1 className="text-[1.25rem] font-bold leading-tight tracking-tight text-neutral-950 sm:text-[1.375rem]">
                  Gilgamesh London
                </h1>
                <p className="w-full text-pretty text-[13px] leading-snug text-neutral-600 sm:text-[14px] sm:leading-relaxed">
                  The finest contemporary Pan Asian cuisine. Restaurant, Bar, Late,
                  Events. The ultimate destination dining.
                </p>
              </header>
              <VenueHeaderRating className="pt-0" />
              <div className="grid w-full grid-cols-[1fr_auto] items-stretch gap-2">
                <button type="button" className={bookBtn} onClick={onBookNow}>
                  Book Now
                </button>
                <GetDirectionsIconLink />
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
