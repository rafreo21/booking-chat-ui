import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_MENU_CATEGORIES, MOCK_MENU_ITEMS } from '../data/mockMenu'
import type { MenuCategory, MenuCategoryId, MenuItem } from '../types/bookingCustomization'
import {
  MenuCatalogContext,
  type MenuCatalogContextValue,
} from './catalogTypes'

type CatalogJson = {
  availabilityVersion?: string
  categories?: MenuCategory[]
  items?: MenuItem[]
}

type Snapshot = {
  availabilityVersion: string
  categories: MenuCategory[]
  items: MenuItem[]
}

function normalizeCatalog(raw: CatalogJson | null): Snapshot {
  const cats = raw?.categories
  const items = raw?.items
  if (cats?.length && items?.length) {
    return {
      availabilityVersion: raw?.availabilityVersion?.trim() || 'catalog',
      categories: [...cats].sort((a, b) => a.order - b.order),
      items,
    }
  }
  return {
    availabilityVersion: 'mock',
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
      categories: snapshot.categories,
      items: snapshot.items,
      getMenuItemById: (id: string) => byId.get(id),
      menuItemsInCategory: (categoryId: MenuCategoryId) =>
        snapshot.items.filter((m) => m.categoryId === categoryId),
      refetch: load,
    }
  }, [loading, error, snapshot, load])

  return <MenuCatalogContext.Provider value={value}>{children}</MenuCatalogContext.Provider>
}
