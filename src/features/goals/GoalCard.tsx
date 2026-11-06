import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { goalProgress } from '@/calculations/goals'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCurrency } from '@/hooks/useCurrency'
import type { GoalContribution, GoalWithContributions } from '@/types/goal'
import { formatDate } from '@/utils/date'
import { cn, formatPercent } from '@/utils/format'

type Props = {
  goal: GoalWithContributions
  today: string
  onContribute: () => void
  onEdit: () => void
  onDelete: () => void
  onDeleteContribution: (contribution: GoalContribution) => void
}

export function GoalCard({ goal, today, onContribute, onEdit, onDelete, onDeleteContribution }: Props) {
  const { fmt } = useCurrency()
  const [open, setOpen] = useState(false)
  const p = goalProgress(goal, today)

  let pace: string | null = null
  if (p.completed) pace = 'Goal reached.'
  else if (p.daysLeft !== null && p.daysLeft <= 0) pace = `Target date passed. ${fmt(p.remaining)} to go.`
  else if (p.monthlyNeeded !== null) pace = `Set aside ${fmt(p.monthlyNeeded)} a month to finish by ${formatDate(goal.target_date!, 'long')}.`

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: goal.color }} aria-hidden />
          <h3 className="truncate text-[15px] font-semibold">{goal.name}</h3>
          {p.completed && <Badge tone="good">Reached</Badge>}
        </div>
        <div className="-mr-1.5 -mt-1 flex shrink-0">
          <IconButton label={`Edit ${goal.name}`} onClick={onEdit}>
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label={`Delete ${goal.name}`} danger onClick={onDelete}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-2xl font-bold tracking-tight tabular-nums">
            {fmt(p.saved)} <span className="text-sm font-medium text-mute">of {fmt(goal.target_amount)}</span>
          </p>
          <span className="text-sm font-semibold tabular-nums text-mute">{formatPercent(p.percent / 100)}</span>
        </div>
        <ProgressBar className="mt-3" percent={p.percent} color={goal.color} label={`${goal.name} progress`} />
      </div>

      {pace && <p className="text-[13px] text-mute">{pace}</p>}
      {goal.notes && <p className="text-[13px] text-mute">{goal.notes}</p>}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-mute hover:text-ink"
        >
          Contributions ({goal.goal_contributions.length})
          <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
        <Button size="sm" variant={p.completed ? 'secondary' : 'primary'} onClick={onContribute}>
          Add money
        </Button>
      </div>

      {open &&
        (goal.goal_contributions.length === 0 ? (
          <p className="text-[13px] text-mute">Nothing added yet.</p>
        ) : (
          <ul className="divide-y divide-line rounded-control border border-line">
            {goal.goal_contributions.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3 py-2 text-[13px]">
                <span className="w-20 shrink-0 text-mute">{formatDate(c.contributed_on)}</span>
                <span className="min-w-0 flex-1 truncate text-mute">{c.note}</span>
                <span className="font-semibold tabular-nums">{fmt(c.amount)}</span>
                <IconButton
                  label={`Remove ${fmt(c.amount)} contribution`}
                  danger
                  className="-mr-1.5 size-7"
                  onClick={() => onDeleteContribution(c)}
                >
                  <Trash2 className="size-3.5" />
                </IconButton>
              </li>
            ))}
          </ul>
        ))}
    </Card>
  )
}
