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
  limit: (count: number) => {
    maybeSingle: () => Promise<{
      data: { snapshot: ProfileSnapshot } | null;
      error: { message: string } | null;
    }>;
  };
};

const elementLabels: Record<string, string> = {
  education: "school_name",
  experience: "role_title",
  skill: "label",
  "professional-link": "label",
  contact: "label",
};
const elementFields: Record<string, string> = {
  school_name: "schoolName",
  field_of_study: "fieldOfStudy",
  start_date: "startDate",
  end_date: "endDate",
  role_title: "roleTitle",
  link_type: "linkType",
  action_type: "actionType",
};

function normalizeSnapshot(snapshot: ProfileSnapshot): ProfileSnapshot {
  const rawElements = snapshot.elements ?? {};
  const elements = Object.fromEntries(
    Object.entries(rawElements).map(([kind, items]) => [
      kind,
      (Array.isArray(items) ? items : []).map(
        (raw: Record<string, unknown>) => ({
          id: String(raw.id),
          label: String(raw[elementLabels[kind] ?? "label"] ?? "Saved item"),
          item_order: Number(raw.item_order ?? 0),
          show_on_profile_page: raw.show_on_profile_page !== false,
          show_on_resume: raw.show_on_resume === true,
          values: Object.fromEntries(
            Object.entries(raw)
              .filter(
                ([key, value]) =>
                  key !== "id" &&
                  key !== "profile_id" &&
                  key !== "owner_id" &&
                  value !== null &&
                  value !== "",
              )
              .map(([key, value]) => [
                elementFields[key] ?? key,
                String(value),
              ]),
          ),
        }),
      ),
    ]),
  );
  return { ...snapshot, elements };
}

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
  return result.data?.snapshot ? normalizeSnapshot(result.data.snapshot) : null;
}
