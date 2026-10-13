"use client";

import { useState } from "react";

export type MagicLinkResult = { ok: true } | { ok: false; error: string };

type Props = {
  requestMagicLink: (email: string) => Promise<MagicLinkResult>;
};

export function MagicLinkSignIn({ requestMagicLink }: Props) {
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendMagicLink(targetEmail = email) {
    setError(null);
    setIsSubmitting(true);
    const result = await requestMagicLink(targetEmail);
    setIsSubmitting(false);
    if (result.ok) setSentEmail(targetEmail);
    else setError(result.error);
  }

  if (sentEmail) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <h1 className="text-3xl font-bold">Check {sentEmail}</h1>
        <p className="mt-3 text-slate-300">Use the Magic Link we sent to complete sign-in.</p>
        {error && <p role="alert" className="mt-4 text-red-200">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button className="rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950" disabled={isSubmitting} onClick={() => sendMagicLink(sentEmail)}>
            Resend Magic Link
          </button>
          <button className="rounded-full border border-white/20 px-5 py-3 font-semibold" onClick={() => setSentEmail(null)}>
            Change email
          </button>
        </div>
      </section>
    );
  }

  return (
    <form className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white" onSubmit={(event) => { event.preventDefault(); void sendMagicLink(); }}>
      <h1 className="text-3xl font-bold">Sign in with Magic Link</h1>
      <p className="mt-3 text-slate-300">Enter your email to create or return to your one Professional Profile.</p>
      <label className="mt-6 block text-sm font-medium">
        Email
        <input className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      {error && <p role="alert" className="mt-4 text-red-200">{error}</p>}
      <button className="mt-6 rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950" disabled={isSubmitting} type="submit">
        Send Magic Link
      </button>
    </form>
  );
}
