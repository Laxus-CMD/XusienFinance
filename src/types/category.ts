import type { CategoryRow, CategoryType } from '@/lib/supabase/database.types'

export type { CategoryType }
export type Category = CategoryRow

export type CategoryInput = {
  name: string
  type: CategoryType
  parent_id: string | null
  color: string
}

export type CategoryNode = {
  category: Category
  children: Category[]
}
