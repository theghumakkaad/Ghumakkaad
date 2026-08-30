-- ============================================================
--  GHUMAKKAAD — restrict admin writes to specific accounts
--
--  schema.sql's write policies are "to authenticated using (true)".
--  That blocks the public anon key from writing, which is what the
--  comment there promises — but it does NOT limit writes to you
--  specifically. Any account that can sign in (today or in the
--  future) gets full control of every price, itinerary and site
--  setting. This migration narrows that to a short list of accounts
--  you approve explicitly.
--
--  HOW TO RUN THIS
--  1. Supabase dashboard → SQL Editor → New query → paste this whole
--     file → Run. It's safe to run even if you've already created
--     your admin account in Supabase Auth.
--  2. Find your own user id: Authentication → Users → click your
--     account → copy the "UID" field (looks like a uuid).
--  3. Run, replacing the uuid with the one you copied:
--       insert into admins (user_id) values ('paste-your-uid-here');
--  4. In Supabase Auth settings (Authentication → Providers → Email),
--     turn OFF "Allow new users to sign up" so nobody else can create
--     an account at all — the admins table only matters for accounts
--     that already exist, so this closes the other half of the gap.
-- ============================================================

create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- you can read the list of admins from a signed-in admin session (handy
-- for building an "add another admin" screen later); nobody else can
-- read or write this table at all, including other authenticated users
drop policy if exists "admins read self" on admins;
create policy "admins read self" on admins for select
  to authenticated using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- ---------- replace the blanket "any authenticated user" policies ----------
drop policy if exists "write packages when signed in" on packages;
create policy "write packages when admin" on packages
  for all to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "write days" on itinerary_days;
create policy "write days when admin" on itinerary_days
  for all to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "write tiers" on pricing_tiers;
create policy "write tiers when admin" on pricing_tiers
  for all to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "write dates" on departure_dates;
create policy "write dates when admin" on departure_dates
  for all to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "write settings" on site_settings;
create policy "write settings when admin" on site_settings
  for all to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- Read policies are untouched on purpose: the public still reads active
-- packages and site settings with no session at all, same as before.
