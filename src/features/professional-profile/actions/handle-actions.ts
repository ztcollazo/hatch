"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { claimHandle } from "../data/handles";
import type { SupabaseProfileClient } from "../data/profiles";

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
