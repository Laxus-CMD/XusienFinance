// Hand-written to match docs/schema.sql.
// Regenerate with: npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type AccountType = 'cash' | 'bank' | 'ewallet'
export type CategoryType = 'income' | 'expense'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type BillRecurrence = 'none' | 'weekly' | 'monthly' | 'yearly'

export type ProfileRow = {
  id: string
  full_name: string | null
  currency: string
  created_at: string
}

export type AccountRow = {
  id: string
  user_id: string
  name: string
  type: AccountType
  opening_balance: number
  color: string
  is_archived: boolean
  created_at: string
}

export type CategoryRow = {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  type: CategoryType
  color: string
  created_at: string
}

export type TransactionRow = {
  id: string
  user_id: string
  account_id: string
  to_account_id: string | null
  category_id: string | null
  type: TransactionType
  amount: number
  description: string
  date: string
  created_at: string
}

export type BillRow = {
  id: string
  user_id: string
  name: string
  amount: number
  amount_paid: number
  due_date: string
  recurrence: BillRecurrence
  category_id: string | null
  account_id: string | null
  notes: string | null
  is_paid: boolean
  created_at: string
}

export type BillPaymentRow = {
  id: string
  user_id: string
  bill_id: string
  transaction_id: string | null
  amount: number
  paid_on: string
  created_at: string
}

export type BudgetRow = {
  id: string
  user_id: string
  category_id: string
  amount: number
  alert_threshold: number
  created_at: string
}

export type GoalRow = {
  id: string
  user_id: string
  name: string
  target_amount: number
  target_date: string | null
  color: string
  notes: string | null
  created_at: string
}

export type GoalContributionRow = {
  id: string
  user_id: string
  goal_id: string
  amount: number
  contributed_on: string
  note: string | null
  created_at: string
}

/** Insert shape: the listed keys become optional (they have database defaults). */
type WithDefaults<Row, Optional extends keyof Row> = Omit<Row, Optional> & Partial<Pick<Row, Optional>>

type Table<Row, Insert> = {
  Row: Row
  Insert: Insert
  Update: Partial<Insert>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, WithDefaults<ProfileRow, 'full_name' | 'currency' | 'created_at'>>
      accounts: Table<
        AccountRow,
        WithDefaults<AccountRow, 'id' | 'user_id' | 'opening_balance' | 'color' | 'is_archived' | 'created_at'>
      >
      categories: Table<
        CategoryRow,
        WithDefaults<CategoryRow, 'id' | 'user_id' | 'parent_id' | 'color' | 'created_at'>
      >
      transactions: Table<
        TransactionRow,
        WithDefaults<
          TransactionRow,
          'id' | 'user_id' | 'to_account_id' | 'category_id' | 'description' | 'date' | 'created_at'
        >
      >
      bills: Table<
        BillRow,
        WithDefaults<
          BillRow,
          'id' | 'user_id' | 'amount_paid' | 'recurrence' | 'category_id' | 'account_id' | 'notes' | 'is_paid' | 'created_at'
        >
      >
      bill_payments: Table<
        BillPaymentRow,
        WithDefaults<BillPaymentRow, 'id' | 'user_id' | 'transaction_id' | 'paid_on' | 'created_at'>
      >
      budgets: Table<
        BudgetRow,
        WithDefaults<BudgetRow, 'id' | 'user_id' | 'alert_threshold' | 'created_at'>
      >
      goals: Table<
        GoalRow,
        WithDefaults<GoalRow, 'id' | 'user_id' | 'target_date' | 'color' | 'notes' | 'created_at'>
      >
      goal_contributions: Table<
        GoalContributionRow,
        WithDefaults<GoalContributionRow, 'id' | 'user_id' | 'contributed_on' | 'note' | 'created_at'>
      >
    }
    Views: { [_ in never]: never }
    Functions: {
      pay_bill: {
        Args: { p_bill_id: string; p_amount: number; p_account_id: string; p_paid_on?: string }
        Returns: BillRow
      }
    }
    Enums: {
      account_type: AccountType
      category_type: CategoryType
      transaction_type: TransactionType
      bill_recurrence: BillRecurrence
    }
    CompositeTypes: { [_ in never]: never }
  }
}
