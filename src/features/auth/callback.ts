import { createClient } from "@/lib/supabase/server";

type TokenMagicLinkCallbackParams = {
  tokenHash?: string | null;
  type?: string | null;
};

export async function completeTokenMagicLinkSignIn({ tokenHash, type }: TokenMagicLinkCallbackParams) {
  if (!tokenHash) return;

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type === "recovery" ? "recovery" : "email",
  });

  if (error) throw new Error(error.message);
}
