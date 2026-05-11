import type { MenuItem } from '../types/bookingCustomization'

/**
 * Canonical ids for guest-selected allergens to avoid (UK/EU-style major allergens + common groupings).
 * Matching uses `MenuItem.allergens` when present, otherwise keywords on name/description/tags.
 */
export const ALLERGEN_FILTER_OPTIONS = [
  { id: 'celery', label: 'Celery' },
  { id: 'gluten', label: 'Gluten / wheat' },
  { id: 'crustaceans', label: 'Crustaceans' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'fish', label: 'Fish' },
  { id: 'lupin', label: 'Lupin' },
  { id: 'milk', label: 'Milk' },
  { id: 'molluscs', label: 'Molluscs' },
  { id: 'mustard', label: 'Mustard' },
  { id: 'tree-nuts', label: 'Tree nuts' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'sesame', label: 'Sesame' },
  { id: 'soy', label: 'Soya / soy' },
  { id: 'sulphites', label: 'Sulphites' },
] as const

export type AllergenFilterId = (typeof ALLERGEN_FILTER_OPTIONS)[number]['id']

/** Token variants that may appear in catalog `allergens[]` JSON. */
const JSON_ALIASES: Record<AllergenFilterId, readonly string[]> = {
  celery: ['celery', 'celeriac'],
  gluten: ['gluten', 'wheat', 'barley', 'rye', 'cereals containing gluten'],
  crustaceans: ['crustaceans', 'crustacean', 'shellfish', 'shrimp', 'prawn', 'crab', 'lobster'],
  eggs: ['eggs', 'egg'],
  fish: ['fish'],
  lupin: ['lupin', 'lupine'],
  milk: ['milk', 'dairy', 'lactose', 'butter', 'cream', 'cheese'],
  molluscs: ['molluscs', 'mollusc', 'mollusk', 'squid', 'octopus', 'oyster', 'mussel', 'clam', 'snail'],
  mustard: ['mustard'],
  'tree-nuts': ['tree nuts', 'tree nut', 'nuts', 'almond', 'hazelnut', 'walnut', 'cashew', 'pecan', 'pistachio', 'macadamia', 'brazil nut'],
  peanuts: ['peanuts', 'peanut', 'groundnut'],
  sesame: ['sesame', 'tahini'],
  soy: ['soy', 'soya', 'soybeans', 'soybean'],
  sulphites: ['sulphites', 'sulfites', 'sulphite', 'sulfite', 'sulfur dioxide', 'sulphur dioxide'],
}

/** Keyword fallback when items have no structured `allergens` (imprecise — improves as catalog is enriched). */
const TEXT_KEYWORDS: Record<AllergenFilterId, readonly string[]> = {
  celery: ['celery', 'celeriac'],
  gluten: ['gluten', 'wheat', 'barley', 'rye', 'couscous', 'bulgur', 'semolina', 'gnocchi', 'udon', 'panko', 'breadcrumbs'],
  crustaceans: ['crab', 'lobster', 'shrimp', 'prawn', 'crayfish', 'langoustine', 'crustacean'],
  eggs: ['egg', 'mayo', 'mayonnaise', 'meringue'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'sea bass', 'anchovy', 'sashimi', 'unagi', 'eel'],
  lupin: ['lupin', 'lupine'],
  milk: ['milk', 'cream', 'butter', 'cheese', 'yoghurt', 'yogurt', 'dairy', 'ghee', 'lactose', 'paneer', 'mascarpone'],
  molluscs: ['squid', 'calamari', 'octopus', 'oyster', 'mussel', 'clam', 'snail', 'scallop', 'cuttlefish'],
  mustard: ['mustard'],
  'tree-nuts': [
    'almond',
    'hazelnut',
    'walnut',
    'cashew',
    'pecan',
    'pistachio',
    'macadamia',
    'brazil nut',
    'nut ',
    'nuts ',
    'pine nut',
    'marzipan',
  ],
  peanuts: ['peanut', 'groundnut'],
  sesame: ['sesame', 'tahini'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'miso', 'tamari', 'teriyaki'],
  sulphites: ['sulphite', 'sulfite', 'sulfur dioxide', 'sulphur dioxide', 'wine'],
}

function blobForItem(item: MenuItem): string {
  return [item.name, item.description ?? '', ...(item.dietaryTags ?? [])].join(' ').toLowerCase()
}

function structuredAllergenBlob(item: MenuItem): string {
  const tags = item.allergens ?? []
  return tags.join(' ').toLowerCase()
}

function matchesAliases(blob: string, aliases: readonly string[]): boolean {
  for (const a of aliases) {
    if (blob.includes(a.toLowerCase())) return true
  }
  return false
}

/** True if this dish likely contains the avoided allergen (hide from picker when guest selected it). */
export function itemLikelyContainsAllergen(item: MenuItem, avoid: AllergenFilterId): boolean {
  const structured = structuredAllergenBlob(item).trim()
  if (structured.length > 0) {
    if (matchesAliases(structured, JSON_ALIASES[avoid])) return true
  }
  const blob = blobForItem(item)
  return matchesAliases(blob, TEXT_KEYWORDS[avoid])
}

export function itemMatchesAnyAvoidedAllergen(item: MenuItem, avoided: Iterable<AllergenFilterId>): boolean {
  for (const id of avoided) {
    if (itemLikelyContainsAllergen(item, id)) return true
  }
  return false
}

/** Keeps items that do not match any avoided allergen. */
export function filterItemsByAllergens<T extends MenuItem>(
  items: readonly T[],
  avoidedIds: readonly AllergenFilterId[],
): T[] {
  if (avoidedIds.length === 0) return [...items]
  const set = new Set(avoidedIds)
  return items.filter((item) => !itemMatchesAnyAvoidedAllergen(item, set))
}

const ALLOWED_IDS = new Set<string>(ALLERGEN_FILTER_OPTIONS.map((o) => o.id))

/** Normalize persisted seat allergen ids from JSON/API. */
export function parseAllergenFilterIds(raw: readonly string[] | undefined): AllergenFilterId[] {
  if (!raw?.length) return []
  const out: AllergenFilterId[] = []
  for (const x of raw) {
    if (ALLOWED_IDS.has(x)) out.push(x as AllergenFilterId)
  }
  return out
}

export function allergenOptionLabel(id: AllergenFilterId): string {
  return ALLERGEN_FILTER_OPTIONS.find((o) => o.id === id)?.label ?? id
}
