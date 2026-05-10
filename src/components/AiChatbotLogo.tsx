import { useEffect, useRef } from 'react'

/** Canonical looping mark (`public/ai-chatbot-logo.mp4`, H.264). */
const LOGO_MP4 = '/ai-chatbot-logo.mp4'

function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return true
  if (
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1 &&
    /MacIntel/i.test(navigator.platform)
  ) {
    return true
  }
  return false
}

/** Default: 24×24px; `sm:` 28×28px. Pass `sizePx` for a fixed diameter (e.g. manage reservation). */
const responsiveBoxClass =
  'h-6 w-6 min-h-6 min-w-6 max-h-6 max-w-6 sm:h-7 sm:w-7 sm:min-h-7 sm:min-w-7 sm:max-h-7 sm:max-w-7'

/**
 * Looping AI mark: single H.264 MP4, circular clip only — no ring or dark shadow (transparent chrome).
 */
export function AiChatbotLogo({
  sizePx,
  className = '',
}: {
  /** Fixed pixel diameter; omit for default responsive size (24 / 28px). */
  sizePx?: number
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const fixed = sizePx != null
  const dim = fixed ? `${sizePx}px` : null
  const boxStyle = fixed
    ? {
        width: dim!,
        height: dim!,
        minWidth: dim!,
        minHeight: dim!,
        maxWidth: dim!,
        maxHeight: dim!,
        boxSizing: 'border-box' as const,
      }
    : undefined

  useEffect(() => {
    const v = ref.current
    if (!v) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => {
      if (mq.matches) {
        v.pause()
        try {
          v.currentTime = 0
        } catch {
          /* ignore */
        }
      } else {
        void v.play().catch(() => {})
      }
    }

    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v || !isAppleTouchDevice()) return
    v.load()
    void v.play().catch(() => {})
  }, [])

  return (
    <span
      className={`ai-chatbot-logo-root inline-flex flex-none overflow-hidden rounded-full bg-transparent ${fixed ? '' : responsiveBoxClass} ${className}`}
      style={boxStyle}
      role="img"
      aria-label="Booking assistant"
    >
      <span className="ai-chatbot-logo-inner relative block size-full min-h-0 min-w-0 overflow-hidden rounded-full bg-transparent">
        <video
          ref={ref}
          className="ai-chatbot-logo-video size-full min-h-0 min-w-0"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden
        >
          <source src={LOGO_MP4} type="video/mp4" />
        </video>
      </span>
    </span>
  )
}
