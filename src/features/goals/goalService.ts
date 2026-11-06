import { supabase, unwrap } from '@/lib/supabase/client'
import type { ContributionInput, Goal, GoalContribution, GoalInput, GoalWithContributions } from '@/types/goal'

/** Goals with their contributions attached, newest contribution first. */
export async function listGoals(): Promise<GoalWithContributions[]> {
  const [goals, contributions] = await Promise.all([
    supabase.from('goals').select('*').order('created_at', { ascending: true }),
    supabase
      .from('goal_contributions')
      .select('*')
      .order('contributed_on', { ascending: false })
      .order('created_at', { ascending: false }),
  ])
  const goalRows = unwrap(goals)
  const contributionRows = unwrap(contributions)
  return goalRows.map((goal) => ({
    ...goal,
    goal_contributions: contributionRows.filter((c) => c.goal_id === goal.id),
  }))
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  return unwrap(await supabase.from('goals').insert(input).select().single())
}

export async function updateGoal(id: string, patch: Partial<GoalInput>): Promise<Goal> {
  return unwrap(await supabase.from('goals').update(patch).eq('id', id).select().single())
}

export async function deleteGoal(id: string): Promise<void> {
  unwrap(await supabase.from('goals').delete().eq('id', id))
}

export async function addContribution(input: ContributionInput): Promise<GoalContribution> {
  return unwrap(await supabase.from('goal_contributions').insert(input).select().single())
}

export async function deleteContribution(id: string): Promise<void> {
  unwrap(await supabase.from('goal_contributions').delete().eq('id', id))
}
