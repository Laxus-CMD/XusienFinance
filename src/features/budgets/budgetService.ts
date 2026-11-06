import { supabase, unwrap } from '@/lib/supabase/client'
import type { Budget, BudgetInput } from '@/types/budget'

export async function listBudgets(): Promise<Budget[]> {
  return unwrap(await supabase.from('budgets').select('*').order('created_at', { ascending: true }))
}

export async function createBudget(input: BudgetInput): Promise<Budget> {
  return unwrap(await supabase.from('budgets').insert(input).select().single())
}

export async function updateBudget(id: string, patch: Partial<BudgetInput>): Promise<Budget> {
  return unwrap(await supabase.from('budgets').update(patch).eq('id', id).select().single())
}

export async function deleteBudget(id: string): Promise<void> {
  unwrap(await supabase.from('budgets').delete().eq('id', id))
}
