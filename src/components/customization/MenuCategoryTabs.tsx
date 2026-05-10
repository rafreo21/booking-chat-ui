import { useEffect, useRef, useState } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Menu, MenuCategoryId, MenuId } from '../../types/bookingCustomization'
import {
  PILL_CHOICE_BUTTON_CLASS,
  PILL_TAB_TRIGGER_CLASS,
  PILL_TABS_LIST_CLASS,
} from './pillTabStyles'

type Props = {
  menus: Menu[]
  activeMenuId: MenuId
  onMenuChange: (id: MenuId) => void
  categories: { id: MenuCategoryId; label: string }[]
  activeId: MenuCategoryId
  onChange: (id: MenuCategoryId) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

export function MenuCategoryTabs({
  menus,
  activeMenuId,
  onMenuChange,
  categories,
  activeId,
  onChange,
  searchQuery,
  onSearchQueryChange,
}: Props) {
  const showMenuPicker = menus.length > 1
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) queueMicrotask(() => inputRef.current?.focus())
  }, [searchOpen])

  const collapseSearch = () => {
    setSearchOpen(false)
    onSearchQueryChange('')
  }

  const hasActiveQuery = Boolean(searchQuery.trim())

  return (
    <div className="min-w-0 space-y-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">Menu</h3>
        {showMenuPicker ? (
          <Select value={activeMenuId} onValueChange={onMenuChange}>
            <SelectTrigger
              size="default"
              className="mt-2 h-10 w-full max-w-xs justify-between rounded-lg text-sm font-medium"
              aria-label="Choose a menu"
            >
              <SelectValue placeholder="Choose a menu" />
            </SelectTrigger>
            <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
              {menus.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {categories.length > 0 ? (
        <div className="flex min-w-0 flex-nowrap items-center gap-2">
          <div className="shrink-0" role="search">
            {!searchOpen ? (
              <button
                type="button"
                className={cn(
                  PILL_CHOICE_BUTTON_CLASS,
                  'size-9 p-0 transition-[border-color,box-shadow,transform,background-color] duration-200',
                  'hover:border-primary/35 hover:shadow-md hover:bg-muted/80',
                  'active:scale-[0.96]',
                )}
                aria-label="Search dishes"
                aria-expanded={false}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon className="size-4 transition-colors duration-200" aria-hidden />
              </button>
            ) : (
              <div
                className={cn(
                  'group/search relative flex h-9 max-w-[200px] origin-left items-center gap-1 rounded-full border px-2 shadow-xs motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-2 motion-safe:duration-200',
                  'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
                  'focus-within:border-ring focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/45 focus-within:ring-offset-2 focus-within:ring-offset-background',
                  hasActiveQuery
                    ? 'border-primary/55 bg-primary/[0.07] shadow-sm dark:border-primary/45 dark:bg-primary/12'
                    : 'border-border bg-card',
                )}
              >
                <SearchIcon
                  className={cn(
                    'size-4 shrink-0 transition-colors duration-200',
                    hasActiveQuery
                      ? 'text-primary'
                      : 'text-muted-foreground group-focus-within/search:text-foreground',
                  )}
                  aria-hidden
                />
                <Input
                  id="menu-dish-search-field"
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      collapseSearch()
                    }
                  }}
                  placeholder="Search…"
                  className={cn(
                    'h-7 min-w-0 flex-1 border-0 bg-transparent px-1 py-0 text-[13px] shadow-none outline-none md:text-[13px]',
                    'placeholder:text-muted-foreground/80 placeholder:transition-colors',
                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                    hasActiveQuery && 'text-foreground font-medium',
                  )}
                  aria-label="Search dishes in this menu"
                />
                <button
                  type="button"
                  className={cn(
                    'rounded-full p-1 text-muted-foreground transition-[background-color,color,transform] duration-150',
                    'hover:bg-muted hover:text-foreground',
                    'active:scale-90',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                  aria-label="Close search"
                  onClick={() => collapseSearch()}
                >
                  <XIcon className="size-3.5" aria-hidden />
                </button>
              </div>
            )}
          </div>

          <Tabs value={activeId} onValueChange={onChange} className="min-w-0 flex-1 overflow-hidden">
            <TabsList className={PILL_TABS_LIST_CLASS} aria-label="Course category">
              {categories.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className={PILL_TAB_TRIGGER_CLASS}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      ) : null}
    </div>
  )
}
