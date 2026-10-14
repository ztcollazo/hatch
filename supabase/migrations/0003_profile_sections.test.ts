import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Profile Section migration", () => {
  it("stores core Profile Sections as typed relational structures with ordering, visibility, and RLS", () => {
    const migration = readFileSync("supabase/migrations/0003_profile_sections.sql", "utf8");

    for (const table of ["profile_education", "profile_experience", "profile_projects", "profile_skill_tags", "profile_public_professional_links", "profile_contact_actions", "profile_bios", "profile_image_metadata"]) {
      expect(migration).toContain("create table if not exists public." + table);
    }
    expect(migration).toContain("item_order integer not null default 0");
    expect(migration).toContain("show_on_profile_page boolean not null default true");
    expect(migration).toContain("show_on_resume boolean not null default true");
    expect(migration).toContain("section_order integer not null default 0");
    expect(migration).toContain("storage_path text");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("auth.uid() = owner_id");
  });
});
