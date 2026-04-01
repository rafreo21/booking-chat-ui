import { useState } from 'react'
import { ASSETS } from '../figma/assets'

/**
 * AI avatar from Figma (83:3097): masked ring logo inside the dark chat header.
 */
export function AiChatbotLogo({
  sizePx = 24,
  className = '',
}: {
  sizePx?: number
  className?: string
}) {
  const [useFallback, setUseFallback] = useState(false)
  const dim = `${sizePx}px`

  if (useFallback) {
    return (
      <img
        src={ASSETS.aiLogoFallback}
        alt=""
        width={sizePx}
        height={sizePx}
        className={`shrink-0 rounded-full object-contain ring-2 ring-white/40 ${className}`}
        style={{ width: dim, height: dim }}
      />
    )
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ width: dim, height: dim }}
      role="img"
      aria-label="Booking assistant"
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: `url('${ASSETS.aiLogoMask}')`,
          maskImage: `url('${ASSETS.aiLogoMask}')`,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      >
        <img
          src={ASSETS.aiLogoFill}
          alt=""
          width={sizePx}
          height={sizePx}
          className="size-full max-h-none max-w-none object-cover"
          draggable={false}
          onError={() => setUseFallback(true)}
        />
      </div>
    </div>
  )
}
