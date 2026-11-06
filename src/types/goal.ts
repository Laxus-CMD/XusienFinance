import type { GoalContributionRow, GoalRow } from '@/lib/supabase/database.types'

export type Goal = GoalRow
export type GoalContribution = GoalContributionRow
export type GoalWithContributions = Goal & { goal_contributions: GoalContribution[] }

export type GoalInput = {
  name: string
  target_amount: number
  target_date: string | null
  color: string
  notes: string | null
}

export type ContributionInput = {
  goal_id: string
  amount: number
  contributed_on: string
  note: string | null
}

export type GoalProgress = {
  saved: number
  remaining: number
  /** 0 to 100 */
  percent: number
  completed: boolean
  /** Amount to set aside each month to hit the target date. Null when there is no future date. */
  monthlyNeeded: number | null
  daysLeft: number | null
}
