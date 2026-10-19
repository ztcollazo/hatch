-- Profile Images are the only Storage-backed asset in the MVP.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- Objects must live at profiles/<owned profile id>/...
create policy "owners can upload profile images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'images' and
    (storage.foldername(name))[1] = 'profiles' and
    exists (
      select 1 from public.professional_profiles p
      where p.id::text = (storage.foldername(name))[2]
        and p.owner_id = auth.uid()
    )
  );

create policy "owners can update profile images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'images' and
    exists (
      select 1 from public.professional_profiles p
      where p.id::text = (storage.foldername(name))[2]
        and p.owner_id = auth.uid()
    )
  )
  with check (bucket_id = 'images');

create policy "owners can delete profile images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'images' and
    exists (
      select 1 from public.professional_profiles p
      where p.id::text = (storage.foldername(name))[2]
        and p.owner_id = auth.uid()
    )
  );

-- Public reads are needed to render an image referenced by a published snapshot.
create policy "anyone can read profile images"
  on storage.objects for select
  using (bucket_id = 'images');

-- Keep the public representation immutable: it gets the image path only when
-- publish_profile_snapshot creates a snapshot.
create or replace function public.publish_profile_snapshot(
  target_profile_id uuid,
  selected_template text default null
)
returns public.profile_snapshots
language plpgsql
security invoker
set search_path = public
as $$
declare
  profile_row public.professional_profiles;
  snapshot_row public.profile_snapshots;
  template_value text;
  image_value jsonb;
begin
  select * into profile_row from public.professional_profiles
    where id = target_profile_id and owner_id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  template_value := coalesce(selected_template, profile_row.profile_template, 'recruiter-brief');
  if template_value not in ('recruiter-brief', 'project-showcase') then raise exception 'Invalid profile template'; end if;
  if profile_row.handle is null or profile_row.full_name is null or profile_row.target_role is null or profile_row.headline is null then
    raise exception 'Publish checklist is incomplete';
  end if;
  select case when storage_path is null then null else jsonb_build_object('path', storage_path, 'alt_text', coalesce(alt_text, 'Profile image')) end
    into image_value from public.profile_image_metadata
    where profile_id = profile_row.id and show_on_profile_page
    limit 1;
  insert into public.profile_snapshots (profile_id, owner_id, handle, snapshot)
  values (profile_row.id, profile_row.owner_id, profile_row.handle,
    jsonb_build_object('full_name', profile_row.full_name, 'target_role', profile_row.target_role,
      'headline', profile_row.headline, 'public_professional_link', profile_row.public_professional_link,
      'search_indexing', profile_row.search_indexing, 'profile_template', template_value, 'profile_image', image_value,
      'bio', coalesce((select bio from profile_bios where profile_id = profile_row.id and show_on_profile_page), ''),
      'projects', coalesce((select jsonb_agg(to_jsonb(p) order by p.item_order) from profile_projects p where p.profile_id = profile_row.id and p.show_on_profile_page), '[]'::jsonb),
      'elements', jsonb_build_object(
        'education', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_education e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'experience', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_experience e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'skill', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_skill_tags e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'professional-link', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_public_professional_links e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb),
        'contact', coalesce((select jsonb_agg(to_jsonb(e) order by e.item_order) from profile_contact_actions e where e.profile_id = profile_row.id and e.show_on_profile_page), '[]'::jsonb)
      ))) returning * into snapshot_row;
  return snapshot_row;
end;
$$;
