import type { GoalProgress, GoalWithContributions } from '@/types/goal'
import { roundMoney } from '@/utils/currency'
import { daysBetween } from '@/utils/date'

export function goalSaved(goal: GoalWithContributions): number {
  return roundMoney(goal.goal_contributions.reduce((total, c) => total + c.amount, 0))
}

export function goalProgress(goal: GoalWithContributions, today: string): GoalProgress {
  const saved = goalSaved(goal)
  const remaining = roundMoney(Math.max(goal.target_amount - saved, 0))
  const completed = saved >= goal.target_amount
  const daysLeft = goal.target_date ? daysBetween(today, goal.target_date) : null

  let monthlyNeeded: number | null = null
  if (!completed && daysLeft !== null && daysLeft > 0) {
    const months = Math.max(1, Math.ceil(daysLeft / 30.44))
    monthlyNeeded = roundMoney(remaining / months)
  }

  return {
    saved,
    remaining,
    percent: Math.min((saved / goal.target_amount) * 100, 100),
    completed,
    monthlyNeeded,
    daysLeft,
  }
}
