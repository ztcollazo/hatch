"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type Template = "recruiter-brief" | "project-showcase";
type PublishResult = {
  ok: boolean;
  error?: string;
  publishedAt?: string;
};
type PublishAction = (formData: FormData) => Promise<PublishResult>;

function PublishButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="publish-snapshot-button" disabled={pending}>
      {pending ? "Publishing…" : "Publish profile page"}
      {!pending && <span aria-hidden="true">→</span>}
    </button>
  );
}

export function PublishSnapshotForm({
  selectedTemplate,
  handle,
  action,
}: {
  selectedTemplate: Template;
  handle: string | null;
  action: PublishAction;
}) {
  const [result, formAction] = useActionState<PublishResult | null, FormData>(
    async (_previous, formData) => action(formData),
    null,
  );
  return (
    <form action={formAction} className="publish-snapshot-card">
      <div className="publish-snapshot-heading">
        <div>
          <p className="publish-kicker">Ready when you are</p>
          <h3>Publish your profile snapshot</h3>
          <p>
            Choose a visual direction, then share a polished version of your
            professional story.
          </p>
        </div>
        <span className="publish-lockup" aria-hidden="true">↗</span>
      </div>
      <fieldset className="template-options">
        <legend>Choose a template</legend>
        <label className="template-option">
          <input type="radio" name="template" value="recruiter-brief" defaultChecked={selectedTemplate === "recruiter-brief"} />
          <span className="template-option-mark" />
          <span><strong>Recruiter Brief</strong><small>Clear, focused, and easy to scan.</small></span>
        </label>
        <label className="template-option">
          <input type="radio" name="template" value="project-showcase" defaultChecked={selectedTemplate === "project-showcase"} />
          <span className="template-option-mark" />
          <span><strong>Project Showcase</strong><small>Make your work and point of view lead.</small></span>
        </label>
      </fieldset>
      <div className="publish-snapshot-actions">
        <PublishButton />
        <p>Publishes to <strong>/u/{handle ?? "your-handle"}</strong></p>
      </div>
      {result?.ok && (
        <p className="publish-feedback publish-feedback-success" role="status">
          <span aria-hidden="true">✓</span> Published successfully. Your profile is live at <strong>/u/{handle ?? "your-handle"}</strong>.
        </p>
      )}
      {result && !result.ok && (
        <p className="publish-feedback publish-feedback-error" role="alert">{result.error ?? "We couldn't publish your profile. Please try again."}</p>
      )}
    </form>
  );
}
