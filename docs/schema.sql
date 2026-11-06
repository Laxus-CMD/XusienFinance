-- =====================================================================
-- LaxFinance database schema for Supabase (PostgreSQL)
-- Run this whole file once in the Supabase SQL editor on a fresh project.
-- Every table is protected by row level security. Users only see their own rows.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.account_type as enum ('cash', 'bank', 'ewallet');
create type public.category_type as enum ('income', 'expense');
create type public.transaction_type as enum ('income', 'expense', 'transfer');
create type public.bill_recurrence as enum ('none', 'weekly', 'monthly', 'yearly');

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  currency text not null default 'PHP' check (char_length(currency) = 3),
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  type public.account_type not null,
  opening_balance numeric(14, 2) not null default 0,
  color text not null default '#3987e5',
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  parent_id uuid references public.categories (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  type public.category_type not null,
  color text not null default '#6b7487',
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  to_account_id uuid references public.accounts (id) on delete restrict,
  category_id uuid references public.categories (id) on delete set null,
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  description text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint transfer_shape check (
    (type = 'transfer' and to_account_id is not null and to_account_id <> account_id)
    or (type <> 'transfer' and to_account_id is null)
  )
);

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(14, 2) not null check (amount > 0),
  amount_paid numeric(14, 2) not null default 0 check (amount_paid >= 0),
  due_date date not null,
  recurrence public.bill_recurrence not null default 'none',
  category_id uuid references public.categories (id) on delete set null,
  account_id uuid references public.accounts (id) on delete set null,
  notes text,
  is_paid boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.bill_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bill_id uuid not null references public.bills (id) on delete cascade,
  transaction_id uuid references public.transactions (id) on delete set null,
  amount numeric(14, 2) not null check (amount > 0),
  paid_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  alert_threshold integer not null default 80 check (alert_threshold between 1 and 100),
  created_at timestamptz not null default now(),
  unique (user_id, category_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  target_date date,
  color text not null default '#199e70',
  notes text,
  created_at timestamptz not null default now()
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  goal_id uuid not null references public.goals (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  contributed_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------
create index transactions_user_date_idx on public.transactions (user_id, date desc);
create index transactions_account_idx on public.transactions (account_id);
create index transactions_to_account_idx on public.transactions (to_account_id);
create index transactions_category_idx on public.transactions (category_id);
create index categories_user_type_idx on public.categories (user_id, type);
create index bills_user_due_idx on public.bills (user_id, due_date);
create index bill_payments_bill_idx on public.bill_payments (bill_id, paid_on desc);
create index goal_contributions_goal_idx on public.goal_contributions (goal_id, contributed_on desc);

-- ---------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles: own row" on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array[
    'accounts', 'categories', 'transactions', 'bills',
    'bill_payments', 'budgets', 'goals', 'goal_contributions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))',
      t || ': own rows', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Pay a bill in one atomic step
-- Creates the expense transaction, logs the payment and updates the bill.
-- Recurring bills roll forward to the next due date once fully paid.
-- ---------------------------------------------------------------------
create or replace function public.pay_bill(
  p_bill_id uuid,
  p_amount numeric,
  p_account_id uuid,
  p_paid_on date default current_date
)
returns public.bills
language plpgsql
security invoker
as $$
declare
  b public.bills;
  tx_id uuid;
  new_paid numeric(14, 2);
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  select * into b from public.bills where id = p_bill_id for update;
  if not found then
    raise exception 'Bill not found';
  end if;

  insert into public.transactions (account_id, category_id, type, amount, description, date)
  values (p_account_id, b.category_id, 'expense', p_amount, 'Bill: ' || b.name, p_paid_on)
  returning id into tx_id;

  insert into public.bill_payments (bill_id, transaction_id, amount, paid_on)
  values (b.id, tx_id, p_amount, p_paid_on);

  new_paid := b.amount_paid + p_amount;

  if new_paid < b.amount then
    update public.bills set amount_paid = new_paid where id = b.id;
  elsif b.recurrence = 'none' then
    update public.bills set amount_paid = new_paid, is_paid = true where id = b.id;
  else
    update public.bills
    set amount_paid = 0,
        due_date = case b.recurrence
          when 'weekly' then b.due_date + 7
          when 'monthly' then (b.due_date + interval '1 month')::date
          else (b.due_date + interval '1 year')::date
        end
    where id = b.id;
  end if;

  select * into b from public.bills where id = p_bill_id;
  return b;
end;
$$;

-- ---------------------------------------------------------------------
-- Default categories for new users
-- ---------------------------------------------------------------------
create or replace function public.seed_default_categories(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_parent uuid;
begin
  for r in
    select * from (values
      ('Food & Dining',    'expense', '#d95926', array['Groceries', 'Restaurants', 'Coffee & Snacks']),
      ('Transport',        'expense', '#3987e5', array['Commute', 'Fuel', 'Ride-hailing']),
      ('Housing',          'expense', '#199e70', array['Rent', 'Maintenance']),
      ('Bills & Utilities','expense', '#c98500', array['Electricity', 'Water', 'Internet', 'Mobile load']),
      ('Shopping',         'expense', '#d55181', array['Clothing', 'Gadgets']),
      ('Health',           'expense', '#e66767', array['Medicine', 'Checkups']),
      ('Education',        'expense', '#9085e9', array['Tuition', 'Books & Supplies']),
      ('Entertainment',    'expense', '#008300', array['Subscriptions', 'Games']),
      ('Other',            'expense', '#6b7487', array[]::text[]),
      ('Salary',           'income',  '#3987e5', array[]::text[]),
      ('Allowance',        'income',  '#199e70', array[]::text[]),
      ('Freelance',        'income',  '#9085e9', array[]::text[]),
      ('Gifts',            'income',  '#d55181', array[]::text[]),
      ('Other income',     'income',  '#6b7487', array[]::text[])
    ) as t (name, type, color, subs)
  loop
    insert into public.categories (user_id, name, type, color)
    values (uid, r.name, r.type::public.category_type, r.color)
    returning id into v_parent;

    insert into public.categories (user_id, parent_id, name, type, color)
    select uid, v_parent, s, r.type::public.category_type, r.color
    from unnest(r.subs) as s;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- New user hook: create the profile and seed categories
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''));

  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
