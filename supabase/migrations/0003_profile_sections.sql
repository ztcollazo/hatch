create table if not exists public.profile_section_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  section_key text not null,
  section_order integer not null default 0,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default true,
  unique (profile_id, section_key)
);

create table if not exists public.profile_education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  school_name text not null,
  degree text,
  field_of_study text,
  start_date text,
  end_date text,
  item_order integer not null default 0,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default true
);

create table if not exists public.profile_experience (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  role_title text not null,
  organization text,
  summary text,
  start_date text,
  end_date text,
  item_order integer not null default 0,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default true
);

create table if not exists public.profile_projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  url text,
  item_order integer not null default 0,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default true
);

create table if not exists public.profile_skill_tags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  item_order integer not null default 0,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default true
);

create table if not exists public.profile_public_professional_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  url text not null,
  link_type text,
  item_order integer not null default 0,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default false
);

create table if not exists public.profile_contact_actions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  url text not null,
  action_type text,
  item_order integer not null default 0,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default false
);

create table if not exists public.profile_bios (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  bio text not null,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default false
);

create table if not exists public.profile_image_metadata (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text,
  alt_text text,
  width integer,
  height integer,
  show_on_profile_page boolean not null default true,
  show_on_resume boolean not null default false
);

alter table public.profile_section_settings enable row level security;
alter table public.profile_education enable row level security;
alter table public.profile_experience enable row level security;
alter table public.profile_projects enable row level security;
alter table public.profile_skill_tags enable row level security;
alter table public.profile_public_professional_links enable row level security;
alter table public.profile_contact_actions enable row level security;
alter table public.profile_bios enable row level security;
alter table public.profile_image_metadata enable row level security;

create policy "owners manage profile section settings" on public.profile_section_settings for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage education" on public.profile_education for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage experience" on public.profile_experience for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage projects" on public.profile_projects for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage skill tags" on public.profile_skill_tags for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage public professional links" on public.profile_public_professional_links for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage contact actions" on public.profile_contact_actions for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage bios" on public.profile_bios for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage profile image metadata" on public.profile_image_metadata for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
