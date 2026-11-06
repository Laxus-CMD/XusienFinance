import { categoryPath, indexCategories } from '@/calculations/categoryTree'
import { supabase, unwrap } from '@/lib/supabase/client'
import type {
  AccountRow,
  BillPaymentRow,
  BillRow,
  BudgetRow,
  CategoryRow,
  GoalContributionRow,
  GoalRow,
  TransactionRow,
} from '@/lib/supabase/database.types'
import type { Account } from '@/types/account'
import type { Category } from '@/types/category'
import type { Transaction, TransactionInput, TransactionType } from '@/types/transaction'

const PAGE_SIZE = 1000
const CHUNK_SIZE = 500

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

async function fetchAll<T>(page: (from: number, to: number) => Page<T>): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const chunk = unwrap(await page(from, from + PAGE_SIZE - 1))
    rows.push(...chunk)
    if (chunk.length < PAGE_SIZE) break
  }
  return rows
}

async function inChunks<T>(rows: T[], send: (chunk: T[]) => PromiseLike<{ error: { message: string } | null }>) {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const { error } = await send(rows.slice(i, i + CHUNK_SIZE))
    if (error) throw new Error(error.message)
  }
}

export function downloadFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/* ------------------------------------------------------------------ */
/* Full backup (JSON)                                                  */
/* ------------------------------------------------------------------ */

export type BackupData = {
  accounts: AccountRow[]
  categories: CategoryRow[]
  transactions: TransactionRow[]
  bills: BillRow[]
  bill_payments: BillPaymentRow[]
  budgets: BudgetRow[]
  goals: GoalRow[]
  goal_contributions: GoalContributionRow[]
}

export type Backup = {
  app: 'laxfinance'
  version: 1
  exported_at: string
  data: BackupData
}

export type RestoreCounts = { [K in keyof BackupData]: number }

