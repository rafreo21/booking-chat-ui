import { useId } from 'react'

/**
 * AI ring logo (Figma 83:3097) — inlined SVG so it always renders (no .png/.svg MIME issues).
 */
export function AiChatbotLogo({
  sizePx = 24,
  className = '',
}: {
  sizePx?: number
  className?: string
}) {
  const gradId = `ai-logo-grad-${useId().replace(/:/g, '')}`

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="Booking assistant"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5Z"
        fill={`url(#${gradId})`}
      />
      <defs>
        <linearGradient
          id={gradId}
          x1="24"
          y1="0"
          x2="0"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.13" stopColor="#BBEEC6" />
          <stop offset="0.18" stopColor="#8DF9A6" />
          <stop offset="0.34" stopColor="#1B9436" />
          <stop offset="0.67" stopColor="#01340D" />
          <stop offset="0.81" stopColor="#27A543" />
          <stop offset="0.86" stopColor="#199234" />
        </linearGradient>
      </defs>
    </svg>
  )
}
