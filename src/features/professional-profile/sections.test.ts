import { describe, expect, it, vi } from "vitest";
import { createProfileSectionItem, removeProfileSectionItem, reorderProfileSectionItems, updateOutputVisibility } from "./sections";

describe("Profile Section storage", () => {
  it("creates typed Project section items with Item Order and Output Visibility", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "project-1" }, error: null });
    const insert = vi.fn(() => ({ select: () => ({ single }) }));
    const supabase = { from: vi.fn(() => ({ insert })) };

    const result = await createProfileSectionItem(supabase as never, "profile-1", "projects", {
      title: "Campus Events Finder",
      summary: "Helps students find events.",
      itemOrder: 2,
      showOnProfilePage: true,
      showOnResume: false,
    });

    expect(result).toEqual({ id: "project-1" });
    expect(supabase.from).toHaveBeenCalledWith("profile_projects");
    expect(insert).toHaveBeenCalledWith({
      profile_id: "profile-1",
      title: "Campus Events Finder",
      summary: "Helps students find events.",
      item_order: 2,
      show_on_profile_page: true,
      show_on_resume: false,
    });
  });

  it("updates Output Visibility without changing Profile Section content", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const supabase = { from: vi.fn(() => ({ update })) };

    await updateOutputVisibility(supabase as never, "profile_projects", "project-1", { showOnProfilePage: false, showOnResume: true });

    expect(update).toHaveBeenCalledWith({ show_on_profile_page: false, show_on_resume: true });
    expect(eq).toHaveBeenCalledWith("id", "project-1");
  });

  it("reorders section items using explicit Item Order values", async () => {
    const update = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
    const supabase = { from: vi.fn(() => ({ update })) };

    await reorderProfileSectionItems(supabase as never, "profile_projects", ["project-2", "project-1"]);

    expect(update).toHaveBeenNthCalledWith(1, { item_order: 0 });
    expect(update).toHaveBeenNthCalledWith(2, { item_order: 1 });
  });

  it("removes a section item", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const remove = vi.fn(() => ({ eq }));
    const supabase = { from: vi.fn(() => ({ delete: remove })) };

    await removeProfileSectionItem(supabase as never, "profile_projects", "project-1");

    expect(remove).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith("id", "project-1");
  });
});
