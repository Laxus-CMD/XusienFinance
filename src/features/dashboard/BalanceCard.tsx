import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import type { NetWorthPoint } from '@/calculations/netWorth'
import { ChartTooltip } from '@/components/shared/ChartTooltip'
import { Card } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import { plural, formatPercent } from '@/utils/format'
import { CHART } from '@/utils/palette'

type BalanceProps = {
  total: number
  /** Change since the end of last month. Null when there is no history. */
  change: number | null
  series: NetWorthPoint[]
  accountCount: number
}

/** The headline of the dashboard: total balance with a six month trend. */
export function BalanceCard({ total, change, series, accountCount }: BalanceProps) {
  const { fmt } = useCurrency()
  const Arrow = change !== null && change < 0 ? ArrowDownRight : ArrowUpRight

  return (
    <Card className="flex h-full flex-col">
      <p className="text-sm font-medium text-mute">Total balance</p>
      <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums sm:text-[2.75rem] sm:leading-tight">
        {fmt(total)}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-mute">
        {change !== null && (
          <>
            <Arrow className="size-3.5" aria-hidden />
            <span className="font-semibold tabular-nums text-ink">{fmt(change, { sign: true })}</span>
            <span>since last month</span>
          </>
        )}
        {change === null && <span>Across {plural(accountCount, 'account')}</span>}
      </p>

      <div className="-mx-1 mt-5 h-24 flex-1" role="img" aria-label={`Net worth over the last ${series.length} months`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
            <YAxis hide domain={['dataMin', 'dataMax']} padding={{ top: 8, bottom: 8 }} />
            <Tooltip
              cursor={{ stroke: CHART.axis, strokeDasharray: '3 3' }}
              content={<ChartTooltip format={(v) => fmt(v)} />}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Net worth"
              stroke={CHART.income}
              strokeWidth={2}
              fill={CHART.income}
              fillOpacity={0.1}
              activeDot={{ r: 4, stroke: '#151a23', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

type StatProps = {
  label: string
  value: string
  /** Ratio against the comparison period, for example 0.12 for +12%. */
  delta?: number | null
  deltaLabel?: string
  hint?: string
}

export function StatCard({ label, value, delta, deltaLabel = 'vs last month', hint }: StatProps) {
  return (
    <Card className="flex flex-col justify-between gap-4">
      <p className="text-sm font-medium text-mute">{label}</p>
      <div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="mt-1 flex min-h-5 items-center gap-1 text-[13px] text-mute">
          {delta !== undefined && delta !== null ? (
            <>
              {delta >= 0 ? (
                <ArrowUpRight className="size-3.5" aria-hidden />
              ) : (
                <ArrowDownRight className="size-3.5" aria-hidden />
              )}
              <span className="font-semibold tabular-nums text-ink">{formatPercent(Math.abs(delta))}</span>
              <span>{deltaLabel}</span>
            </>
          ) : (
            hint
          )}
        </p>
      </div>
    </Card>
  )
}
