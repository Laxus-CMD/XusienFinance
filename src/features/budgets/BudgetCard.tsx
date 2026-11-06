import { Pencil, Trash2 } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCurrency } from '@/hooks/useCurrency'
import type { BudgetStatus, BudgetUsage } from '@/types/budget'

const STATUS: Record<BudgetStatus, { label: string; tone: BadgeTone; bar: 'brand' | 'warn' | 'bad' }> = {
  ok: { label: 'On track', tone: 'good', bar: 'brand' },
  warning: { label: 'Nearing limit', tone: 'warn', bar: 'warn' },
  over: { label: 'Over budget', tone: 'bad', bar: 'bad' },
}

type Props = {
  usage: BudgetUsage
  onEdit: () => void
  onDelete: () => void
}

export function BudgetCard({ usage, onEdit, onDelete }: Props) {
  const { fmt } = useCurrency()
  const { budget, category, spent, remaining, percent, status } = usage
  const name = category?.name ?? 'Deleted category'
  const s = STATUS[status]

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: category?.color ?? '#6b7487' }} aria-hidden />
          <h3 className="truncate text-[15px] font-semibold">{name}</h3>
        </div>
        <div className="-mr-1.5 -mt-1 flex shrink-0">
          <IconButton label={`Edit ${name} budget`} onClick={onEdit}>
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label={`Delete ${name} budget`} danger onClick={onDelete}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {fmt(spent)} <span className="text-sm font-medium text-mute">of {fmt(budget.amount)}</span>
        </p>
        <ProgressBar className="mt-3" percent={percent} tone={s.bar} label={`${name} budget used`} />
      </div>

      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="text-mute">
          {remaining >= 0 ? `${fmt(remaining)} left` : `${fmt(Math.abs(remaining))} over`}
        </span>
        <Badge tone={s.tone}>
          {s.label}, {Math.round(percent)}%
        </Badge>
      </div>
    </Card>
  )
}
