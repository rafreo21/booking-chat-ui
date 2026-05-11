import { useEffect, useMemo, useState } from 'react'
import {
  ClockIcon,
  LayoutGridIcon,
  ListIcon,
  MoreHorizontalIcon,
  SearchIcon,
  StoreIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PAGE_SIZE = 10

type ChannelTag = 'pos' | 'online'

export type MenuRow = {
  id: string
  name: string
  initials: string
  locationLabel: string
  channelsBlock: string
  channelsTable: string
  schedule: string
  channels: ChannelTag[]
  isNew?: boolean
}

function buildMockMenus(): MenuRow[] {
  const names = [
    'Ala Carté',
    'Lunch specials',
    'Brunch weekend',
    'Dinner tasting',
    'Bar bites',
    'Kids menu',
    'Wine pairings',
    'Delivery-only',
    'Kiosk express',
    'Late night',
    'Breakfast club',
    'Catering',
  ]
  return names.map((name, i) => ({
    id: `demo-menu-${i}`,
    name,
    initials: name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    locationLabel: 'Reo',
    channelsBlock: i % 3 === 2 ? 'Online ordering' : 'Points of sale + 1 more',
    channelsTable: i % 3 === 2 ? '1 channel' : '2 channels',
    schedule: 'Mon - Sun, 09:00 - 17:00',
    channels: i % 3 === 2 ? ['online'] : ['pos', 'online'],
    isNew: i === 0,
  }))
}

type ChannelFilter = 'all' | ChannelTag

function rowMatchesChannel(row: MenuRow, filter: ChannelFilter): boolean {
  if (filter === 'all') return true
  return row.channels.includes(filter)
}

type RestaurantMenusIndexProps = {
  onCreateMenu: () => void
}

export function RestaurantMenusIndex({ onCreateMenu }: RestaurantMenusIndexProps) {
  const [menus] = useState<MenuRow[]>(() => buildMockMenus())
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all')
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return menus.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q)) return false
      return rowMatchesChannel(m, channelFilter)
    })
  }, [menus, search, channelFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1))
  }, [pageCount, filtered.length])

  const safePage = Math.min(page, pageCount - 1)
  const start = safePage * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)
  const showingFrom = filtered.length === 0 ? 0 : start + 1
  const showingTo = Math.min(start + PAGE_SIZE, filtered.length)

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 pb-12 pt-1 md:gap-8 md:pb-16 md:pt-2">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[26px]">
            Menus
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Use menus to sell your items on kiosks, delivery apps, online ordering sites and any restaurant POS modes.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <Button type="button" variant="outline" size="sm" className="h-10 rounded-lg px-4 font-semibold" disabled title="Coming soon">
            Rearrange
          </Button>
          <Button type="button" variant="default" size="sm" className="h-10 rounded-lg px-4 font-semibold" onClick={onCreateMenu}>
            Create a menu
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search by menu name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border-border bg-background ps-10 text-[13px]"
            aria-label="Search by menu name"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelFilter)}>
            <SelectTrigger
              size="sm"
              className="h-10 w-fit max-w-full shrink-0 items-center justify-start gap-1 rounded-xl border-border bg-background ps-3 pe-2 text-[13px] font-semibold shadow-none data-[size=sm]:h-10 data-[size=sm]:rounded-xl"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 font-medium text-muted-foreground">Channels</span>
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pos">Points of sale</SelectItem>
              <SelectItem value="online">Online ordering</SelectItem>
            </SelectContent>
          </Select>

          <div
            className="ml-auto flex shrink-0 items-center rounded-xl border border-border bg-muted/25 p-1 sm:ml-0"
            role="group"
            aria-label="View layout"
          >
            <Button
              type="button"
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className="size-9 rounded-lg shadow-none"
              aria-pressed={view === 'grid'}
              aria-label="Block view"
              onClick={() => setView('grid')}
            >
              <LayoutGridIcon className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant={view === 'table' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className="size-9 rounded-lg shadow-none"
              aria-pressed={view === 'table'}
              aria-label="Table view"
              onClick={() => setView('table')}
            >
              <ListIcon className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {pageRows.map((row) => (
            <li key={row.id}>
              <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-background px-4 py-4 shadow-none ring-0 sm:flex-nowrap sm:items-center sm:px-5">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-[13px] font-bold text-foreground"
                  aria-hidden
                >
                  {row.initials}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[15px] font-semibold text-foreground">{row.name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <StoreIcon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      {row.locationLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <LayoutGridIcon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      {row.channelsBlock}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      {row.schedule}
                    </span>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:pl-2">
                  {row.isNew ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-blue-200 bg-blue-50 px-2.5 text-[11px] font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/80 dark:text-blue-300"
                    >
                      New
                    </Badge>
                  ) : null}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-9 rounded-lg text-muted-foreground"
                        aria-label={`Actions for ${row.name}`}
                      >
                        <MoreHorizontalIcon className="size-5" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                      <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-none ring-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="ps-4">Name</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead className="w-14 pe-4 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                    No menus match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="ps-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-bold"
                          aria-hidden
                        >
                          {row.initials}
                        </div>
                        <span className="truncate">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.locationLabel}</TableCell>
                    <TableCell className="text-muted-foreground">{row.channelsTable}</TableCell>
                    <TableCell className="pe-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-9 rounded-lg text-muted-foreground"
                            aria-label={`Actions for ${row.name}`}
                          >
                            <MoreHorizontalIcon className="size-5" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                          <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted-foreground">
            Showing <span className="font-medium text-foreground">{showingFrom}</span>–
            <span className="font-medium text-foreground">{showingTo}</span> of{' '}
            <span className="font-medium text-foreground">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[7rem] rounded-lg font-semibold"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <span className="px-1 text-[13px] tabular-nums text-muted-foreground">
              Page {safePage + 1} of {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-w-[7rem] rounded-lg font-semibold"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
