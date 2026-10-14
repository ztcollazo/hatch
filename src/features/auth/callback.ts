import { createClient } from "@/lib/supabase/server";

export async function completeMagicLinkSignIn(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) throw new Error(error.message);
}
