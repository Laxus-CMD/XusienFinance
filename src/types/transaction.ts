import type { TransactionRow, TransactionType } from '@/lib/supabase/database.types'

export type { TransactionType }
export type Transaction = TransactionRow

export type TransactionInput = {
  type: TransactionType
  amount: number
  date: string
  account_id: string
  to_account_id: string | null
  category_id: string | null
  description: string
}

export type TransactionFilterState = {
  search: string
  type: TransactionType | 'all'
  accountId: string
  categoryId: string
  from: string
  to: string
}

export const EMPTY_FILTERS: TransactionFilterState = {
  search: '',
  type: 'all',
  accountId: '',
  categoryId: '',
  from: '',
  to: '',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
}
