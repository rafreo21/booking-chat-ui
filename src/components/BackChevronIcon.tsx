import { CaretLeft } from '@phosphor-icons/react'

/** Back control — [Phosphor CaretLeft](https://phosphoricons.com/?q=caret), default 20px. */
export function BackChevronIcon({
  className = '',
  size = 20,
}: {
  className?: string
  size?: number
}) {
  return (
    <CaretLeft
      className={className}
      size={size}
      weight="regular"
      aria-hidden
    />
  )
}
