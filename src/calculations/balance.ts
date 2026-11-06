import type { Account } from '@/types/account'
import type { Transaction } from '@/types/transaction'
import { roundMoney } from '@/utils/currency'

/**
 * Balance per account id.
 * opening balance + income - expenses, minus transfers out, plus transfers in.
 */
export function accountBalances(accounts: Account[], transactions: Transaction[]): Record<string, number> {
  const balances: Record<string, number> = {}
  for (const a of accounts) balances[a.id] = a.opening_balance

  const add = (id: string | null, delta: number) => {
    if (id !== null && id in balances) balances[id] += delta
  }

  for (const t of transactions) {
    if (t.type === 'income') {
      add(t.account_id, t.amount)
    } else if (t.type === 'expense') {
      add(t.account_id, -t.amount)
    } else {
      add(t.account_id, -t.amount)
      add(t.to_account_id, t.amount)
    }
  }

  for (const id of Object.keys(balances)) balances[id] = roundMoney(balances[id])
  return balances
}

/** Sum of balances across accounts that are not archived. */
export function totalBalance(accounts: Account[], balances: Record<string, number>): number {
  return roundMoney(
    accounts.filter((a) => !a.is_archived).reduce((total, a) => total + (balances[a.id] ?? 0), 0),
  )
}
