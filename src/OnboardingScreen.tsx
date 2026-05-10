import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AiChatbotLogo } from './components/AiChatbotLogo'
import { OnboardingHeroCarousel } from './components/OnboardingHeroCarousel'
import { ONBOARDING_HERO_SLIDES } from './figma/assets'
import { GetDirectionsIconLink } from './components/GetDirectionsFab'
import { VenueHeaderRating } from './components/VenueHeaderRating'
import {
  WIDGET_FRAME_HEIGHT_CLASS,
  WIDGET_LOGO_ABSOLUTE_INSET_CLASS,
  WIDGET_PAGE_SHELL_CLASS,
  WIDGET_STACK_COLUMN_CLASS,
  WIDGET_TOP_ROW_SPACER_CLASS,
} from './widgetLayout'

type Props = {
  onBookNow: () => void
}

export function OnboardingScreen({ onBookNow }: Props) {
  return (
    <div className="relative min-h-dvh bg-muted/40">
      <div className={WIDGET_PAGE_SHELL_CLASS}>
        <div className={WIDGET_STACK_COLUMN_CLASS}>
          <div className={WIDGET_TOP_ROW_SPACER_CLASS} aria-hidden="true">
            <span className="inline-block size-11 shrink-0" />
          </div>
          <Card
            className={`flex w-full flex-col gap-0 overflow-hidden rounded-2xl border py-0 text-card-foreground shadow-md ring-1 ring-border ${WIDGET_FRAME_HEIGHT_CLASS}`}
          >
            <div className="relative min-h-0 flex-1 border-b border-border">
              <OnboardingHeroCarousel slides={ONBOARDING_HERO_SLIDES} className="h-full min-h-[9.5rem]" />
              <div
                className={`pointer-events-none absolute z-20 ${WIDGET_LOGO_ABSOLUTE_INSET_CLASS}`}
              >
                <AiChatbotLogo />
              </div>
            </div>

            <CardContent className="shrink-0 space-y-2.5 px-3 py-3 sm:space-y-3 sm:px-4 sm:py-3.5">
              <header className="space-y-1 text-center sm:space-y-1.5">
                <h1 className="text-[1.25rem] font-bold leading-tight tracking-tight text-foreground sm:text-[1.375rem]">
                  Gilgamesh London
                </h1>
                <p className="w-full text-pretty text-[13px] leading-snug text-muted-foreground sm:text-[14px] sm:leading-relaxed">
                  The finest contemporary Pan Asian cuisine. Restaurant, Bar, Late,
                  Events. The ultimate destination dining.
                </p>
              </header>
              <VenueHeaderRating className="pt-0" />
              <div className="flex w-full items-center gap-2">
                <Button type="button" size="lg" className="h-11 min-w-0 flex-1 px-5 text-[15px] font-semibold" onClick={onBookNow}>
                  Book Now
                </Button>
                <GetDirectionsIconLink />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
