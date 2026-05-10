import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Menu, MenuCategoryId, MenuId } from '../../types/bookingCustomization'
import { PILL_TAB_TRIGGER_CLASS, PILL_TABS_LIST_CLASS } from './pillTabStyles'

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
          <TabsList className={PILL_TABS_LIST_CLASS} aria-label="Course category">
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className={PILL_TAB_TRIGGER_CLASS}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  )
}
