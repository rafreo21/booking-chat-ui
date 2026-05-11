import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3Icon,
  BellIcon,
  ClipboardListIcon,
  CreditCardIcon,
  GlobeIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PanelLeftIcon,
  PanelRightIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  UserCircleIcon,
  UsersIcon,
  UtensilsCrossedIcon,
  WalletIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signOutRestaurant } from '@/lib/restaurantAuth'
import { cn } from '@/lib/utils'

type NavItem = {
  title: string
  url: string
  end?: boolean
  icon: LucideIcon
}

const navMain: NavItem[] = [
  { title: 'Home', url: '/restaurant/dashboard', end: true, icon: LayoutDashboardIcon },
  { title: 'Items & services', url: '/restaurant/dashboard/menu', icon: UtensilsCrossedIcon },
]

type NavSoonItem = {
  title: string
  icon: LucideIcon
}

const navSoon: NavSoonItem[] = [
  { title: 'Invoices & payments', icon: ReceiptIcon },
  { title: 'Online', icon: GlobeIcon },
  { title: 'Customers', icon: UsersIcon },
  { title: 'Reports', icon: BarChart3Icon },
  { title: 'Staff', icon: UserCircleIcon },
  { title: 'Money', icon: WalletIcon },
  { title: 'Settings', icon: SettingsIcon },
]

const navLinkClassExpanded =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors'

const navLinkClassCompact =
  'flex size-10 items-center justify-center rounded-xl text-[13px] font-semibold transition-colors'

export type RestaurantSidebarPanelProps = {
  initials: string
  name: string
  email: string
  /** Close mobile drawer after navigating */
  onNavigate?: () => void
  /** Desktop icon-only rail */
  compact?: boolean
  /** Desktop: collapse / expand rail */
  onToggleCompact?: () => void
}

/**
 * Restaurant nav chrome — plain layout (no shadcn Sidebar shell).
 * Render inside `<aside>` (desktop) or `<SheetContent>` (mobile).
 */
export function RestaurantSidebarPanel({
  initials,
  name,
  email,
  onNavigate,
  compact = false,
  onToggleCompact,
}: RestaurantSidebarPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {compact ? (
        <div className="flex shrink-0 flex-col items-center gap-2 px-2 pb-2 pt-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-bold text-background"
            title={name}
            aria-label={name}
          >
            {initials}
          </div>
          {onToggleCompact ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg text-muted-foreground"
              aria-label="Expand sidebar"
              onClick={onToggleCompact}
            >
              <PanelRightIcon className="size-5" aria-hidden />
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="shrink-0 space-y-3 px-3 pb-2 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-muted/40 px-2 py-2">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-bold text-background"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{email}</p>
            </div>
            {onToggleCompact ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-lg text-muted-foreground"
                aria-label="Collapse sidebar"
                onClick={onToggleCompact}
              >
                <PanelLeftIcon className="size-5" aria-hidden />
              </Button>
            ) : null}
          </div>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              readOnly
              placeholder="Search venue…"
              className="h-9 rounded-xl border-border bg-muted/30 pl-9 text-[13px]"
              aria-label="Search (coming soon)"
            />
          </div>
        </div>
      )}

      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-3" aria-label="Restaurant dashboard">
        <div className={cn('space-y-0.5', compact && 'flex flex-col items-center')}>
          <ul className={cn('space-y-0.5', compact && 'flex w-full flex-col items-center')}>
            {navMain.map((item) => (
              <li key={item.title} className={cn(compact && 'flex justify-center')}>
                <NavLink
                  to={item.url}
                  end={item.end}
                  title={item.title}
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) =>
                    cn(
                      compact ? navLinkClassCompact : navLinkClassExpanded,
                      isActive
                        ? 'bg-muted text-foreground shadow-sm ring-1 ring-border'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                    )
                  }
                >
                  <item.icon className="size-[18px] shrink-0 opacity-80" aria-hidden />
                  <span className={cn(compact ? 'sr-only' : 'truncate')}>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={cn('space-y-0.5', compact && 'flex flex-col items-center')}>
          <p
            className={cn(
              compact ? 'sr-only' : 'mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
            )}
          >
            Coming soon
          </p>
          <ul className={cn('space-y-0.5', compact && 'flex w-full flex-col items-center')}>
            {navSoon.map((item) => (
              <li key={item.title} className={cn(compact && 'flex justify-center')}>
                <button
                  type="button"
                  disabled
                  title={item.title}
                  aria-label={item.title}
                  className={cn(
                    compact ? navLinkClassCompact : navLinkClassExpanded,
                    'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-muted-foreground',
                  )}
                >
                  <item.icon className="size-[18px] shrink-0 opacity-80" aria-hidden />
                  <span className={cn(compact ? 'sr-only' : 'truncate')}>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div
        className={cn(
          'mt-auto shrink-0 space-y-3 pb-6 pt-4',
          compact ? 'flex flex-col items-center gap-2 px-2' : 'space-y-3 px-3',
        )}
      >
        <div
          className={cn(
            'flex gap-1',
            compact ? 'flex-col items-center' : 'items-center justify-between px-1',
          )}
        >
          <Button type="button" variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground" disabled aria-label="Notifications">
            <BellIcon className="size-[18px]" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground" disabled aria-label="Tasks">
            <ClipboardListIcon className="size-[18px]" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground" disabled aria-label="Help">
            <HelpCircleIcon className="size-[18px]" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground" disabled aria-label="Assistant">
            <SparklesIcon className="size-[18px]" />
          </Button>
        </div>
        {compact ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-10 shrink-0 rounded-xl shadow-sm"
            disabled
            aria-label="Take payment"
            title="Take payment"
          >
            <CreditCardIcon className="size-[18px]" aria-hidden />
          </Button>
        ) : (
          <Button type="button" className="h-11 w-full rounded-xl text-[14px] font-semibold shadow-sm" disabled>
            Take payment
          </Button>
        )}
        {compact ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-xl border-border bg-background text-muted-foreground"
            onClick={() => void signOutRestaurant()}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOutIcon className="size-[18px]" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-xl gap-2 border-border bg-background text-[13px] font-semibold"
            onClick={() => void signOutRestaurant()}
          >
            <LogOutIcon className="size-4" aria-hidden />
            Sign out
          </Button>
        )}
      </div>
    </div>
  )
}
