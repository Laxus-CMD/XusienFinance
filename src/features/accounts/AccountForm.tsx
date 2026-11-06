import { useState } from 'react'
import type { FormEvent } from 'react'
import { ColorSwatches } from '@/components/shared/ColorSwatches'
import { FormActions } from '@/components/shared/FormActions'
import { Input, Select } from '@/components/ui/Input'
import type { Account, AccountType } from '@/types/account'
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from '@/types/account'
import { errorMessage } from '@/utils/format'
import { CATEGORICAL } from '@/utils/palette'
import { createAccount, updateAccount } from './accountService'

type Props = {
  account?: Account
  onSaved: () => void
  onCancel: () => void
}

export function AccountForm({ account, onSaved, onCancel }: Props) {
  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>(account?.type ?? 'bank')
  const [opening, setOpening] = useState(String(account?.opening_balance ?? 0))
  const [color, setColor] = useState(account?.color ?? CATEGORICAL[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const openingBalance = Number(opening)
    if (!name.trim()) return setError('Give the account a name.')
    if (!Number.isFinite(openingBalance)) return setError('Opening balance must be a number.')

    setBusy(true)
    setError(null)
    try {
      const input = { name: name.trim(), type, opening_balance: openingBalance, color }
      if (account) await updateAccount(account.id, input)
      else await createAccount(input)
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
        placeholder="GCash, BPI savings, Wallet"
        autoFocus
        required
      />
      <Select label="Type" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
        {ACCOUNT_TYPES.map((t) => (
          <option key={t} value={t}>
            {ACCOUNT_TYPE_LABELS[t]}
          </option>
        ))}
      </Select>
      <Input
        label="Opening balance"
        type="number"
        step="0.01"
        inputMode="decimal"
        value={opening}
        onChange={(e) => setOpening(e.target.value)}
        hint="What the account held before your first recorded transaction."
      />
      <ColorSwatches value={color} onChange={setColor} />
      <FormActions submitLabel={account ? 'Save changes' : 'Add account'} busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}
