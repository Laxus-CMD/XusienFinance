import { supabase, unwrap } from '@/lib/supabase/client'
import type { Bill, BillInput, BillPayment, PayBillInput } from '@/types/bill'

export async function listBills(): Promise<Bill[]> {
  return unwrap(await supabase.from('bills').select('*').order('due_date', { ascending: true }))
}

export async function createBill(input: BillInput): Promise<Bill> {
  return unwrap(await supabase.from('bills').insert(input).select().single())
}

export async function updateBill(id: string, patch: Partial<BillInput>): Promise<Bill> {
  return unwrap(await supabase.from('bills').update(patch).eq('id', id).select().single())
}

export async function deleteBill(id: string): Promise<void> {
  unwrap(await supabase.from('bills').delete().eq('id', id))
}

/**
 * Pay (part of) a bill. One database call does it all:
 * logs the expense, records the payment and rolls recurring bills forward.
 */
export async function payBill({ billId, amount, accountId, paidOn }: PayBillInput): Promise<Bill> {
  return unwrap(
    await supabase.rpc('pay_bill', {
      p_bill_id: billId,
      p_amount: amount,
      p_account_id: accountId,
      p_paid_on: paidOn,
    }),
  )
}

export async function listBillPayments(billId: string): Promise<BillPayment[]> {
  return unwrap(
    await supabase
      .from('bill_payments')
      .select('*')
      .eq('bill_id', billId)
      .order('paid_on', { ascending: false })
      .order('created_at', { ascending: false }),
  )
}
