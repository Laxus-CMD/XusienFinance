import { Plus, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { accountBalances, totalBalance } from '@/calculations/balance'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useAccounts } from '@/hooks/useAccounts'
import { useCurrency } from '@/hooks/useCurrency'
import { useTransactions } from '@/hooks/useTransactions'
import type { Account } from '@/types/account'
import { errorMessage, plural } from '@/utils/format'
import { AccountCard } from './AccountCard'
import { AccountForm } from './AccountForm'
import { setAccountArchived } from './accountService'

export function Accounts() {
  const { fmt } = useCurrency()
  const accountsQuery = useAccounts()
  const txQuery = useTransactions()
  const [editing, setEditing] = useState<Account | 'new' | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { accounts } = accountsQuery
  const balances = useMemo(() => accountBalances(accounts, txQuery.transactions), [accounts, txQuery.transactions])
  const active = accounts.filter((a) => !a.is_archived)
  const archived = accounts.filter((a) => a.is_archived)

  const error = accountsQuery.error || txQuery.error
  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (accountsQuery.loading || txQuery.loading) return <LoadingState />

  async function toggleArchive(account: Account) {
    setBusyId(account.id)
    setActionError(null)
    try {
      await setAccountArchived(account.id, !account.is_archived)
      accountsQuery.reload()
    } catch (e) {
      setActionError(errorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageContainer
      description="Cash, bank accounts and e-wallets. Balances update as you record transactions."
      actions={
        <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
          Add account
        </Button>
      }
    >
      {actionError && <ErrorNotice message={actionError} />}

      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add the places your money lives. You can add more any time."
          action={<Button onClick={() => setEditing('new')}>Add account</Button>}
        />
      ) : (
        <>
          <Card className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-mute">Combined balance</p>
              <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{fmt(totalBalance(accounts, balances))}</p>
            </div>
            <p className="text-sm text-mute">{plural(active.length, 'active account')}</p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                balance={balances[account.id] ?? 0}
                busy={busyId === account.id}
                onEdit={() => setEditing(account)}
                onToggleArchive={() => void toggleArchive(account)}
              />
            ))}
          </div>

          {archived.length > 0 && (
            <section aria-labelledby="archived-heading">
              <h2 id="archived-heading" className="mb-3 text-sm font-semibold text-mute">
                Archived ({archived.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archived.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    balance={balances[account.id] ?? 0}
                    busy={busyId === account.id}
                    onEdit={() => setEditing(account)}
                    onToggleArchive={() => void toggleArchive(account)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add account' : 'Edit account'}
        size="sm"
      >
        {editing !== null && (
          <AccountForm
            account={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              accountsQuery.reload()
              txQuery.reload()
            }}
          />
        )}
      </Modal>
    </PageContainer>
  )
}
