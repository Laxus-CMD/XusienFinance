import { useMemo } from 'react'
import { billStatus, occurrencesInMonth } from '@/calculations/bills'
import { MonthSwitcher } from '@/components/shared/MonthSwitcher'
import { Card } from '@/components/ui/Card'
import { useCurrency } from '@/hooks/useCurrency'
import type { Bill, BillStatus } from '@/types/bill'
import { BILL_STATUS_LABELS } from '@/types/bill'
import { parseISODate } from '@/utils/date'
import { cn } from '@/utils/format'

const CHIP: Record<BillStatus, string> = {
  paid: 'bg-good/15 text-good',
  overdue: 'bg-bad/15 text-bad',
  'due-soon': 'bg-warn/15 text-warn',
  upcoming: 'bg-brand/15 text-brand',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Props = {
  bills: Bill[]
  month: string
  onMonthChange: (month: string) => void
  today: string
}

type Entry = { bill: Bill; status: BillStatus }

export function BillCalendar({ bills, month, onMonthChange, today }: Props) {
  const { fmt } = useCurrency()

  const { cells, byDate } = useMemo(() => {
    const first = parseISODate(`${month}-01`)
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const blanks = first.getDay()
    const map = new Map<string, Entry[]>()

    for (const bill of bills) {
      if (bill.is_paid && bill.recurrence === 'none' && !occurrencesInMonth(bill, month).length) continue
      for (const date of occurrencesInMonth(bill, month)) {
        // The next due date carries the real status. Later repeats are simply upcoming.
        const status: BillStatus = date === bill.due_date ? billStatus(bill, today) : 'upcoming'
        map.set(date, [...(map.get(date) ?? []), { bill, status }])
      }
    }
    return { cells: { blanks, daysInMonth }, byDate: map }
  }, [bills, month, today])

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <MonthSwitcher value={month} onChange={onMonthChange} allowFuture />
      </div>
      <div className="grid grid-cols-7 border-b border-line text-center text-xs font-medium text-mute">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: cells.blanks }, (_, i) => (
          <div key={`blank-${i}`} className="min-h-20 border-b border-r border-line bg-bg/40 sm:min-h-24" />
        ))}
        {Array.from({ length: cells.daysInMonth }, (_, i) => {
          const day = i + 1
          const date = `${month}-${String(day).padStart(2, '0')}`
          const entries = byDate.get(date) ?? []
          const isToday = date === today
          return (
            <div key={date} className="min-h-20 min-w-0 border-b border-r border-line p-1.5 sm:min-h-24">
              <span
                className={cn(
                  'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                  isToday ? 'bg-brand text-brand-ink' : 'text-mute',
                )}
              >
                {day}
              </span>
              <ul className="mt-1 space-y-1">
                {entries.map(({ bill, status }) => (
                  <li
                    key={bill.id}
                    title={`${bill.name}, ${fmt(bill.amount)}, ${BILL_STATUS_LABELS[status]}`}
                    className={cn('truncate rounded px-1.5 py-0.5 text-[11px] font-semibold', CHIP[status])}
                  >
                    {bill.name}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
