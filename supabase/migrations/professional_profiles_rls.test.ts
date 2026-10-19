import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Professional Profile RLS migration", () => {
  it("enforces one owner-scoped Professional Profile per signed-in user", () => {
    const migration = readFileSync("supabase/migrations/0001_professional_profiles.sql", "utf8");

    expect(migration).toContain("enable row level security");
    expect(migration).toContain("unique (owner_id)");
    expect(migration).toContain("auth.uid() = owner_id");
    expect(migration).toContain("with check (auth.uid() = owner_id)");
  });

  it("documents owner-scoped RLS for every private draft relation", () => {
    const hardening = readFileSync("supabase/migrations/0013_profile_rls_hardening.sql", "utf8");
    for (const table of ["profile_section_settings", "profile_education", "profile_experience", "profile_projects", "profile_skill_tags", "profile_public_professional_links", "profile_contact_actions", "profile_bios", "profile_image_metadata"]) {
      expect(hardening).toContain(`alter table public.${table} enable row level security`);
    }
    expect(hardening).toContain("owner-scoped by RLS");
  });
});
