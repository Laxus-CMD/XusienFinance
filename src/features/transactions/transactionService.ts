import { descendantIds, indexCategories } from '@/calculations/categoryTree'
import { supabase, unwrap } from '@/lib/supabase/client'
import type { Category } from '@/types/category'
import type { Transaction, TransactionFilterState, TransactionInput } from '@/types/transaction'

// Supabase returns at most 1000 rows per request, so read in pages.
const PAGE_SIZE = 1000

function ordered() {
  return supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id')
}

export async function listAllTransactions(): Promise<Transaction[]> {
  const rows: Transaction[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = unwrap(await ordered().range(from, from + PAGE_SIZE - 1))
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return rows
}

/** Inclusive date range, newest first. */
export async function listTransactionsInRange(from: string, to: string): Promise<Transaction[]> {
  const rows: Transaction[] = []
  for (let start = 0; ; start += PAGE_SIZE) {
    const page = unwrap(await ordered().gte('date', from).lte('date', to).range(start, start + PAGE_SIZE - 1))
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return rows
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  return unwrap(await supabase.from('transactions').insert(input).select().single())
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  return unwrap(await supabase.from('transactions').update(input).eq('id', id).select().single())
}

export async function deleteTransaction(id: string): Promise<void> {
  unwrap(await supabase.from('transactions').delete().eq('id', id))
}

/** Client-side filtering. Picking a parent category also matches its subcategories. */
export function applyTransactionFilters(
  transactions: Transaction[],
  filters: TransactionFilterState,
  categories: Category[],
): Transaction[] {
  const byId = indexCategories(categories)
  const categoryIds = filters.categoryId ? descendantIds(filters.categoryId, categories) : null
  const needle = filters.search.trim().toLowerCase()

  return transactions.filter((t) => {
    if (filters.type !== 'all' && t.type !== filters.type) return false
    if (filters.accountId && t.account_id !== filters.accountId && t.to_account_id !== filters.accountId) return false
    if (categoryIds && (!t.category_id || !categoryIds.has(t.category_id))) return false
    if (filters.from && t.date < filters.from) return false
    if (filters.to && t.date > filters.to) return false
    if (needle) {
      const category = t.category_id ? (byId.get(t.category_id)?.name ?? '') : ''
      const haystack = `${t.description} ${category}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })
}
