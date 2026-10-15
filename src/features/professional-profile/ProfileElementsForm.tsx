"use client";
import { useState, useTransition } from "react";
export type ProfileElementKind =
  | "education"
  | "experience"
  | "skill"
  | "professional-link"
  | "contact";
export type ProfileElementInput = Record<string, string> & { id?: string };
export type SavedProfileElement = {
  id: string;
  label: string;
  values: ProfileElementInput;
};
type Props = {
  save: (
    kind: ProfileElementKind,
    values: ProfileElementInput,
  ) => Promise<
    { ok: true; item: SavedProfileElement } | { ok: false; error: string }
  >;
  initialItems?: Partial<Record<ProfileElementKind, SavedProfileElement[]>>;
};
const definitions: Array<{
  kind: ProfileElementKind;
  title: string;
  fields: Array<[string, string]>;
}> = [
  {
    kind: "education",
    title: "Education",
    fields: [
      ["schoolName", "School name"],
      ["degree", "Degree"],
      ["fieldOfStudy", "Field of study"],
      ["startDate", "Start date"],
      ["endDate", "End date"],
    ],
  },
  {
    kind: "experience",
    title: "Experience",
    fields: [
      ["roleTitle", "Role title"],
      ["organization", "Organization"],
      ["summary", "Summary"],
      ["startDate", "Start date"],
      ["endDate", "End date"],
    ],
  },
  { kind: "skill", title: "Skill tag", fields: [["label", "Skill"]] },
  {
    kind: "professional-link",
    title: "Professional link",
    fields: [
      ["label", "Label"],
      ["url", "URL"],
      ["linkType", "Link type"],
    ],
  },
  {
    kind: "contact",
    title: "Contact action",
    fields: [
      ["label", "Label"],
      ["url", "URL"],
      ["actionType", "Action type"],
    ],
  },
];
const typeOptions: Record<string, Array<[string, string]>> = {
  linkType: [
    ["linkedin", "LinkedIn"],
    ["github", "GitHub"],
    ["portfolio", "Portfolio"],
    ["website", "Personal website"],
    ["other", "Other"],
  ],
  actionType: [
    ["email", "Email me"],
    ["calendar", "Book a call"],
    ["phone", "Call me"],
    ["other", "Other"],
  ],
};

