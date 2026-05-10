/** Same outer width for onboarding card and chat column (24rem / 384px). */
export const WIDGET_MAX_W = 'max-w-sm'

/**
 * Page chrome: centers the widget column horizontally and **vertically** on the screen.
 */
export const WIDGET_PAGE_SHELL_CLASS =
  'flex min-h-dvh w-full flex-col items-center justify-center px-4 pb-[max(6.25rem,env(safe-area-inset-bottom)+5rem)] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-28 sm:pt-6'

/**
 * Chat host shell — same layout and padding as {@link WIDGET_PAGE_SHELL_CLASS};
 * use inside `h-dvh` with `flex-1 min-h-0` so the column is vertically centered like onboarding.
 */
export const WIDGET_CHAT_PAGE_SHELL_CLASS =
  'flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-[max(6.25rem,env(safe-area-inset-bottom)+5rem)] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pb-28 sm:pt-6'

/**
 * Column: top chrome row + main card, `gap-2` between — shared by onboarding + chat.
 */
export const WIDGET_STACK_COLUMN_CLASS = `flex w-full ${WIDGET_MAX_W} flex-col items-stretch gap-2`

/** @deprecated Alias of {@link WIDGET_STACK_COLUMN_CLASS}. */
export const WIDGET_CHAT_STACK_COLUMN_CLASS = WIDGET_STACK_COLUMN_CLASS

/**
 * Back row (chat) or reserved row (onboarding) — use `items-center` + `h-9` placeholder so card tops align.
 */
export const WIDGET_TOP_ROW_SPACER_CLASS = 'flex w-full items-center justify-start py-2'

/**
 * Chat dark header padding — logo is the first element at this inset from the card inner top-left.
 * Onboarding uses WIDGET_LOGO_ABSOLUTE_INSET_CLASS on the hero so placement matches.
 */
export const WIDGET_CHAT_HEADER_PAD_CLASS = 'px-3 py-3 sm:px-4 sm:py-4'

/** Same top/left offset as `WIDGET_CHAT_HEADER_PAD_CLASS` for an absolutely positioned logo. */
export const WIDGET_LOGO_ABSOLUTE_INSET_CLASS = 'left-3 top-3 sm:left-4 sm:top-4'

/**
 * Shared fixed height for onboarding venue card **and** chat card — same footprint for transitions.
 */
export const WIDGET_FRAME_HEIGHT_CLASS =
  'h-[min(580px,calc(100dvh-5.5rem))] max-h-[min(580px,calc(100dvh-5.5rem))] sm:h-[min(580px,calc(100dvh-6rem))] sm:max-h-[min(580px,calc(100dvh-6rem))]'

/**
 * @deprecated Chat uses {@link WIDGET_FRAME_HEIGHT_CLASS} + `flex flex-col` so the transcript fills the frame.
 */
export const WIDGET_CHAT_CARD_FRAME_CLASS =
  'max-h-[min(580px,calc(100dvh-5.5rem))] sm:max-h-[min(580px,calc(100dvh-6rem))]'
