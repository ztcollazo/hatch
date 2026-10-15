delete from public.profile_bios older
using public.profile_bios newer
where older.profile_id = newer.profile_id
  and older.id < newer.id;

alter table public.profile_bios
  add constraint profile_bios_profile_id_unique unique (profile_id);
