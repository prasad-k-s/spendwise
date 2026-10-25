-- =============================================================
-- 0003: groups, members and invite links
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Needs 0001 and 0002 to have been run first.
--
-- How it fits together:
--   groups          a shared space (flat, trip, family…)
--   group_members   who is in each group, as 'owner' or 'member'
--   group_invites   shareable invite links; anyone signed in with a valid link can join
-- Groups are created with create_group() and joined with accept_group_invite().
-- Shared expenses inside a group come in the next migration.
-- =============================================================

-- ---------- Tables ----------
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) between 1 and 60),
  currency    text not null default 'INR' check (char_length(currency) = 3),
  created_by  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger groups_set_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

create table public.group_members (
  group_id   uuid not null references public.groups (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'member')),
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_members_user_id_idx on public.group_members (user_id);

create table public.group_invites (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  -- 32 random hex characters; this is the secret part of the invite link.
  token       text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_by  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  expires_at  timestamptz not null default now() + interval '7 days',
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index group_invites_group_id_idx on public.group_invites (group_id);

-- ---------- Helper functions used by the RLS policies ----------
-- SECURITY DEFINER lets these read group_members without triggering group_members' own
-- policies, which would otherwise call these functions again (infinite recursion).

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_group_owner(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = (select auth.uid()) and role = 'owner'
  );
$$;

-- True when the signed-in user and p_user_id are in at least one group together.
create or replace function public.shares_group_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members me
    join public.group_members them on them.group_id = me.group_id
    where me.user_id = (select auth.uid()) and them.user_id = p_user_id
  );
$$;

-- ---------- Creating a group ----------
-- Creates the group and adds the creator as its owner in one step, returning the new id.
-- (A plain INSERT can't return the row: RLS only shows groups you're a member of,
-- and the membership doesn't exist yet at that moment.)
create or replace function public.create_group(p_name text, p_currency text default 'INR')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_group_id uuid;
begin
  if v_user_id is null then
    raise exception 'You need to be signed in to create a group' using errcode = '42501';
  end if;

  insert into public.groups (name, currency, created_by)
  values (trim(p_name), upper(p_currency), v_user_id)
  returning id into v_group_id;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, v_user_id, 'owner');

  return v_group_id;
end;
$$;

-- ---------- A group must always keep at least one owner ----------
create or replace function public.keep_one_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     -- deleting the whole group, or the owner's whole account, removes members too; that's fine
     and exists (select 1 from public.groups where id = old.group_id)
     and exists (select 1 from public.profiles where id = old.user_id)
     and not exists (
       select 1 from public.group_members
       where group_id = old.group_id and role = 'owner' and user_id <> old.user_id
     )
  then
    raise exception 'A group needs at least one owner. Make someone else an owner first, or delete the group.'
      using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger group_members_keep_one_owner
  before update of role or delete on public.group_members
  for each row execute function public.keep_one_owner();

-- ---------- Row Level Security ----------
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;

-- groups: members can see their groups; only owners can rename or delete.
-- Creating a group goes through create_group(), so there's no insert policy.
create policy "Members can view their groups"
  on public.groups for select to authenticated
  using (public.is_group_member(id));

create policy "Owners can update their groups"
  on public.groups for update to authenticated
  using (public.is_group_owner(id))
  with check (public.is_group_owner(id));

create policy "Owners can delete their groups"
  on public.groups for delete to authenticated
  using (public.is_group_owner(id));

-- group_members: members see everyone in their groups. Joining only happens through
-- create_group() or accept_group_invite(), so there's no insert policy.
create policy "Members can view members of their groups"
  on public.group_members for select to authenticated
  using (public.is_group_member(group_id));

create policy "Owners can change member roles"
  on public.group_members for update to authenticated
  using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id));

create policy "Members can leave and owners can remove members"
  on public.group_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_owner(group_id));

-- group_invites: only owners manage invite links. Joining uses accept_group_invite().
create policy "Owners can view invites"
  on public.group_invites for select to authenticated
  using (public.is_group_owner(group_id));

create policy "Owners can create invites"
  on public.group_invites for insert to authenticated
  with check (public.is_group_owner(group_id) and created_by = (select auth.uid()));

create policy "Owners can revoke invites"
  on public.group_invites for update to authenticated
  using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id));

create policy "Owners can delete invites"
  on public.group_invites for delete to authenticated
  using (public.is_group_owner(group_id));

-- profiles: you can now also see the profile (name, avatar) of people in your groups.
create policy "Users can view profiles of people in their groups"
  on public.profiles for select to authenticated
  using (public.shares_group_with(id));

-- ---------- Invite links ----------
-- Shows "You're invited to <group>" before joining. Returns nothing for a bad,
-- expired or revoked link, so it can't be used to discover groups.
create or replace function public.get_invite_preview(p_token text)
returns table (group_id uuid, group_name text, member_count bigint, already_member boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select g.id,
         g.name,
         (select count(*) from public.group_members m where m.group_id = g.id),
         exists (
           select 1 from public.group_members m
           where m.group_id = g.id and m.user_id = (select auth.uid())
         )
  from public.group_invites i
  join public.groups g on g.id = i.group_id
  where i.token = p_token
    and i.revoked_at is null
    and i.expires_at > now();
$$;

-- Joins the group for a valid invite link and returns the group id.
create or replace function public.accept_group_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'You need to be signed in to join a group' using errcode = '42501';
  end if;

  select i.group_id into v_group_id
  from public.group_invites i
  where i.token = p_token and i.revoked_at is null and i.expires_at > now();

  if v_group_id is null then
    raise exception 'This invite link is invalid or has expired' using errcode = 'P0002';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, (select auth.uid()), 'member')
  on conflict (group_id, user_id) do nothing;

  return v_group_id;
end;
$$;

-- Only signed-in users may call these functions.
revoke execute on function public.create_group(text, text) from public, anon;
revoke execute on function public.get_invite_preview(text) from public, anon;
revoke execute on function public.accept_group_invite(text) from public, anon;
grant execute on function public.create_group(text, text) to authenticated;
grant execute on function public.get_invite_preview(text) to authenticated;
grant execute on function public.accept_group_invite(text) to authenticated;
