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
});
