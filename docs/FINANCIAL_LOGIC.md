# Financial logic

All money maths lives in `src/calculations/`. These files are plain functions with no React and no network. That keeps them easy to test.

Amounts are rounded to cents after each sum with `roundMoney`. This avoids drift like 0.1 + 0.2.

## Balances

`calculations/balance.ts`

```
balance = opening_balance
        + income on the account
        - expenses on the account
        - transfers out of the account
        + transfers into the account
```

- Archived accounts keep their balance but are left out of the total.
- Transactions dated in the future count straight away.
- Balances come from the full transaction list. The app reads it in pages of 1000 because Supabase caps each request. If the list grows very large move this to a SQL view.

## Income expense and net

`calculations/cashflow.ts`

- Income is the sum of income transactions.
- Expense is the sum of expense transactions.
- Net is income minus expense.
- Transfers are ignored. They only move money between your own accounts.
- Savings rate is net divided by income. It is empty when income is zero.
- Percent change is `(current - previous) / |previous|`. It is empty when previous is zero.

## Categories

`calculations/categoryTree.ts`

- Categories have one level of subcategories.
- Category totals roll up into the top level parent. Spending on Groceries counts toward Food and Dining.
- A report shows the top categories and folds the rest into one "Other" slice.
- Uncategorized transactions get their own "Uncategorized" slice.

## Budgets

`calculations/budget.ts`

- Spent is the sum of expenses this month in the budget's category and all of its subcategories.
- Percent is spent divided by the limit.
- Status:
  - `over` when percent is above 100.
  - `warning` when percent reaches the alert threshold.
  - `ok` otherwise.
- Budgets are monthly. The same limit applies every month.

## Bills

`calculations/bills.ts`

- Outstanding is amount minus amount paid on the current cycle.
- Status uses days until the due date:
  - `paid` when the bill is a paid one-time bill.
  - `overdue` when the date has passed.
  - `due-soon` when it is due within 7 days.
  - `upcoming` otherwise.
- Paying a bill (`pay_bill` in SQL):
  - Always creates an expense transaction and a payment record.
  - A partial payment raises `amount_paid`.
  - A full payment on a one-time bill marks it paid.
  - A full payment on a recurring bill moves the due date forward and resets `amount_paid`.
- Next due date adds 7 days or 1 month or 12 months. A month step clamps to the last day, so Jan 31 becomes Feb 28.
- The calendar projects repeats from the bill's current due date. A bill due on the 31st shows on the 31st in long months and the last day in short ones.

Known limit: after a clamp the database adds one month to the clamped date. A bill due Jan 31 pays on time then moves to Feb 28 then Mar 28. If that matters change the due date by hand.

## Goals

`calculations/goals.ts`

- Saved is the sum of contributions.
- Remaining is target minus saved. It never goes below zero.
- Percent is capped at 100.
- Monthly pace is remaining divided by the months left to the target date. Months are days left divided by 30.44 and rounded up. The minimum is 1.
- No pace is shown when there is no date or the date has passed.

## Net worth

`calculations/netWorth.ts`

- Today it equals the total of active account balances.
- The trend line is the balance at the end of each month. It assumes every active account existed from the start with its opening balance. A transfer to an archived account counts as money leaving.

## Reports

`features/reports/reportService.ts`

- A range is 3 6 or 12 whole months ending this month or the months of this year so far.
- The previous period has the same number of months directly before the range. It drives the percent changes.
- The month table compares each month with the one before it.

## Alerts

`calculations/alerts.ts`

- A bill alert appears when a bill is overdue or due within 3 days.
- A budget alert appears when a budget is `warning` or `over` for the current month.
- Each alert has a stable id built from the bill and due date or the budget and month. Dismissing one hides only that alert. It returns for the next cycle.
- Dismissals are stored in the browser.

## Currency

- Amounts are stored as plain numbers with two decimals.
- One currency per user. It is set in Settings and only changes how amounts are shown.
- Formatting uses `Intl.NumberFormat`. The default is PHP.
