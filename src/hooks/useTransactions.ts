import { useMemo } from 'react'
import { listAllTransactions } from '@/features/transactions/transactionService'
import { useResource } from './useResource'

/** Every transaction, newest first. Balances and reports are computed from this list. */
export function useTransactions() {
  const { data, loading, error, reload } = useResource(listAllTransactions, 'transactions')
  const transactions = useMemo(() => data ?? [], [data])
  return { transactions, loading, error, reload }
}
