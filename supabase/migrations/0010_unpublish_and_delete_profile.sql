-- Published pages are immutable snapshots. Unpublishing removes every snapshot so
-- the public snapshot query cannot expose an older version of the profile.
create or replace function public.unpublish_profile(target_profile_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.profile_snapshots
    where profile_id = target_profile_id and owner_id = auth.uid();
  if not found then
    -- Treat an already unpublished profile as a successful, idempotent operation.
    if not exists (select 1 from public.professional_profiles
                   where id = target_profile_id and owner_id = auth.uid()) then
      raise exception 'Profile not found';
    end if;
  end if;
end;
$$;

-- Deleting the profile cascades to all draft sections, image metadata, and
-- published snapshots. Profile image files should use the profile-owned path
-- convention `profiles/<profile id>/...`; the application removes those objects
-- from Storage before invoking this function (SQL cannot call the Storage API).
create or replace function public.delete_profile_data(target_profile_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (select 1 from public.professional_profiles
                 where id = target_profile_id and owner_id = auth.uid()) then
    raise exception 'Profile not found';
  end if;
  delete from public.professional_profiles
    where id = target_profile_id and owner_id = auth.uid();
end;
$$;

revoke all on function public.unpublish_profile(uuid) from public;
grant execute on function public.unpublish_profile(uuid) to authenticated;
revoke all on function public.delete_profile_data(uuid) from public;
grant execute on function public.delete_profile_data(uuid) to authenticated;
