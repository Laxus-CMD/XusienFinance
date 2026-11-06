# Product spec

## Summary

LaxFinance is a personal finance web app. It gives one person a clear picture of their money. Income. Spending. Balances. Bills. Budgets. Savings goals.

The first idea was called Pennywise. The project and app are now named LaxFinance.

## Goals

- Show where a person stands financially in under five seconds.
- Make recording a transaction fast.
- Never miss a bill.
- Keep spending inside the limits the person chose.
- Show progress toward savings goals.

## Not in scope for v1

- Bank sync or open banking.
- Multiple currencies in one account set or exchange rates.
- Sharing data between users.
- Investments and loans.
- Native mobile apps. The web app is responsive instead.

## Users

One person managing their own money. A student or early career worker is the main case. They have a few accounts such as cash a bank account and an e-wallet. They have a few recurring bills and a monthly allowance or salary.

## Features

### 1. Financial dashboard

- Total balance across active accounts.
- Change since the end of last month.
- Income and spending for this month with change against last month.
- Net for the month.
- Budget left across all budgets.
- Six month income and expense chart.
- Spending by category this month.
- Six most recent transactions.
- Bills due in the next two weeks.
- A clear empty state when there are no accounts yet.

### 2. Account management

- Add edit and archive accounts.
- Types: cash bank account e-wallet.
- Opening balance and a color.
- Archived accounts keep their history and drop out of totals and pickers.
- Balance is calculated from transactions. It is never typed in by hand.

### 3. Transaction management

- Income expense and transfer.
- Amount date account category and description.
- Transfers move money between two accounts and are not counted as income or spending.
- Search by description or category. Filter by type account category and date range.
- Twenty rows per page.
- Edit and delete with confirmation.

### 4. Bill management

- One-time and recurring bills: weekly monthly yearly.
- Due date amount category notes and a usual payment account.
- Statuses: paid overdue due soon (within 7 days) upcoming.
- Pay all or part of a bill. Paying creates an expense and a payment record in one step.
- Recurring bills roll to their next due date when fully paid.
- Payment history per bill.
- List view grouped by status and a month calendar.

### 5. Expense categorization

- Income and expense categories.
- One level of subcategories.
- Subcategories use their parent color.
- New users get a starter set.
- Deleting a category removes its subcategories. Transactions stay and become uncategorized.

### 6. Budget management

- A monthly limit per expense category.
- Spending in subcategories counts toward the parent.
- A warning threshold from 50 to 100 percent.
- Status: on track nearing limit over budget.
- A month switcher to look back.

### 7. Savings goals

- Name target amount optional target date color and notes.
- Contributions with a date and a note.
- Progress bar. Amount left. Monthly amount needed to hit the date.
- Contributions track progress only. They do not move money between accounts.

### 8. Financial reports and analytics

- Periods: 3 months 6 months 12 months year to date.
- Income spending net and savings rate with change against the previous period.
- Cash flow chart with income expenses and net.
- Spending or income by category.
- Month by month table.

### 9. Notifications and reminders

- Overdue bills.
- Bills due within three days.
- Budgets that pass their warning threshold or their limit.
- Shown in the header bell. Each can be dismissed.
- Alerts are worked out from live data. No emails or push in v1.

### 10. Data management

- Download a full JSON backup.
- Restore from a backup. It merges by id and never deletes.
- Export transactions as CSV.
- Import transactions from CSV. Bad rows are skipped and listed.

## Design direction

Dark. Minimal. Muted accents. Cards for each block of information. Interactive charts. Simple navigation.

- Surfaces step up in lightness: page then card then raised.
- Charts use one fixed set of colors checked for color blindness. Income is blue and spending is orange.
- Status colors are kept for state only: paid due soon overdue.
- Every chart has a legend and a screen reader table.
- Works from phone width up. The sidebar becomes a drawer on small screens.

## Tech stack

| Area | Choice |
| --- | --- |
| Language | TypeScript |
| UI | React 19 |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (auth and API) |
| Database | PostgreSQL |
| Charts | Recharts |
| Icons | lucide-react |
| Font | Manrope (self hosted) |
