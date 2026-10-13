"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { MagicLinkResult } from "./MagicLinkSignIn";

export async function requestMagicLink(email: string): Promise<MagicLinkResult> {
  if (!email.includes("@")) return { ok: false, error: "Use a valid email address." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: origin + "/auth/callback" },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
