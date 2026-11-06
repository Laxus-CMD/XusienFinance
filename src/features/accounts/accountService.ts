import { supabase, unwrap } from '@/lib/supabase/client'
import type { Account, AccountInput } from '@/types/account'

export async function listAccounts(): Promise<Account[]> {
  return unwrap(
    await supabase.from('accounts').select('*').order('created_at', { ascending: true }).order('name'),
  )
}

export async function createAccount(input: AccountInput): Promise<Account> {
  return unwrap(await supabase.from('accounts').insert(input).select().single())
}

export async function updateAccount(id: string, patch: Partial<AccountInput>): Promise<Account> {
  return unwrap(await supabase.from('accounts').update(patch).eq('id', id).select().single())
}

/** Archived accounts keep their history but drop out of totals and pickers. */
export async function setAccountArchived(id: string, archived: boolean): Promise<Account> {
  return unwrap(
    await supabase.from('accounts').update({ is_archived: archived }).eq('id', id).select().single(),
  )
}
