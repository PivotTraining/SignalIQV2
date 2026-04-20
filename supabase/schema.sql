-- ─────────────────────────────────────────────────────────────────────────────
-- Signal IQ v2 — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Owners (Chris + Jazmine) ────────────────────────────────────────────────
create table if not exists owners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text check (role in ('Founder','CoFounder','VA','Contractor')),
  email       text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ─── Organizations ───────────────────────────────────────────────────────────
create table if not exists organizations (
  id           uuid primary key default gen_random_uuid(),
  org_name     text not null,
  type         text check (type in ('School/EDU','Non-profit','Corporate','Government','Other')),
  size         integer,
  revenue_band text,
  notes        text,
  created_at   timestamptz default now()
);

-- ─── Tags / Segments ─────────────────────────────────────────────────────────
create table if not exists tags (
  id         uuid primary key default gen_random_uuid(),
  tag_name   text not null,
  category   text check (category in ('ICP','Lifecycle','Temp','Custom')),
  color      text,
  created_at timestamptz default now()
);

-- ─── Contacts ────────────────────────────────────────────────────────────────
create table if not exists contacts (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  title             text,
  company           text,
  email             text,
  phone             text,
  headcount         integer default 0,
  industry          text,
  intent            integer default 50  check (intent            between 0 and 100),
  signal_stack      integer default 50  check (signal_stack      between 0 and 100),
  intent_velocity   integer default 50  check (intent_velocity   between 0 and 100),
  budget_indicator  integer default 50  check (budget_indicator  between 0 and 100),
  authority_match   integer default 50  check (authority_match   between 0 and 100),
  timing_window     integer default 50  check (timing_window     between 0 and 100),
  social_proof      integer default 50  check (social_proof      between 0 and 100),
  last_touch        date,
  next_move         text,
  notes             text,
  owner_id          uuid references owners(id),
  org_id            uuid references organizations(id),
  created_at        timestamptz default now()
);

-- ─── Interactions ────────────────────────────────────────────────────────────
create table if not exists interactions (
  id             uuid primary key default gen_random_uuid(),
  contact_id     uuid not null references contacts(id) on delete cascade,
  date           date not null default current_date,
  channel        text check (channel in ('email','call','linkedin')),
  direction      text check (direction in ('in','out')),
  depth          integer default 3 check (depth between 1 and 5),
  intent         integer default 50 check (intent between 0 and 100),
  notes          text,
  latency_hours  integer,
  created_at     timestamptz default now()
);

-- ─── Signal Logs (audit trail) ───────────────────────────────────────────────
create table if not exists signal_logs (
  id            uuid primary key default gen_random_uuid(),
  contact_id    uuid references contacts(id),
  owner_id      uuid references owners(id),
  field_changed text,
  before_val    text,
  after_val     text,
  created_at    timestamptz default now()
);

-- ─── Contact ↔ Tag join table ────────────────────────────────────────────────
create table if not exists contact_tags (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id     uuid references tags(id)     on delete cascade,
  primary key (contact_id, tag_id)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists interactions_contact_idx on interactions(contact_id);
create index if not exists interactions_date_idx    on interactions(date);
create index if not exists contacts_last_touch_idx  on contacts(last_touch);
create index if not exists signal_logs_contact_idx  on signal_logs(contact_id);

-- ─── Row Level Security (enable but allow anon reads for dashboard) ───────────
alter table contacts      enable row level security;
alter table interactions  enable row level security;
alter table organizations enable row level security;
alter table owners        enable row level security;
alter table tags          enable row level security;
alter table signal_logs   enable row level security;
alter table contact_tags  enable row level security;

-- Allow anon key to read everything (dashboard polling)
create policy "anon read contacts"      on contacts      for select using (true);
create policy "anon read interactions"  on interactions  for select using (true);
create policy "anon read organizations" on organizations for select using (true);
create policy "anon read owners"        on owners        for select using (true);
create policy "anon read tags"          on tags          for select using (true);
create policy "anon read contact_tags"  on contact_tags  for select using (true);

-- Allow anon key to insert interactions and update contacts
create policy "anon insert interactions" on interactions for insert with check (true);
create policy "anon update contacts"     on contacts     for update using (true);
create policy "anon insert signal_logs"  on signal_logs  for insert with check (true);
