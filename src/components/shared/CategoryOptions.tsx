import { buildCategoryTree } from '@/calculations/categoryTree'
import type { Category, CategoryType } from '@/types/category'

type Props = {
  categories: Category[]
  type?: CategoryType
  /** Hide these ids. Used so a budget cannot pick a category that already has one. */
  exclude?: Set<string>
}

/** <option> list with subcategories indented under their parent. Render inside a <select>. */
export function CategoryOptions({ categories, type, exclude }: Props) {
  const tree = buildCategoryTree(categories, type)
  return (
    <>
      {tree.map(({ category, children }) => (
        <OptionGroup key={category.id} category={category} children={children} exclude={exclude} />
      ))}
    </>
  )
}

function OptionGroup({ category, children, exclude }: { category: Category; children: Category[]; exclude?: Set<string> }) {
  return (
    <>
      {!exclude?.has(category.id) && <option value={category.id}>{category.name}</option>}
      {children
        .filter((child) => !exclude?.has(child.id))
        .map((child) => (
          <option key={child.id} value={child.id}>
            {'   '}
            {child.name}
          </option>
        ))}
    </>
  )
}
