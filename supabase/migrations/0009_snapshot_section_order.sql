-- Preserve the user's section order in published snapshots so public templates
-- render sections in the same order as the editor.
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
begin
  select * into profile_row from public.professional_profiles
    where id = target_profile_id and owner_id = auth.uid() for update;
  if not found then raise exception 'Profile not found'; end if;
  template_value := coalesce(selected_template, profile_row.profile_template, 'recruiter-brief');
  if template_value not in ('recruiter-brief', 'project-showcase') then raise exception 'Invalid profile template'; end if;
  if profile_row.handle is null or profile_row.full_name is null or profile_row.target_role is null or profile_row.headline is null then
    raise exception 'Publish checklist is incomplete';
  end if;
  insert into public.profile_snapshots (profile_id, owner_id, handle, snapshot)
  values (profile_row.id, profile_row.owner_id, profile_row.handle,
    jsonb_build_object(
      'full_name', profile_row.full_name, 'target_role', profile_row.target_role,
      'headline', profile_row.headline, 'public_professional_link', profile_row.public_professional_link,
      'search_indexing', profile_row.search_indexing, 'profile_template', template_value,
      'bio', coalesce((select bio from profile_bios where profile_id = profile_row.id and show_on_profile_page), ''),
      'sectionOrder', coalesce((select jsonb_agg(section_key order by section_order)
        from profile_section_settings where profile_id = profile_row.id),
        '["education","experience","skill","project","professional-link","contact"]'::jsonb),
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
