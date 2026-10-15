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
  projects: DraftProject[];
};

type QueryResult = { data: unknown; error: { message: string } | null };
type ProfileQuery = {
  select: (columns: string) => ProfileQuery;
  eq: (column: string, value: string) => ProfileQuery;
  order: (column: string, options: { ascending: boolean }) => Promise<QueryResult>;
  single: () => Promise<QueryResult>;
};

export type ProfileDataClient = { from: (table: string) => ProfileQuery };

export async function loadDraftProfile(supabase: ProfileDataClient, profileId: string): Promise<DraftProfile> {
  const profileResult = await supabase.from("professional_profiles").select("full_name,target_role,headline").eq("id", profileId).single();
  const projectsResult = await supabase.from("profile_projects").select("id,title,summary,item_order,show_on_profile_page,show_on_resume").eq("profile_id", profileId).order("item_order", { ascending: true });
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (projectsResult.error) throw new Error(projectsResult.error.message);
  return { ...(profileResult.data as Omit<DraftProfile, "projects">), projects: (projectsResult.data as DraftProject[] | null) ?? [] };
}
