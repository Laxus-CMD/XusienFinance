import { Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import { useCurrency } from '@/hooks/useCurrency'
import type { Account } from '@/types/account'
import type { Category } from '@/types/category'
import type { Transaction } from '@/types/transaction'
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction'
import { categoryPath } from '@/calculations/categoryTree'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/format'

type Props = {
  transactions: Transaction[]
  accountsById: Map<string, Account>
  categoriesById: Map<string, Category>
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

const GRID = 'sm:grid-cols-[84px_minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_112px_72px]'

export function TransactionTable({ transactions, accountsById, categoriesById, onEdit, onDelete }: Props) {
  const { fmt } = useCurrency()

  return (
    <div>
      <div
        aria-hidden
        className={cn('hidden gap-4 border-b border-line px-5 py-3 text-[13px] font-medium text-mute sm:grid', GRID)}
      >
        <span>Date</span>
        <span>Description</span>
        <span>Category</span>
        <span>Account</span>
        <span className="text-right">Amount</span>
        <span />
      </div>
      <ul className="divide-y divide-line">
        {transactions.map((t) => {
          const category = t.category_id ? categoriesById.get(t.category_id) : undefined
          const from = accountsById.get(t.account_id)?.name ?? 'Unknown'
          const to = t.to_account_id ? (accountsById.get(t.to_account_id)?.name ?? 'Unknown') : null
          const label = t.description || (to ? `Transfer to ${to}` : categoryPath(t.category_id, categoriesById))

          return (
            <li key={t.id} className={cn('grid items-center gap-x-4 gap-y-1 px-5 py-3 text-sm', GRID)}>
              <span className="order-2 text-[13px] text-mute sm:order-none sm:text-sm">{formatDate(t.date)}</span>
              <span className="order-1 min-w-0 truncate font-semibold sm:order-none">{label}</span>
              <span className="order-3 hidden min-w-0 items-center gap-2 truncate text-mute sm:order-none sm:flex">
                {t.type === 'transfer' ? (
                  TRANSACTION_TYPE_LABELS.transfer
                ) : (
                  <>
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: category?.color ?? '#6b7487' }}
                      aria-hidden
                    />
                    <span className="truncate">{categoryPath(t.category_id, categoriesById)}</span>
                  </>
                )}
              </span>
              <span className="order-3 hidden min-w-0 truncate text-mute sm:order-none sm:block">
                {to ? `${from} to ${to}` : from}
              </span>
              <span
                className={cn(
                  'order-1 text-right font-semibold tabular-nums sm:order-none',
                  t.type === 'income' && 'text-income',
                  t.type === 'transfer' && 'text-mute',
                )}
              >
                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                {fmt(t.amount)}
              </span>
              <span className="order-4 col-span-2 flex justify-end sm:order-none sm:col-span-1">
                <IconButton label={`Edit ${label}`} onClick={() => onEdit(t)}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton label={`Delete ${label}`} danger onClick={() => onDelete(t)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
