export type ProfessionalProfileRecord = {
  id: string;
  owner_id: string;
  full_name: string | null;
  target_role?: string | null;
  headline?: string | null;
  handle?: string | null;
};

export type SupabaseProfileClient = {
  from: (table: "professional_profiles") => {
    update: (values: { handle: string }) => {
      eq: (column: "id", value: string) => {
        is: (column: "handle", value: null) => {
          select: (columns: string) => {
            single: () => Promise<{ data: { handle: string } | null; error: { code?: string; message: string } | null }>;
          };
        };
      };
    };
    select: (columns: string) => {
      eq: (column: "owner_id", value: string) => {
        maybeSingle: () => Promise<{ data: ProfessionalProfileRecord | null; error: { message: string; code?: string } | null }>;
      };
    };
    insert: (values: { owner_id: string; full_name: string }) => {
      select: (columns: string) => {
        single: () => Promise<{ data: ProfessionalProfileRecord | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function ensureOneProfessionalProfile(supabase: SupabaseProfileClient, userId: string, email: string) {
  const existing = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();

  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;

  const fallbackName = email.split("@")[0] || "student";
  const created = await supabase
    .from("professional_profiles")
    .insert({ owner_id: userId, full_name: fallbackName })
    .select("*")
    .single();

  if (created.error || !created.data) throw new Error(created.error?.message ?? "Could not create Professional Profile.");
  return created.data;
}
