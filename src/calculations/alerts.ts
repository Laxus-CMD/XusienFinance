import type { Bill } from '@/types/bill'
import type { Budget } from '@/types/budget'
import type { Category } from '@/types/category'
import type { Transaction } from '@/types/transaction'
import { describeDue, formatDate, monthKey } from '@/utils/date'
import { billStatus, daysToDue, outstanding } from './bills'
import { budgetUsage } from './budget'

export type AppAlert = {
  /** Stable per bill cycle or budget month, so a dismissed alert stays dismissed. */
  id: string
  severity: 'warn' | 'bad'
  title: string
  detail: string
  target: 'bills' | 'budgets'
}

type AlertInput = {
  bills: Bill[]
  budgets: Budget[]
  categories: Category[]
  /** Transactions for the current month. */
  transactions: Transaction[]
  today: string
  money: (amount: number) => string
}

const ALERT_WINDOW_DAYS = 3

export function buildAlerts({ bills, budgets, categories, transactions, today, money }: AlertInput): AppAlert[] {
  const alerts: AppAlert[] = []

  for (const bill of bills) {
    const status = billStatus(bill, today)
    const days = daysToDue(bill, today)
    if (status === 'overdue') {
      alerts.push({
        id: `bill:${bill.id}:${bill.due_date}`,
        severity: 'bad',
        title: `${bill.name} is overdue`,
        detail: `${money(outstanding(bill))} was due ${formatDate(bill.due_date)}`,
        target: 'bills',
      })
    } else if (status !== 'paid' && days <= ALERT_WINDOW_DAYS) {
      alerts.push({
        id: `bill:${bill.id}:${bill.due_date}`,
        severity: 'warn',
        title: `${bill.name}: ${describeDue(days).toLowerCase()}`,
        detail: `${money(outstanding(bill))} on ${formatDate(bill.due_date)}`,
        target: 'bills',
      })
    }
  }

  const month = monthKey(today)
  for (const budget of budgets) {
    const usage = budgetUsage(budget, categories, transactions, month)
    if (usage.status === 'ok') continue
    const name = usage.category?.name ?? 'Budget'
    alerts.push({
      id: `budget:${budget.id}:${month}:${usage.status}`,
      severity: usage.status === 'over' ? 'bad' : 'warn',
      title: usage.status === 'over' ? `Over budget: ${name}` : `Nearing limit: ${name}`,
      detail: `${money(usage.spent)} spent of ${money(budget.amount)} this month`,
      target: 'budgets',
    })
  }

  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'bad' ? -1 : 1))
}
