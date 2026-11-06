import type { BillPaymentRow, BillRecurrence, BillRow } from '@/lib/supabase/database.types'

export type { BillRecurrence }
export type Bill = BillRow
export type BillPayment = BillPaymentRow

export type BillStatus = 'paid' | 'overdue' | 'due-soon' | 'upcoming'

export type BillInput = {
  name: string
  amount: number
  due_date: string
  recurrence: BillRecurrence
  category_id: string | null
  account_id: string | null
  notes: string | null
}

export type PayBillInput = {
  billId: string
  amount: number
  accountId: string
  paidOn: string
}

export const RECURRENCE_LABELS: Record<BillRecurrence, string> = {
  none: 'One time',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export const RECURRENCES: BillRecurrence[] = ['none', 'weekly', 'monthly', 'yearly']

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  paid: 'Paid',
  overdue: 'Overdue',
  'due-soon': 'Due soon',
  upcoming: 'Upcoming',
}
