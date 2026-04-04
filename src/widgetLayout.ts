/** Same outer width for onboarding card and chat column (24rem / 384px). */
export const WIDGET_MAX_W = 'max-w-sm'

/**
 * Page chrome: centers the widget column; shared by onboarding + chat so frames line up.
 */
export const WIDGET_PAGE_SHELL_CLASS =
  'flex min-h-dvh w-full items-center justify-center px-4 pb-[max(5.5rem,env(safe-area-inset-bottom)+4.5rem)] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-28 sm:pt-6'

/** Column: top row (back or spacer) + main card, `gap-2` between. */
export const WIDGET_STACK_COLUMN_CLASS = `flex w-full ${WIDGET_MAX_W} flex-col items-stretch gap-2`

/**
 * Same block size as chat back row (`py-2` + `size-11` control) so onboarding card top
 * aligns with the chat frame when switching screens.
 */
export const WIDGET_TOP_ROW_SPACER_CLASS = 'flex w-full justify-start py-2'

/**
 * Chat dark header padding — logo is the first element at this inset from the card inner top-left.
 * Onboarding uses WIDGET_LOGO_ABSOLUTE_INSET_CLASS on the hero so placement matches.
 */
export const WIDGET_CHAT_HEADER_PAD_CLASS = 'px-3 py-3 sm:px-4 sm:py-4'

/** Same top/left offset as `WIDGET_CHAT_HEADER_PAD_CLASS` for an absolutely positioned logo. */
export const WIDGET_LOGO_ABSOLUTE_INSET_CLASS = 'left-3 top-3 sm:left-4 sm:top-4'

/**
 * Shared fixed cap for onboarding + chat cards so both screens match.
 * Mirrors BookingChatView shell (580px max, viewport-safe on small phones).
 */
export const WIDGET_FRAME_HEIGHT_CLASS =
  'h-[min(580px,calc(100dvh-5.5rem))] max-h-[min(580px,calc(100dvh-5.5rem))] sm:h-[min(580px,calc(100dvh-6rem))] sm:max-h-[min(580px,calc(100dvh-6rem))]'
