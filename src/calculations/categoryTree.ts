import type { Category, CategoryNode, CategoryType } from '@/types/category'

const byName = (a: Category, b: Category) => a.name.localeCompare(b.name)

export function indexCategories(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((c) => [c.id, c]))
}

/** Top-level categories with their subcategories, sorted by name. */
export function buildCategoryTree(categories: Category[], type?: CategoryType): CategoryNode[] {
  const scoped = type ? categories.filter((c) => c.type === type) : categories
  return scoped
    .filter((c) => c.parent_id === null)
    .sort(byName)
    .map((category) => ({
      category,
      children: scoped.filter((c) => c.parent_id === category.id).sort(byName),
    }))
}

/** The category itself plus every subcategory under it. */
export function descendantIds(categoryId: string, categories: Category[]): Set<string> {
  const ids = new Set<string>([categoryId])
  let grew = true
  while (grew) {
    grew = false
    for (const c of categories) {
      if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) {
        ids.add(c.id)
        grew = true
      }
    }
  }
  return ids
}

/** Walk up to the top-level parent. A top-level category is its own root. */
export function rootCategory(categoryId: string, byId: Map<string, Category>): Category | undefined {
  let current = byId.get(categoryId)
  for (let i = 0; current?.parent_id && i < 10; i++) {
    current = byId.get(current.parent_id) ?? current
    if (!current.parent_id) break
  }
  return current
}

/** "Food & Dining / Groceries" */
export function categoryPath(categoryId: string | null, byId: Map<string, Category>): string {
  if (!categoryId) return 'Uncategorized'
  const category = byId.get(categoryId)
  if (!category) return 'Uncategorized'
  const parent = category.parent_id ? byId.get(category.parent_id) : undefined
  return parent ? `${parent.name} / ${category.name}` : category.name
}
