export type DraftElement = {
  id: string;
  label: string;
  item_order: number;
  show_on_profile_page: boolean;
  show_on_resume: boolean;
  values: Record<string, string>;
};

export type DraftProject = {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  item_order: number;
  show_on_profile_page: boolean;
  show_on_resume: boolean;
};

export type DraftProfile = {
  full_name: string | null;
  profile_image?: { path: string; alt_text: string; show_on_profile_page?: boolean; show_on_resume?: boolean } | null;
  target_role: string | null;
  headline: string | null;
  bio: string;
  projects: DraftProject[];
  elements: Record<string, DraftElement[]>;
  sectionOrder: string[];
};

type QueryResult = { data: unknown; error: { message: string } | null };
type ProfileQuery = {
  select: (columns: string) => ProfileQuery;
  eq: (column: string, value: string) => ProfileQuery;
  order: (
    column: string,
    options: { ascending: boolean },
  ) => Promise<QueryResult>;
  single: () => Promise<QueryResult>;
  maybeSingle: () => Promise<QueryResult>;
};
export type ProfileDataClient = { from: (table: string) => ProfileQuery };

const fieldNames: Record<string, string> = {
  school_name: "schoolName",
  field_of_study: "fieldOfStudy",
  start_date: "startDate",
  end_date: "endDate",
  role_title: "roleTitle",
  link_type: "linkType",
  action_type: "actionType",
};

export async function loadDraftProfile(
  supabase: ProfileDataClient,
  profileId: string,
): Promise<DraftProfile> {
  const profileResult = await supabase
    .from("professional_profiles")
    .select("full_name,target_role,headline")
    .eq("id", profileId)
    .single();
  const projectsResult = await supabase
    .from("profile_projects")
    .select(
      "id,title,summary,url,item_order,show_on_profile_page,show_on_resume",
    )
    .eq("profile_id", profileId)
    .order("item_order", { ascending: true });
  const bioResult = await supabase
    .from("profile_bios")
    .select("bio")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (bioResult.error) throw new Error(bioResult.error.message);
  const sectionSettingsResult = await supabase
    .from("profile_section_settings")
    .select("section_key,section_order")
    .eq("profile_id", profileId)
    .order("section_order", { ascending: true });
  if (sectionSettingsResult.error)
    throw new Error(sectionSettingsResult.error.message);
  const defaultSectionOrder = [
    "education",
    "experience",
    "skill",
    "project",
    "professional-link",
    "contact",
  ];
  const savedSectionOrder = (
    (sectionSettingsResult.data ?? []) as Array<{
      section_key: string;
      section_order: number;
    }>
  ).map(({ section_key }) => section_key);
  const sectionOrder = [
    ...savedSectionOrder,
    ...defaultSectionOrder.filter((kind) => !savedSectionOrder.includes(kind)),
  ];

  const elements: Record<string, DraftElement[]> = {};
  for (const [kind, table, label, columns] of [
    [
      "education",
      "profile_education",
      "school_name",
      "id,school_name,degree,field_of_study,start_date,end_date",
    ],
    [
      "experience",
      "profile_experience",
      "role_title",
      "id,role_title,organization,summary,start_date,end_date",
    ],
    ["skill", "profile_skill_tags", "label", "id,label"],
    [
      "professional-link",
      "profile_public_professional_links",
      "label",
      "id,label,url,link_type",
    ],
    ["contact", "profile_contact_actions", "label", "id,label,url,action_type"],
  ] as const) {
    const result = await supabase
      .from(table)
      .select(`${columns},show_on_profile_page,show_on_resume`)
      .eq("profile_id", profileId)
      .order("item_order", { ascending: true });
    if (result.error) throw new Error(result.error.message);
    elements[kind] = (
      (result.data ?? []) as Array<Record<string, unknown>>
    ).map((item) => {
      const values = Object.fromEntries(
        Object.entries(item)
          .filter(
            ([key, value]) => key !== "id" && value !== null && value !== "",
          )
          .map(([key, value]) => [fieldNames[key] ?? key, String(value)]),
      );
      return {
        id: String(item.id),
        label: String(item[label] ?? "Saved item"),
        item_order: Number(item.item_order ?? 0),
        show_on_profile_page: item.show_on_profile_page !== false,
        show_on_resume: item.show_on_resume === true,
        values,
      };
    });
  }
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (projectsResult.error) throw new Error(projectsResult.error.message);
  return {
    ...(profileResult.data as Omit<
      DraftProfile,
      "projects" | "elements" | "bio"
    >),
    bio: (bioResult.data as { bio?: string } | null)?.bio ?? "",
    projects: (projectsResult.data as DraftProject[] | null) ?? [],
    elements,
    sectionOrder,
  };
}
