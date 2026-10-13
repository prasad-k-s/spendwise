-- =============================================================
-- 0001: profiles and categories
-- Run this once in Supabase → SQL Editor → New query → Run.
-- =============================================================

-- ---------- Helper: keep updated_at current ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles: one row per signed-up user ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  currency    text not null default 'INR' check (char_length(currency) = 3),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Users can see and edit only their own profile.
-- (Profiles are created by the sign-up trigger below, so there is no insert policy.)
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------- categories: each user's expense/income categories ----------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 50),
  type        text not null check (type in ('expense', 'income')),
  icon        text not null default 'circle',   -- a lucide-react icon name
  color       text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at  timestamptz not null default now(),
  unique (user_id, name, type)
);

create index categories_user_id_idx on public.categories (user_id);

alter table public.categories enable row level security;

-- Users have full control over their own categories and can't see anyone else's.
create policy "Users can view their own categories"
  on public.categories for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own categories"
  on public.categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------- On sign-up: create the profile and default categories ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.categories (user_id, name, type, icon, color)
  values
    (new.id, 'Food & Dining',     'expense', 'utensils',         '#f97316'),
    (new.id, 'Groceries',         'expense', 'shopping-cart',    '#22c55e'),
    (new.id, 'Transport',         'expense', 'car',              '#3b82f6'),
    (new.id, 'Shopping',          'expense', 'shopping-bag',     '#ec4899'),
    (new.id, 'Bills & Utilities', 'expense', 'receipt',          '#eab308'),
    (new.id, 'Rent',              'expense', 'house',            '#8b5cf6'),
    (new.id, 'Health',            'expense', 'heart-pulse',      '#ef4444'),
    (new.id, 'Entertainment',     'expense', 'clapperboard',     '#06b6d4'),
    (new.id, 'Education',         'expense', 'graduation-cap',   '#6366f1'),
    (new.id, 'Travel',            'expense', 'plane',            '#14b8a6'),
    (new.id, 'Other',             'expense', 'circle-ellipsis',  '#64748b'),
    (new.id, 'Salary',            'income',  'wallet',           '#16a34a'),
    (new.id, 'Freelance',         'income',  'briefcase',        '#0ea5e9'),
    (new.id, 'Investments',       'income',  'trending-up',      '#a855f7'),
    (new.id, 'Other',             'income',  'circle-plus',      '#64748b');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
