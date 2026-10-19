"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfileDetails } from "../domain/profile-types";

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
