# Development roadmap

## Phase 1: Foundation. Done

- Vite React TypeScript project with Tailwind v4.
- Supabase client and typed database.
- Schema with row level security and a starter category set.
- Auth: sign up and sign in.
- App shell: sidebar header and hash routing.
- UI kit: Button Input Modal Card Badge ProgressBar.

## Phase 2: Core tracking. Done

- Accounts with calculated balances.
- Transactions with search filters and paging.
- Categories with subcategories.

## Phase 3: Planning. Done

- Bills with partial payments history and a calendar.
- Budgets with warning thresholds.
- Savings goals with contributions.

## Phase 4: Insight. Done

- Dashboard.
- Reports with cash flow and category breakdown.
- Notification bell for bills and budgets.

## Phase 5: Data. Done

- JSON backup and restore.
- CSV export and import.
- Profile and currency settings.

## Next

Ordered by value.

1. **Tests.** Add Vitest. The functions in `src/calculations/` are pure so start there. Then add a few Playwright flows: sign in add a transaction pay a bill.
2. **Recurring transactions.** Rent salary and allowance that post themselves. A small Supabase scheduled function can do it.
3. **Email reminders.** Send bill reminders by email. Needs a scheduled Supabase function and an email provider.
4. **Multi-currency accounts.** Needs a currency per account and an exchange rate on each transfer.
5. **Attachments.** Receipts on transactions using Supabase Storage.
6. **Rules.** Auto-categorize by description. For example anything with "Jollibee" goes to Restaurants.
7. **Installable app.** A web manifest and offline shell so it can sit on the phone home screen.
8. **Faster balances.** If the transaction list gets large move balances and monthly totals into SQL views.
9. **Bill due date fix.** Keep the original day of month when a clamped date rolls forward.

## Ideas to think about

- Shared accounts for couples or roommates.
- Split a transaction across categories.
- Yearly budgets and rollover of unspent amounts.
- A weekly summary email.
