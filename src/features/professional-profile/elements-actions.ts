"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileElementDefinitionByKind } from "./domain/profile-definitions";
import type { ProfileElementInput, ProfileElementKind, ProfileProjectInput } from "./domain/profile-types";

const elementTables = Object.fromEntries(
  Object.values(profileElementDefinitionByKind).map(({ kind, table }) => [kind, table]),
) as Record<ProfileElementKind, string>;

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
      ) as ProfileElementInput,
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

