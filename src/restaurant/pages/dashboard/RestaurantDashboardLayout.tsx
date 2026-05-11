import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2Icon, PanelLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { RestaurantSidebarPanel } from '@/restaurant/pages/dashboard/RestaurantSidebarPanel'
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth'
import { isRestaurantBypassUser } from '@/lib/restaurantBypassAuth'
import { guestBookingHomeHref } from '@/lib/appShell'
import { cn } from '@/lib/utils'

const SIDEBAR_COLLAPSED_KEY = 'restaurant-dashboard-sidebar-collapsed'

function readSidebarCollapsed(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Authenticated restaurant shell — nested routes render in `<Outlet />`.
 * Desktop: persistent `<aside>`. Mobile: left sheet opened by a floating control (no top bar).
 */
export function RestaurantDashboardLayout() {
  const { user, loading, configured } = useRestaurantAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(readSidebarCollapsed)

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, desktopSidebarCollapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [desktopSidebarCollapsed])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/restaurant/login" replace />
  }

  if (!configured && !isRestaurantBypassUser(user)) {
    return <Navigate to="/restaurant/login?error=config" replace />
  }

  const email = user.email ?? 'Signed in'
  const name =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    email
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || '?'

  const guestHome = guestBookingHomeHref()
  const pathname = location.pathname

  const sidebarProps = {
    initials,
    name,
    email,
    onNavigate: () => setMobileMenuOpen(false),
  }

  const desktopSidebarProps = {
    ...sidebarProps,
    compact: desktopSidebarCollapsed,
    onToggleCompact: () => setDesktopSidebarCollapsed((c) => !c),
  }

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-muted/40">
      {/* Desktop sidebar — viewport height; does not grow with main content scroll */}
      <aside
        className={cn(
          'hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out md:flex',
          desktopSidebarCollapsed ? 'w-[4.25rem]' : 'w-[15.5rem]',
        )}
      >
        <RestaurantSidebarPanel {...desktopSidebarProps} />
      </aside>

      {/* Main column — fills remainder; inner region scrolls */}
      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
        {/* Floating menu — mobile / tablet only */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Open navigation"
          className="fixed left-4 top-4 z-50 size-11 rounded-full border border-border bg-background shadow-md md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <PanelLeftIcon className="size-5" aria-hidden />
        </Button>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="left"
            showCloseButton
            className="flex h-full max-h-dvh min-h-0 w-[min(100vw-1rem,17.5rem)] flex-col overflow-hidden gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-none data-[side=left]:w-[min(100vw-1rem,17.5rem)]"
          >
            <RestaurantSidebarPanel {...sidebarProps} />
          </SheetContent>
        </Sheet>

        <div className="mx-auto flex min-h-0 min-w-0 w-full max-w-[1440px] flex-1 flex-col overflow-y-auto overscroll-y-contain pt-[4.25rem] md:pt-0 lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
            <Outlet />
          </div>

          <aside className="hidden w-[300px] shrink-0 border-l border-border bg-muted/20 xl:flex xl:flex-col xl:gap-4 xl:px-5 xl:py-8">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm ring-1 ring-border">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Balance</p>
              <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">£0.00</p>
              <p className="mt-1 text-[12px] text-muted-foreground">Payouts & ledger sync coming soon.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-border">
              <p className="border-b border-border px-4 py-3 text-[13px] font-semibold text-foreground">Quick actions</p>
              <ul className="divide-y divide-border">
                <li>
                  <a
                    href={guestHome}
                    className="block px-4 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted/60"
                  >
                    Open guest booking
                  </a>
                </li>
                <li>
                  <NavLink
                    to="/restaurant/dashboard/menu"
                    className={cn(
                      'block px-4 py-3 text-[14px] font-semibold transition-colors hover:bg-muted/60',
                      pathname.startsWith('/restaurant/dashboard/menu') ? 'bg-muted/80 text-foreground' : 'text-foreground',
                    )}
                  >
                    Edit menu
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/staff/prep"
                    className="block px-4 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted/60"
                  >
                    Staff prep board
                  </NavLink>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
