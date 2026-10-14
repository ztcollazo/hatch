"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  code?: string;
};

const CALLBACK_TIMEOUT_MS = 10_000;

export function AuthCallbackClient({ code }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Starting Magic Link callback…");

  useEffect(() => {
    let isActive = true;
    let didFinish = false;

    async function checkExistingSessionOrShowTimeout() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();

        if (!isActive || didFinish) return;

        if (data.session) {
          didFinish = true;
          window.location.replace("/dashboard");
          return;
        }
      } catch {
        // Fall through to the timeout message below.
      }

      if (!isActive || didFinish) return;
      setStatus("Magic Link callback timed out.");
      setError("Magic Link sign-in timed out. Request a fresh link and try again.");
    }

    const timeoutId = window.setTimeout(() => {
      void checkExistingSessionOrShowTimeout();
    }, CALLBACK_TIMEOUT_MS);

    async function completeSignIn() {
      if (!code) {
        window.clearTimeout(timeoutId);
        setStatus("Magic Link callback is missing a code.");
        setError("Magic Link sign-in is missing a code. Request a fresh link and try again.");
        return;
      }

      setStatus("Exchanging Magic Link code…");

      try {
        const supabase = createClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!isActive || didFinish) return;
        window.clearTimeout(timeoutId);

        if (exchangeError) throw new Error(exchangeError.message);

        didFinish = true;
        setStatus("Sign-in complete. Redirecting…");
        window.location.replace("/dashboard");
      } catch (caughtError) {
        if (!isActive || didFinish) return;
        window.clearTimeout(timeoutId);

        const supabase = createClient();
        const { data } = await supabase.auth.getSession();

        if (!isActive || didFinish) return;

        if (data.session) {
          didFinish = true;
          window.location.replace("/dashboard");
          return;
        }

        setStatus("Magic Link callback failed.");
        setError(caughtError instanceof Error ? caughtError.message : "Magic Link sign-in failed. Request a fresh link and try again.");
      }
    }

    void completeSignIn();

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [code]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Completing sign-in</h1>
        <p className="mt-4 text-slate-300">{status}</p>
        {error ? (
          <div className="mt-4" role="alert">
            <p className="text-red-200">{error}</p>
            <a className="mt-6 inline-flex rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950" href="/auth/sign-in">
              Request a fresh Magic Link
            </a>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">This should redirect automatically after Supabase completes the session exchange.</p>
        )}
      </section>
    </main>
  );
}
