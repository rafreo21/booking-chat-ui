import { Check, Globe, Star } from '@phosphor-icons/react'

const GILGAMESH_WEB = 'https://www.gilgameshlondon.co.uk/'
const GILGAMESH_GOOGLE_REVIEWS =
  'https://www.google.com/maps/place/Gilgamesh/@51.512282,-0.1273413,17z/data=!3m1!5s0x48761b499d8d40c3:0xdf5f3b0ae82e580c!4m8!3m7!1s0x4876052833627881:0x7bc455794b19a1c1!8m2!3d51.512282!4d-0.1273413!9m1!1b1!16s%2Fg%2F11vkl8fs0_?entry=ttu'

const iconGlobe = '#1A73E8'
const iconStar = '#FBAD04'
const iconCheck = '#31B564'

type Props = {
  className?: string
}

/**
 * Dine-in row: globe (site), label, star + linked Google rating + check — aligned with Figma reference.
 */
export function VenueHeaderRating({ className = '' }: Props) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] leading-snug sm:text-[14px] ${className}`}
    >
      <a
        href={GILGAMESH_WEB}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center rounded-full p-0.5 text-[#1A73E8] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        aria-label="Gilgamesh website"
      >
        <Globe size={20} weight="fill" color={iconGlobe} aria-hidden />
      </a>

      <span className="font-medium text-[#f3f2f2]">Dine in</span>

      <span className="inline-flex items-center gap-1.5">
        <Star size={20} weight="fill" color={iconStar} aria-hidden className="shrink-0" />
        <a
          href={GILGAMESH_GOOGLE_REVIEWS}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Gilgamesh on Google Maps and read reviews (4.5 rating)"
          className="font-semibold tabular-nums text-white underline decoration-white/70 underline-offset-[3px] transition hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          4.5
        </a>
        <Check size={20} weight="fill" color={iconCheck} aria-hidden className="shrink-0" />
      </span>
    </div>
  )
}
