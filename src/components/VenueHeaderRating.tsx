import { Check, Globe, Star } from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'

/**
 * Venue row icons — official Phosphor React components, fill weight, 20px
 * (same as phosphoricons.com: Star, Check, Globe).
 * @see https://phosphoricons.com?q=star&size=20&weight=fill
 * @see https://phosphoricons.com?q=check&size=20&weight=fill
 * @see https://phosphoricons.com?q=globe&size=20&weight=fill
 */
const venueIconProps = {
  size: 20,
  weight: 'fill',
} satisfies Pick<IconProps, 'size' | 'weight'>

const GILGAMESH_WEB = 'https://www.gilgameshlondon.co.uk/'
const GILGAMESH_GOOGLE_REVIEWS =
  'https://www.google.com/maps/place/Gilgamesh/@51.512282,-0.1273413,17z/data=!3m1!5s0x48761b499d8d40c3:0xdf5f3b0ae82e580c!4m8!3m7!1s0x4876052833627881:0x7bc455794b19a1c1!8m2!3d51.512282!4d-0.1273413!9m1!1b1!16s%2Fg%2F11vkl8fs0_?entry=ttu'

const iconGlobe = '#1A73E8'
const iconStar = '#FBAD04'
const iconCheck = '#31B564'

type Theme = 'light' | 'dark'

type Props = {
  className?: string
  /** `light` = onboarding card; `dark` = chat header bar. */
  theme?: Theme
}

/**
 * Star + linked 4.5 · (check + dine in only) · globe. Same order in onboarding and chat.
 */
export function VenueHeaderRating({ className = '', theme = 'light' }: Props) {
  const isDark = theme === 'dark'

  const ratingLink = isDark
    ? 'font-semibold tabular-nums text-white underline decoration-white/70 underline-offset-[3px] transition hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950'
    : 'font-semibold tabular-nums text-neutral-950 underline decoration-neutral-400 underline-offset-[3px] transition hover:decoration-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2'

  const dineLabel = isDark
    ? 'font-medium text-[#f3f2f2]'
    : 'font-medium text-neutral-800'

  const globeFocus = isDark
    ? 'focus-visible:ring-[#1A73E8]/50 focus-visible:ring-offset-neutral-950'
    : 'focus-visible:ring-[#1A73E8]/50 focus-visible:ring-offset-2'

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13px] leading-snug sm:text-[14px] ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <Star
          {...venueIconProps}
          color={iconStar}
          aria-hidden
          className="shrink-0"
        />
        <a
          href={GILGAMESH_GOOGLE_REVIEWS}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Gilgamesh on Google Maps and read reviews (4.5 rating)"
          className={ratingLink}
        >
          4.5
        </a>
      </span>

      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <Check
          {...venueIconProps}
          color={iconCheck}
          aria-hidden
          className="shrink-0"
        />
        <span className={dineLabel}>Dine in only</span>
      </span>

      <a
        href={GILGAMESH_WEB}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex shrink-0 items-center justify-center rounded-full p-0.5 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 ${globeFocus}`}
        aria-label="Gilgamesh website"
      >
        <Globe {...venueIconProps} color={iconGlobe} aria-hidden />
      </a>
    </div>
  )
}
