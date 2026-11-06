import type { BillRecurrence } from '@/lib/supabase/database.types'

/*
 * Dates are stored as "YYYY-MM-DD" strings. They are parsed as local dates on purpose.
 * new Date("2026-10-31") would be read as UTC and can shift a day in some time zones.
 */

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Adds months and clamps to the last day (Jan 31 + 1 month = Feb 28). */
export function addMonthsISO(iso: string, months: number): string {
  const d = parseISODate(iso)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, lastDay))
  return toISODate(d)
}

export function daysBetween(fromISO: string, toISO: string): number {
  const ms = parseISODate(toISO).getTime() - parseISODate(fromISO).getTime()
  return Math.round(ms / 86_400_000)
}

/** "2026-10-31" -> "2026-10" */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function currentMonthKey(): string {
  return monthKey(todayISO())
}

export function shiftMonthKey(key: string, months: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + months, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export function monthBounds(key: string): { from: string; to: string } {
  const [y, m] = key.split('-').map(Number)
  return { from: `${key}-01`, to: toISODate(new Date(y, m, 0)) }
}

/** The last `count` month keys ending at `endKey`, oldest first. */
export function lastMonthKeys(count: number, endKey = currentMonthKey()): string[] {
  return Array.from({ length: count }, (_, i) => shiftMonthKey(endKey, i - (count - 1)))
}

export function monthLabel(key: string, style: 'short' | 'long' = 'short'): string {
  const d = parseISODate(`${key}-01`)
  return d.toLocaleDateString(
    'en-US',
    style === 'short' ? { month: 'short' } : { month: 'long', year: 'numeric' },
  )
}

export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  return parseISODate(iso).toLocaleDateString(
    'en-US',
    style === 'short'
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' },
  )
}

export function nextDueDate(iso: string, recurrence: BillRecurrence): string {
  switch (recurrence) {
    case 'weekly':
      return addDaysISO(iso, 7)
    case 'monthly':
      return addMonthsISO(iso, 1)
    case 'yearly':
      return addMonthsISO(iso, 12)
    default:
      return iso
  }
}

/** 3 -> "Due in 3 days", 0 -> "Due today", -2 -> "2 days overdue" */
export function describeDue(daysLeft: number): string {
  if (daysLeft === 0) return 'Due today'
  if (daysLeft === 1) return 'Due tomorrow'
  if (daysLeft > 1) return `Due in ${daysLeft} days`
  const late = Math.abs(daysLeft)
  return `${late} ${late === 1 ? 'day' : 'days'} overdue`
}
