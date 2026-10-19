import Link from "next/link";
import { MagicLinkSignIn } from "@/features/auth/MagicLinkSignIn";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const supabase = await createClient();
  if ((await supabase.auth.getClaims()).data?.claims) redirect("/dashboard");
  return (
    <main className="auth-shell">
      <header className="site-header">
        <Link href="/" className="brand-mark flex items-center gap-3">
          <span className="brand-glyph">H</span>
          <span>Hatch</span>
        </Link>
      </header>
      <div className="auth-content">
        <p className="eyebrow">Welcome back</p>
        <h1>Your profile, in one place.</h1>
        <MagicLinkSignIn />
      </div>
    </main>
  );
}
