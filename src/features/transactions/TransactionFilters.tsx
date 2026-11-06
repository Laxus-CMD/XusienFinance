import { X } from 'lucide-react'
import { CategoryOptions } from '@/components/shared/CategoryOptions'
import { DatePicker } from '@/components/shared/DatePicker'
import { SearchBar } from '@/components/shared/SearchBar'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import type { Account } from '@/types/account'
import type { Category } from '@/types/category'
import type { TransactionFilterState, TransactionType } from '@/types/transaction'
import { EMPTY_FILTERS, TRANSACTION_TYPE_LABELS } from '@/types/transaction'

type Props = {
  filters: TransactionFilterState
  onChange: (next: TransactionFilterState) => void
  accounts: Account[]
  categories: Category[]
}

export function TransactionFilters({ filters, onChange, accounts, categories }: Props) {
  const set = <K extends keyof TransactionFilterState>(key: K, value: TransactionFilterState[K]) =>
    onChange({ ...filters, [key]: value })
  const active = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)

  return (
    <div className="space-y-3 rounded-card border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          className="min-w-52 flex-1"
          value={filters.search}
          onChange={(v) => set('search', v)}
          placeholder="Search description or category"
        />
        {active && (
          <Button variant="ghost" size="sm" icon={<X className="size-3.5" />} onClick={() => onChange(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          aria-label="Type"
          value={filters.type}
          onChange={(e) => set('type', e.target.value as TransactionType | 'all')}
        >
          <option value="all">All types</option>
          {(Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select aria-label="Account" value={filters.accountId} onChange={(e) => set('accountId', e.target.value)}>
          <option value="">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Category" value={filters.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
          <option value="">All categories</option>
          <CategoryOptions categories={categories} />
        </Select>
        <DatePicker value={filters.from} onChange={(v) => set('from', v)} max={filters.to || undefined} />
        <DatePicker value={filters.to} onChange={(v) => set('to', v)} min={filters.from || undefined} />
      </div>
    </div>
  )
}
