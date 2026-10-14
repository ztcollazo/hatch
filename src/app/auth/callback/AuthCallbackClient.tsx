"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  code?: string;
};

const CALLBACK_TIMEOUT_MS = 10_000;

export function AuthCallbackClient({ code }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeSignIn() {
      if (!code) {
        setError("Magic Link sign-in is missing a code. Request a fresh link and try again.");
        return;
      }

      try {
        const supabase = createClient();
        const timeout = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("Magic Link sign-in timed out. Request a fresh link and try again.")), CALLBACK_TIMEOUT_MS);
        });

        const { error: exchangeError } = await Promise.race([
          supabase.auth.exchangeCodeForSession(code),
          timeout,
        ]);

        if (exchangeError) throw new Error(exchangeError.message);

        window.location.replace("/dashboard");
      } catch (caughtError) {
        if (!isMounted) return;

        const supabase = createClient();
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          window.location.replace("/dashboard");
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Magic Link sign-in failed. Request a fresh link and try again.");
      }
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
