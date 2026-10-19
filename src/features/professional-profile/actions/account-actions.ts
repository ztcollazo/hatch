"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
