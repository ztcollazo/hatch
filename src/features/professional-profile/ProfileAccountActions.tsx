"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type Result = { ok: boolean; error?: string };
type Action = () => Promise<Result>;

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Working…" : children}</button>;
}

export function ProfileAccountActions({ unpublish, deleteProfile, published }: {
  unpublish: Action;
  deleteProfile: Action;
  published: boolean;
}) {
  const [unpublishResult, unpublishAction] = useActionState<Result | null, FormData>(
    async () => unpublish(), null,
  );
  const [deleteResult, deleteAction] = useActionState<Result | null, FormData>(
    async () => deleteProfile(), null,
  );
  return <section aria-label="Profile publishing and deletion" className="mt-8 border-t border-[#d9d5cb] pt-6">
    <h2 className="text-xl font-semibold">Profile access</h2>
    <p className="mt-2 text-sm text-[#6b7280]">Unpublish removes the public snapshot and keeps your draft data.</p>
    <form action={unpublishAction} className="mt-3">
      <Submit>{published ? "Unpublish profile page" : "Profile is unpublished"}</Submit>
    </form>
    {unpublishResult && <p role={unpublishResult.ok ? "status" : "alert"}>{unpublishResult.ok ? "Your profile is no longer public." : unpublishResult.error}</p>}
    <div className="mt-6">
      <h3 className="font-semibold">Delete profile data</h3>
      <p className="mt-1 text-sm text-[#6b7280]">This permanently deletes your draft, snapshots, and image metadata. Stored profile images are also removed.</p>
      <form action={deleteAction} className="mt-3" onSubmit={(event) => { if (!window.confirm("Delete all profile data? This cannot be undone.")) event.preventDefault(); }}>
        <Submit>Delete profile data</Submit>
      </form>
      {deleteResult && <p role="alert">{deleteResult.error}</p>}
    </div>
  </section>;
}
