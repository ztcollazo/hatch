"use client";

import { useState, useTransition } from "react";
import type { HandleClaimResult } from "./handles";

type Props = {
  profileId: string;
  currentHandle: string | null;
  claim: (profileId: string, currentHandle: string | null, requestedHandle: string) => Promise<HandleClaimResult>;
};

export function HandleClaimForm({ profileId, currentHandle, claim }: Props) {
  const [handle, setHandle] = useState(currentHandle ?? "");
  const [claimedHandle, setClaimedHandle] = useState(currentHandle);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (claimedHandle) {
    return (
      <section className="mt-8 rounded-2xl bg-slate-900 p-5">
        <p className="text-sm font-semibold text-slate-400">Public Profile Route</p>
        <p className="mt-2 text-2xl font-bold">/u/{claimedHandle}</p>
        <p className="mt-2 text-sm text-slate-300">Handle changes are not supported in the MVP.</p>
      </section>
    );
  }

  return (
    <form
      className="mt-8 rounded-2xl bg-slate-900 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await claim(profileId, currentHandle, handle);
          if (result.ok) setClaimedHandle(result.handle);
          else setError(result.error);
        });
      }}
    >
      <label className="block text-sm font-semibold text-slate-100">
        Handle
        <input
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="maya-chen"
        />
      </label>
      <p className="mt-2 text-sm text-slate-300">Claim a lowercase, URL-safe Handle for your future /u/handle Public Profile Route.</p>
      {error && <p role="alert" className="mt-3 text-red-200">{error}</p>}
      <button className="mt-4 rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950" disabled={isPending} type="submit">
        Claim Handle
      </button>
    </form>
  );
}
