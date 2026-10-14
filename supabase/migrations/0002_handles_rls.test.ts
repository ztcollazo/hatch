import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Handle migration", () => {
  it("enforces globally unique, lowercase, one-time Handles", () => {
    const migration = readFileSync("supabase/migrations/0002_handles.sql", "utf8");

    expect(migration).toContain("handle text");
    expect(migration).toContain("unique (handle)");
    expect(migration).toContain("handle = lower(handle)");
    expect(migration).toContain("prevent_handle_changes");
    expect(migration).toContain("Handle changes are not supported");
  });
});
