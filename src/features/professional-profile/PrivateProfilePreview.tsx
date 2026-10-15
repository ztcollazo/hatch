"use client";

import { useState } from "react";
import type { DraftProfile } from "./profile-view";

type Props = { profile: DraftProfile };

export function PrivateProfilePreview({ profile }: Props) {
  const [template, setTemplate] = useState<"recruiter-brief" | "project-showcase">("recruiter-brief");
  const projects = profile.projects.filter((project) => project.show_on_profile_page).sort((a, b) => a.item_order - b.item_order);
  return (
    <section aria-label="Private Profile Page Preview" className="mt-8 rounded-2xl border border-emerald-300/30 bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">Private Preview</p><p className="text-sm text-slate-300">Draft changes are visible only to you until you publish.</p></div>
        <label className="text-sm">Template <select className="ml-2 rounded-lg bg-slate-950 px-2 py-2" value={template} onChange={(event) => setTemplate(event.target.value as typeof template)}><option value="recruiter-brief">Recruiter Brief</option><option value="project-showcase">Project Showcase</option></select></label>
      </div>
      <article className={`mt-5 rounded-xl p-6 text-slate-950 ${template === "project-showcase" ? "bg-emerald-50" : "bg-white"}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{template === "project-showcase" ? "Project Showcase" : "Recruiter Brief"}</p>
        <h2 className="mt-2 text-3xl font-bold">{profile.full_name || "Your name"}</h2>
        <p className="mt-1 text-lg">{profile.target_role || "Your target role"}</p>
        <p className="mt-4 leading-7">{profile.headline || "Your headline will appear here."}</p>
        {profile.bio && <p className="mt-5 leading-7">{profile.bio}</p>}
        {projects.length > 0 && <div className="mt-5"><h3 className="font-bold">Projects</h3><ul className="mt-2 space-y-2">{projects.map((project) => <li key={project.id}><strong>{project.title}</strong>{project.summary && <span> — {project.summary}</span>}</li>)}</ul></div>}
        {Object.entries(profile.elements).map(([kind, items]) => items.length > 0 && <div key={kind} className="mt-5"><h3 className="font-bold capitalize">{kind.replaceAll("-", " ")}</h3><ul className="mt-2 space-y-1">{items.map((item) => <li key={item.id}><strong>{item.label}</strong>{Object.entries(item.values).filter(([key, value]) => key !== "label" && value).map(([key, value]) => <span key={key}> · {value}</span>)}</li>)}</ul></div>)}
      </article>
    </section>
  );
}
