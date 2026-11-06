import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { listAccounts } from '@/features/accounts/accountService'
import { listCategories } from '@/features/categories/categoryService'
import { listAllTransactions } from '@/features/transactions/transactionService'
import { useAuth } from '@/hooks/useAuth'
import { todayISO } from '@/utils/date'
import { errorMessage } from '@/utils/format'
import {
  type Backup,
  buildBackup,
  downloadFile,
  importTransactionsCsv,
  parseBackup,
  restoreBackup,
  transactionsToCsv,
} from './dataService'

type Message = { tone: 'ok' | 'error'; lines: string[] }

export function DataSettings() {
  const { user } = useAuth()
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [pendingBackup, setPendingBackup] = useState<Backup | null>(null)
  const csvInput = useRef<HTMLInputElement>(null)
  const jsonInput = useRef<HTMLInputElement>(null)

  async function run(label: string, task: () => Promise<string[]>) {
    setBusy(label)
    setMessage(null)
    try {
      setMessage({ tone: 'ok', lines: await task() })
    } catch (e) {
      setMessage({ tone: 'error', lines: [errorMessage(e)] })
    } finally {
      setBusy(null)
    }
  }

  const exportBackup = () =>
    run('backup', async () => {
      const backup = await buildBackup()
      downloadFile(`laxfinance-backup-${todayISO()}.json`, JSON.stringify(backup, null, 2), 'application/json')
      const total = Object.values(backup.data).reduce((t, rows) => t + rows.length, 0)
      return [`Backup saved with ${total} records.`]
    })

  const exportCsv = () =>
    run('csv-export', async () => {
      const [transactions, accounts, categories] = await Promise.all([
        listAllTransactions(),
        listAccounts(),
        listCategories(),
      ])
      downloadFile(`laxfinance-transactions-${todayISO()}.csv`, transactionsToCsv(transactions, accounts, categories), 'text/csv')
      return [`Exported ${transactions.length} transactions.`]
    })

  async function onCsvPicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await run('csv-import', async () => {
      const [accounts, categories] = await Promise.all([listAccounts(), listCategories()])
      const result = await importTransactionsCsv(await file.text(), accounts, categories)
      const lines = [`Imported ${result.imported} transactions.`]
      if (result.uncategorized > 0) lines.push(`${result.uncategorized} had a category that was not found, so they are uncategorized.`)
      if (result.skipped > 0) lines.push(`Skipped ${result.skipped} rows.`, ...result.problems)
      return lines
    })
  }

  async function onJsonPicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setMessage(null)
      setPendingBackup(parseBackup(await file.text()))
    } catch (e) {
      setMessage({ tone: 'error', lines: [errorMessage(e)] })
    }
  }

  async function confirmRestore() {
    const backup = pendingBackup
    if (!backup || !user) return
    setPendingBackup(null)
    await run('restore', async () => {
      const counts = await restoreBackup(backup, user.id)
      return [
        'Backup restored.',
        `${counts.accounts} accounts, ${counts.transactions} transactions, ${counts.bills} bills, ${counts.budgets} budgets, ${counts.goals} goals.`,
      ]
    })
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardHeader title="Backup" subtitle="One file with everything: accounts, transactions, bills, budgets and goals." />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Download className="size-4" />} loading={busy === 'backup'} onClick={() => void exportBackup()}>
            Download backup
          </Button>
          <Button variant="secondary" icon={<Upload className="size-4" />} loading={busy === 'restore'} onClick={() => jsonInput.current?.click()}>
            Restore from backup
          </Button>
          <input ref={jsonInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onJsonPicked(e)} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Transactions as CSV"
          subtitle="Open in a spreadsheet, or bring in transactions from your bank. Accounts must exist first."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Download className="size-4" />} loading={busy === 'csv-export'} onClick={() => void exportCsv()}>
            Export CSV
          </Button>
          <Button variant="secondary" icon={<Upload className="size-4" />} loading={busy === 'csv-import'} onClick={() => csvInput.current?.click()}>
            Import CSV
          </Button>
          <input ref={csvInput} type="file" accept="text/csv,.csv" className="hidden" onChange={(e) => void onCsvPicked(e)} />
        </div>
        <p className="mt-3 text-[13px] text-mute">
          Columns: date (2026-10-31), type (income, expense or transfer), amount, account, to_account, category, description.
        </p>
      </Card>

      {message && (
        <div
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={
            message.tone === 'error'
              ? 'space-y-1 rounded-card border border-bad/30 bg-bad/10 p-4 text-sm text-bad'
              : 'space-y-1 rounded-card border border-line bg-surface p-4 text-sm text-mute'
          }
        >
          {message.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingBackup !== null}
        title="Restore this backup?"
        message={
          pendingBackup
            ? `It has ${pendingBackup.data.accounts.length} accounts and ${pendingBackup.data.transactions.length} transactions. Matching records are updated and the rest are added. Nothing is deleted.`
            : ''
        }
        confirmLabel="Restore"
        onConfirm={() => void confirmRestore()}
        onCancel={() => setPendingBackup(null)}
      />
    </div>
  )
}
