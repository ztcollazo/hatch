"use client";
import { useState, useTransition } from "react";

export type ProfileElementKind =
  "education" | "experience" | "skill" | "professional-link" | "contact" | "project";
export type ProfileElementInput = Record<string, string> & { id?: string };
export type SavedProfileElement = {
  id: string;
  label: string;
  values: ProfileElementInput;
};
type Props = {
  profileId: string;
  reorderItems: (kind: ProfileElementKind, ids: string[]) => Promise<{ ok: true } | { ok: false; error: string }>;
  reorderSections: (kinds: ProfileElementKind[]) => Promise<{ ok: true } | { ok: false; error: string }>;
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
  { kind: "project", title: "Project", fields: [["title", "Title"], ["summary", "Summary"], ["url", "URL"]] },
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
export function ProfileElementsForm({ save, initialItems = {}, reorderItems, reorderSections }: Props) {
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
  const [dragged, setDragged] = useState<{ kind: ProfileElementKind; id: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<ProfileElementKind[]>(definitions.map(({ kind }) => kind));
  const reorderedIds = (kind: ProfileElementKind, fromId: string, toId: string) => { const list = [...(items[kind] ?? [])]; const from = list.findIndex((item) => item.id === fromId); const to = list.findIndex((item) => item.id === toId); const [item] = list.splice(from, 1); list.splice(to, 0, item); return list.map((entry) => entry.id); };
  const beginDrag = (kind: ProfileElementKind, id: string, event: React.DragEvent) => {
    setDragged({ kind, id });
    setDragOver(null);
    const image = document.createElement("canvas");
    image.width = 1;
    image.height = 1;
    event.dataTransfer.setDragImage(image, 0, 0);
    event.dataTransfer.effectAllowed = "move";
  };
  const finishDrag = () => { setDragged(null); setDragOver(null); };
  const move = (kind: ProfileElementKind, fromId: string, toId: string) => { if (fromId === toId) return; setItems((current) => { const list = [...(current[kind] ?? [])]; const from = list.findIndex((item) => item.id === fromId); const to = list.findIndex((item) => item.id === toId); const [item] = list.splice(from, 1); list.splice(to, 0, item); return { ...current, [kind]: list }; }); };
  const moveSection = async (from: ProfileElementKind, to: ProfileElementKind) => {
    if (from === to) return;
    const next = [...sectionOrder];
    next.splice(next.indexOf(from), 1);
    next.splice(next.indexOf(to), 0, from);
    setSectionOrder(next);
    await reorderSections(next);
  };
  const moveItem = async (kind: ProfileElementKind, from: string, to: string) => {
    if (from === to) return;
    const next = [...(items[kind] ?? [])];
    const fromIndex = next.findIndex((item) => item.id === from);
    const toIndex = next.findIndex((item) => item.id === to);
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    setItems((current) => ({ ...current, [kind]: next }));
    await reorderItems(kind, next.map((entry) => entry.id));
  };
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
        {sectionOrder.map((kind) => {
          const definition = definitions.find((entry) => entry.kind === kind)!;
          const { title, fields } = definition;
          return (
          <div draggable onDragStart={(event) => beginDrag(kind, kind, event)} onDragEnd={finishDrag} onDragOver={(event) => { event.preventDefault(); setDragOver(kind); }} onDrop={async () => { if (dragged && dragged.kind !== kind) await moveSection(dragged.kind, kind); finishDrag(); }}
            key={kind}
            className={`element-group profile-element-section rounded-xl p-5 ${dragged?.id === kind ? "is-dragging" : ""} ${dragOver === kind ? "is-drag-over" : ""}`}
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
                        draggable
                        onDragStart={(event) => beginDrag(kind, item.id, event)}
                        onDragEnd={finishDrag}
                        onDragOver={(event) => { event.preventDefault(); setDragOver(item.id); }}
                        onDrop={async () => { if (dragged?.kind === kind) await moveItem(kind, dragged.id, item.id); finishDrag(); }}
                        className={`tag w-max hover:bg-blue-600/30! ${dragged?.id === item.id ? "is-dragging" : ""} ${dragOver === item.id ? "is-drag-over" : ""}`}
                        onClick={() => editItem(kind, item)}
                        key={item.id}
                      >
                        {item.label}
                      </li>
                    ))
                  : items[kind]?.map((item) => (
                      <li draggable onDragStart={(event) => beginDrag(kind, item.id, event)} onDragEnd={finishDrag} onDragOver={(event) => { event.preventDefault(); setDragOver(item.id); }} onDrop={async () => { if (dragged?.kind === kind) await moveItem(kind, dragged.id, item.id); finishDrag(); }} key={item.id} className={`element-card ${dragged?.id === item.id ? "is-dragging" : ""} ${dragOver === item.id ? "is-drag-over" : ""}`}>
                        <div className="flex items-start justify-between gap-3"><span className="drag-handle" aria-label="Drag to reorder" title="Drag to reorder" aria-hidden="true">⋮⋮</span>
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
          );
        })}
      </div>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </>
  );
}
