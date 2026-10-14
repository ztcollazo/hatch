"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  code?: string;
};

export function AuthCallbackClient({ code }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeSignIn() {
      if (!code) {
        setError("Magic Link sign-in is missing a code. Request a fresh link and try again.");
        return;
      }

      const supabase = createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        if (isMounted) setError(exchangeError.message);
        return;
      }

      window.location.replace("/dashboard");
    }

    void completeSignIn();

    return () => {
      isMounted = false;
    };
  }, [code]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Completing sign-in</h1>
        {error ? (
          <div className="mt-4" role="alert">
            <p className="text-red-200">{error}</p>
            <a className="mt-6 inline-flex rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950" href="/auth/sign-in">
              Request a fresh Magic Link
            </a>
          </div>
        ) : (
          <p className="mt-4 text-slate-300">Please wait while we finish your Magic Link sign-in.</p>
        )}
      </section>
    </main>
  );
}
