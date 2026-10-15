"use client";

import { useState, useTransition } from "react";

export type ProfileElementKind = "education" | "experience" | "skill" | "professional-link" | "contact";
export type ProfileElementInput = Record<string, string>;

export type SavedProfileElement = { id: string; label: string };
type Props = { save: (kind: ProfileElementKind, values: ProfileElementInput) => Promise<{ ok: true; item: SavedProfileElement } | { ok: false; error: string }>; initialItems?: Partial<Record<ProfileElementKind, SavedProfileElement[]>> };

const definitions: Array<{ kind: ProfileElementKind; title: string; fields: Array<[string, string]> }> = [
  { kind: "education", title: "Education", fields: [["schoolName", "School name"], ["degree", "Degree"], ["fieldOfStudy", "Field of study"], ["startDate", "Start date"], ["endDate", "End date"]] },
  { kind: "experience", title: "Experience", fields: [["roleTitle", "Role title"], ["organization", "Organization"], ["summary", "Summary"], ["startDate", "Start date"], ["endDate", "End date"]] },
  { kind: "skill", title: "Skill tag", fields: [["label", "Skill"]] },
  { kind: "professional-link", title: "Professional link", fields: [["label", "Label"], ["url", "URL"], ["linkType", "Link type"]] },
  { kind: "contact", title: "Contact action", fields: [["label", "Label"], ["url", "URL"], ["actionType", "Action type"]] },
];

export function ProfileElementsForm({ save, initialItems = {} }: Props) {
  const [items, setItems] = useState(initialItems);
  const [values, setValues] = useState<Record<ProfileElementKind, ProfileElementInput>>(() => Object.fromEntries(definitions.map(({ kind }) => [kind, {}])) as Record<ProfileElementKind, ProfileElementInput>);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  return <section className="mt-8 rounded-2xl bg-slate-900 p-5">
    <h2 className="text-xl font-bold">Profile elements</h2>
    <p className="mt-1 text-sm text-slate-300">Add the structured items that make up your Professional Profile. Each item stays in your draft until publishing.</p>
    <div className="mt-5 grid gap-5">
      {definitions.map(({ kind, title, fields }) => <form key={kind} className="rounded-xl border border-white/10 p-4" onSubmit={(event) => {
        event.preventDefault(); setMessage(null);
        startTransition(async () => { const result = await save(kind, values[kind]); setMessage(result.ok ? `${title} saved.` : result.error); if (result.ok) { setValues((current) => ({ ...current, [kind]: {} })); setItems((current) => ({ ...current, [kind]: [...(current[kind] ?? []), result.item] })); } });
      }}>
        <h3 className="font-semibold">{title}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {fields.map(([key, label]) => <label key={key} className="block text-sm font-medium sm:last:col-span-2">{label}{key === "summary" ? <textarea className="mt-1 min-h-20 w-full rounded-lg bg-slate-950 px-3 py-2" value={values[kind][key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [kind]: { ...current[kind], [key]: event.target.value } }))} /> : <input className="mt-1 w-full rounded-lg bg-slate-950 px-3 py-2" value={values[kind][key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [kind]: { ...current[kind], [key]: event.target.value } }))} />}</label>)}
        </div>
        {(items[kind]?.length ?? 0) > 0 && <ul className="mt-4 space-y-2">{items[kind]?.map((item) => <li key={item.id} className="rounded-lg bg-slate-950 px-3 py-2 text-sm">{item.label}</li>)}</ul>}
        <button className="mt-4 rounded-full border border-emerald-300/60 px-4 py-2 text-sm text-emerald-100" type="submit" disabled={isPending}>Add {title}</button>
      </form>)}
    </div>
    {message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
  </section>;
}
