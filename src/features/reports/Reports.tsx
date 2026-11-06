import { useMemo, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/features/dashboard/BalanceCard'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/hooks/useCurrency'
import { useTransactions } from '@/hooks/useTransactions'
import { monthLabel } from '@/utils/date'
import { cn, formatPercent } from '@/utils/format'
import { CashFlowChart } from './CashFlowChart'
import { CategoryReport } from './CategoryReport'
import { REPORT_RANGES, type ReportRangeKey, buildReport } from './reportService'

export function Reports() {
  const { fmt } = useCurrency()
  const txQuery = useTransactions()
  const categoriesQuery = useCategories()
  const [range, setRange] = useState<ReportRangeKey>('last-6')

  const report = useMemo(
    () => buildReport(txQuery.transactions, categoriesQuery.categories, range),
    [txQuery.transactions, categoriesQuery.categories, range],
  )

  const error = txQuery.error || categoriesQuery.error
  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (txQuery.loading || categoriesQuery.loading) return <LoadingState />

  const { summary, changes, series } = report
  const rows = series.map((point, i) => ({
    ...point,
    spendingChange: i > 0 && series[i - 1].expense > 0 ? (point.expense - series[i - 1].expense) / series[i - 1].expense : null,
  }))

  return (
    <PageContainer
      description="See where your money comes from and where it goes."
      actions={
        <div role="group" aria-label="Report period" className="flex rounded-control border border-line bg-surface p-1">
          {REPORT_RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              aria-pressed={range === r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                'h-8 rounded-[7px] px-3 text-[13px] font-semibold transition-colors',
                range === r.key ? 'bg-raised text-ink' : 'text-mute hover:text-ink',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={fmt(summary.income)}
          delta={changes.income}
          deltaLabel="vs previous period"
          hint={summary.income > 0 ? 'No earlier period to compare' : 'No income in this period'}
        />
        <StatCard
          label="Spending"
          value={fmt(summary.expense)}
          delta={changes.expense}
          deltaLabel="vs previous period"
          hint={summary.expense > 0 ? 'No earlier period to compare' : 'No spending in this period'}
        />
        <StatCard label="Net" value={fmt(summary.net, { sign: true })} delta={changes.net} deltaLabel="vs previous period" hint="Income minus spending" />
        <StatCard
          label="Savings rate"
          value={report.savingsRate === null ? 'n/a' : formatPercent(report.savingsRate)}
          hint={report.savingsRate === null ? 'Needs some income' : 'Share of income kept'}
        />
      </div>

      <CashFlowChart series={series} />

      <CategoryReport expenseSlices={report.expenseSlices} incomeSlices={report.incomeSlices} />

      <Card padded={false}>
        <CardHeader className="mb-0 px-5 pt-5" title="Month by month" subtitle="Newest first" />
        <div className="overflow-x-auto">
          <table className="mt-3 w-full min-w-136 text-sm">
            <thead>
              <tr className="border-y border-line text-left text-[13px] font-medium text-mute">
                <th className="px-5 py-2.5 font-medium">Month</th>
                <th className="px-3 py-2.5 text-right font-medium">Income</th>
                <th className="px-3 py-2.5 text-right font-medium">Spending</th>
                <th className="px-3 py-2.5 text-right font-medium">Net</th>
                <th className="px-5 py-2.5 text-right font-medium">Spending change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...rows].reverse().map((row) => (
                <tr key={row.key}>
                  <td className="px-5 py-3 font-medium">{monthLabel(row.key, 'long')}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmt(row.income)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmt(row.expense)}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{fmt(row.net, { sign: true })}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-mute">
                    {row.spendingChange === null
                      ? 'n/a'
                      : `${row.spendingChange > 0 ? '+' : row.spendingChange < 0 ? '-' : ''}${formatPercent(Math.abs(row.spendingChange))}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  )
}
