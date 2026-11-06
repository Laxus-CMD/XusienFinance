import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthPoint } from '@/calculations/cashflow'
import { ChartLegend } from '@/components/shared/ChartLegend'
import { ChartTooltip } from '@/components/shared/ChartTooltip'
import { Card, CardHeader } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import { CHART } from '@/utils/palette'

export function IncomeExpenseChart({ series }: { series: MonthPoint[] }) {
  const { fmt } = useCurrency()

  return (
    <Card className="h-full">
      <CardHeader
        title="Income and expenses"
        subtitle={`Last ${series.length} months`}
        action={
          <ChartLegend
            items={[
              { label: 'Income', color: CHART.income },
              { label: 'Expenses', color: CHART.expense },
            ]}
          />
        }
      />
      <div className="h-64" role="img" aria-label="Bar chart of monthly income and expenses. The table below has the same numbers.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 12 }} />
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART.axis, fontSize: 12 }}
              tickFormatter={(v: number) => fmt(v, { compact: true })}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip format={(v) => fmt(v)} />} />
            <Bar dataKey="income" name="Income" fill={CHART.income} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
            <Bar dataKey="expense" name="Expenses" fill={CHART.expense} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Monthly income and expenses</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expenses</th>
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.key}>
              <td>{p.label}</td>
              <td>{fmt(p.income)}</td>
              <td>{fmt(p.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
