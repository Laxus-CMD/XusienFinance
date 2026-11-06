import type { BudgetRow } from '@/lib/supabase/database.types'
import type { Category } from './category'

export type Budget = BudgetRow

export type BudgetInput = {
  category_id: string
  amount: number
  alert_threshold: number
}

export type BudgetStatus = 'ok' | 'warning' | 'over'

export type BudgetUsage = {
  budget: Budget
  category: Category | undefined
  spent: number
  remaining: number
  /** 0 to 100 or more. Over 100 means the limit is exceeded. */
  percent: number
  status: BudgetStatus
}
