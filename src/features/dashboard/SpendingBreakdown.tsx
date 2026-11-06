import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategorySlice } from '@/calculations/cashflow'
import { ChartTooltip } from '@/components/shared/ChartTooltip'
import { Card, CardHeader } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import { formatPercent } from '@/utils/format'

type Props = {
  slices: CategorySlice[]
  total: number
}

export function SpendingBreakdown({ slices, total }: Props) {
  const { fmt } = useCurrency()

  return (
    <Card className="h-full">
      <CardHeader title="Where it went" subtitle="Spending by category this month" />
      {slices.length === 0 ? (
        <p className="py-10 text-center text-sm text-mute">No spending recorded this month yet.</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative size-44 shrink-0" role="img" aria-label="Donut chart of spending by category. The list beside it has the same numbers.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<ChartTooltip format={(v) => fmt(v)} />} />
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="66%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="#151a23"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {slices.map((s) => (
                    <Cell key={s.id} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-mute">Spent</span>
              <span className="text-base font-bold tabular-nums">{fmt(total, { compact: total >= 100000 })}</span>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-2.5">
            {slices.map((s) => (
              <li key={s.id} className="flex items-start gap-2.5 text-sm">
                <span className="mt-[5px] size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="flex gap-3 text-[13px] tabular-nums text-mute">
                    <span>{fmt(s.value)}</span>
                    <span>{formatPercent(s.share)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
