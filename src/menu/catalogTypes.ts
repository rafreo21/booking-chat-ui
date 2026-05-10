import { createContext } from 'react'
import type {
  Menu,
  MenuCategory,
  MenuCategoryId,
  MenuId,
  MenuItem,
} from '../types/bookingCustomization'

export type MenuCatalogContextValue = {
  loading: boolean
  error: string | null
  availabilityVersion: string
  /** All menus available (e.g. À la Carte, Brunch, Drinks). */
  menus: Menu[]
  /** Categories across all menus. Filter via {@link categoriesInMenu}. */
  categories: MenuCategory[]
  items: MenuItem[]
  getMenuItemById: (id: string) => MenuItem | undefined
  menuItemsInCategory: (categoryId: MenuCategoryId) => MenuItem[]
  /** Categories that belong to a given menu, sorted by `order`. */
  categoriesInMenu: (menuId: MenuId) => MenuCategory[]
  refetch: () => Promise<void>
}

export const MenuCatalogContext = createContext<MenuCatalogContextValue | null>(null)
