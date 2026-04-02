import { useEffect, useRef } from 'react'

const SRC_WEBM = '/ai-chatbot-logo-loop.webm'
const SRC_MP4 = '/ai-chatbot-logo-loop.mp4'

function prefersWebmVp9(): boolean {
  if (typeof document === 'undefined') return false
  const v = document.createElement('video')
  return v.canPlayType('video/webm; codecs="vp9"') !== ''
}

/** iOS Safari: `mix-blend-mode` on `<video>` often hides the layer — skip multiply there. */
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

function shouldMultiplyMp4Background(): boolean {
  if (prefersWebmVp9()) return false
  if (isAppleTouchDevice()) return false
  return true
}

/**
 * Looping reference animation (VP9 + alpha in WebM; H.264 MP4 with multiply on dark bg where supported).
 */
export function AiChatbotLogo({
  sizePx = 24,
  className = '',
}: {
  sizePx?: number
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const multiplyMp4 = shouldMultiplyMp4Background()
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
      className={`ai-chatbot-logo-root inline-flex shrink-0 overflow-hidden rounded-full bg-[#0a0a0a] ${className}`}
      style={{ width: dim, height: dim }}
      role="img"
      aria-label="Booking assistant"
    >
      <video
        ref={ref}
        className={`ai-chatbot-logo-video size-full min-h-px min-w-px object-cover object-center ${multiplyMp4 ? 'ai-chatbot-logo-video--multiply' : ''}`}
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
  )
}
