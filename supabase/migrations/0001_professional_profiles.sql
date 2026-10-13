create extension if not exists "pgcrypto";

create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  target_role text,
  headline text,
  education text,
  project text,
  skill_tags text[] not null default '{}',
  public_professional_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

alter table public.professional_profiles enable row level security;

create policy "Users can read their own Professional Profile"
  on public.professional_profiles
  for select
  using (auth.uid() = owner_id);

create policy "Users can create their own Professional Profile"
  on public.professional_profiles
  for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own Professional Profile"
  on public.professional_profiles
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own Professional Profile"
  on public.professional_profiles
  for delete
  using (auth.uid() = owner_id);
