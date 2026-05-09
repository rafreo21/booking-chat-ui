import { useContext } from 'react'
import { MenuCatalogContext, type MenuCatalogContextValue } from './catalogTypes'

export function useMenuCatalog(): MenuCatalogContextValue {
  const ctx = useContext(MenuCatalogContext)
  if (!ctx) throw new Error('useMenuCatalog must be used within MenuCatalogProvider')
  return ctx
}
