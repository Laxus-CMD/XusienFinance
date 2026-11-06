import {
  type CategorySlice,
  type MonthPoint,
  type Summary,
  categoryBreakdown,
  filterByRange,
  monthlySeries,
  percentChange,
  savingsRate,
  summarize,
} from '@/calculations/cashflow'
import type { Category } from '@/types/category'
import type { Transaction } from '@/types/transaction'
import { currentMonthKey, lastMonthKeys, monthBounds, shiftMonthKey } from '@/utils/date'

export type ReportRangeKey = 'last-3' | 'last-6' | 'last-12' | 'ytd'

export const REPORT_RANGES: { key: ReportRangeKey; label: string }[] = [
  { key: 'last-3', label: '3 months' },
  { key: 'last-6', label: '6 months' },
  { key: 'last-12', label: '12 months' },
  { key: 'ytd', label: 'Year to date' },
]

export type Report = {
  keys: string[]
  from: string
  to: string
  summary: Summary
  /** Same number of months, immediately before the range. */
  previous: Summary
  series: MonthPoint[]
  expenseSlices: CategorySlice[]
  incomeSlices: CategorySlice[]
  savingsRate: number | null
  changes: { income: number | null; expense: number | null; net: number | null }
}

export function monthKeysFor(range: ReportRangeKey, now = currentMonthKey()): string[] {
  switch (range) {
    case 'last-3':
      return lastMonthKeys(3, now)
    case 'last-6':
      return lastMonthKeys(6, now)
    case 'last-12':
      return lastMonthKeys(12, now)
    case 'ytd':
      return lastMonthKeys(Number(now.slice(5, 7)), now)
  }
}

export function buildReport(
  transactions: Transaction[],
  categories: Category[],
  range: ReportRangeKey,
  now = currentMonthKey(),
): Report {
  const keys = monthKeysFor(range, now)
  const from = monthBounds(keys[0]).from
  const to = monthBounds(keys[keys.length - 1]).to
  const inRange = filterByRange(transactions, from, to)

  const previousKeys = keys.map((k) => shiftMonthKey(k, -keys.length))
  const previous = summarize(
    filterByRange(transactions, monthBounds(previousKeys[0]).from, monthBounds(previousKeys[previousKeys.length - 1]).to),
  )
  const summary = summarize(inRange)

  return {
    keys,
    from,
    to,
    summary,
    previous,
    series: monthlySeries(inRange, keys),
    expenseSlices: categoryBreakdown(inRange, categories, 'expense', 8),
    incomeSlices: categoryBreakdown(inRange, categories, 'income', 8),
    savingsRate: savingsRate(summary),
    changes: {
      income: percentChange(summary.income, previous.income),
      expense: percentChange(summary.expense, previous.expense),
      net: percentChange(summary.net, previous.net),
    },
  }
}