export async function buildBackup(): Promise<Backup> {
  const [accounts, categories, transactions, bills, bill_payments, budgets, goals, goal_contributions] =
    await Promise.all([
      fetchAll((a, b) => supabase.from('accounts').select('*').order('created_at').order('id').range(a, b)),
      fetchAll((a, b) => supabase.from('categories').select('*').order('created_at').order('id').range(a, b)),
      fetchAll((a, b) => supabase.from('transactions').select('*').order('date').order('id').range(a, b)),
      fetchAll((a, b) => supabase.from('bills').select('*').order('created_at').order('id').range(a, b)),
      fetchAll((a, b) => supabase.from('bill_payments').select('*').order('created_at').order('id').range(a, b)),
      fetchAll((a, b) => supabase.from('budgets').select('*').order('created_at').order('id').range(a, b)),
      fetchAll((a, b) => supabase.from('goals').select('*').order('created_at').order('id').range(a, b)),
      fetchAll((a, b) => supabase.from('goal_contributions').select('*').order('created_at').order('id').range(a, b)),
    ])

  return {
    app: 'laxfinance',
    version: 1,
    exported_at: new Date().toISOString(),
    data: { accounts, categories, transactions, bills, bill_payments, budgets, goals, goal_contributions },
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Read and sanity check a backup file. Throws a readable error when it is not one. */
export function parseBackup(text: string): Backup {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!isRecord(json) || json.app !== 'laxfinance' || json.version !== 1 || !isRecord(json.data)) {
    throw new Error('That is not a LaxFinance backup file.')
  }
  const data = json.data
  const list = <T>(key: keyof BackupData): T[] => {
    const value = data[key]
    if (value === undefined) return []
    if (!Array.isArray(value) || !value.every((row) => isRecord(row) && typeof row.id === 'string')) {
      throw new Error(`The "${key}" section of the backup is damaged.`)
    }
    return value as T[]
  }
  return {
    app: 'laxfinance',
    version: 1,
    exported_at: String(json.exported_at ?? ''),
    data: {
      accounts: list('accounts'),
      categories: list('categories'),
      transactions: list('transactions'),
      bills: list('bills'),
      bill_payments: list('bill_payments'),
      budgets: list('budgets'),
      goals: list('goals'),
      goal_contributions: list('goal_contributions'),
    },
  }
}

/**
 * Merge a backup into the signed-in account. Rows are matched by id,
 * so restoring twice does not duplicate anything and nothing is deleted.
 */
export async function restoreBackup(backup: Backup, userId: string): Promise<RestoreCounts> {
  const d = backup.data
  const own = <T extends { user_id: string }>(rows: T[]): T[] => rows.map((r) => ({ ...r, user_id: userId }))

  // Order matters: parents before the rows that point at them.
  await inChunks(own(d.categories.filter((c) => !c.parent_id)), (c) => supabase.from('categories').upsert(c))
  await inChunks(own(d.categories.filter((c) => c.parent_id)), (c) => supabase.from('categories').upsert(c))
  await inChunks(own(d.accounts), (c) => supabase.from('accounts').upsert(c))
  await inChunks(own(d.transactions), (c) => supabase.from('transactions').upsert(c))
  await inChunks(own(d.bills), (c) => supabase.from('bills').upsert(c))
  await inChunks(own(d.bill_payments), (c) => supabase.from('bill_payments').upsert(c))
  await inChunks(own(d.budgets), (c) => supabase.from('budgets').upsert(c))
  await inChunks(own(d.goals), (c) => supabase.from('goals').upsert(c))
  await inChunks(own(d.goal_contributions), (c) => supabase.from('goal_contributions').upsert(c))

  return {
    accounts: d.accounts.length,
    categories: d.categories.length,
    transactions: d.transactions.length,
    bills: d.bills.length,
    bill_payments: d.bill_payments.length,
    budgets: d.budgets.length,
    goals: d.goals.length,
    goal_contributions: d.goal_contributions.length,
  }
}

/* ------------------------------------------------------------------ */
/* Transactions (CSV)                                                  */
/* ------------------------------------------------------------------ */

export const CSV_COLUMNS = ['date', 'type', 'amount', 'account', 'to_account', 'category', 'description'] as const

/** RFC 4180 style parser. Handles quoted commas, quotes and line breaks. */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input // drop a byte order mark
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

function csvCell(value: string | number): string {
  let s = String(value)
  // Stop spreadsheets from running a cell as a formula.
  if (typeof value === 'string' && /^[=+\-@]/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function transactionsToCsv(transactions: Transaction[], accounts: Account[], categories: Category[]): string {
  const accountName = new Map(accounts.map((a) => [a.id, a.name]))
  const byId = indexCategories(categories)
  const lines = [CSV_COLUMNS.join(',')]
  for (const t of transactions) {
    lines.push(
      [
        t.date,
        t.type,
        t.amount,
        accountName.get(t.account_id) ?? '',
        t.to_account_id ? (accountName.get(t.to_account_id) ?? '') : '',
        t.category_id ? categoryPath(t.category_id, byId) : '',
        t.description,
      ]
        .map(csvCell)
        .join(','),
    )
  }
  return lines.join('\n')
}

export type ImportResult = {
  imported: number
  skipped: number
  /** Imported rows whose category name was not found. */
  uncategorized: number
  problems: string[]
}

const TYPES = new Set<string>(['income', 'expense', 'transfer'])

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

/**
 * Import transactions from CSV. Columns: date, type, amount, account, to_account, category, description.
 * Accounts must already exist. Bad rows are skipped and listed so nothing fails silently.
 */
export async function importTransactionsCsv(
  text: string,
  accounts: Account[],
  categories: Category[],
): Promise<ImportResult> {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('The file has no data rows.')

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const col = (name: (typeof CSV_COLUMNS)[number]) => header.indexOf(name)
  for (const required of ['date', 'type', 'amount', 'account'] as const) {
    if (col(required) === -1) throw new Error(`Missing column "${required}". Export a CSV first to see the format.`)
  }

  const accountByName = new Map(accounts.map((a) => [a.name.trim().toLowerCase(), a.id]))
  const byId = indexCategories(categories)
  const categoryByKey = new Map<string, Category>()
  for (const c of categories) {
    categoryByKey.set(`${c.type}|${categoryPath(c.id, byId).toLowerCase()}`, c)
    if (!categoryByKey.has(`${c.type}|${c.name.trim().toLowerCase()}`)) {
      categoryByKey.set(`${c.type}|${c.name.trim().toLowerCase()}`, c)
    }
  }

  const valid: TransactionInput[] = []
  const problems: string[] = []
  let skipped = 0
  let uncategorized = 0

  rows.slice(1).forEach((cells, index) => {
    const line = index + 2
    const get = (name: (typeof CSV_COLUMNS)[number]) => (cells[col(name)] ?? '').trim()
    const fail = (reason: string) => {
      skipped++
      if (problems.length < 10) problems.push(`Row ${line}: ${reason}`)
    }

    const date = get('date')
    const type = get('type').toLowerCase()
    const amount = Number(get('amount').replace(/,/g, ''))
    const accountId = accountByName.get(get('account').toLowerCase())

    if (!isRealDate(date)) return fail('date must look like 2026-10-31')
    if (!TYPES.has(type)) return fail('type must be income, expense or transfer')
    if (!Number.isFinite(amount) || amount <= 0) return fail('amount must be greater than zero')
    if (!accountId) return fail(`account "${get('account')}" does not exist`)

    let toAccountId: string | null = null
    if (type === 'transfer') {
      toAccountId = accountByName.get(get('to_account').toLowerCase()) ?? null
      if (!toAccountId) return fail(`to_account "${get('to_account')}" does not exist`)
      if (toAccountId === accountId) return fail('transfer needs two different accounts')
    }

    let categoryId: string | null = null
    const categoryText = get('category').toLowerCase()
    if (type !== 'transfer' && categoryText) {
      categoryId = categoryByKey.get(`${type}|${categoryText}`)?.id ?? null
      if (!categoryId) uncategorized++
    }

    valid.push({
      type: type as TransactionType,
      amount,
      date,
      account_id: accountId,
      to_account_id: toAccountId,
      category_id: categoryId,
      description: get('description'),
    })
  })

  await inChunks(valid, (chunk) => supabase.from('transactions').insert(chunk))
  return { imported: valid.length, skipped, uncategorized, problems }
}
