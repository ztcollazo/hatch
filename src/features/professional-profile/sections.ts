export type ProfileSectionTable =
  | "profile_education"
  | "profile_experience"
  | "profile_projects"
  | "profile_skill_tags"
  | "profile_public_professional_links"
  | "profile_contact_actions"
  | "profile_bios"
  | "profile_image_metadata";

export type ProjectSectionInput = {
  title: string;
  summary: string;
  itemOrder: number;
  showOnProfilePage: boolean;
  showOnResume: boolean;
};

export type OutputVisibility = {
  showOnProfilePage: boolean;
  showOnResume: boolean;
};

type SupabaseSectionClient = {
  from: (table: ProfileSectionTable) => {
    insert: (values: Record<string, unknown>) => { select: (columns: string) => { single: () => Promise<{ data: unknown; error: { message: string } | null }> } };
    update: (values: Record<string, unknown>) => { eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }> };
    delete: () => { eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }> };
  };
};

export async function createProfileSectionItem(
  supabase: SupabaseSectionClient,
  profileId: string,
  section: "projects",
  input: ProjectSectionInput,
) {
  const table = section === "projects" ? "profile_projects" : sectionToTable();
  const { data, error } = await supabase
    .from(table)
    .insert({
      profile_id: profileId,
      title: input.title,
      summary: input.summary,
      item_order: input.itemOrder,
      show_on_profile_page: input.showOnProfilePage,
      show_on_resume: input.showOnResume,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOutputVisibility(supabase: SupabaseSectionClient, table: ProfileSectionTable, itemId: string, visibility: OutputVisibility) {
  const { error } = await supabase.from(table).update({
    show_on_profile_page: visibility.showOnProfilePage,
    show_on_resume: visibility.showOnResume,
  }).eq("id", itemId);
  if (error) throw new Error(error.message);
}

export async function reorderProfileSectionItems(supabase: SupabaseSectionClient, table: ProfileSectionTable, orderedIds: string[]) {
  for (const [itemOrder, id] of orderedIds.entries()) {
    const { error } = await supabase.from(table).update({ item_order: itemOrder }).eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export async function removeProfileSectionItem(supabase: SupabaseSectionClient, table: ProfileSectionTable, itemId: string) {
  const { error } = await supabase.from(table).delete().eq("id", itemId);
  if (error) throw new Error(error.message);
}

function sectionToTable(): ProfileSectionTable {
  return "profile_projects";
}
