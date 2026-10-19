"use client";

import { useState, useTransition } from "react";

type Props = {
  initialFullName: string;
  save: (
    fullName: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function ProfileIdentityForm({ initialFullName, save }: Props) {
  const [fullName, setFullName] = useState(initialFullName);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 rounded-2xl bg-slate-900 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        startTransition(async () => {
          const result = await save(fullName);
          setMessage(result.ok ? "Full name saved." : result.error);
        });
      }}
    >
      <label className="block text-sm font-semibold" htmlFor="full-name">
        Full name
      </label>
      <input
        id="full-name"
        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
      />
      {message && (
        <p className="mt-3 text-sm text-emerald-200" role="status">
          {message}
        </p>
      )}
      <button
        className="mt-4 rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950"
        disabled={isPending}
        type="submit"
      >
        Save Full Name
      </button>
    </form>
  );
}
