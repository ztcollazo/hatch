import type { DraftProfile } from "./profile-view";

export type ProfileSnapshot = DraftProfile & {
  public_professional_link: string | null;
  search_indexing: boolean;
  profile_template: "recruiter-brief" | "project-showcase";
};

export type SnapshotClient = {
  from: (table: "profile_snapshots") => {
    select: (columns: string) => SnapshotQuery;
  };
};
type SnapshotQuery = {
  eq: (column: string, value: string) => SnapshotQuery;
  order: (column: string, options: { ascending: boolean }) => SnapshotQuery;
  limit: (count: number) => { maybeSingle: () => Promise<{ data: { snapshot: ProfileSnapshot } | null; error: { message: string } | null }> };
};

export async function loadPublishedProfile(
  supabase: SnapshotClient,
  handle: string,
) {
  const result = await supabase
    .from("profile_snapshots")
    .select("snapshot")
    .eq("handle", handle)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data?.snapshot ?? null;
}
