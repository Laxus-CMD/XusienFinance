import { useState } from 'react'
import type { FormEvent } from 'react'
import { ColorSwatches } from '@/components/shared/ColorSwatches'
import { DatePicker } from '@/components/shared/DatePicker'
import { FormActions } from '@/components/shared/FormActions'
import { Input, Textarea } from '@/components/ui/Input'
import type { Goal } from '@/types/goal'
import { todayISO } from '@/utils/date'
import { errorMessage } from '@/utils/format'
import { CATEGORICAL } from '@/utils/palette'
import { addContribution, createGoal, updateGoal } from './goalService'

type GoalFormProps = {
  goal?: Goal
  onSaved: () => void
  onCancel: () => void
}

export function GoalForm({ goal, onSaved, onCancel }: GoalFormProps) {
  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(goal ? String(goal.target_amount) : '')
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? '')
  const [color, setColor] = useState(goal?.color ?? CATEGORICAL[2])
  const [notes, setNotes] = useState(goal?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(target)
    if (!name.trim()) return setError('Give the goal a name.')
    if (!Number.isFinite(value) || value <= 0) return setError('Enter a target greater than zero.')

    setBusy(true)
    setError(null)
    try {
      const input = {
        name: name.trim(),
        target_amount: value,
        target_date: targetDate || null,
        color,
        notes: notes.trim() || null,
      }
      if (goal) await updateGoal(goal.id, input)
      else await createGoal(input)
      onSaved()
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Goal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Laptop, emergency fund, trip"
        autoFocus
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Target amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="0.00"
          required
        />
        <DatePicker label="Target date (optional)" value={targetDate} onChange={setTargetDate} />
      </div>
      <ColorSwatches value={color} onChange={setColor} />
      <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      <FormActions submitLabel={goal ? 'Save changes' : 'Add goal'} busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}

type ContributionFormProps = {
  goalId: string
  onSaved: () => void
  onCancel: () => void
}

/** Log money set aside for a goal. This tracks progress only. It does not move money between accounts. */
export function ContributionForm({ goalId, onSaved, onCancel }: ContributionFormProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount greater than zero.')

    setBusy(true)
    setError(null)
    try {
      await addContribution({ goal_id: goalId, amount: value, contributed_on: date, note: note.trim() || null })
      onSaved()
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <Input
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional"
        hint="This tracks progress only. Record a transfer if you moved the money between accounts."
      />
      <FormActions submitLabel="Add to goal" busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}
