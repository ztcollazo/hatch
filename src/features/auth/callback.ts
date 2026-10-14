import { createClient } from "@/lib/supabase/server";

type MagicLinkCallbackParams = {
  code?: string | null;
  tokenHash?: string | null;
  type?: string | null;
};

export async function completeMagicLinkSignIn({ code, tokenHash, type }: MagicLinkCallbackParams) {
  const supabase = await createClient();

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type === "recovery" ? "recovery" : "email",
    });

    if (error) throw new Error(error.message);
    return;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
  }
}
