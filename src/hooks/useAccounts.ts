import { useMemo } from 'react'
import { listAccounts } from '@/features/accounts/accountService'
import { useResource } from './useResource'

export function useAccounts() {
  const { data, loading, error, reload } = useResource(listAccounts, 'accounts')
  const accounts = useMemo(() => data ?? [], [data])
  const activeAccounts = useMemo(() => accounts.filter((a) => !a.is_archived), [accounts])
  return { accounts, activeAccounts, loading, error, reload }
}
