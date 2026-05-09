import { createContext } from 'react'
import type { MenuCategory, MenuCategoryId, MenuItem } from '../types/bookingCustomization'

export type MenuCatalogContextValue = {
  loading: boolean
  error: string | null
  availabilityVersion: string
  categories: MenuCategory[]
  items: MenuItem[]
  getMenuItemById: (id: string) => MenuItem | undefined
  menuItemsInCategory: (categoryId: MenuCategoryId) => MenuItem[]
  refetch: () => Promise<void>
}

export const MenuCatalogContext = createContext<MenuCatalogContextValue | null>(null)
