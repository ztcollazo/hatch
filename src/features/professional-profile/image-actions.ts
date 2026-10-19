"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

