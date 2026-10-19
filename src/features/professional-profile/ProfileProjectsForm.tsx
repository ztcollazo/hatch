"use client";
import { useState, useTransition } from "react";
import type { DraftProject } from "./profile-view";
import type { ProfileProjectInput } from "./domain/profile-types";
type Props = {
  projects: DraftProject[];
  save: (
    values: ProfileProjectInput,
  ) => Promise<{ ok: true; item: DraftProject } | { ok: false; error: string }>;
};
const empty: ProfileProjectInput = { title: "", summary: "", url: "" };
export function ProfileProjectsForm({
  projects: initialProjects,
  save,
}: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [values, setValues] = useState<ProfileProjectInput>(empty);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const update = (key: keyof ProfileProjectInput, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));
  return (
    <section className="profile-elements mt-8 rounded-2xl p-5">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold">Projects</h3>
          <p className="mt-1 text-sm">
            Share the work that best demonstrates your craft.
          </p>
        </div>
        <span className="element-count">{projects.length} saved</span>
      </div>
      {projects.length ? (
        <ul className="mt-5 grid gap-3">
          {projects.map((p) => (
            <li className="element-card" key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="element-title">{p.title}</p>
                  <p className="element-subtitle">
                    {p.summary ? "Featured project" : "Project in progress"}
                  </p>
                </div>
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => {
                    setValues({
                      id: p.id,
                      title: p.title,
                      summary: p.summary || "",
                      url: p.url || "",
                    });
                    document
                      .getElementById("project-form")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  Edit
                </button>
              </div>
              <dl className="element-details">
                <div>
                  <dt>Description</dt>
                  <dd>{p.summary || "No summary yet."}</dd>
                </div>
                <div>
                  <dt>URL</dt>
                  <dd>
                    {p.url ? (
                      <a
                        className="text-link"
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {p.url}
                      </a>
                    ) : (
                      "No URL added"
                    )}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-element mt-5">No saved projects yet.</p>
      )}
      <form
        id="project-form"
        className="element-form mt-5 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          setMessage(null);
          startTransition(async () => {
            const r = await save(values);
            setMessage(
              r.ok
                ? values.id
                  ? "Project updated."
                  : "Project saved."
                : r.error,
            );
            if (r.ok) {
              setProjects((c) =>
                c.some((p) => p.id === r.item.id)
                  ? c.map((p) => (p.id === r.item.id ? r.item : p))
                  : [...c, r.item],
              );
              setValues(empty);
            }
          });
        }}
      >
        <p className="form-kicker">
          {values.id ? "Editing project" : "Add project"}
        </p>
        <div className="mt-3 grid gap-3">
          <label>
            Title
            <input
              required
              className="mt-1 w-full rounded-lg px-3 py-2"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </label>
          <label>
            Summary
            <textarea
              className="mt-1 min-h-24 w-full rounded-lg px-3 py-2"
              value={values.summary}
              onChange={(e) => update("summary", e.target.value)}
            />
          </label>
          <label>
            URL
            <input
              type="url"
              className="mt-1 w-full rounded-lg px-3 py-2"
              value={values.url}
              onChange={(e) => update("url", e.target.value)}
            />
          </label>
        </div>
        <button
          className="save-element mt-4 rounded-full px-4 py-2 text-sm"
          type="submit"
          disabled={pending}
        >
          {values.id ? "Update" : "Save"} project
        </button>
      </form>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
