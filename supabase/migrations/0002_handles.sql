alter table public.professional_profiles
  add column if not exists handle text;

alter table public.professional_profiles
  add constraint professional_profiles_handle_unique unique (handle),
  add constraint professional_profiles_handle_lowercase check (handle is null or handle = lower(handle)),
  add constraint professional_profiles_handle_url_safe check (handle is null or handle ~ '^[a-z0-9]([a-z0-9._-]{1,28}[a-z0-9])$');

create or replace function public.prevent_handle_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as 42226
begin
  if old.handle is not null and new.handle is distinct from old.handle then
    raise exception 'Handle changes are not supported';
  end if;
  return new;
end;
42226;

drop trigger if exists prevent_handle_changes on public.professional_profiles;
create trigger prevent_handle_changes
  before update of handle on public.professional_profiles
  for each row
  execute function public.prevent_handle_changes();
