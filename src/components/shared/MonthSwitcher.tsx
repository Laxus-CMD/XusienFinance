import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import { currentMonthKey, monthLabel, shiftMonthKey } from '@/utils/date'

type Props = {
  /** "YYYY-MM" */
  value: string
  onChange: (value: string) => void
  /** Let the user step into future months. Off by default. */
  allowFuture?: boolean
}

/** Step through months. Stops at the current month unless `allowFuture` is set. */
export function MonthSwitcher({ value, onChange, allowFuture = false }: Props) {
  const atCurrent = !allowFuture && value >= currentMonthKey()
  return (
    <div className="inline-flex items-center gap-1 rounded-control border border-line bg-surface p-1">
      <IconButton label="Previous month" onClick={() => onChange(shiftMonthKey(value, -1))}>
        <ChevronLeft className="size-4" />
      </IconButton>
      <span className="min-w-32 text-center text-sm font-semibold">{monthLabel(value, 'long')}</span>
      <IconButton label="Next month" disabled={atCurrent} onClick={() => onChange(shiftMonthKey(value, 1))}>
        <ChevronRight className="size-4" />
      </IconButton>
    </div>
  )
}
