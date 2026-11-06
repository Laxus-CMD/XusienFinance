import type { AccountRow, AccountType } from '@/lib/supabase/database.types'

export type { AccountType }
export type Account = AccountRow

export type AccountInput = {
  name: string
  type: AccountType
  opening_balance: number
  color: string
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Cash',
  bank: 'Bank account',
  ewallet: 'E-wallet',
}

export const ACCOUNT_TYPES: AccountType[] = ['cash', 'bank', 'ewallet']
