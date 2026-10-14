import { MagicLinkSignIn } from "@/features/auth/MagicLinkSignIn";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const supabase = await createClient();

  if ((await supabase.auth.getClaims()).data?.claims) {
      redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16">
      <div className="mx-auto max-w-xl">
        <MagicLinkSignIn />
      </div>
    </main>
  );
}
