"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { claimHandle } from "./handles";
import type { SupabaseProfileClient } from "./profiles";
import type { ProfileDetails } from "./ProfileDetailsForm";

export async function saveProfileFullName(profileId: string, fullName: string) {
  const trimmedName = fullName.trim();
  if (!trimmedName) return { ok: false as const, error: "Full name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("professional_profiles").update({ full_name: trimmedName }).eq("id", profileId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function saveProfileDetails(profileId: string, details: ProfileDetails) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { error: profileError } = await supabase.from("professional_profiles").update({
    target_role: details.targetRole.trim(), headline: details.headline.trim(), education: details.education.trim(), project: details.project.trim(),
    skill_tags: details.skillTags.split(",").map((tag) => tag.trim()).filter(Boolean), public_professional_link: details.publicProfessionalLink.trim() || null,
  }).eq("id", profileId);
  if (profileError) return { ok: false as const, error: profileError.message };
  const { error: bioError } = await supabase.from("profile_bios").upsert({ profile_id: profileId, owner_id: user.id, bio: details.bio.trim() }, { onConflict: "profile_id" });
  if (bioError) return { ok: false as const, error: bioError.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function claimProfileHandle(profileId: string, currentHandle: string | null, requestedHandle: string) {
  const supabase = await createClient();
  const result = await claimHandle(supabase as unknown as SupabaseProfileClient, profileId, currentHandle, requestedHandle);
  if (result.ok) revalidatePath("/dashboard");
  return result;
}
