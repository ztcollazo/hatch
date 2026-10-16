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
  return <section aria-label="Profile publishing and deletion" className="profile-account-actions">
    <div className="account-action-block">
      <p className="account-kicker">Profile access</p>
      <h2>Manage your public profile</h2>
      <p>Unpublish removes the public snapshot and keeps your draft data.</p>
      <form action={unpublishAction}>
        <Submit>{published ? "Unpublish profile page" : "Profile is unpublished"}</Submit>
      </form>
      {unpublishResult && <p className={unpublishResult.ok ? "account-feedback success" : "account-feedback danger"} role={unpublishResult.ok ? "status" : "alert"}>{unpublishResult.ok ? "Your profile is no longer public." : unpublishResult.error}</p>}
    </div>
    <div className="account-action-block account-danger-zone">
      <p className="account-kicker">Danger zone</p>
      <h3>Delete profile data</h3>
      <p>This permanently deletes your draft, snapshots, and stored profile images.</p>
      <form action={deleteAction} onSubmit={(event) => { if (!window.confirm("Delete all profile data? This cannot be undone.")) event.preventDefault(); }}>
        <Submit>Delete profile data</Submit>
      </form>
      {deleteResult && <p className="account-feedback danger" role="alert">{deleteResult.error}</p>}
    </div>
  </section>;
}