const displayNames: Record<string, string> = {
  schoolName: "School",
  degree: "Degree",
  fieldOfStudy: "Field of study",
  roleTitle: "Role",
  organization: "Organization",
  summary: "About",
  startDate: "Started",
  endDate: "Ended",
  url: "Link",
  linkType: "Type",
  actionType: "Action",
};
export function ProfileElementsForm({ save, initialItems = {} }: Props) {
  const [items, setItems] = useState(initialItems);
  const [values, setValues] = useState<
    Record<ProfileElementKind, ProfileElementInput>
  >(
    () =>
      Object.fromEntries(definitions.map(({ kind }) => [kind, {}])) as Record<
        ProfileElementKind,
        ProfileElementInput
      >,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const update = (kind: ProfileElementKind, key: string, value: string) =>
    setValues((current) => ({
      ...current,
      [kind]: { ...current[kind], [key]: value },
    }));
  const editItem = (kind: ProfileElementKind, item: SavedProfileElement) => {
    setValues((current) => ({
      ...current,
      [kind]: { ...item.values, id: item.id },
    }));
    document
      .getElementById(`element-form-${kind}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <>
      <div className="mt-5 grid gap-5">
        {definitions.map(({ kind, title, fields }) => (
          <div
            key={kind}
            className="element-group profile-element-section rounded-xl p-5"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold">{title}</h3>
              <span className="element-count">
                {items[kind]?.length ?? 0} saved
              </span>
            </div>
            {items[kind]?.length ? (
              <ul
                className={
                  "mt-3 gap-3" + (kind === "skill" ? " flex" : " grid")
                }
              >
                {kind === "skill"
                  ? items[kind]?.map((item) => (
                      <li
                        onClick={() => editItem(kind, item)}
                        key={item.id}
                        className="tag w-max hover:bg-blue-600/30!"
                      >
                        {item.label}
                      </li>
                    ))
                  : items[kind]?.map((item) => (
                      <li key={item.id} className="element-card">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="element-title">{item.label}</p>
                            {(kind === "professional-link" ||
                              kind === "contact") &&
                              item.values.linkType && (
                                <span className="element-subtitle">
                                  {typeOptions.linkType.find(
                                    ([value]) => value === item.values.linkType,
                                  )?.[1] ?? "Link"}
                                </span>
                              )}
                            {kind === "contact" && item.values.actionType && (
                              <span className="element-subtitle">
                                {typeOptions.actionType.find(
                                  ([value]) => value === item.values.actionType,
                                )?.[1] ?? "Contact"}
                              </span>
                            )}
                            {kind === "education" && (
                              <p className="element-subtitle">
                                {[item.values.degree, item.values.fieldOfStudy]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                            {kind === "experience" && (
                              <p className="element-subtitle">
                                {[
                                  item.values.organization,
                                  [item.values.startDate, item.values.endDate]
                                    .filter(Boolean)
                                    .join(" – "),
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => editItem(kind, item)}
                          >
                            Edit
                          </button>
                        </div>
                        <dl className="element-details">
                          {Object.entries(item.values)
                            .filter(
                              ([key, value]) =>
                                key !== "id" &&
                                value &&
                                !(
                                  key === "schoolName" && value === item.label
                                ) &&
                                !(
                                  key === "roleTitle" && value === item.label
                                ) &&
                                !(key === "label" && value === item.label),
                            )
                            .map(([key, value]) => (
                              <div key={key}>
                                <dt>{displayNames[key] ?? key}</dt>
                                <dd
                                  className={key === "url" ? "break-all" : ""}
                                >
                                  {value}
                                </dd>
                              </div>
                            ))}
                        </dl>
                      </li>
                    ))}
              </ul>
            ) : (
              <p className="empty-element">
                No saved {title.toLowerCase()} yet.
              </p>
            )}
            <form
              id={`element-form-${kind}`}
              className="element-form mt-4 pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage(null);
                startTransition(async () => {
                  const result = await save(kind, values[kind]);
                  setMessage(
                    result.ok
                      ? `${title} ${values[kind].id ? "updated" : "saved"}.`
                      : result.error,
                  );
                  if (result.ok) {
                    setValues((current) => ({ ...current, [kind]: {} }));
                    setItems((current) => ({
                      ...current,
                      [kind]: current[kind]?.some(
                        (item) => item.id === result.item.id,
                      )
                        ? current[kind]?.map((item) =>
                            item.id === result.item.id ? result.item : item,
                          )
                        : [...(current[kind] ?? []), result.item],
                    }));
                  }
                });
              }}
            >
              <p className="form-kicker">
                {values[kind].id ? `Editing ${title}` : `Add ${title}`}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {fields.map(([key, label]) => (
                  <label key={key} className="block text-sm font-medium">
                    {label}
                    {key === "summary" ? (
                      <textarea
                        className="mt-1 min-h-20 w-full rounded-lg px-3 py-2"
                        value={values[kind][key] ?? ""}
                        onChange={(event) =>
                          update(kind, key, event.target.value)
                        }
                      />
                    ) : typeOptions[key] ? (
                      <select
                        className="mt-1 w-full rounded-lg px-3 py-2"
                        value={values[kind][key] ?? ""}
                        onChange={(event) =>
                          update(kind, key, event.target.value)
                        }
                      >
                        <option value="">Choose a type</option>
                        {typeOptions[key].map(([value, optionLabel]) => (
                          <option key={value} value={value}>
                            {optionLabel}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="mt-1 w-full rounded-lg px-3 py-2"
                        value={values[kind][key] ?? ""}
                        onChange={(event) =>
                          update(kind, key, event.target.value)
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
              <button
                className="save-element mt-4 rounded-full px-4 py-2 text-sm"
                type="submit"
                disabled={isPending}
              >
                {values[kind].id ? "Update" : "Save"} {title}
              </button>
            </form>
          </div>
        ))}
      </div>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </>
  );
}
