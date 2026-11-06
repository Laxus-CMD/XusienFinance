import { useCallback, useMemo, useState } from 'react'
import { type AppAlert, buildAlerts } from '@/calculations/alerts'
import { listBills } from '@/features/bills/billService'
import { listBudgets } from '@/features/budgets/budgetService'
import { listCategories } from '@/features/categories/categoryService'
import { listTransactionsInRange } from '@/features/transactions/transactionService'
import { currentMonthKey, monthBounds, todayISO } from '@/utils/date'
import { useCurrency } from './useCurrency'
import { useResource } from './useResource'

const STORAGE_KEY = 'laxfinance.dismissed-alerts'

function readDismissed(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function writeDismissed(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage can be blocked. Dismissals then last only until reload.
  }
}

/**
 * Bill reminders and budget alerts, worked out from live data.
 * Pass the current route as `refreshKey` so alerts refresh as the user moves around.
 */
export function useNotifications(refreshKey: string) {
  const { fmt } = useCurrency()
  const [dismissed, setDismissed] = useState<string[]>(readDismissed)

  const { data } = useResource(async () => {
    const { from, to } = monthBounds(currentMonthKey())
    const [bills, budgets, categories, transactions] = await Promise.all([
      listBills(),
      listBudgets(),
      listCategories(),
      listTransactionsInRange(from, to),
    ])
    return { bills, budgets, categories, transactions }
  }, refreshKey)

  const alerts: AppAlert[] = useMemo(() => {
    if (!data) return []
    return buildAlerts({ ...data, today: todayISO(), money: (n) => fmt(n) }).filter(
      (a) => !dismissed.includes(a.id),
    )
  }, [data, dismissed, fmt])

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = [...prev, id].slice(-200)
      writeDismissed(next)
      return next
    })
  }, [])

  return { alerts, dismiss }
}
