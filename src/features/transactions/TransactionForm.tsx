import { useState } from 'react'
import type { FormEvent } from 'react'
import { CategoryOptions } from '@/components/shared/CategoryOptions'
import { DatePicker } from '@/components/shared/DatePicker'
import { FormActions } from '@/components/shared/FormActions'
import { Input, Select } from '@/components/ui/Input'
import type { Account } from '@/types/account'
import type { Category } from '@/types/category'
import type { Transaction, TransactionType } from '@/types/transaction'
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction'
import { todayISO } from '@/utils/date'
import { cn, errorMessage } from '@/utils/format'
import { createTransaction, updateTransaction } from './transactionService'

const TYPES: TransactionType[] = ['expense', 'income', 'transfer']

type Props = {
  transaction?: Transaction
  accounts: Account[]
  categories: Category[]
  onSaved: () => void
  onCancel: () => void
}

export function TransactionForm({ transaction, accounts, categories, onSaved, onCancel }: Props) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [date, setDate] = useState(transaction?.date ?? todayISO())
  const [accountId, setAccountId] = useState(transaction?.account_id ?? accounts[0]?.id ?? '')
  const [toAccountId, setToAccountId] = useState(transaction?.to_account_id ?? '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isTransfer = type === 'transfer'

  function changeType(next: TransactionType) {
    setType(next)
    // A category belongs to income or expense, so clear it when the type changes.
    const current = categories.find((c) => c.id === categoryId)
    if (next === 'transfer' || (current && current.type !== next)) setCategoryId('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount greater than zero.')
    if (!accountId) return setError('Pick an account.')
    if (isTransfer && !toAccountId) return setError('Pick the account the money goes to.')
    if (isTransfer && toAccountId === accountId) return setError('Choose two different accounts.')

    setBusy(true)
    setError(null)
    try {
      const input = {
        type,
        amount: value,
        date,
        account_id: accountId,
        to_account_id: isTransfer ? toAccountId : null,
        category_id: isTransfer || !categoryId ? null : categoryId,
        description: description.trim(),
      }
      if (transaction) await updateTransaction(transaction.id, input)
      else await createTransaction(input)
      onSaved()
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div role="radiogroup" aria-label="Transaction type" className="grid grid-cols-3 gap-1 rounded-control bg-raised p-1">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => changeType(t)}
            className={cn(
              'h-8 rounded-[7px] text-sm font-semibold transition-colors',
              type === t ? 'bg-surface text-ink' : 'text-mute hover:text-ink',
            )}
          >
            {TRANSACTION_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

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
          autoFocus
          required
        />
        <DatePicker label="Date" value={date} onChange={setDate} required />
      </div>

      <div className={cn('grid gap-4', isTransfer && 'grid-cols-2')}>
        <Select label={isTransfer ? 'From account' : 'Account'} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        {isTransfer && (
          <Select label="To account" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
            <option value="">Choose account</option>
            {accounts
              .filter((a) => a.id !== accountId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </Select>
        )}
      </div>

      {!isTransfer && (
        <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Uncategorized</option>
          <CategoryOptions categories={categories} type={type} />
        </Select>
      )}

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={isTransfer ? 'Optional note' : 'What was it for?'}
      />

      <FormActions submitLabel={transaction ? 'Save changes' : 'Add transaction'} busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}
