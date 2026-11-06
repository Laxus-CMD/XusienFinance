import { useState } from 'react'
import type { FormEvent } from 'react'
import { CategoryOptions } from '@/components/shared/CategoryOptions'
import { FormActions } from '@/components/shared/FormActions'
import { Input, Select } from '@/components/ui/Input'
import type { Budget } from '@/types/budget'
import type { Category } from '@/types/category'
import { errorMessage } from '@/utils/format'
import { createBudget, updateBudget } from './budgetService'

type Props = {
  budget?: Budget
  categories: Category[]
  /** Categories that already have a budget. Hidden when creating. */
  takenCategoryIds: Set<string>
  onSaved: () => void
  onCancel: () => void
}

export function BudgetForm({ budget, categories, takenCategoryIds, onSaved, onCancel }: Props) {
  const [categoryId, setCategoryId] = useState(budget?.category_id ?? '')
  const [amount, setAmount] = useState(budget ? String(budget.amount) : '')
  const [threshold, setThreshold] = useState(budget?.alert_threshold ?? 80)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!categoryId) return setError('Pick a category to limit.')
    if (!Number.isFinite(value) || value <= 0) return setError('Enter a limit greater than zero.')

    setBusy(true)
    setError(null)
    try {
      if (budget) await updateBudget(budget.id, { amount: value, alert_threshold: threshold })
      else await createBudget({ category_id: categoryId, amount: value, alert_threshold: threshold })
      onSaved()
    } catch (e) {
      setError(errorMessage(e))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Category"
        value={categoryId}
        disabled={Boolean(budget)}
        onChange={(e) => setCategoryId(e.target.value)}
        hint="Spending in subcategories counts toward the parent."
      >
        <option value="">Choose a category</option>
        <CategoryOptions categories={categories} type="expense" exclude={budget ? undefined : takenCategoryIds} />
      </Select>
      <Input
        label="Monthly limit"
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        required
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="threshold" className="flex items-center justify-between text-[13px] font-medium text-mute">
          <span>Warn me at</span>
          <span className="font-semibold tabular-nums text-ink">{threshold}% used</span>
        </label>
        <input
          id="threshold"
          type="range"
          min={50}
          max={100}
          step={5}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-brand"
        />
      </div>
      <FormActions submitLabel={budget ? 'Save changes' : 'Add budget'} busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}
