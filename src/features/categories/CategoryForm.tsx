import { useState } from 'react'
import type { FormEvent } from 'react'
import { ColorSwatches } from '@/components/shared/ColorSwatches'
import { FormActions } from '@/components/shared/FormActions'
import { Input, Select } from '@/components/ui/Input'
import type { Category, CategoryType } from '@/types/category'
import { errorMessage } from '@/utils/format'
import { CATEGORICAL } from '@/utils/palette'
import { createCategory, updateCategory } from './categoryService'

type Props = {
  /** Edit this category. Leave out to create one. */
  category?: Category
  /** Starting values when creating, for example a new subcategory under a parent. */
  preset?: { type?: CategoryType; parent_id?: string | null; color?: string }
  categories: Category[]
  onSaved: () => void
  onCancel: () => void
}

export function CategoryForm({ category, preset, categories, onSaved, onCancel }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<CategoryType>(category?.type ?? preset?.type ?? 'expense')
  const [parentId, setParentId] = useState(category?.parent_id ?? preset?.parent_id ?? '')
  const [color, setColor] = useState(category?.color ?? preset?.color ?? CATEGORICAL[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parents = categories.filter((c) => c.parent_id === null && c.type === type && c.id !== category?.id)
  // A category with its own subcategories cannot become a subcategory itself.
  const hasChildren = category ? categories.some((c) => c.parent_id === category.id) : false
  const parent = parents.find((p) => p.id === parentId)

  function changeType(next: CategoryType) {
    setType(next)
    setParentId('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return setError('Give the category a name.')

    setBusy(true)
    setError(null)
    try {
      const input = {
        name: name.trim(),
        type,
        parent_id: parentId || null,
        color: parent ? parent.color : color,
      }
      if (category) await updateCategory(category.id, input)
      else await createCategory(input)
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
        placeholder="Groceries, Allowance"
        autoFocus
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Type"
          value={type}
          disabled={Boolean(category) || Boolean(preset?.parent_id)}
          onChange={(e) => changeType(e.target.value as CategoryType)}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
        <Select
          label="Inside"
          value={parentId}
          disabled={hasChildren}
          onChange={(e) => setParentId(e.target.value)}
          hint={hasChildren ? 'Has subcategories, so it stays top level.' : undefined}
        >
          <option value="">Top level</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      {parent ? (
        <p className="text-[13px] text-mute">Subcategories use the color of their parent.</p>
      ) : (
        <ColorSwatches value={color} onChange={setColor} />
      )}
      <FormActions submitLabel={category ? 'Save changes' : 'Add category'} busy={busy} error={error} onCancel={onCancel} />
    </form>
  )
}
