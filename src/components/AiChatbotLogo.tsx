import { useEffect, useRef } from 'react'

const SRC_WEBM = '/ai-chatbot-logo-loop.webm'
const SRC_MP4 = '/ai-chatbot-logo-loop.mp4'

/**
 * Looping logo — WebM + H.264, pre-composited on #0a0a0a, with a neutral grey bezel
 * so it reads clearly on the dark chat header (all viewports / devices).
 */
export function AiChatbotLogo({
  sizePx = 24,
  className = '',
}: {
  sizePx?: number
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const dim = `${sizePx}px`

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

    const onLoaded = () => sync()
    v.addEventListener('loadeddata', onLoaded)
    sync()
    mq.addEventListener('change', sync)
    return () => {
      v.removeEventListener('loadeddata', onLoaded)
      mq.removeEventListener('change', sync)
    }
  }, [])

  return (
    <span
      className={`ai-chatbot-logo-root inline-flex shrink-0 rounded-full border border-neutral-500/50 bg-gradient-to-b from-neutral-600/90 to-neutral-700/95 p-[2px] shadow-[0_1px_4px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/25 ${className}`}
      style={{ width: dim, height: dim }}
      role="img"
      aria-label="Booking assistant"
    >
      <span className="relative block size-full min-h-0 min-w-0 overflow-hidden rounded-full bg-[#0a0a0a]">
        <video
          ref={ref}
          className="ai-chatbot-logo-video size-full min-h-px min-w-px object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden
        >
          <source src={SRC_WEBM} type="video/webm" />
          <source src={SRC_MP4} type="video/mp4" />
        </video>
      </span>
    </span>
  )
}
