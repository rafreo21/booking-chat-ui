import { useEffect, useRef } from 'react'

const SRC_WEBM = '/ai-chatbot-logo-loop.webm'
const SRC_MP4 = '/ai-chatbot-logo-loop.mp4'

function prefersWebmVp9(): boolean {
  if (typeof document === 'undefined') return false
  const v = document.createElement('video')
  return v.canPlayType('video/webm; codecs="vp9"') !== ''
}

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

/**
 * WebM VP9 carries alpha — no blend needed. MP4 is an opaque “white plate” — use multiply
 * into the dark well so it matches WebM everywhere (including iPhone / small screens).
 */
function shouldMultiplyVideoIntoWell(): boolean {
  return !prefersWebmVp9()
}

const responsiveBoxClass =
  'h-6 w-6 min-h-6 min-w-6 max-h-6 max-w-6 sm:h-7 sm:w-7 sm:min-h-7 sm:min-w-7 sm:max-h-7 sm:max-w-7'

/**
 * Looping reference animation: WebM VP9 (alpha) or H.264 MP4 (multiply into dark well — all platforms).
 * Grey ring + inner neutral ring; same component on onboarding and chat.
 *
 * Default: **24px** below `sm`, **28px** from `sm` up — matches compact phones (e.g. iPhone 8) vs tablet/desktop.
 * Pass `sizePx` to lock one size at every breakpoint.
 */
export function AiChatbotLogo({
  sizePx,
  className = '',
}: {
  /** Omit for responsive 24px → 28px at `sm`. Set to lock a fixed size (px) on all viewports. */
  sizePx?: number
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const multiplyVideo = shouldMultiplyVideoIntoWell()
  const fixed = sizePx != null
  const dim = fixed ? `${sizePx}px` : null
  /** Lock dimensions when a fixed size is requested; otherwise CSS breakpoints handle size. */
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
      className={`ai-chatbot-logo-root box-border inline-flex flex-none rounded-full border border-neutral-500 bg-neutral-950 p-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] [transform:translateZ(0)] isolate sm:p-[2.5px] ${fixed ? '' : responsiveBoxClass} ${className}`}
      style={boxStyle}
      role="img"
      aria-label="Booking assistant"
    >
      <span className="relative block size-full min-h-0 min-w-0 overflow-hidden rounded-full bg-[#0a0a0a] ring-1 ring-neutral-700/60 [transform:translateZ(0)]">
        <video
          ref={ref}
          className={`ai-chatbot-logo-video size-full min-h-px min-w-px object-cover object-center [-webkit-backface-visibility:hidden] [backface-visibility:hidden] ${multiplyVideo ? 'ai-chatbot-logo-video--multiply' : ''}`}
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
