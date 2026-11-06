import { useMemo } from 'react'
import { type FormatOptions, formatCurrency } from '@/utils/currency'
import { useAuth } from './useAuth'

/** Money formatter bound to the currency in the user's profile. */
export function useCurrency() {
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'PHP'
  return useMemo(
    () => ({
      currency,
      fmt: (amount: number, opts?: FormatOptions) => formatCurrency(amount, currency, opts),
    }),
    [currency],
  )
}
