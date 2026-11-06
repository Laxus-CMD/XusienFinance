import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { buildCategoryTree } from '@/calculations/categoryTree'
import { PageContainer } from '@/components/layout/PageContainer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Button, IconButton } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useCategories } from '@/hooks/useCategories'
import type { Category, CategoryType } from '@/types/category'
import { errorMessage } from '@/utils/format'
import { CategoryForm } from './CategoryForm'
import { deleteCategory } from './categoryService'

type Dialog = { mode: 'new'; preset?: { type?: CategoryType; parent_id?: string; color?: string } } | { mode: 'edit'; category: Category }

export function Categories() {
  const { categories, loading, error, reload } = useCategories()
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (loading) return <LoadingState />

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await deleteCategory(deleting.id)
      setDeleting(null)
      reload()
    } catch (e) {
      setDeleteError(errorMessage(e))
    } finally {
      setDeleteBusy(false)
    }
  }

  const subCount = deleting ? categories.filter((c) => c.parent_id === deleting.id).length : 0

  return (
    <PageContainer
      description="Group your transactions. Subcategories roll up into their parent in budgets and reports."
      actions={
        <Button icon={<Plus className="size-4" />} onClick={() => setDialog({ mode: 'new' })}>
          Add category
        </Button>
      }
    >
      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Categories keep spending organized. Add your first one."
          action={<Button onClick={() => setDialog({ mode: 'new' })}>Add category</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(['expense', 'income'] as const).map((type) => {
            const tree = buildCategoryTree(categories, type)
            return (
              <Card key={type}>
                <CardHeader
                  title={type === 'expense' ? 'Expense categories' : 'Income categories'}
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Plus className="size-3.5" />}
                      onClick={() => setDialog({ mode: 'new', preset: { type } })}
                    >
                      Add
                    </Button>
                  }
                />
                {tree.length === 0 ? (
                  <p className="py-6 text-center text-sm text-mute">None yet.</p>
                ) : (
                  <ul className="-my-1 divide-y divide-line">
                    {tree.map(({ category, children }) => (
                      <li key={category.id} className="py-2">
                        <Row
                          category={category}
                          onAddChild={() =>
                            setDialog({ mode: 'new', preset: { type, parent_id: category.id, color: category.color } })
                          }
                          onEdit={() => setDialog({ mode: 'edit', category })}
                          onDelete={() => {
                            setDeleteError(null)
                            setDeleting(category)
                          }}
                        />
                        {children.length > 0 && (
                          <ul className="ml-5 mt-1 border-l border-line pl-3">
                            {children.map((child) => (
                              <li key={child.id}>
                                <Row
                                  category={child}
                                  onEdit={() => setDialog({ mode: 'edit', category: child })}
                                  onDelete={() => {
                                    setDeleteError(null)
                                    setDeleting(child)
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog?.mode === 'edit' ? 'Edit category' : 'Add category'}
        size="sm"
      >
        {dialog !== null && (
          <CategoryForm
            category={dialog.mode === 'edit' ? dialog.category : undefined}
            preset={dialog.mode === 'new' ? dialog.preset : undefined}
            categories={categories}
            onCancel={() => setDialog(null)}
            onSaved={() => {
              setDialog(null)
              reload()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? 'category'}?`}
        message={`${
          subCount > 0 ? `Its ${subCount} ${subCount === 1 ? 'subcategory is' : 'subcategories are'} deleted too. ` : ''
        }Transactions in it stay but become uncategorized. Budgets on it are removed.`}
        confirmLabel="Delete"
        danger
        loading={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </PageContainer>
  )
}

type RowProps = {
  category: Category
  onAddChild?: () => void
  onEdit: () => void
  onDelete: () => void
}

function Row({ category, onAddChild, onEdit, onDelete }: RowProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} aria-hidden />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span>
      <div className="flex shrink-0">
        {onAddChild && (
          <IconButton label={`Add subcategory to ${category.name}`} onClick={onAddChild}>
            <Plus className="size-4" />
          </IconButton>
        )}
        <IconButton label={`Edit ${category.name}`} onClick={onEdit}>
          <Pencil className="size-4" />
        </IconButton>
        <IconButton label={`Delete ${category.name}`} danger onClick={onDelete}>
          <Trash2 className="size-4" />
        </IconButton>
      </div>
    </div>
  )
}
