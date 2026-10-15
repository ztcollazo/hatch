export type DraftElement = { id: string; label: string; values: Record<string, string> };

export type DraftProject = {
  id: string;
  title: string;
  summary: string | null;
  item_order: number;
  show_on_profile_page: boolean;
  show_on_resume: boolean;
};

export type DraftProfile = {
  full_name: string | null;
  target_role: string | null;
  headline: string | null;
  bio: string;
  projects: DraftProject[];
  elements: Record<string, DraftElement[]>;
};

type QueryResult = { data: unknown; error: { message: string } | null };
type ProfileQuery = {
  select: (columns: string) => ProfileQuery;
  eq: (column: string, value: string) => ProfileQuery;
  order: (column: string, options: { ascending: boolean }) => Promise<QueryResult>;
  single: () => Promise<QueryResult>;
  maybeSingle: () => Promise<QueryResult>;
};

export type ProfileDataClient = { from: (table: string) => ProfileQuery };

export async function loadDraftProfile(supabase: ProfileDataClient, profileId: string): Promise<DraftProfile> {
  const profileResult = await supabase.from("professional_profiles").select("full_name,target_role,headline").eq("id", profileId).single();
  const projectsResult = await supabase.from("profile_projects").select("id,title,summary,item_order,show_on_profile_page,show_on_resume").eq("profile_id", profileId).order("item_order", { ascending: true });
  const bioResult = await supabase.from("profile_bios").select("bio").eq("profile_id", profileId).maybeSingle();
  if (bioResult.error) throw new Error(bioResult.error.message);
  const elements: Record<string, DraftElement[]> = {};
  for (const [kind, table, label] of [["education", "profile_education", "school_name"], ["experience", "profile_experience", "role_title"], ["skill", "profile_skill_tags", "label"], ["professional-link", "profile_public_professional_links", "label"], ["contact", "profile_contact_actions", "label"]] as const) {
    const result = await supabase.from(table).select(`id,${label}`).eq("profile_id", profileId).order("item_order", { ascending: true });
    if (result.error) throw new Error(result.error.message);
    elements[kind] = ((result.data ?? []) as Array<Record<string, string>>).map((item) => ({ id: item.id, label: item[label], values: Object.fromEntries(Object.entries(item).filter(([key, value]) => key !== "id" && value !== null).map(([key, value]) => [key, String(value)])) }));
  }
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (projectsResult.error) throw new Error(projectsResult.error.message);
  return { ...(profileResult.data as Omit<DraftProfile, "projects" | "elements" | "bio">), bio: (bioResult.data as { bio?: string } | null)?.bio ?? "", projects: (projectsResult.data as DraftProject[] | null) ?? [], elements };
}
