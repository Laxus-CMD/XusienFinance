import { Gauge, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { budgetTotals, budgetUsages } from '@/calculations/budget'
import { PageContainer } from '@/components/layout/PageContainer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { MonthSwitcher } from '@/components/shared/MonthSwitcher'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { listTransactionsInRange } from '@/features/transactions/transactionService'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/hooks/useCurrency'
import { useResource } from '@/hooks/useResource'
import type { Budget } from '@/types/budget'
import { currentMonthKey, monthBounds } from '@/utils/date'
import { errorMessage } from '@/utils/format'
import { BudgetCard } from './BudgetCard'
import { BudgetForm } from './BudgetForm'
import { deleteBudget, listBudgets } from './budgetService'

export function Budgets() {
  const { fmt } = useCurrency()
  const [month, setMonth] = useState(currentMonthKey())
  const budgetsQuery = useResource(listBudgets, 'budgets')
  const categoriesQuery = useCategories()
  const txQuery = useResource(() => {
    const { from, to } = monthBounds(month)
    return listTransactionsInRange(from, to)
  }, `tx-${month}`)

  const [editing, setEditing] = useState<Budget | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const budgets = useMemo(() => budgetsQuery.data ?? [], [budgetsQuery.data])
  const { categories } = categoriesQuery
  const usages = useMemo(
    () => budgetUsages(budgets, categories, txQuery.data ?? [], month).sort((a, b) => b.percent - a.percent),
    [budgets, categories, txQuery.data, month],
  )
  const totals = budgetTotals(usages)
  const taken = useMemo(() => new Set(budgets.map((b) => b.category_id)), [budgets])
  const hasExpenseCategories = categories.some((c) => c.type === 'expense')

  const error = budgetsQuery.error || categoriesQuery.error || txQuery.error
  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (budgetsQuery.loading || categoriesQuery.loading) return <LoadingState />

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await deleteBudget(deleting.id)
      setDeleting(null)
      budgetsQuery.reload()
    } catch (e) {
      setDeleteError(errorMessage(e))
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <PageContainer
      description="Set a monthly limit per category. You get an alert when spending nears it."
      actions={
        <>
          <MonthSwitcher value={month} onChange={setMonth} />
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')} disabled={!hasExpenseCategories}>
            Add budget
          </Button>
        </>
      }
    >
      {budgets.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No budgets yet"
          description="Pick a category like Food or Transport and set how much you want to spend on it each month."
          action={
            hasExpenseCategories ? (
              <Button onClick={() => setEditing('new')}>Add budget</Button>
            ) : (
              <a href="#/categories">
                <Button>Create a category first</Button>
              </a>
            )
          }
        />
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-mute">Spent across budgets</p>
                <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                  {fmt(totals.spent)} <span className="text-base font-medium text-mute">of {fmt(totals.limit)}</span>
                </p>
              </div>
              <p className="text-sm text-mute">
                {totals.remaining >= 0 ? `${fmt(totals.remaining)} left` : `${fmt(Math.abs(totals.remaining))} over`}
              </p>
            </div>
            <ProgressBar
              className="mt-4"
              percent={totals.limit > 0 ? (totals.spent / totals.limit) * 100 : 0}
              tone={totals.spent > totals.limit ? 'bad' : 'brand'}
              label="Total budget used"
            />
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {usages.map((usage) => (
              <BudgetCard
                key={usage.budget.id}
                usage={usage}
                onEdit={() => setEditing(usage.budget)}
                onDelete={() => {
                  setDeleteError(null)
                  setDeleting(usage.budget)
                }}
              />
            ))}
          </div>
        </>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add budget' : 'Edit budget'} size="sm">
        {editing !== null && (
          <BudgetForm
            budget={editing === 'new' ? undefined : editing}
            categories={categories}
            takenCategoryIds={taken}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              budgetsQuery.reload()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this budget?"
        message="Your transactions are not affected. You just stop tracking a limit for this category."
        confirmLabel="Delete"
        danger
        loading={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </PageContainer>
  )
}
