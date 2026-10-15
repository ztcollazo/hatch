delete from public.profile_bios older
using public.profile_bios newer
where older.profile_id = newer.profile_id
  and older.id < newer.id;

create unique index if not exists profile_bios_profile_id_unique_idx
  on public.profile_bios (profile_id);
