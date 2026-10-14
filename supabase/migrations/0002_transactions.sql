-- =============================================================
-- 0002: transactions (each user's income and expenses)
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Needs 0001_profiles_and_categories.sql to have been run first.
-- =============================================================

create table public.transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  type            text not null check (type in ('expense', 'income')),
  amount          numeric(12, 2) not null check (amount > 0),
  -- If a category is deleted, its transactions stay and become "Uncategorized".
  category_id     uuid references public.categories (id) on delete set null,
  occurred_on     date not null default current_date,
  note            text check (char_length(note) <= 200),
  payment_method  text not null default 'upi'
                  check (payment_method in ('cash', 'upi', 'card', 'bank_transfer', 'other')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Fast "my transactions, newest first" lists and per-category reports.
create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc, created_at desc);
create index transactions_category_id_idx on public.transactions (category_id);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ---------- Integrity: the category must be yours and match the type ----------
-- (Stops an expense being filed under "Salary", or under someone else's category.)
create or replace function public.check_transaction_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.user_id = new.user_id
      and c.type = new.type
  ) then
    raise exception 'Category does not exist or does not match the transaction type'
      using errcode = '23514';  -- check_violation
  end if;
  return new;
end;
$$;

create trigger transactions_check_category
  before insert or update of category_id, type, user_id on public.transactions
  for each row execute function public.check_transaction_category();

-- ---------- Row Level Security: users only touch their own transactions ----------
alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own transactions"
  on public.transactions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
