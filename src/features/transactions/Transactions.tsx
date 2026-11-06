import { ArrowLeftRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { summarize } from '@/calculations/cashflow'
import { PageContainer } from '@/components/layout/PageContainer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Button, IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/hooks/useCurrency'
import { useTransactions } from '@/hooks/useTransactions'
import type { Transaction, TransactionFilterState } from '@/types/transaction'
import { EMPTY_FILTERS } from '@/types/transaction'
import { errorMessage, plural } from '@/utils/format'
import { TransactionFilters } from './TransactionFilters'
import { TransactionForm } from './TransactionForm'
import { TransactionTable } from './TransactionTable'
import { applyTransactionFilters, deleteTransaction } from './transactionService'

const PAGE_SIZE = 20

export function Transactions() {
  const { fmt } = useCurrency()
  const accountsQuery = useAccounts()
  const categoriesQuery = useCategories()
  const txQuery = useTransactions()

  const [filters, setFilters] = useState<TransactionFilterState>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { accounts, activeAccounts } = accountsQuery
  const { categories, byId: categoriesById } = categoriesQuery
  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])
  const filtered = useMemo(
    () => applyTransactionFilters(txQuery.transactions, filters, categories),
    [txQuery.transactions, filters, categories],
  )
  const totals = useMemo(() => summarize(filtered), [filtered])

  const error = accountsQuery.error || categoriesQuery.error || txQuery.error
  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (accountsQuery.loading || categoriesQuery.loading || txQuery.loading) return <LoadingState />

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  function changeFilters(next: TransactionFilterState) {
    setFilters(next)
    setPage(0)
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await deleteTransaction(deleting.id)
      setDeleting(null)
      txQuery.reload()
    } catch (e) {
      setDeleteError(errorMessage(e))
    } finally {
      setDeleteBusy(false)
    }
  }

  // When editing, keep the original account selectable even if it was archived since.
  const formAccounts =
    editing && editing !== 'new'
      ? accounts.filter((a) => !a.is_archived || a.id === editing.account_id || a.id === editing.to_account_id)
      : activeAccounts

  return (
    <PageContainer
      description="Every income, expense and transfer in one list."
      actions={
        <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')} disabled={activeAccounts.length === 0}>
          Add transaction
        </Button>
      }
    >
      {accounts.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Add an account first"
          description="Transactions belong to an account. Create one and come back."
          action={
            <a href="#/accounts">
              <Button>Go to accounts</Button>
            </a>
          }
        />
      ) : (
        <>
          <TransactionFilters filters={filters} onChange={changeFilters} accounts={accounts} categories={categories} />

          <Card padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3 text-sm">
              <span className="text-mute">{plural(filtered.length, 'transaction')}</span>
              <span className="flex flex-wrap gap-x-5 text-mute">
                <span>
                  In <span className="font-semibold tabular-nums text-ink">{fmt(totals.income)}</span>
                </span>
                <span>
                  Out <span className="font-semibold tabular-nums text-ink">{fmt(totals.expense)}</span>
                </span>
              </span>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                className="m-5 border-0"
                icon={ArrowLeftRight}
                title={txQuery.transactions.length === 0 ? 'No transactions yet' : 'Nothing matches those filters'}
                description={
                  txQuery.transactions.length === 0
                    ? 'Record your first income or expense to see it here.'
                    : 'Try a wider date range or clear the filters.'
                }
                action={
                  txQuery.transactions.length === 0 ? (
                    <Button onClick={() => setEditing('new')}>Add transaction</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => changeFilters(EMPTY_FILTERS)}>
                      Clear filters
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <TransactionTable
                  transactions={rows}
                  accountsById={accountsById}
                  categoriesById={categoriesById}
                  onEdit={setEditing}
                  onDelete={(t) => {
                    setDeleteError(null)
                    setDeleting(t)
                  }}
                />
                {pageCount > 1 && (
                  <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-mute">
                    <span>
                      {safePage * PAGE_SIZE + 1} to {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <IconButton label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                        <ChevronLeft className="size-4" />
                      </IconButton>
                      <IconButton label="Next page" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
                        <ChevronRight className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add transaction' : 'Edit transaction'}
      >
        {editing !== null && (
          <TransactionForm
            transaction={editing === 'new' ? undefined : editing}
            accounts={formAccounts}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              txQuery.reload()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this transaction?"
        message="It will be removed from your history and account balance. This cannot be undone."
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
