-- Keep every private Draft Profile relation owner-scoped. This migration is
-- intentionally explicit so the Free Pilot RLS contract is easy to audit.
alter table public.profile_section_settings enable row level security;
alter table public.profile_education enable row level security;
alter table public.profile_experience enable row level security;
alter table public.profile_projects enable row level security;
alter table public.profile_skill_tags enable row level security;
alter table public.profile_public_professional_links enable row level security;
alter table public.profile_contact_actions enable row level security;
alter table public.profile_bios enable row level security;
alter table public.profile_image_metadata enable row level security;

comment on table public.professional_profiles is 'Private Draft Profile; all access is owner-scoped by RLS.';
comment on table public.profile_section_settings is 'Private Draft Profile section ordering; owner-scoped by RLS.';
comment on table public.profile_image_metadata is 'Private Profile Image metadata; owner-scoped by RLS.';
