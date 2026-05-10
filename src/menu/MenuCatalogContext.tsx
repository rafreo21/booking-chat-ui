import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_MENU_CATEGORIES, MOCK_MENU_ITEMS, MOCK_MENUS } from '../data/mockMenu'
import type {
  Menu,
  MenuCategory,
  MenuCategoryId,
  MenuId,
  MenuItem,
} from '../types/bookingCustomization'
import {
  MenuCatalogContext,
  type MenuCatalogContextValue,
} from './catalogTypes'

type CatalogJson = {
  availabilityVersion?: string
  menus?: Menu[]
  categories?: MenuCategory[]
  items?: MenuItem[]
}

type Snapshot = {
  availabilityVersion: string
  menus: Menu[]
  categories: MenuCategory[]
  items: MenuItem[]
}

function normalizeCatalog(raw: CatalogJson | null): Snapshot {
  const cats = raw?.categories
  const items = raw?.items
  if (cats?.length && items?.length) {
    const menus =
      raw?.menus && raw.menus.length > 0
        ? [...raw.menus].sort((a, b) => a.order - b.order)
        : // No menus declared in JSON — synthesize a default one.
          [{ id: 'default', label: 'Menu', order: 0 } as Menu]
    const fallbackMenuId = menus[0]?.id ?? 'default'
    return {
      availabilityVersion: raw?.availabilityVersion?.trim() || 'catalog',
      menus,
      categories: [...cats]
        .map((c) => ({ ...c, menuId: c.menuId ?? fallbackMenuId }))
        .sort((a, b) => a.order - b.order),
      items,
    }
  }
  return {
    availabilityVersion: 'mock',
    menus: [...MOCK_MENUS].sort((a, b) => a.order - b.order),
    categories: [...MOCK_MENU_CATEGORIES].sort((a, b) => a.order - b.order),
    items: MOCK_MENU_ITEMS,
  }
}

export function MenuCatalogProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot>(() => normalizeCatalog(null))

  const load = useCallback(async () => {
    const url = import.meta.env.VITE_MENU_URL?.trim() || '/menu.json'
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Menu HTTP ${res.status}`)
      const json = (await res.json()) as CatalogJson
      setSnapshot(normalizeCatalog(json))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Menu load failed'
      setError(msg)
      setSnapshot(normalizeCatalog(null))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const value = useMemo<MenuCatalogContextValue>(() => {
    const byId = new Map(snapshot.items.map((m) => [m.id, m]))
    return {
      loading,
      error,
      availabilityVersion: snapshot.availabilityVersion,
      menus: snapshot.menus,
      categories: snapshot.categories,
      items: snapshot.items,
      getMenuItemById: (id: string) => byId.get(id),
      menuItemsInCategory: (categoryId: MenuCategoryId) =>
        snapshot.items.filter((m) => m.categoryId === categoryId),
      categoriesInMenu: (menuId: MenuId) =>
        snapshot.categories.filter((c) => (c.menuId ?? snapshot.menus[0]?.id) === menuId),
      refetch: load,
    }
  }, [loading, error, snapshot, load])

  return <MenuCatalogContext.Provider value={value}>{children}</MenuCatalogContext.Provider>
}
