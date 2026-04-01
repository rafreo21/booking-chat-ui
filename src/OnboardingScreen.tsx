import { ASSETS } from './figma/assets'
import { GetDirectionsIconLink } from './components/GetDirectionsFab'

function StarRow({ filled }: { filled: number }) {
  return (
    <div className="flex justify-center gap-1.5" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className="size-5 shrink-0 text-amber-500 sm:size-[22px]"
          viewBox="0 0 24 24"
          fill={i < filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M12 3l2.09 4.26L19 8.27l-3.5 3.41L16.18 17 12 14.77 7.82 17 8.5 11.68 5 8.27l4.91-.01L12 3z" />
        </svg>
      ))}
    </div>
  )
}

/** Primary fills ~75–80% of row; map stays square — equal 44px height. */
const bookBtn =
  'inline-flex h-11 min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg bg-neutral-950 px-3 text-[15px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition hover:bg-neutral-800 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'

type Props = {
  onBookNow: () => void
}

export function OnboardingScreen({ onBookNow }: Props) {
  return (
    <div className="min-h-dvh bg-[var(--color-chat-bg)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-6 sm:px-5 sm:py-8">
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

          <div className="space-y-3 p-4 sm:p-5">
            <header className="space-y-1.5 text-center">
              <h1 className="text-[1.375rem] font-bold leading-tight tracking-tight text-neutral-950 sm:text-2xl">
                Gilgamesh London
              </h1>
              <p className="text-[14px] leading-snug text-neutral-600 sm:text-[15px] sm:leading-relaxed">
                The finest contemporary Pan Asian cuisine. Restaurant, bar, late
                nights, and events — destination dining in the heart of London.
              </p>
            </header>
            <StarRow filled={4} />
            <div className="mx-auto flex w-full max-w-[288px] items-stretch gap-3 pt-0.5">
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
