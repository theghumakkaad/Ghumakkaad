-- ============================================================
--  GHUMAKKAAD — database schema
--  Run this once in the Supabase SQL editor of a NEW project.
--
--  Design notes:
--   * Days, fares and dates are their own tables, because you
--     add and reorder them constantly and they need sorting.
--   * The flat lists (inclusions, FAQs, packing…) are jsonb on
--     the package. They are always read and written together,
--     so separate tables would buy nothing.
--   * Row level security: anyone may read ACTIVE packages,
--     only a signed-in user may write. That is what stops the
--     public anon key from being able to edit your prices.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- packages ----------
create table if not exists packages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  terrain         text not null default 'desert',   -- desert | snow | monsoon | beach | hills
  kicker          text default '',
  sub             text default '',
  duration        text default '',
  card_image      text default '',
  active          boolean not null default true,
  featured        boolean not null default false,
  display_order   int not null default 0,

  fare_label      text default 'Option',
  addon_label     text default '',
  gst_percent     numeric default 0,
  season_rate     numeric default 0,
  season_windows  jsonb default '[]'::jsonb,        -- [["2026-11-07","2026-11-14"]]

  facts           jsonb default '[]'::jsonb,
  included        jsonb default '[]'::jsonb,
  excluded        jsonb default '[]'::jsonb,
  excluded_note   text default '',
  notes_title     text default '',
  notes_lede      text default '',
  notes           jsonb default '[]'::jsonb,        -- [{h,p}]
  stops_title     text default '',
  stops_lede      text default '',
  stops           jsonb default '[]'::jsonb,        -- [["Ahmedabad","CTM"]]
  stops_note      text default '',
  packing         jsonb default '[]'::jsonb,        -- [["Torch",0]]
  cancel_lede     text default '',
  charges         jsonb default '[]'::jsonb,        -- [["10%","More than 15 days"]]
  cancel_note     text default '',
  faqs            jsonb default '[]'::jsonb,        -- [{q,a}]
  addons          jsonb default '[]'::jsonb,        -- [{id,label,note,add}]
  scenes          jsonb default '[]'::jsonb,        -- [{anchor,frac,type,src,tint,rain}]

  seo_title       text default '',
  seo_description text default '',
  seo_keywords    text default '',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- itinerary ----------
create table if not exists itinerary_days (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references packages(id) on delete cascade,
  position    int not null default 0,
  tag         text default '',        -- "Day 2 · Shimla" — the track reads its number from here
  title       text default '',
  meals       text default '',
  acts        jsonb default '[]'::jsonb
);
create index if not exists itinerary_days_pkg on itinerary_days(package_id, position);

-- ---------- fares ----------
create table if not exists pricing_tiers (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references packages(id) on delete cascade,
  position    int not null default 0,
  label       text not null,          -- "4 Sharing", "Sleeper", "Ahmedabad"
  note        text default '',
  price       numeric not null default 0,
  child_price numeric                 -- null when a trip has no child rate
);
create index if not exists pricing_tiers_pkg on pricing_tiers(package_id, position);

-- ---------- departures ----------
create table if not exists departure_dates (
  id              uuid primary key default gen_random_uuid(),
  package_id      uuid not null references packages(id) on delete cascade,
  date            date not null,
  seasonal        boolean not null default false,   -- adds season_rate
  seats_available int,
  unique (package_id, date)
);
create index if not exists departure_dates_pkg on departure_dates(package_id, date);

-- ---------- site settings (single row) ----------
create table if not exists site_settings (
  id          int primary key default 1,
  name        text default 'Ghumakkaad',
  url         text default 'https://ghumakkaad.com',
  tagline     text default 'Every journey has a story',
  blurb       text default '',
  whatsapp    text default '',
  phone_display text default '',
  email       text default '',
  address     text default '',
  hero_kicker text default '',
  hero_title  text default '',
  hero_sub    text default '',
  hero_video  text default '',
  updated_at  timestamptz not null default now(),
  constraint one_row check (id = 1)
);

-- keep updated_at honest
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists packages_touch on packages;
create trigger packages_touch before update on packages
  for each row execute function touch_updated_at();

-- ============================================================
--  ROW LEVEL SECURITY
--  Public: read active packages and their children.
--  Signed in: full control, on a NEW project.
--
--  Run 002_restrict_admin_access.sql right after this file. "Signed
--  in: full control" here means any authenticated user, not just you
--  — fine for a brand-new project with one account, but it's the
--  first thing to tighten before you share access with anyone else
--  or leave sign-ups open. That migration narrows every write policy
--  below to an explicit admins table and explains how to add yourself
--  to it.
-- ============================================================
alter table packages         enable row level security;
alter table itinerary_days   enable row level security;
alter table pricing_tiers    enable row level security;
alter table departure_dates  enable row level security;
alter table site_settings    enable row level security;

drop policy if exists "read active packages" on packages;
create policy "read active packages" on packages
  for select using (active = true);

drop policy if exists "write packages when signed in" on packages;
create policy "write packages when signed in" on packages
  for all to authenticated using (true) with check (true);

-- children follow their parent
drop policy if exists "read days" on itinerary_days;
create policy "read days" on itinerary_days for select
  using (exists (select 1 from packages p where p.id = package_id and p.active));
drop policy if exists "write days" on itinerary_days;
create policy "write days" on itinerary_days for all to authenticated using (true) with check (true);

drop policy if exists "read tiers" on pricing_tiers;
create policy "read tiers" on pricing_tiers for select
  using (exists (select 1 from packages p where p.id = package_id and p.active));
drop policy if exists "write tiers" on pricing_tiers;
create policy "write tiers" on pricing_tiers for all to authenticated using (true) with check (true);

drop policy if exists "read dates" on departure_dates;
create policy "read dates" on departure_dates for select
  using (exists (select 1 from packages p where p.id = package_id and p.active));
drop policy if exists "write dates" on departure_dates;
create policy "write dates" on departure_dates for all to authenticated using (true) with check (true);

drop policy if exists "read settings" on site_settings;
create policy "read settings" on site_settings for select using (true);
drop policy if exists "write settings" on site_settings;
create policy "write settings" on site_settings for all to authenticated using (true) with check (true);
