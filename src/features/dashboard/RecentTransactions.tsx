import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import type { Account } from '@/types/account'
import type { Category } from '@/types/category'
import type { Transaction } from '@/types/transaction'
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/format'

type Props = {
  transactions: Transaction[]
  accountsById: Map<string, Account>
  categoriesById: Map<string, Category>
}

const ICONS = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight }

export function RecentTransactions({ transactions, accountsById, categoriesById }: Props) {
  const { fmt } = useCurrency()

  return (
    <Card className="h-full">
      <CardHeader
        title="Recent transactions"
        action={
          <a href="#/transactions" className="text-[13px] font-semibold text-brand hover:underline">
            View all
          </a>
        }
      />
      {transactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-mute">Transactions you record will show up here.</p>
      ) : (
        <ul className="-my-1 divide-y divide-line">
          {transactions.map((t) => {
            const Icon = ICONS[t.type]
            const category = t.category_id ? categoriesById.get(t.category_id) : undefined
            const title = t.description || category?.name || TRANSACTION_TYPE_LABELS[t.type]
            return (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${category?.color ?? '#6b7487'}26`, color: category?.color ?? '#9aa3b5' }}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{title}</p>
                  <p className="flex gap-3 text-[13px] text-mute">
                    <span>{formatDate(t.date)}</span>
                    <span className="truncate">{accountsById.get(t.account_id)?.name}</span>
                  </p>
                </div>
                <p
                  className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    t.type === 'income' && 'text-income',
                    t.type === 'transfer' && 'text-mute',
                  )}
                >
                  {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                  {fmt(t.amount)}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
