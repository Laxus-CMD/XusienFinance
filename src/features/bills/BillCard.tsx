import { ChevronDown, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { billStatus, daysToDue, outstanding } from '@/calculations/bills'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCurrency } from '@/hooks/useCurrency'
import { useResource } from '@/hooks/useResource'
import type { Bill, BillStatus } from '@/types/bill'
import { BILL_STATUS_LABELS, RECURRENCE_LABELS } from '@/types/bill'
import { describeDue, formatDate } from '@/utils/date'
import { cn } from '@/utils/format'
import { listBillPayments } from './billService'

const TONES: Record<BillStatus, BadgeTone> = {
  paid: 'good',
  overdue: 'bad',
  'due-soon': 'warn',
  upcoming: 'neutral',
}

type Props = {
  bill: Bill
  today: string
  onPay: () => void
  onEdit: () => void
  onDelete: () => void
}

export function BillCard({ bill, today, onPay, onEdit, onDelete }: Props) {
  const { fmt } = useCurrency()
  const [showHistory, setShowHistory] = useState(false)
  const status = billStatus(bill, today)
  const left = outstanding(bill)
  const partial = bill.amount_paid > 0 && !bill.is_paid

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold">{bill.name}</h3>
            <Badge tone={TONES[status]}>{BILL_STATUS_LABELS[status]}</Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[13px] text-mute">
            <span>
              {bill.is_paid ? `Was due ${formatDate(bill.due_date)}` : `${formatDate(bill.due_date)}, ${describeDue(daysToDue(bill, today)).toLowerCase()}`}
            </span>
            {bill.recurrence !== 'none' && (
              <span className="inline-flex items-center gap-1">
                <Repeat className="size-3" aria-hidden />
                {RECURRENCE_LABELS[bill.recurrence]}
              </span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold tabular-nums">{fmt(bill.is_paid ? bill.amount : left)}</p>
          {partial && <p className="text-xs text-mute">of {fmt(bill.amount)}</p>}
        </div>
      </div>

      {partial && (
        <ProgressBar percent={(bill.amount_paid / bill.amount) * 100} label={`${bill.name} paid so far`} tone="good" />
      )}

      {bill.notes && <p className="text-[13px] text-mute">{bill.notes}</p>}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          aria-expanded={showHistory}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-mute hover:text-ink"
        >
          Payment history
          <ChevronDown className={cn('size-3.5 transition-transform', showHistory && 'rotate-180')} aria-hidden />
        </button>
        <div className="flex items-center gap-1">
          <IconButton label={`Edit ${bill.name}`} onClick={onEdit}>
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label={`Delete ${bill.name}`} danger onClick={onDelete}>
            <Trash2 className="size-4" />
          </IconButton>
          {!bill.is_paid && (
            <Button size="sm" onClick={onPay} className="ml-1">
              Pay
            </Button>
          )}
        </div>
      </div>

      {showHistory && <PaymentHistory billId={bill.id} />}
    </Card>
  )
}

function PaymentHistory({ billId }: { billId: string }) {
  const { fmt } = useCurrency()
  const { data, loading, error } = useResource(() => listBillPayments(billId), `payments-${billId}`)

  if (loading) return <p className="text-[13px] text-mute">Loading history</p>
  if (error) return <p className="text-[13px] text-bad">{error}</p>
  if (!data?.length) return <p className="text-[13px] text-mute">No payments yet.</p>

  return (
    <ul className="divide-y divide-line rounded-control border border-line">
      {data.map((p) => (
        <li key={p.id} className="flex items-center justify-between px-3 py-2 text-[13px]">
          <span className="text-mute">{formatDate(p.paid_on, 'long')}</span>
          <span className="font-semibold tabular-nums">{fmt(p.amount)}</span>
        </li>
      ))}
    </ul>
  )
}
