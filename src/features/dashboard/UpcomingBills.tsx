import { billStatus, daysToDue, outstanding } from '@/calculations/bills'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import type { Bill, BillStatus } from '@/types/bill'
import { BILL_STATUS_LABELS } from '@/types/bill'
import { describeDue, formatDate } from '@/utils/date'

const TONES: Record<BillStatus, BadgeTone> = {
  paid: 'good',
  overdue: 'bad',
  'due-soon': 'warn',
  upcoming: 'neutral',
}

type Props = { bills: Bill[]; today: string }

export function UpcomingBills({ bills, today }: Props) {
  const { fmt } = useCurrency()

  return (
    <Card className="h-full">
      <CardHeader
        title="Upcoming bills"
        subtitle="Next two weeks"
        action={
          <a href="#/bills" className="text-[13px] font-semibold text-brand hover:underline">
            View all
          </a>
        }
      />
      {bills.length === 0 ? (
        <p className="py-10 text-center text-sm text-mute">Nothing due in the next two weeks.</p>
      ) : (
        <ul className="-my-1 divide-y divide-line">
          {bills.map((bill) => {
            const status = billStatus(bill, today)
            return (
              <li key={bill.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{bill.name}</p>
                  <p className="text-[13px] text-mute">
                    {formatDate(bill.due_date)}, {describeDue(daysToDue(bill, today)).toLowerCase()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold tabular-nums">{fmt(outstanding(bill))}</span>
                  <Badge tone={TONES[status]}>{BILL_STATUS_LABELS[status]}</Badge>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
