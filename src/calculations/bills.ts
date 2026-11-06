import type { Bill, BillStatus } from '@/types/bill'
import { roundMoney } from '@/utils/currency'
import { addDaysISO, addMonthsISO, daysBetween, monthBounds } from '@/utils/date'

export const DUE_SOON_DAYS = 7

/** What is still owed on the current cycle. */
export function outstanding(bill: Bill): number {
  return roundMoney(Math.max(bill.amount - bill.amount_paid, 0))
}

/** Negative when overdue. */
export function daysToDue(bill: Bill, today: string): number {
  return daysBetween(today, bill.due_date)
}

export function billStatus(bill: Bill, today: string): BillStatus {
  if (bill.is_paid) return 'paid'
  const days = daysToDue(bill, today)
  if (days < 0) return 'overdue'
  if (days <= DUE_SOON_DAYS) return 'due-soon'
  return 'upcoming'
}

/**
 * Due dates that fall in a month, including projected repeats of recurring bills.
 * Used by the calendar. Repeats are computed from the original due date so a bill
 * on the 31st does not drift to the 28th after February.
 */
export function occurrencesInMonth(bill: Bill, month: string): string[] {
  const { from, to } = monthBounds(month)
  if (bill.recurrence === 'none') {
    return bill.due_date >= from && bill.due_date <= to ? [bill.due_date] : []
  }

  const out: string[] = []
  for (let i = 0; i < 1200; i++) {
    const date =
      bill.recurrence === 'weekly'
        ? addDaysISO(bill.due_date, 7 * i)
        : addMonthsISO(bill.due_date, (bill.recurrence === 'monthly' ? 1 : 12) * i)
    if (date > to) break
    if (date >= from) out.push(date)
  }
  return out
}

/** Unpaid bills that are overdue or due within `withinDays`, soonest first. */
export function upcomingBills(bills: Bill[], today: string, withinDays = 14): Bill[] {
  return bills
    .filter((b) => !b.is_paid && daysToDue(b, today) <= withinDays)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
}

export function billTotals(
  bills: Bill[],
  today: string,
): { outstanding: number; overdue: number; dueSoon: number } {
  let owed = 0
  let overdue = 0
  let dueSoon = 0
  for (const b of bills) {
    if (b.is_paid) continue
    owed += outstanding(b)
    const status = billStatus(b, today)
    if (status === 'overdue') overdue++
    else if (status === 'due-soon') dueSoon++
  }
  return { outstanding: roundMoney(owed), overdue, dueSoon }
}
