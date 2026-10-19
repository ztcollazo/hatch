"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type Result = { ok: boolean; error?: string };
type Action = () => Promise<Result>;

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Working…" : children}
    </button>
  );
}

export function ProfileAccountActions({
  unpublishAction,
  deleteProfileAction,
  published,
}: {
  unpublishAction: Action;
  deleteProfileAction: Action;
  published: boolean;
}) {
  const [unpublishResult, unpublishActionExec] = useActionState<
    Result | null,
    FormData
  >(async () => unpublishAction(), null);
  const [deleteResult, deleteAction] = useActionState<Result | null, FormData>(
    async () => deleteProfileAction(),
    null,
  );
  return (
    <section
      aria-label="Profile publishing and deletion"
      className="profile-account-actions"
    >
      <div className="account-action-block">
        <p className="account-kicker">Profile settings</p>
        <h2>Manage your public profile</h2>
        <p>Taking your profile offline keeps your saved information safe.</p>
        <form action={unpublishActionExec}>
          <Submit>
            {published ? "Take profile offline" : "Profile is unpublished"}
          </Submit>
        </form>
        {unpublishResult && (
          <p
            className={
              unpublishResult.ok
                ? "account-feedback success"
                : "account-feedback danger"
            }
            role={unpublishResult.ok ? "status" : "alert"}
          >
            {unpublishResult.ok
              ? "Your profile is no longer public."
              : unpublishResult.error}
          </p>
        )}
      </div>
      <div className="account-action-block account-danger-zone">
        <p className="account-kicker">Delete account</p>
        <h3>Delete my data</h3>
        <p>This permanently deletes your saved profile and images.</p>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !window.confirm("Delete all profile data? This cannot be undone.")
            )
              event.preventDefault();
          }}
        >
          <Submit>Delete my data</Submit>
        </form>
        {deleteResult && (
          <p className="account-feedback danger" role="alert">
            {deleteResult.error}
          </p>
        )}
      </div>
    </section>
  );
}
