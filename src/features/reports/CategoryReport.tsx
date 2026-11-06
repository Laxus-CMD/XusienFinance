import { useState } from 'react'
import type { CategorySlice } from '@/calculations/cashflow'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCurrency } from '@/hooks/useCurrency'
import { cn, formatPercent } from '@/utils/format'

type Kind = 'expense' | 'income'

type Props = {
  expenseSlices: CategorySlice[]
  incomeSlices: CategorySlice[]
}

export function CategoryReport({ expenseSlices, incomeSlices }: Props) {
  const { fmt } = useCurrency()
  const [kind, setKind] = useState<Kind>('expense')
  const slices = kind === 'expense' ? expenseSlices : incomeSlices

  return (
    <Card>
      <CardHeader
        title="By category"
        subtitle="Subcategories roll up into their parent"
        action={
          <div role="group" aria-label="Category report type" className="flex rounded-control bg-raised p-1">
            {(['expense', 'income'] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className={cn(
                  'h-7 rounded-[7px] px-3 text-[13px] font-semibold transition-colors',
                  kind === k ? 'bg-surface text-ink' : 'text-mute hover:text-ink',
                )}
              >
                {k === 'expense' ? 'Spending' : 'Income'}
              </button>
            ))}
          </div>
        }
      />
      {slices.length === 0 ? (
        <p className="py-10 text-center text-sm text-mute">Nothing recorded in this period.</p>
      ) : (
        <ul className="space-y-4">
          {slices.map((s) => (
            <li key={s.id}>
              <div className="mb-1.5 flex items-center gap-2.5 text-sm">
                <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden />
                <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                <span className="font-semibold tabular-nums">{fmt(s.value)}</span>
                <span className="w-10 text-right text-[13px] tabular-nums text-mute">{formatPercent(s.share)}</span>
              </div>
              <ProgressBar percent={s.share * 100} color={s.color} label={`${s.name} share`} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
