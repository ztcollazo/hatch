alter table public.professional_profiles
  add column if not exists profile_template text not null default 'recruiter-brief';

alter table public.professional_profiles
  drop constraint if exists professional_profiles_profile_template_check;

alter table public.professional_profiles
  add constraint professional_profiles_profile_template_check
  check (profile_template in ('recruiter-brief', 'project-showcase'));
