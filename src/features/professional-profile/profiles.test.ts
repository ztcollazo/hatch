import { describe, expect, it, vi } from "vitest";
import { ensureOneProfessionalProfile } from "./profiles";

describe("Professional Profile creation", () => {
  it("returns an existing Professional Profile instead of creating a second one", async () => {
    const existingProfile = { id: "profile-1", owner_id: "user-1", full_name: "Maya Chen" };
    const maybeSingle = vi.fn().mockResolvedValue({ data: existingProfile, error: null });
    const insert = vi.fn();
    const supabase = {
      from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }), insert })),
    };

    const profile = await ensureOneProfessionalProfile(supabase as never, "user-1", "maya@example.edu");

    expect(profile).toEqual(existingProfile);
    expect(insert).not.toHaveBeenCalled();
  });

  it("creates one Professional Profile when the signed-in user does not have one", async () => {
    const createdProfile = { id: "profile-2", owner_id: "user-1", full_name: "maya" };
    const existingMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const createdSingle = vi.fn().mockResolvedValue({ data: createdProfile, error: null });
    const insert = vi.fn(() => ({ select: () => ({ single: createdSingle }) }));
    const supabase = {
      from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle: existingMaybeSingle }) }), insert })),
    };

    const profile = await ensureOneProfessionalProfile(supabase as never, "user-1", "maya@example.edu");

    expect(insert).toHaveBeenCalledWith({ owner_id: "user-1", full_name: "maya" });
    expect(profile).toEqual(createdProfile);
  });
});
