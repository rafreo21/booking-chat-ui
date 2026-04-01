/** Local copies of Figma MCP exports (see `public/figma/`). */
export const ASSETS = {
  hero: '/figma/hero.jpg',
  logo: '/figma/logo.png',
  maps: '/figma/maps.svg',
  /** Mask + fill pair from Figma node 83:3097 (AI logo). */
  aiLogoMask: '/figma/ai-logo-mask.png',
  aiLogoFill: '/figma/ai-logo-fill.png',
  /** Fallback single asset if mask rendering fails in a browser. */
  aiLogoFallback: '/figma/ai-logo-main.png',
  sendIcon: '/figma/send-icon.png',
  /** Back chevron from Figma node 83:3123. */
  backChevron: '/figma/back-chevron-figma.png',
} as const

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Gilgamesh+London+UK'
