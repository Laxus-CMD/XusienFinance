import { Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { accountBalances, totalBalance } from '@/calculations/balance'
import { budgetTotals, budgetUsages } from '@/calculations/budget'
import { upcomingBills } from '@/calculations/bills'
import { categoryBreakdown, monthlySeries, percentChange, summarize } from '@/calculations/cashflow'
import { indexCategories } from '@/calculations/categoryTree'
import { netWorthSeries } from '@/calculations/netWorth'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { listBills } from '@/features/bills/billService'
import { listBudgets } from '@/features/budgets/budgetService'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/hooks/useCurrency'
import { useResource } from '@/hooks/useResource'
import { useTransactions } from '@/hooks/useTransactions'
import { currentMonthKey, lastMonthKeys, monthKey, shiftMonthKey, todayISO } from '@/utils/date'
import { BalanceCard, StatCard } from './BalanceCard'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { RecentTransactions } from './RecentTransactions'
import { SpendingBreakdown } from './SpendingBreakdown'
import { UpcomingBills } from './UpcomingBills'

export function Dashboard() {
  const { fmt } = useCurrency()
  const accountsQuery = useAccounts()
  const txQuery = useTransactions()
  const categoriesQuery = useCategories()
  const billsQuery = useResource(listBills, 'bills')
  const budgetsQuery = useResource(listBudgets, 'budgets')

  const accounts = accountsQuery.accounts
  const transactions = txQuery.transactions
  const categories = categoriesQuery.categories
  const bills = billsQuery.data
  const budgets = budgetsQuery.data

  const model = useMemo(() => {
    if (!bills || !budgets) return null
    const today = todayISO()
    const month = currentMonthKey()
    const prevMonth = shiftMonthKey(month, -1)
    const keys = lastMonthKeys(6)

    const balances = accountBalances(accounts, transactions)
    const total = totalBalance(accounts, balances)
    const trend = netWorthSeries(accounts, transactions, keys)
    const lastMonthEnd = trend.length > 1 ? trend[trend.length - 2].value : null

    const thisMonth = transactions.filter((t) => monthKey(t.date) === month)
    const lastMonth = transactions.filter((t) => monthKey(t.date) === prevMonth)
    const summary = summarize(thisMonth)
    const previous = summarize(lastMonth)

    const usages = budgetUsages(budgets, categories, transactions, month)

    return {
      today,
      total,
      change: lastMonthEnd === null || transactions.length === 0 ? null : total - lastMonthEnd,
      trend,
      summary,
      previous,
      series: monthlySeries(transactions, keys),
      slices: categoryBreakdown(thisMonth, categories, 'expense', 5),
      budgetTotals: budgetTotals(usages),
      budgetCount: usages.length,
      upcoming: upcomingBills(bills, today, 14).slice(0, 5),
      recent: transactions.slice(0, 6),
    }
  }, [accounts, transactions, categories, bills, budgets])

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])
  const categoriesById = useMemo(() => indexCategories(categories), [categories])

  const error = accountsQuery.error || txQuery.error || categoriesQuery.error || billsQuery.error || budgetsQuery.error
  const loading =
    accountsQuery.loading || txQuery.loading || categoriesQuery.loading || billsQuery.loading || budgetsQuery.loading

  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (loading || !model) return <LoadingState />

  if (accounts.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon={Wallet}
          title="Start with an account"
          description="Add a cash wallet, bank account or e-wallet. Your balances, charts and reports build from there."
          action={
            <a href="#/accounts">
              <Button>Add your first account</Button>
            </a>
          }
        />
      </PageContainer>
    )
  }

  const { summary, previous, budgetTotals: bt } = model

  return (
    <PageContainer>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <BalanceCard
            total={model.total}
            change={model.change}
            series={model.trend}
            accountCount={accounts.filter((a) => !a.is_archived).length}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-7">
          <StatCard
            label="Income this month"
            value={fmt(summary.income)}
            delta={percentChange(summary.income, previous.income)}
            hint={summary.income > 0 ? 'Nothing to compare yet' : 'No income yet'}
          />
          <StatCard
            label="Spent this month"
            value={fmt(summary.expense)}
            delta={percentChange(summary.expense, previous.expense)}
            hint={summary.expense > 0 ? 'Nothing to compare yet' : 'Nothing spent yet'}
          />
          <StatCard label="Net this month" value={fmt(summary.net, { sign: true })} delta={percentChange(summary.net, previous.net)} hint="Income minus spending" />
          <StatCard
            label="Budget left"
            value={model.budgetCount ? fmt(bt.remaining) : 'Not set'}
            hint={model.budgetCount ? `of ${fmt(bt.limit)} across ${model.budgetCount} budgets` : 'Add a budget to track limits'}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <IncomeExpenseChart series={model.series} />
        </div>
        <div className="lg:col-span-5">
          <SpendingBreakdown slices={model.slices} total={summary.expense} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentTransactions transactions={model.recent} accountsById={accountsById} categoriesById={categoriesById} />
        </div>
        <div className="lg:col-span-5">
          <UpcomingBills bills={model.upcoming} today={model.today} />
        </div>
      </div>
    </PageContainer>
  )
}
