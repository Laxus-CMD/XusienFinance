import type { Account } from '@/types/account'
import type { Transaction } from '@/types/transaction'
import { roundMoney } from '@/utils/currency'
import { monthBounds, monthLabel } from '@/utils/date'
import { totalBalance } from './balance'

export type NetWorthPoint = { key: string; label: string; value: number }

/** Net worth today. Same as the total of all active account balances. */
export function netWorth(accounts: Account[], balances: Record<string, number>): number {
  return totalBalance(accounts, balances)
}

/**
 * Net worth at the end of each month.
 * Assumes every active account existed from the start with its opening balance.
 */
export function netWorthSeries(
  accounts: Account[],
  transactions: Transaction[],
  keys: string[],
): NetWorthPoint[] {
  const included = new Set(accounts.filter((a) => !a.is_archived).map((a) => a.id))
  const opening = accounts.filter((a) => included.has(a.id)).reduce((t, a) => t + a.opening_balance, 0)

  const effect = (t: Transaction): number => {
    if (t.type === 'income') return included.has(t.account_id) ? t.amount : 0
    if (t.type === 'expense') return included.has(t.account_id) ? -t.amount : 0
    return (included.has(t.account_id) ? -t.amount : 0) + (t.to_account_id && included.has(t.to_account_id) ? t.amount : 0)
  }

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  let running = opening
  let i = 0

  return keys.map((key) => {
    const end = monthBounds(key).to
    while (i < sorted.length && sorted[i].date <= end) {
      running += effect(sorted[i])
      i++
    }
    return { key, label: monthLabel(key), value: roundMoney(running) }
  })
}
