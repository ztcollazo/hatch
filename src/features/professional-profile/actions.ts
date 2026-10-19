"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { claimHandle } from "./handles";
import type { SupabaseProfileClient } from "./profiles";
import type {
  ProfileDetails,
  ProfileElementInput,
  ProfileElementKind,
  ProfileProjectInput,
} from "./domain/profile-types";
import { profileElementDefinitionByKind } from "./domain/profile-definitions";

export type { ProfileProjectInput } from "./domain/profile-types";

/* Profile mutations are kept here temporarily as the server-action boundary.
 * Domain input types live outside the UI so persistence code does not depend on
 * React components. The individual action groups can be split in a later pass.
 */

export async function saveProfileImage(profileId: string, storagePath: string, altText: string, visibility: { showOnProfilePage: boolean; showOnResume: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  if (!storagePath.startsWith(`profiles/${profileId}/`)) return { ok: false as const, error: "Invalid profile image path." };
  const existing = await supabase.from("profile_image_metadata").select("storage_path").eq("profile_id", profileId);
  if (existing.error) return { ok: false as const, error: existing.error.message };
  const oldPaths = (existing.data ?? []).map((row: { storage_path?: string | null }) => row.storage_path).filter((path): path is string => Boolean(path));
  if (oldPaths.some((path) => !path.startsWith(`profiles/${profileId}/`))) return { ok: false as const, error: "Invalid profile image path." };
  if (oldPaths.length) {
    const removed = await supabase.storage.from("images").remove(oldPaths);
    if (removed.error) return { ok: false as const, error: removed.error.message };
  }
  const { error: oldError } = await supabase.from("profile_image_metadata").delete().eq("profile_id", profileId);
  if (oldError) return { ok: false as const, error: oldError.message };
  const { error } = await supabase.from("profile_image_metadata").insert({ profile_id: profileId, owner_id: user.id, storage_path: storagePath, alt_text: altText.trim() || "Profile image", show_on_profile_page: visibility.showOnProfilePage, show_on_resume: visibility.showOnResume });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updateProfileImageVisibility(profileId: string, visibility: { showOnProfilePage: boolean; showOnResume: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { error } = await supabase.from("profile_image_metadata").update({ show_on_profile_page: visibility.showOnProfilePage, show_on_resume: visibility.showOnResume }).eq("profile_id", profileId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function removeProfileImage(profileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { data, error } = await supabase.from("profile_image_metadata").select("storage_path").eq("profile_id", profileId);
  if (error) return { ok: false as const, error: error.message };
  const paths = (data ?? []).map((row: { storage_path?: string | null }) => row.storage_path).filter((path): path is string => Boolean(path));
  if (paths.some((path) => !path.startsWith(`profiles/${profileId}/`))) return { ok: false as const, error: "Invalid profile image path." };
  if (paths.length) {
    const removed = await supabase.storage.from("images").remove(paths);
    if (removed.error) return { ok: false as const, error: removed.error.message };
  }
  const deleted = await supabase.from("profile_image_metadata").delete().eq("profile_id", profileId);
  if (deleted.error) return { ok: false as const, error: deleted.error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

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
  const definition = profileElementDefinitionByKind[kind];
  const fieldMap = Object.fromEntries(
    definition.fields.map(({ key, column }) => [key, column]),
  );
  const row: Record<string, string | number | boolean> = {
    profile_id: profileId,
    owner_id: user.id,
    item_order: 0,
    show_on_profile_page: true,
    show_on_resume: true,
  };
  const itemId = values.id;
  for (const [key, value] of Object.entries(values))
    if (key !== "id" && typeof value === "string" && value.trim()) row[fieldMap[key] ?? key] = value.trim();
  if (!row[definition.requiredColumn])
    return {
      ok: false as const,
      error: `${definition.requiredColumn.replaceAll("_", " ")} is required` + ".",
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
      label: String(
        values.label ??
        values.schoolName ??
        values.roleTitle ??
        values.title ??
        values.url ??
        "Saved item",
      ),
      values: Object.fromEntries(
        Object.entries(values).filter(([key]) => key !== "id"),
      ),
      show_on_profile_page: true,
      show_on_resume: true,
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

const elementTables = Object.fromEntries(
  Object.values(profileElementDefinitionByKind).map(({ kind, table }) => [kind, table]),
) as Record<ProfileElementKind, string>;

export async function updateProfileElementVisibility(profileId: string, kind: ProfileElementKind, itemId: string, visibility: { showOnProfilePage: boolean; showOnResume: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { error } = await supabase.from(elementTables[kind]).update({ show_on_profile_page: visibility.showOnProfilePage, show_on_resume: visibility.showOnResume }).eq("id", itemId).eq("profile_id", profileId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function reorderProfileElements(
  profileId: string,
  kind: ProfileElementKind,
  orderedIds: string[],
) {
  console.log("Reordering profile elements:", { profileId, kind, orderedIds });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  for (const [itemOrder, id] of orderedIds.entries()) {
    const { data, error } = await supabase
      .from(elementTables[kind])
      .update({ item_order: itemOrder })
      .eq("id", id)
      .eq("profile_id", profileId)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false as const, error: error.message };
    if (!data)
      return {
        ok: false as const,
        error: "The item could not be found for this profile.",
      };
  }
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function reorderProfileSections(
  profileId: string,
  orderedKinds: ProfileElementKind[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  for (const [sectionOrder, sectionKey] of orderedKinds.entries()) {
    const { data, error } = await supabase
      .from("profile_section_settings")
      .upsert(
        {
          profile_id: profileId,
          owner_id: user.id,
          section_key: sectionKey,
          section_order: sectionOrder,
        },
        { onConflict: "profile_id,section_key" },
      )
      .select("section_key")
      .maybeSingle();
    if (error) return { ok: false as const, error: error.message };
    if (!data)
      return {
        ok: false as const,
        error: "The section order could not be saved for this profile.",
      };
  }
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function saveProfileTemplate(
  profileId: string,
  template: "recruiter-brief" | "project-showcase",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { error } = await supabase
    .from("professional_profiles")
    .update({ profile_template: template })
    .eq("id", profileId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function publishProfileSnapshot(
  profileId: string,
  template?: "recruiter-brief" | "project-showcase",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  if (template) {
    const { error: templateError } = await supabase
      .from("professional_profiles")
      .update({ profile_template: template })
      .eq("id", profileId);
    if (templateError)
      return { ok: false as const, error: templateError.message };
  }
  const { data, error } = await supabase.rpc("publish_profile_snapshot", {
    target_profile_id: profileId,
    selected_template: template ?? null,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const, snapshot: data };
}

export async function unpublishProfile(profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { error } = await supabase.rpc("unpublish_profile", {
    target_profile_id: profileId,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/u/[handle]`, "page");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteProfileData(profileId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };

  // Storage objects are not deleted by Postgres cascades. Remove metadata paths
  // first, then delete the profile (which cascades all relational profile data).
  const profileResult = await supabase
    .from("professional_profiles")
    .select("handle")
    .eq("id", profileId)
    .maybeSingle();
  if (profileResult.error)
    return { ok: false as const, error: profileResult.error.message };
  if (!profileResult.data)
    return { ok: false as const, error: "Profile not found." };
  const metadata = await supabase
    .from("profile_image_metadata")
    .select("storage_path")
    .eq("profile_id", profileId);
  if (metadata.error)
    return { ok: false as const, error: metadata.error.message };
  const prefix = `profiles/${profileId}/`;
  const paths = (metadata.data ?? [])
    .map((row: { storage_path?: string | null }) => row.storage_path)
    .filter((path): path is string => Boolean(path));
  if (paths.some((path) => !path.startsWith(prefix)))
    return {
      ok: false as const,
      error: "Profile image storage paths are invalid.",
    };
  if (paths.length) {
    const { error } = await supabase.storage.from("images").remove(paths);
    if (error)
      return {
        ok: false as const,
        error: `Could not remove profile images: ${error.message}`,
      };
  }
  const { error } = await supabase.rpc("delete_profile_data", {
    target_profile_id: profileId,
  });
  if (error) return { ok: false as const, error: error.message };
  if (profileResult.data.handle)
    revalidatePath(`/u/${profileResult.data.handle}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
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
