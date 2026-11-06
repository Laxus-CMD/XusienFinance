import { useMemo } from 'react'
import { indexCategories } from '@/calculations/categoryTree'
import { listCategories } from '@/features/categories/categoryService'
import { useResource } from './useResource'

export function useCategories() {
  const { data, loading, error, reload } = useResource(listCategories, 'categories')
  const categories = useMemo(() => data ?? [], [data])
  const byId = useMemo(() => indexCategories(categories), [categories])
  return { categories, byId, loading, error, reload }
}
