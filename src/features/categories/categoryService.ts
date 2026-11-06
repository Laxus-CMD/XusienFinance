import { supabase, unwrap } from '@/lib/supabase/client'
import type { Category, CategoryInput } from '@/types/category'

export async function listCategories(): Promise<Category[]> {
  return unwrap(await supabase.from('categories').select('*').order('name'))
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return unwrap(await supabase.from('categories').insert(input).select().single())
}

export async function updateCategory(id: string, patch: Partial<CategoryInput>): Promise<Category> {
  return unwrap(await supabase.from('categories').update(patch).eq('id', id).select().single())
}

/** Deleting a category also deletes its subcategories. Transactions keep existing as uncategorized. */
export async function deleteCategory(id: string): Promise<void> {
  unwrap(await supabase.from('categories').delete().eq('id', id))
}
