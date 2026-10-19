"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import type { DragEndEvent } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";

export type ProfileElementKind =
  | "education"
  | "experience"
  | "skill"
  | "professional-link"
  | "contact"
  | "project";
export type ProfileElementInput = Record<string, string> & { id?: string };
export type SavedProfileElement = {
  id: string;
  label: string;
  values: ProfileElementInput;
};
type Result = { ok: true } | { ok: false; error: string };
type Props = {
  profileId: string;
  reorderItemsAction: (
    kind: ProfileElementKind,
    ids: string[],
  ) => Promise<Result>;
  reorderSectionsAction: (kinds: ProfileElementKind[]) => Promise<Result>;
  initialSectionOrder?: ProfileElementKind[];
  saveAction: (
    kind: ProfileElementKind,
    values: ProfileElementInput,
  ) => Promise<
    { ok: true; item: SavedProfileElement } | { ok: false; error: string }
  >;
  initialItems?: Partial<Record<ProfileElementKind, SavedProfileElement[]>>;
};
type Definition = {
  kind: ProfileElementKind;
  title: string;
  fields: Array<[string, string]>;
};
const definitions: Definition[] = [
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
    kind: "project",
    title: "Project",
    fields: [
      ["title", "Title"],
      ["summary", "Summary"],
      ["url", "URL"],
    ],
  },
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

function SortableHandle({
  id,
  group,
  index,
  children,
  className,
}: {
  id: string;
  group: string;
  index: number;
  children: (handleRef: (element: Element | null) => void) => React.ReactNode;
  className: string;
}) {
  const { ref, handleRef } = useSortable({ id, group, index });
  return (
    <div ref={ref} className={className}>
      {children(handleRef)}
    </div>
  );
}

function SectionDragHandle({
  handleRef,
}: {
  handleRef: (element: Element | null) => void;
}) {
  return (
    <span
      ref={handleRef}
      className="section-drag-handle"
      role="button"
      tabIndex={0}
      aria-label="Drag section to reorder"
      title="Drag section to reorder"
    >
      ⠿
    </span>
  );
}

