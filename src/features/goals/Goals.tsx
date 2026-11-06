import { Plus, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { goalSaved } from '@/calculations/goals'
import { PageContainer } from '@/components/layout/PageContainer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCurrency } from '@/hooks/useCurrency'
import { useResource } from '@/hooks/useResource'
import type { GoalContribution, GoalWithContributions } from '@/types/goal'
import { todayISO } from '@/utils/date'
import { errorMessage } from '@/utils/format'
import { ContributionForm, GoalForm } from './GoalForm'
import { GoalCard } from './GoalCard'
import { deleteContribution, deleteGoal, listGoals } from './goalService'

type Pending =
  | { kind: 'goal'; goal: GoalWithContributions }
  | { kind: 'contribution'; contribution: GoalContribution }

export function Goals() {
  const { fmt } = useCurrency()
  const { data, loading, error, reload } = useResource(listGoals, 'goals')
  const goals = useMemo(() => data ?? [], [data])

  const [editing, setEditing] = useState<GoalWithContributions | 'new' | null>(null)
  const [contributingTo, setContributingTo] = useState<GoalWithContributions | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [pendingError, setPendingError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const saved = goals.reduce((t, g) => t + Math.min(goalSaved(g), g.target_amount), 0)
    const target = goals.reduce((t, g) => t + g.target_amount, 0)
    return { saved, target }
  }, [goals])

  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (loading) return <LoadingState />

  const today = todayISO()

  async function confirmPending() {
    if (!pending) return
    setBusy(true)
    setPendingError(null)
    try {
      if (pending.kind === 'goal') await deleteGoal(pending.goal.id)
      else await deleteContribution(pending.contribution.id)
      setPending(null)
      reload()
    } catch (e) {
      setPendingError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageContainer
      description="Set a target, add money as you save and watch the bar fill."
      actions={
        <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
          Add goal
        </Button>
      }
    >
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Saving for a laptop, a trip or an emergency fund? Add it and track every peso set aside."
          action={<Button onClick={() => setEditing('new')}>Add goal</Button>}
        />
      ) : (
        <>
          <Card>
            <p className="text-sm font-medium text-mute">Saved toward goals</p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
              {fmt(totals.saved)} <span className="text-base font-medium text-mute">of {fmt(totals.target)}</span>
            </p>
            <ProgressBar
              className="mt-4"
              percent={totals.target > 0 ? (totals.saved / totals.target) * 100 : 0}
              label="All goals progress"
            />
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                today={today}
                onContribute={() => setContributingTo(goal)}
                onEdit={() => setEditing(goal)}
                onDelete={() => {
                  setPendingError(null)
                  setPending({ kind: 'goal', goal })
                }}
                onDeleteContribution={(contribution) => {
                  setPendingError(null)
                  setPending({ kind: 'contribution', contribution })
                }}
              />
            ))}
          </div>
        </>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add goal' : 'Edit goal'}>
        {editing !== null && (
          <GoalForm
            goal={editing === 'new' ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              reload()
            }}
          />
        )}
      </Modal>

      <Modal
        open={contributingTo !== null}
        onClose={() => setContributingTo(null)}
        title={contributingTo ? `Add to ${contributingTo.name}` : 'Add money'}
        size="sm"
      >
        {contributingTo && (
          <ContributionForm
            goalId={contributingTo.id}
            onCancel={() => setContributingTo(null)}
            onSaved={() => {
              setContributingTo(null)
              reload()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'goal' ? `Delete ${pending.goal.name}?` : 'Remove this contribution?'}
        message={
          pending?.kind === 'goal'
            ? 'The goal and all its contributions are deleted. This cannot be undone.'
            : 'The goal total goes down by this amount.'
        }
        confirmLabel={pending?.kind === 'goal' ? 'Delete' : 'Remove'}
        danger
        loading={busy}
        error={pendingError}
        onConfirm={() => void confirmPending()}
        onCancel={() => setPending(null)}
      />
    </PageContainer>
  )
}
