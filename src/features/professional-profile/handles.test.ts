import { describe, expect, it, vi } from "vitest";
import { claimHandle, validateHandle } from "./handles";

describe("Handle validation", () => {
  it.each(["maya", "maya-chen", "maya_2026", "mchen.dev"])("accepts URL-safe Handle %s", (handle) => {
    expect(validateHandle(handle)).toEqual({ ok: true, handle });
  });

  it.each(["ma", "Maya", "maya chen", "maya/chen", "-maya", "dashboard", "u", "auth"])("rejects invalid or Reserved Handle %s", (handle) => {
    const result = validateHandle(handle);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/handle/i);
  });
});

describe("Handle claim", () => {
  it("claims one globally unique Handle for a Professional Profile", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "profile-1", handle: "maya-chen" }, error: null });
    const select = vi.fn(() => ({ single }));
    const is = vi.fn(() => ({ select }));
    const eq = vi.fn(() => ({ is }));
    const update = vi.fn(() => ({ eq }));
    const supabase = { from: vi.fn(() => ({ update })) };

    const result = await claimHandle(supabase as never, "profile-1", null, "maya-chen");

    expect(result).toEqual({ ok: true, handle: "maya-chen" });
    expect(update).toHaveBeenCalledWith({ handle: "maya-chen" });
    expect(eq).toHaveBeenCalledWith("id", "profile-1");
  });

  it("does not expose Handle changes after one is claimed", async () => {
    const result = await claimHandle({} as never, "profile-1", "maya", "maya-chen");

    expect(result).toEqual({ ok: false, error: "Handle changes are not supported in the MVP." });
  });

  it("returns useful feedback when the Handle is already claimed", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate key" } });
    const supabase = { from: vi.fn(() => ({ update: () => ({ eq: () => ({ is: () => ({ select: () => ({ single }) }) }) }) })) };

    const result = await claimHandle(supabase as never, "profile-1", null, "maya");

    expect(result).toEqual({ ok: false, error: "That Handle is already claimed. Try another." });
  });
});
