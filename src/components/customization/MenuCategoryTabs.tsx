import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Menu, MenuCategoryId, MenuId } from '../../types/bookingCustomization'

type Props = {
  menus: Menu[]
  activeMenuId: MenuId
  onMenuChange: (id: MenuId) => void
  categories: { id: MenuCategoryId; label: string }[]
  activeId: MenuCategoryId
  onChange: (id: MenuCategoryId) => void
}

export function MenuCategoryTabs({
  menus,
  activeMenuId,
  onMenuChange,
  categories,
  activeId,
  onChange,
}: Props) {
  const showMenuPicker = menus.length > 1

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
        <Tabs value={activeId} onValueChange={onChange} className="w-full min-w-0">
          <TabsList
            className="h-auto w-full min-w-0 flex-nowrap justify-start gap-2 overflow-x-auto border-0 bg-transparent p-0 shadow-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Course category"
          >
            {categories.map((c) => (
              <TabsTrigger
                key={c.id}
                value={c.id}
                className="flex-none rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-foreground shadow-xs ring-0 transition-colors after:hidden hover:bg-muted/60 hover:text-foreground data-[state=active]:border-primary data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground"
              >
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  )
}
