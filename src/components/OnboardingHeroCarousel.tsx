import { useCallback, useEffect, useRef, useState } from 'react'

type Slide = {
  src: string
  alt: string
}

type Props = {
  slides: readonly Slide[]
  className?: string
}

/**
 * Full-width horizontal carousel: scroll-snap + dot controls (touch-friendly, all viewports).
 */
export function OnboardingHeroCarousel({ slides, className = '' }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  const syncActive = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    const i = Math.round(el.scrollLeft / w)
    const next = Math.max(0, Math.min(i, slides.length - 1))
    if (next !== activeRef.current) {
      activeRef.current = next
      setActive(next)
    }
  }, [slides.length])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => requestAnimationFrame(syncActive)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [syncActive])

  const goTo = (i: number) => {
    const el = scrollerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(i, slides.length - 1))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollerRef}
        className="flex h-full min-h-0 w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label="Gilgamesh London gallery"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className="relative h-full w-full shrink-0 snap-center snap-always"
            aria-hidden={i !== active}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="size-full object-cover"
              draggable={false}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
            />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-3.5 pt-14"
        role="group"
        aria-label="Slide indicators"
      >
        <div className="flex items-center justify-center gap-1.5">
          {slides.map((_, i) => {
            const isActive = i === active
            return (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1} of ${slides.length}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => goTo(i)}
                className={`pointer-events-auto shrink-0 transition-[width,background-color,transform,box-shadow] duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 active:scale-95 ${
                  isActive
                    ? 'h-1.5 w-6 rounded-full bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.3)] sm:w-7'
                    : 'size-1.5 rounded-full bg-neutral-500/90 press:bg-neutral-400 active:scale-95'
                }`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
