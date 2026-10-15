alter table public.professional_profiles
  add column if not exists search_indexing boolean not null default false;


create table if not exists public.profile_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  snapshot jsonb not null,
  published_at timestamptz not null default now()
);

create index if not exists profile_snapshots_profile_published_idx
  on public.profile_snapshots(profile_id, published_at desc);
create index if not exists profile_snapshots_handle_idx
  on public.profile_snapshots(handle);

alter table public.profile_snapshots enable row level security;
create policy "Anyone can read published profile snapshots"
  on public.profile_snapshots for select using (true);
create policy "Owners can create profile snapshots"
  on public.profile_snapshots for insert with check (auth.uid() = owner_id);

create or replace function public.publish_profile_snapshot(target_profile_id uuid)
returns public.profile_snapshots
language plpgsql
security invoker
set search_path = public
as $$
declare
  profile_row public.professional_profiles;
  snapshot_row public.profile_snapshots;
begin
  select * into profile_row from public.professional_profiles
    where id = target_profile_id and owner_id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;

  if profile_row.handle is null or profile_row.full_name is null or
     profile_row.target_role is null or profile_row.headline is null then
    raise exception 'Publish checklist is incomplete';
  end if;
  insert into public.profile_snapshots (profile_id, owner_id, handle, snapshot)
  values (profile_row.id, profile_row.owner_id, profile_row.handle,
    jsonb_build_object('full_name', profile_row.full_name,
      'target_role', profile_row.target_role, 'headline', profile_row.headline,
      'public_professional_link', profile_row.public_professional_link,
      'search_indexing', profile_row.search_indexing,
      'profile_template', profile_row.profile_template,
      'bio', coalesce((select bio from profile_bios where profile_id = profile_row.id and show_on_profile_page), ''),
      'projects', coalesce((select jsonb_agg(to_jsonb(p) order by p.item_order) from profile_projects p where p.profile_id = profile_row.id and p.show_on_profile_page), '[]'::jsonb),
      'elements', jsonb_build_object(
        'education', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_education e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'experience', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_experience e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'skill', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_skill_tags e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'professional-link', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_public_professional_links e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'contact', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_contact_actions e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb)
      )))
  returning * into snapshot_row;
  return snapshot_row;
end;
$$;
