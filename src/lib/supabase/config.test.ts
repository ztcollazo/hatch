import { describe, expect, it, vi } from "vitest";

describe("Supabase configuration", () => {
  it("reports the missing environment variables needed by Supabase helpers", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.resetModules();

    const { getSupabaseConfig } = await import("./config");

    expect(() => getSupabaseConfig()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });
});
