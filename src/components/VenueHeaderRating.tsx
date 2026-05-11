import { CheckFat, GlobeHemisphereEast, Star } from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import { MAPS_URL } from '../figma/assets'
import { GoogleMapsPin } from './GoogleMapsPin'

/**
 * Venue row icons — official Phosphor React components, fill weight, 20px.
 * Dine-in uses **CheckFat** (not plain Check) — see Check family on Phosphor.
 * @see https://phosphoricons.com?q=star&size=20&weight=fill
 * @see https://phosphoricons.com?q=check&size=20&weight=fill
 * @see https://phosphoricons.com?q=globe-hemisphere-east&size=20&weight=fill
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
  /** Show maps directions next to the website globe (chat header). */
  showDirections?: boolean
}

/**
 * (CheckFat + dine in first) · Star + linked 4.5 · Globe (website) · optional maps pin (directions).
 */
export function VenueHeaderRating({
  className = '',
  theme = 'light',
  showDirections = false,
}: Props) {
  const isDark = theme === 'dark'

  const ratingRowClass = isDark
    ? 'group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-1.5 py-0.5 transition-[background-color,opacity] duration-150 hover:bg-white/10 hover:opacity-95 active:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary'
    : 'group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-1.5 py-0.5 transition-colors duration-150 hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

  const ratingScoreClass = isDark
    ? 'font-semibold tabular-nums text-white underline decoration-white/70 underline-offset-[3px] transition-[text-decoration-color] duration-150 group-hover:decoration-white'
    : 'font-semibold tabular-nums text-foreground underline decoration-border underline-offset-[3px] transition-[text-decoration-color] duration-150 group-hover:decoration-foreground/70'

  const dineLabel = isDark
    ? 'font-medium text-[#f3f2f2]'
    : 'font-medium text-foreground'

  /** Shared 32×32 circular hit target for website globe + maps pin (size aligns with 20px Phosphor icons). */
  const mapGlobeHit = isDark
    ? 'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,opacity] duration-150 hover:bg-white/15 active:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-primary'
    : 'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,opacity] duration-150 hover:bg-muted active:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13px] leading-snug sm:text-[14px] ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <CheckFat
          {...venueIconProps}
          color={iconCheck}
          aria-hidden
          className="shrink-0"
        />
        <span className={dineLabel}>Dine in only</span>
      </span>

      <a
        href={GILGAMESH_GOOGLE_REVIEWS}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View Gilgamesh on Google Maps and read reviews (4.5 rating)"
        className={ratingRowClass}
      >
        <Star
          {...venueIconProps}
          color={iconStar}
          aria-hidden
          className="shrink-0 transition-[filter] duration-150 group-hover:brightness-110"
        />
        <span className={ratingScoreClass}>4.5</span>
      </a>

      <span className="inline-flex shrink-0 items-center gap-2">
        <a
          href={GILGAMESH_WEB}
          target="_blank"
          rel="noopener noreferrer"
          className={mapGlobeHit}
          aria-label="Gilgamesh website"
        >
          <GlobeHemisphereEast {...venueIconProps} color={iconGlobe} aria-hidden />
        </a>
        {showDirections ? (
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={mapGlobeHit}
            aria-label="Get directions to Gilgamesh in Google Maps"
          >
            <GoogleMapsPin sizePx={20} />
          </a>
        ) : null}
      </span>
    </div>
  )
}
