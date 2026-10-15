alter table public.profile_bios
  add constraint profile_bios_profile_id_unique unique (profile_id);
