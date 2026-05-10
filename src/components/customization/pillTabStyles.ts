/**
 * Shared pill styling for menu category tabs and seat tabs so both rows match.
 */

export const PILL_TABS_LIST_CLASS =
  'h-auto w-full min-w-0 flex-nowrap justify-start gap-2 overflow-x-auto border-0 bg-transparent p-0 shadow-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

export const PILL_TAB_TRIGGER_CLASS =
  'flex-none rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-foreground shadow-xs ring-0 transition-colors after:hidden hover:bg-muted/60 hover:text-foreground data-[state=active]:border-primary data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground'

/** Matches inactive pill tab look for standalone actions next to pill tabs (e.g. Enter number, Pick date). */
export const PILL_CHOICE_BUTTON_CLASS =
  'inline-flex shrink-0 flex-none items-center justify-center rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-muted-foreground shadow-xs ring-0 transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]'
