import { CalendarClock, CalendarDays, List, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { billStatus, billTotals } from '@/calculations/bills'
import { PageContainer } from '@/components/layout/PageContainer'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorNotice, LoadingState } from '@/components/shared/StateViews'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { useCurrency } from '@/hooks/useCurrency'
import { useResource } from '@/hooks/useResource'
import type { Bill, BillStatus } from '@/types/bill'
import { currentMonthKey, todayISO } from '@/utils/date'
import { cn, errorMessage } from '@/utils/format'
import { BillCalendar } from './BillCalendar'
import { BillCard } from './BillCard'
import { BillForm, PayBillForm } from './BillForm'
import { deleteBill, listBills } from './billService'

type View = 'list' | 'calendar'

const SECTIONS: { status: BillStatus; title: string }[] = [
  { status: 'overdue', title: 'Overdue' },
  { status: 'due-soon', title: 'Due in the next 7 days' },
  { status: 'upcoming', title: 'Upcoming' },
  { status: 'paid', title: 'Paid' },
]

export function Bills() {
  const { fmt } = useCurrency()
  const billsQuery = useResource(listBills, 'bills')
  const { activeAccounts, loading: accountsLoading, error: accountsError } = useAccounts()
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()

  const [view, setView] = useState<View>('list')
  const [month, setMonth] = useState(currentMonthKey())
  const [editing, setEditing] = useState<Bill | 'new' | null>(null)
  const [paying, setPaying] = useState<Bill | null>(null)
  const [deleting, setDeleting] = useState<Bill | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const bills = useMemo(() => billsQuery.data ?? [], [billsQuery.data])
  const today = todayISO()
  const totals = useMemo(() => billTotals(bills, today), [bills, today])
  const grouped = useMemo(() => {
    const groups: Record<BillStatus, Bill[]> = { overdue: [], 'due-soon': [], upcoming: [], paid: [] }
    for (const b of bills) groups[billStatus(b, today)].push(b)
    groups.paid.sort((a, b) => b.due_date.localeCompare(a.due_date))
    return groups
  }, [bills, today])

  const error = billsQuery.error || accountsError || categoriesError
  if (error) {
    return (
      <PageContainer>
        <ErrorNotice message={error} />
      </PageContainer>
    )
  }
  if (billsQuery.loading || accountsLoading || categoriesLoading) return <LoadingState />

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await deleteBill(deleting.id)
      setDeleting(null)
      billsQuery.reload()
    } catch (e) {
      setDeleteError(errorMessage(e))
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <PageContainer
      description="Recurring and one-time bills, with deadlines and payment history."
      actions={
        <>
          <div role="group" aria-label="View" className="flex rounded-control border border-line bg-surface p-1">
            {(
              [
                ['list', List, 'List'],
                ['calendar', CalendarDays, 'Calendar'],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-[7px] px-3 text-[13px] font-semibold transition-colors',
                  view === key ? 'bg-raised text-ink' : 'text-mute hover:text-ink',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Add bill
          </Button>
        </>
      }
    >
      {bills.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No bills yet"
          description="Add rent, subscriptions or tuition. You will get reminders before they are due."
          action={<Button onClick={() => setEditing('new')}>Add bill</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-sm font-medium text-mute">Still to pay</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{fmt(totals.outstanding)}</p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-mute">Overdue</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{totals.overdue}</p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-mute">Due in 7 days</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{totals.dueSoon}</p>
            </Card>
          </div>

          {view === 'calendar' ? (
            <BillCalendar bills={bills} month={month} onMonthChange={setMonth} today={today} />
          ) : (
            SECTIONS.filter((s) => grouped[s.status].length > 0).map((section) => (
              <section key={section.status} aria-labelledby={`bills-${section.status}`}>
                <h2 id={`bills-${section.status}`} className="mb-3 text-sm font-semibold text-mute">
                  {section.title} ({grouped[section.status].length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {grouped[section.status].map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      today={today}
                      onPay={() => setPaying(bill)}
                      onEdit={() => setEditing(bill)}
                      onDelete={() => {
                        setDeleteError(null)
                        setDeleting(bill)
                      }}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add bill' : 'Edit bill'}>
        {editing !== null && (
          <BillForm
            bill={editing === 'new' ? undefined : editing}
            accounts={activeAccounts}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              billsQuery.reload()
            }}
          />
        )}
      </Modal>

      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title={paying ? `Pay ${paying.name}` : 'Pay bill'}
        size="sm"
      >
        {paying && (
          <PayBillForm
            bill={paying}
            accounts={activeAccounts}
            onCancel={() => setPaying(null)}
            onSaved={() => {
              setPaying(null)
              billsQuery.reload()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? 'bill'}?`}
        message="The bill and its payment history are removed. Expenses already recorded from past payments stay in your transactions."
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
