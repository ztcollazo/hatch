"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { claimHandle } from "./handles";
import type { SupabaseProfileClient } from "./profiles";
import type { ProfileDetails } from "./ProfileDetailsForm";
import type {
  ProfileElementInput,
  ProfileElementKind,
} from "./ProfileElementsForm";

export type ProfileProjectInput = {
  id?: string;
  title: string;
  summary: string;
  url: string;
};

export async function saveProfileFullName(profileId: string, fullName: string) {
  const trimmedName = fullName.trim();
  if (!trimmedName)
    return { ok: false as const, error: "Full name is required." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("professional_profiles")
    .update({ full_name: trimmedName })
    .eq("id", profileId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function saveProfileDetails(
  profileId: string,
  details: ProfileDetails,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { error: profileError } = await supabase
    .from("professional_profiles")
    .update({
      target_role: details.targetRole.trim(),
      headline: details.headline.trim(),
      public_professional_link: details.publicProfessionalLink.trim() || null,
    })
    .eq("id", profileId);
  if (profileError) return { ok: false as const, error: profileError.message };
  const { data: existingBio, error: bioLookupError } = await supabase
    .from("profile_bios")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (bioLookupError)
    return { ok: false as const, error: bioLookupError.message };
  const bioValues = {
    profile_id: profileId,
    owner_id: user.id,
    bio: details.bio.trim(),
  };
  const bioResult = existingBio
    ? await supabase
        .from("profile_bios")
        .update({ bio: bioValues.bio })
        .eq("id", existingBio.id)
    : await supabase.from("profile_bios").insert(bioValues);
  if (bioResult.error)
    return { ok: false as const, error: bioResult.error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function saveProfileElement(
  profileId: string,
  kind: ProfileElementKind,
  values: ProfileElementInput,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const definitions: Record<
    ProfileElementKind,
    { table: string; required: string }
  > = {
    education: { table: "profile_education", required: "school_name" },
    experience: { table: "profile_experience", required: "role_title" },
    skill: { table: "profile_skill_tags", required: "label" },
    "professional-link": {
      table: "profile_public_professional_links",
      required: "label",
    },
    contact: { table: "profile_contact_actions", required: "label" },
  };
  const definition = definitions[kind];
  const fieldMap: Record<string, string> = {
    schoolName: "school_name",
    fieldOfStudy: "field_of_study",
    startDate: "start_date",
    endDate: "end_date",
    roleTitle: "role_title",
    linkType: "link_type",
    actionType: "action_type",
  };
  const row: Record<string, string | number | boolean> = {
    profile_id: profileId,
    owner_id: user.id,
    item_order: 0,
    show_on_profile_page: true,
    show_on_resume: true,
  };
  const itemId = values.id;
  for (const [key, value] of Object.entries(values))
    if (key !== "id" && value.trim()) row[fieldMap[key] ?? key] = value.trim();
  if (!row[definition.required])
    return {
      ok: false as const,
      error: `${definition.required.replaceAll("_", " ")} is required.`,
    };
  const result = itemId
    ? await supabase
        .from(definition.table)
        .update(row)
        .eq("id", itemId)
        .select("id")
        .single()
    : await supabase.from(definition.table).insert(row).select("id").single();
  if (result.error) return { ok: false as const, error: result.error.message };
  revalidatePath("/dashboard");
  const { data } = itemId ? { data: { id: itemId } } : result;
  return {
    ok: true as const,
    item: {
      id: data?.id ?? crypto.randomUUID(),
      label:
        values.label ??
        values.schoolName ??
        values.roleTitle ??
        values.url ??
        "Saved item",
      values: Object.fromEntries(
        Object.entries(values).filter(([key]) => key !== "id"),
      ),
    },
  };
}

export async function saveProfileProject(
  profileId: string,
  values: ProfileProjectInput,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const title = values.title.trim();
  if (!title)
    return { ok: false as const, error: "Project title is required." };
  const row = {
    profile_id: profileId,
    owner_id: user.id,
    title,
    summary: values.summary.trim() || null,
    url: values.url.trim() || null,
    item_order: 0,
    show_on_profile_page: true,
    show_on_resume: true,
  };
  const result = values.id
    ? await supabase
        .from("profile_projects")
        .update(row)
        .eq("id", values.id)
        .select("id")
        .single()
    : await supabase.from("profile_projects").insert(row).select("id").single();
  if (result.error) return { ok: false as const, error: result.error.message };
  revalidatePath("/dashboard");
  return {
    ok: true as const,
    item: {
      ...row,
      id: result.data?.id ?? values.id ?? crypto.randomUUID(),
      summary: row.summary ?? "",
      url: row.url ?? "",
    },
  };
}

export async function saveProfileTemplate(
  profileId: string,
  template: "recruiter-brief" | "project-showcase",
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { error } = await supabase
    .from("professional_profiles")
    .update({ profile_template: template })
    .eq("id", profileId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function publishProfileSnapshot(profileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { data, error } = await supabase.rpc("publish_profile_snapshot", {
    target_profile_id: profileId,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const, snapshot: data };
}

export async function claimProfileHandle(
  profileId: string,
  currentHandle: string | null,
  requestedHandle: string,
) {
  const supabase = await createClient();
  const result = await claimHandle(
    supabase as unknown as SupabaseProfileClient,
    profileId,
    currentHandle,
    requestedHandle,
  );
  if (result.ok) revalidatePath("/dashboard");
  return result;
}
