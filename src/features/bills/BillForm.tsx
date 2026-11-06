import { useState } from 'react'
import type { FormEvent } from 'react'
import { outstanding } from '@/calculations/bills'
import { CategoryOptions } from '@/components/shared/CategoryOptions'
import { DatePicker } from '@/components/shared/DatePicker'
import { FormActions } from '@/components/shared/FormActions'
import { Input, Select, Textarea } from '@/components/ui/Input'
import type { Account } from '@/types/account'
import type { Bill, BillRecurrence } from '@/types/bill'
import { RECURRENCES, RECURRENCE_LABELS } from '@/types/bill'
import type { Category } from '@/types/category'
import { todayISO } from '@/utils/date'
import { errorMessage } from '@/utils/format'
import { createBill, payBill, updateBill } from './billService'

type FormProps = {
  bill?: Bill
  accounts: Account[]
  categories: Category[]
  onSaved: () => void
  onCancel: () => void
}

export function BillForm({ bill, accounts, categories, onSaved, onCancel }: FormProps) {
  const [name, setName] = useState(bill?.name ?? '')
  const [amount, setAmount] = useState(bill ? String(bill.amount) : '')
  const [dueDate, setDueDate] = useState(bill?.due_date ?? todayISO())
  const [recurrence, setRecurrence] = useState<BillRecurrence>(bill?.recurrence ?? 'monthly')
  const [categoryId, setCategoryId] = useState(bill?.category_id ?? '')
  const [accountId, setAccountId] = useState(bill?.account_id ?? '')
  const [notes, setNotes] = useState(bill?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!name.trim()) return setError('Give the bill a name.')
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount greater than zero.')
    if (!dueDate) return setError('Pick a due date.')

    setBusy(true)
    setError(null)
    try {
      const input = {
        name: name.trim(),
        amount: value,
        due_date: dueDate,
        recurrence,
        category_id: categoryId || null,
        account_id: accountId || null,
        notes: notes.trim() || null,
      }
      if (bill) await updateBill(bill.id, input)
      else await createBill(input)
      onSaved()
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Electricity, Netflix, Tuition"
        autoFocus
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
        <DatePicker label="Next due date" value={dueDate} onChange={setDueDate} required />
      </div>
      <Select label="Repeats" value={recurrence} onChange={(e) => setRecurrence(e.target.value as BillRecurrence)}>
        {RECURRENCES.map((r) => (
          <option key={r} value={r}>
            {RECURRENCE_LABELS[r]}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Uncategorized</option>
          <CategoryOptions categories={categories} type="expense" />
        </Select>
        <Select label="Usually paid from" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Choose when paying</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
      <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reference number, payment link" rows={2} />
      <FormActions submitLabel={bill ? 'Save changes' : 'Add bill'} busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}

type PayProps = {
  bill: Bill
  accounts: Account[]
  onSaved: () => void
  onCancel: () => void
}

/** Pay all or part of a bill. Records an expense and logs the payment. */
export function PayBillForm({ bill, accounts, onSaved, onCancel }: PayProps) {
  const [amount, setAmount] = useState(String(outstanding(bill)))
  const [accountId, setAccountId] = useState(
    accounts.find((a) => a.id === bill.account_id)?.id ?? accounts[0]?.id ?? '',
  )
  const [paidOn, setPaidOn] = useState(todayISO())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount greater than zero.')
    if (!accountId) return setError('Pick the account you paid from.')

    setBusy(true)
    setError(null)
    try {
      await payBill({ billId: bill.id, amount: value, accountId, paidOn })
      onSaved()
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        hint="Pay less than the full amount to make a partial payment."
        autoFocus
        required
      />
      <Select label="Paid from" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
      <DatePicker label="Date paid" value={paidOn} onChange={setPaidOn} required />
      <FormActions submitLabel="Record payment" busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}
