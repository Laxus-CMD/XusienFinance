import type { Category } from '@/types/category'
import type { Transaction } from '@/types/transaction'
import { roundMoney } from '@/utils/currency'
import { monthKey, monthLabel } from '@/utils/date'
import { NEUTRAL } from '@/utils/palette'
import { indexCategories, rootCategory } from './categoryTree'

export type Summary = { income: number; expense: number; net: number }

export type MonthPoint = Summary & { key: string; label: string }

export type CategorySlice = {
  id: string
  name: string
  color: string
  value: number
  /** 0 to 1 */
  share: number
}

/** Income and expense totals. Transfers are ignored because they only move money around. */
export function summarize(transactions: Transaction[]): Summary {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else if (t.type === 'expense') expense += t.amount
  }
  income = roundMoney(income)
  expense = roundMoney(expense)
  return { income, expense, net: roundMoney(income - expense) }
}

/** Inclusive range on ISO date strings. Empty bounds are open. */
export function filterByRange(transactions: Transaction[], from?: string, to?: string): Transaction[] {
  return transactions.filter((t) => (!from || t.date >= from) && (!to || t.date <= to))
}

/** One point per month key, in the order given. Months with no activity are zero. */
export function monthlySeries(transactions: Transaction[], keys: string[]): MonthPoint[] {
  const buckets = new Map<string, Transaction[]>(keys.map((k) => [k, []]))
  for (const t of transactions) buckets.get(monthKey(t.date))?.push(t)
  return keys.map((key) => ({
    key,
    label: monthLabel(key),
    ...summarize(buckets.get(key) ?? []),
  }))
}

/**
 * Totals per top-level category. Subcategories roll up into their parent.
 * Anything past `limit` folds into one "Other" slice so charts stay readable.
 */
export function categoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense',
  limit = 6,
): CategorySlice[] {
  const byId = indexCategories(categories)
  const totals = new Map<string, { name: string; color: string; value: number }>()

  for (const t of transactions) {
    if (t.type !== type) continue
    const root = t.category_id ? rootCategory(t.category_id, byId) : undefined
    const id = root?.id ?? 'uncategorized'
    const entry = totals.get(id) ?? {
      name: root?.name ?? 'Uncategorized',
      color: root?.color ?? NEUTRAL,
      value: 0,
    }
    entry.value += t.amount
    totals.set(id, entry)
  }

  const sorted = [...totals.entries()]
    .map(([id, e]) => ({ id, name: e.name, color: e.color, value: roundMoney(e.value) }))
    .sort((a, b) => b.value - a.value)

  const grand = sorted.reduce((total, s) => total + s.value, 0)
  let slices = sorted
  if (sorted.length > limit) {
    const rest = sorted.slice(limit)
    slices = [
      ...sorted.slice(0, limit),
      {
        id: 'other-group',
        name: `Other (${rest.length})`,
        color: NEUTRAL,
        value: roundMoney(rest.reduce((total, s) => total + s.value, 0)),
      },
    ]
  }
  return slices.map((s) => ({ ...s, share: grand > 0 ? s.value / grand : 0 }))
}

/** Share of income kept. Null when there is no income. */
export function savingsRate(summary: Summary): number | null {
  return summary.income > 0 ? summary.net / summary.income : null
}

/** (current - previous) / previous. Null when previous is zero. */
export function percentChange(current: number, previous: number): number | null {
  return previous !== 0 ? (current - previous) / Math.abs(previous) : null
}
