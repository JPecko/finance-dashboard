-- app_config: global key/value store for app-wide settings
-- Run this once in the Supabase SQL Editor

create table if not exists app_config (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- Anyone (including unauthenticated) can read — needed for pre-auth version check
alter table app_config enable row level security;

create policy "public read app_config"
  on app_config for select
  using (true);

-- No insert/update policy for regular users — only service role (scripts) can write

-- Seed current version
insert into app_config (key, value)
  values ('app_version', '1.1.4')
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();
