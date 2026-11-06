# LaxFinance

A personal finance web app. Track accounts, transactions, bills, budgets and savings goals in one place.

Dark theme. Minimal. Built with React, TypeScript, Vite, Tailwind CSS v4, Supabase and Recharts.

## What it does

- **Dashboard.** Total balance with a six month trend. Income, spending and budget left for the month. Charts. Recent transactions and upcoming bills.
- **Accounts.** Cash, bank accounts and e-wallets. Balances are worked out from your transactions.
- **Transactions.** Income, expenses and transfers. Search and filter by type, account, category and date.
- **Bills.** One-time and recurring. Partial payments. Payment history. List and calendar views.
- **Categories.** Your own categories with subcategories.
- **Budgets.** Monthly limits per category with warning thresholds.
- **Goals.** Targets with contributions and a monthly pace.
- **Reports.** Cash flow, spending by category and a month by month table.
- **Notifications.** Bill reminders and budget alerts in the header bell.
- **Data.** Full JSON backup and restore. CSV export and import for transactions.

## Set up

You need Node 20 or newer and a free [Supabase](https://supabase.com) project.

1. Install packages.

   ```bash
   npm install
   ```

2. In Supabase open the SQL editor. Paste and run `docs/schema.sql`. It creates every table, the security rules and the default categories for new users.

3. Copy the example env file.

   ```bash
   cp .env.example .env
   ```

   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Both are in Supabase under Project Settings, then API.

4. Start the app.

   ```bash
   npm run dev
   ```

5. Create an account on the sign-in screen. If Supabase email confirmation is on you will need to confirm first. You can turn it off under Authentication, then Providers, then Email while you develop.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck and build for production |
| `npm run typecheck` | Typecheck only |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

## Project layout

```
src/
  components/   ui (Button, Input, Modal...), layout (Sidebar, Header...), shared (EmptyState...)
  features/     one folder per module: dashboard, accounts, transactions, bills,
                categories, budgets, goals, reports, settings, auth
  calculations/ pure money maths. No React, no network. Easy to test.
  hooks/        useAuth, useAccounts, useTransactions, useCategories, useCurrency...
  lib/supabase/ client and database types
  types/        shared TypeScript types
  utils/        currency, date, format and palette helpers
docs/           spec, schema, financial logic, roadmap
```

Each feature folder holds its screens, its forms and one `*Service.ts` file. The service is the only place that talks to Supabase.

## Good to know

- **Money stays private.** Row level security means every user only reads and writes their own rows.
- **Default currency is the Philippine peso.** Change it in Settings. Amounts are not converted.
- **Balances are calculated.** An account balance is its opening balance plus its transactions. See `docs/FINANCIAL_LOGIC.md`.
- **Type definitions are hand written.** After changing the schema regenerate them with
  `npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts`.

## Docs

- [Product spec](docs/PRODUCT_SPEC.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Financial logic](docs/FINANCIAL_LOGIC.md)
- [Development roadmap](docs/DEVELOPMENT_ROADMAP.md)
