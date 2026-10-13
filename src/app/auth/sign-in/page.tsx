import { requestMagicLink } from "@/features/auth/actions";
import { MagicLinkSignIn } from "@/features/auth/MagicLinkSignIn";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16">
      <div className="mx-auto max-w-xl">
        <MagicLinkSignIn requestMagicLinkAction={requestMagicLink} />
      </div>
    </main>
  );
}
