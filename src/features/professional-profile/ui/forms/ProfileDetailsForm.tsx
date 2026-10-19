"use client";

import { useState, useTransition } from "react";
import type { ProfileDetails } from "../../domain/profile-types";

export type { ProfileDetails } from "../../domain/profile-types";

type Props = {
  initialDetails: ProfileDetails;
  save: (
    details: ProfileDetails,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const fields: Array<{
  key: keyof ProfileDetails;
  label: string;
  multiline?: boolean;
}> = [
  { key: "targetRole", label: "What are you looking for?" },
  { key: "headline", label: "Headline" },
  { key: "publicProfessionalLink", label: "Professional link" },
  { key: "bio", label: "Bio", multiline: true },
];

export function ProfileDetailsForm({ initialDetails, save }: Props) {
  const [details, setDetails] = useState(initialDetails);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  function update(key: keyof ProfileDetails, value: string) {
    setDetails((current) => ({ ...current, [key]: value }));
  }
  return (
    <form
      className="mt-8 rounded-2xl bg-slate-900 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        startTransition(async () => {
          const result = await save(details);
          setMessage(result.ok ? "Profile details saved." : result.error);
        });
      }}
    >
      <h2 className="text-xl font-bold">Profile details</h2>
      <p className="mt-1 text-sm text-slate-300">
        These details shape your profile.
      </p>
      <div className="mt-5 grid gap-4">
        {fields.map(({ key, label, multiline }) => {
          const common = {
            id: key,
            name: key,
            value: details[key],
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => update(key, event.target.value),
          };
          return (
            <label key={key} className="block text-sm font-semibold">
              {label}
              {multiline ? (
                <textarea
                  {...common}
                  className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                />
              ) : (
                <input
                  {...common}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                />
              )}
            </label>
          );
        })}
      </div>
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
        Save Profile Details
      </button>
    </form>
  );
}
