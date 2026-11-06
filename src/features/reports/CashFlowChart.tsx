import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthPoint } from '@/calculations/cashflow'
import { ChartLegend } from '@/components/shared/ChartLegend'
import { ChartTooltip } from '@/components/shared/ChartTooltip'
import { Card, CardHeader } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import { CHART } from '@/utils/palette'

export function CashFlowChart({ series }: { series: MonthPoint[] }) {
  const { fmt } = useCurrency()

  return (
    <Card>
      <CardHeader
        title="Cash flow"
        subtitle="Money in, money out and what was left each month"
        action={
          <ChartLegend
            items={[
              { label: 'Income', color: CHART.income },
              { label: 'Expenses', color: CHART.expense },
              { label: 'Net', color: CHART.net, kind: 'line' },
            ]}
          />
        }
      />
      <div className="h-72" role="img" aria-label="Monthly income, expenses and net. The table below has the same numbers.">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} barGap={2} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 12 }} />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART.axis, fontSize: 12 }}
              tickFormatter={(v: number) => fmt(v, { compact: true })}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip format={(v) => fmt(v)} />} />
            <Bar dataKey="income" name="Income" fill={CHART.income} radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
            <Bar dataKey="expense" name="Expenses" fill={CHART.expense} radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="net"
              name="Net"
              stroke={CHART.net}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART.net, stroke: '#151a23', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: CHART.net, stroke: '#151a23', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Monthly cash flow</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expenses</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.key}>
              <td>{p.label}</td>
              <td>{fmt(p.income)}</td>
              <td>{fmt(p.expense)}</td>
              <td>{fmt(p.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
