"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { claimHandle } from "./handles";
import type { SupabaseProfileClient } from "./profiles";

export async function saveProfileFullName(profileId: string, fullName: string) {
  const trimmedName = fullName.trim();
  if (!trimmedName) return { ok: false as const, error: "Full name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("professional_profiles").update({ full_name: trimmedName }).eq("id", profileId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function claimProfileHandle(profileId: string, currentHandle: string | null, requestedHandle: string) {
  const supabase = await createClient();
  const result = await claimHandle(supabase as unknown as SupabaseProfileClient, profileId, currentHandle, requestedHandle);
  if (result.ok) revalidatePath("/dashboard");
  return result;
}
