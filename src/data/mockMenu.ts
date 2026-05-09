import type { MenuCategory, MenuItem } from '../types/bookingCustomization'

/** Ordered categories for tabs — swap for CMS/API later */
export const MOCK_MENU_CATEGORIES: MenuCategory[] = [
  { id: 'starters', label: 'Starters', order: 0 },
  { id: 'mains', label: 'Mains', order: 1 },
  { id: 'desserts', label: 'Desserts', order: 2 },
  { id: 'drinks', label: 'Drinks', order: 3 },
]

/** Replace with API fetch; IDs must remain stable for saved selections */
export const MOCK_MENU_ITEMS: MenuItem[] = [
  // Starters
  {
    id: 'st-wonton',
    name: 'Crispy wontons',
    description: 'Sweet chilli dip',
    categoryId: 'starters',
    dietaryTags: ['pescatarian'],
  },
  {
    id: 'st-edamame',
    name: 'Spiced edamame',
    categoryId: 'starters',
    dietaryTags: ['vegan', 'gluten-free'],
  },
  {
    id: 'st-satay',
    name: 'Chicken satay skewers',
    description: 'Peanut sauce',
    categoryId: 'starters',
  },
  {
    id: 'st-soup',
    name: 'Tom yum soup',
    description: 'Prawn · mild spice',
    categoryId: 'starters',
    dietaryTags: ['gluten-free'],
  },
  // Mains
  {
    id: 'mn-padthai',
    name: 'King prawn pad Thai',
    categoryId: 'mains',
    dietaryTags: ['pescatarian'],
  },
  {
    id: 'mn-curry',
    name: 'Massaman lamb curry',
    description: 'Jasmine rice',
    categoryId: 'mains',
    dietaryTags: ['gluten-free'],
  },
  {
    id: 'mn-duck',
    name: 'Crispy duck pancakes',
    categoryId: 'mains',
  },
  {
    id: 'mn-tofu',
    name: 'Black pepper tofu',
    description: 'Seasonal greens',
    categoryId: 'mains',
    dietaryTags: ['vegan'],
  },
  // Desserts
  {
    id: 'ds-mango',
    name: 'Mango sticky rice',
    categoryId: 'desserts',
    dietaryTags: ['vegan', 'gluten-free'],
  },
  {
    id: 'ds-ginger',
    name: 'Ginger crème brûlée',
    categoryId: 'desserts',
  },
  {
    id: 'ds-sorbet',
    name: 'Lychee sorbet',
    categoryId: 'desserts',
    dietaryTags: ['vegan'],
  },
  // Drinks
  {
    id: 'dr-yuzu',
    name: 'Yuzu soda',
    categoryId: 'drinks',
    dietaryTags: ['vegan'],
  },
  {
    id: 'dr-jasmine',
    name: 'Jasmine iced tea',
    categoryId: 'drinks',
    dietaryTags: ['vegan'],
  },
  {
    id: 'dr-prosecco',
    name: 'Prosecco · glass',
    categoryId: 'drinks',
  },
]

const itemById = new Map(MOCK_MENU_ITEMS.map((m) => [m.id, m]))

export function getMenuItemById(id: string): MenuItem | undefined {
  return itemById.get(id)
}

export function menuItemsInCategory(categoryId: MenuItem['categoryId']): MenuItem[] {
  return MOCK_MENU_ITEMS.filter((m) => m.categoryId === categoryId)
}