function ItemCard({
  item,
  kind,
  index,
  onEdit,
}: {
  item: SavedProfileElement;
  kind: ProfileElementKind;
  index: number;
  onEdit: () => void;
}) {
  const { ref, handleRef } = useSortable({
    id: `item:${kind}:${item.id}`,
    group: `items:${kind}`,
    index,
  });
  return (
    <li ref={ref} className="element-card">
      <div className="flex items-center justify-between gap-3">
        <span
          ref={handleRef}
          className="drag-handle"
          role="button"
          tabIndex={0}
          aria-label={`Drag ${item.label} to reorder`}
          title="Drag to reorder"
        >
          ⠿
        </span>
        <div className="min-w-0 flex-1">
          <p className="element-title">{item.label}</p>
          {kind === "professional-link" && item.values.linkType && (
            <span className="element-subtitle">
              {typeOptions.linkType.find(
                ([v]) => v === item.values.linkType,
              )?.[1] ?? "Link"}
            </span>
          )}
          {kind === "contact" && item.values.actionType && (
            <span className="element-subtitle">
              {typeOptions.actionType.find(
                ([v]) => v === item.values.actionType,
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
        <button type="button" className="edit-button" onClick={onEdit}>
          Edit
        </button>
      </div>
      {kind !== "skill" && (
        <dl className="element-details">
          {Object.entries(item.values)
            .filter(
              ([key, value]) =>
                !(["id", "show_on_resume", "show_on_profile_page"].includes(key)) &&
                value &&
                !(
                  ["schoolName", "roleTitle", "label"].includes(key) &&
                  value === item.label
                ),
            )
            .map(([key, value]) => (
              <div key={key}>
                <dt>{displayNames[key] ?? key}</dt>
                <dd className={key === "url" ? "break-all" : ""}>{value}</dd>
              </div>
            ))}
        </dl>
      )}
    </li>
  );
}

export function ProfileElementsForm({
  saveAction,
  initialItems = {},
  reorderItemsAction,
  reorderSectionsAction,
  initialSectionOrder,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [sectionOrder, setSectionOrder] = useState(
    initialSectionOrder ?? definitions.map(({ kind }) => kind),
  );
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
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const latestItems = useRef(items);
  const latestSectionOrder = useRef(sectionOrder);
  useEffect(() => {
    latestItems.current = items;
    latestSectionOrder.current = sectionOrder;
  }, [items, sectionOrder]);

  const update = (kind: ProfileElementKind, key: string, value: string) =>
    setValues((c) => ({ ...c, [kind]: { ...c[kind], [key]: value } }));
  const editItem = (kind: ProfileElementKind, item: SavedProfileElement) => {
    setValues((c) => ({ ...c, [kind]: { ...item.values, id: item.id } }));
    document
      .getElementById(`element-form-${kind}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const move = (event: DragEndEvent) => {
    if (event.canceled || !event.operation.source || !event.operation.target)
      return;
    if (!isSortableOperation(event.operation)) return;
    const source = event.operation.source;
    // The optimistic sorting plugin intentionally makes the source the final
    // drop target after it has rearranged the DOM. Therefore source.id and
    // target.id can be identical at dragend. The source sortable's projected
    // index is the authoritative destination; do not use target.id to decide
    // whether a reorder happened.
    const sourceId = String(source.id);
    const projectedIndex = source.sortable.index;
    const initialIndex = source.sortable.initialIndex;
    if (sourceId.startsWith("section:")) {
      const kind = sourceId.slice(8) as ProfileElementKind;
      if (projectedIndex === initialIndex) return;
      const next = [...latestSectionOrder.current];
      const fromIndex = next.indexOf(kind);
      if (fromIndex < 0 || projectedIndex < 0 || projectedIndex >= next.length)
        return;
      next.splice(fromIndex, 1);
      next.splice(projectedIndex, 0, kind);
      setSectionOrder(next);
      startTransition(() => {
        void reorderSectionsAction(next)
          .then((result) => {
            setReorderMessage(
              result.ok ? "Section order updated" : result.error,
            );
          })
          .catch((error: unknown) => {
            setReorderMessage(
              error instanceof Error
                ? error.message
                : "Unable to save section order.",
            );
          });
      });
      return;
    }
    if (sourceId.startsWith("item:")) {
      const [, kind, itemId] = sourceId.split(":");
      const current = latestItems.current[kind as ProfileElementKind] ?? [];
      const fromIndex = current.findIndex((item) => item.id === itemId);
      if (fromIndex < 0 || projectedIndex === initialIndex) return;
      const next = [...current];
      const [entry] = next.splice(fromIndex, 1);
      if (!entry || projectedIndex < 0 || projectedIndex >= next.length + 1)
        return;
      next.splice(projectedIndex, 0, entry);
      setItems((c) => ({ ...c, [kind]: next }));
      startTransition(() => {
        void reorderItemsAction(
          kind as ProfileElementKind,
          next.map((x) => x.id),
        )
          .then((result) => {
            setReorderMessage(
              result.ok
                ? `${definitions.find((x) => x.kind === kind)?.title ?? "Section"} order updated`
                : result.error,
            );
          })
          .catch((error: unknown) => {
            setReorderMessage(
              error instanceof Error
                ? error.message
                : "Unable to save item order.",
            );
          });
      });
    }
  };
  return (
    <DragDropProvider onDragEnd={move}>
      <div className="reorder-guide" role="note">
        <span className="reorder-guide-icon" aria-hidden="true">
          ⠿
        </span>
        <div>
          <strong>Arrange your story</strong>
          <span>
            Drag a section or item by its handle to change the order. Changes
            save automatically.
          </span>
        </div>
      </div>
      <div className="mt-5 grid gap-5">
        {sectionOrder.map((kind, index) => {
          const definition = definitions.find((x) => x.kind === kind)!;
          const saved = items[kind] ?? [];
          return (
            <SortableHandle
              key={kind}
              id={`section:${kind}`}
              group="sections"
              index={index}
              className="element-group profile-element-section rounded-xl p-5"
            >
              {(handleRef) => (
                <>
                  <div className="section-reorder-header">
                    <div className="section-title-row">
                      <SectionDragHandle handleRef={handleRef} />
                      <h3 className="font-semibold">{definition.title}</h3>
                    </div>
                    <span className="element-count">{saved.length} saved</span>
                  </div>
                  {saved.length ? (
                    <ul className={`mt-3 gap-3 grid`}>
                      {saved.map((item, i) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          kind={kind}
                          index={i}
                          onEdit={() => editItem(kind, item)}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-element">
                      No saved {definition.title.toLowerCase()} yet.
                    </p>
                  )}
                  <form
                    id={`element-form-${kind}`}
                    className="element-form mt-4 pt-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setMessage(null);
                      startTransition(async () => {
                        const editing = Boolean(values[kind].id);
                        const result = await saveAction(kind, values[kind]);
                        setMessage(
                          result.ok
                            ? `${definition.title} ${editing ? "updated" : "saved"}.`
                            : result.error,
                        );
                        if (result.ok) {
                          setValues((c) => ({ ...c, [kind]: {} }));
                          setItems((c) => ({
                            ...c,
                            [kind]: c[kind]?.some(
                              (x) => x.id === result.item.id,
                            )
                              ? c[kind]!.map((x) =>
                                  x.id === result.item.id ? result.item : x,
                                )
                              : [...(c[kind] ?? []), result.item],
                          }));
                        }
                      });
                    }}
                  >
                    <p className="form-kicker">
                      {values[kind].id
                        ? `Editing ${definition.title}`
                        : `Add ${definition.title}`}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {definition.fields.map(([key, label]) => (
                        <label key={key} className="block text-sm font-medium">
                          {label}
                          {key === "summary" ? (
                            <textarea
                              className="mt-1 min-h-20 w-full rounded-lg px-3 py-2"
                              value={values[kind][key] ?? ""}
                              onChange={(e) =>
                                update(kind, key, e.target.value)
                              }
                            />
                          ) : typeOptions[key] ? (
                            <select
                              className="mt-1 w-full rounded-lg px-3 py-2"
                              value={values[kind][key] ?? ""}
                              onChange={(e) =>
                                update(kind, key, e.target.value)
                              }
                            >
                              <option value="">Choose a type</option>
                              {typeOptions[key].map(([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="mt-1 w-full rounded-lg px-3 py-2"
                              value={values[kind][key] ?? ""}
                              onChange={(e) =>
                                update(kind, key, e.target.value)
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
                      {values[kind].id ? "Update" : "Save"} {definition.title}
                    </button>
                  </form>
                </>
              )}
            </SortableHandle>
          );
        })}
      </div>
      {(message || reorderMessage) && (
        <p role="status" className="editor-feedback mt-4 text-sm">
          {message || reorderMessage}
        </p>
      )}
    </DragDropProvider>
  );
}
