import type { Budget, BudgetStatus, BudgetUsage } from '@/types/budget'
import type { Category } from '@/types/category'
import type { Transaction } from '@/types/transaction'
import { roundMoney } from '@/utils/currency'
import { monthKey } from '@/utils/date'
import { descendantIds, indexCategories } from './categoryTree'

export function budgetStatus(percent: number, threshold: number): BudgetStatus {
  if (percent > 100) return 'over'
  if (percent >= threshold) return 'warning'
  return 'ok'
}

/** Spending in one month against one budget. Subcategory spending counts toward the parent. */
export function budgetUsage(
  budget: Budget,
  categories: Category[],
  transactions: Transaction[],
  month: string,
): BudgetUsage {
  const ids = descendantIds(budget.category_id, categories)
  let spent = 0
  for (const t of transactions) {
    if (t.type === 'expense' && t.category_id && ids.has(t.category_id) && monthKey(t.date) === month) {
      spent += t.amount
    }
  }
  spent = roundMoney(spent)
  const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
  return {
    budget,
    category: indexCategories(categories).get(budget.category_id),
    spent,
    remaining: roundMoney(budget.amount - spent),
    percent,
    status: budgetStatus(percent, budget.alert_threshold),
  }
}

export function budgetUsages(
  budgets: Budget[],
  categories: Category[],
  transactions: Transaction[],
  month: string,
): BudgetUsage[] {
  return budgets.map((b) => budgetUsage(b, categories, transactions, month))
}

export function budgetTotals(usages: BudgetUsage[]): { limit: number; spent: number; remaining: number } {
  const limit = roundMoney(usages.reduce((t, u) => t + u.budget.amount, 0))
  const spent = roundMoney(usages.reduce((t, u) => t + u.spent, 0))
  return { limit, spent, remaining: roundMoney(limit - spent) }
}
