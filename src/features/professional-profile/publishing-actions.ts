"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

