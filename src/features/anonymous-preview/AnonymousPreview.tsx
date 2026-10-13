"use client";

import { useMemo, useState } from "react";
import type { MinimumCredibleProfile, TemplateChoice } from "./types";

const emptyProfile: MinimumCredibleProfile = {
  fullName: "",
  targetRole: "",
  headline: "",
  education: "",
  project: "",
  skillTags: "",
  publicProfessionalLink: "",
};

const fields: Array<{ name: keyof MinimumCredibleProfile; label: string; placeholder: string }> = [
  { name: "fullName", label: "Full name", placeholder: "e.g. Maya Chen" },
  { name: "targetRole", label: "Target Role", placeholder: "e.g. Frontend Intern" },
  { name: "headline", label: "Headline", placeholder: "e.g. React student building helpful tools" },
  { name: "education", label: "Education", placeholder: "e.g. State University, B.S. Computer Science" },
  { name: "project", label: "Project", placeholder: "e.g. Campus Events Finder" },
  { name: "skillTags", label: "Skill Tags", placeholder: "e.g. React, TypeScript, Supabase" },
  { name: "publicProfessionalLink", label: "Public Professional Link", placeholder: "e.g. https://github.com/maya" },
];

export function AnonymousPreview() {
  const [profile, setProfile] = useState<MinimumCredibleProfile>(emptyProfile);
  const [template, setTemplate] = useState<TemplateChoice>("recruiter-brief");
  const hasProfileData = Object.values(profile).some((value) => value.trim().length > 0);
  const skillTags = useMemo(
    () => profile.skillTags.split(",").map((skill) => skill.trim()).filter(Boolean),
    [profile.skillTags],
  );

  function updateField(name: keyof MinimumCredibleProfile, value: string) {
    setProfile((current) => ({ ...current, [name]: value }));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">Anonymous Preview</p>
          <h1 className="mt-3 text-3xl font-bold">Build a Minimum Credible Profile</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Enter only local Professional Profile details. This disposable preview is local-only and does not save or publish anything to Supabase.
          </p>

          <form className="mt-6 space-y-4">
            {fields.map((field) => (
              <label key={field.name} className="block text-sm font-medium text-slate-100">
                {field.label}
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-emerald-300/40 transition focus:ring-4"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={profile[field.name]}
                  onChange={(event) => updateField(field.name, event.target.value)}
                />
              </label>
            ))}

            <fieldset className="rounded-2xl border border-white/10 p-4">
              <legend className="px-2 text-sm font-semibold">Template</legend>
              <label className="mt-2 flex items-center gap-3 text-sm">
                <input type="radio" name="template" checked={template === "recruiter-brief"} onChange={() => setTemplate("recruiter-brief")} />
                Recruiter Brief Template
              </label>
              <label className="mt-3 flex items-center gap-3 text-sm">
                <input type="radio" name="template" checked={template === "project-showcase"} onChange={() => setTemplate("project-showcase")} />
                Project Showcase Template
              </label>
            </fieldset>
          </form>
        </section>

        <section aria-label="Profile Page Preview" className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/20">
          {!hasProfileData ? (
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-white/20 p-8 text-center text-slate-300">
              <p>Your Profile Page preview will update here as you enter your own Professional Profile data. Placeholder Examples stay in the form placeholders and are not saved as user-owned Professional Profile data.</p>
            </div>
          ) : template === "recruiter-brief" ? (
            <RecruiterBriefPreview profile={profile} skillTags={skillTags} />
          ) : (
            <ProjectShowcasePreview profile={profile} skillTags={skillTags} />
          )}
        </section>
      </div>
    </main>
  );
}

function RecruiterBriefPreview({ profile, skillTags }: { profile: MinimumCredibleProfile; skillTags: string[] }) {
  return (
    <article className="rounded-2xl bg-white p-8 text-slate-950">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Recruiter Brief Preview</p>
      <h2 className="mt-3 text-4xl font-bold">{profile.fullName || "Unnamed student"}</h2>
      <p className="mt-2 text-lg font-medium text-slate-700">{profile.targetRole}</p>
      <p className="mt-5 text-xl leading-8">{profile.headline}</p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div><dt className="font-semibold">Education</dt><dd>{profile.education}</dd></div>
        <div><dt className="font-semibold">Featured Project</dt><dd>{profile.project}</dd></div>
      </dl>
      <SkillList skillTags={skillTags} />
      {profile.publicProfessionalLink && <a className="mt-8 inline-block text-emerald-700 underline" href={profile.publicProfessionalLink}>Contact Action</a>}
    </article>
  );
}

function ProjectShowcasePreview({ profile, skillTags }: { profile: MinimumCredibleProfile; skillTags: string[] }) {
  return (
    <article className="rounded-2xl bg-emerald-50 p-8 text-slate-950">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Project Showcase Preview</p>
      <h2 className="mt-3 text-3xl font-bold">{profile.project || "Featured Project"}</h2>
      <p className="mt-3 text-lg">Built by {profile.fullName || "a student"} for {profile.targetRole}</p>
      <p className="mt-6 rounded-2xl bg-white p-5 text-xl leading-8 shadow-sm">{profile.headline}</p>
      <p className="mt-6 text-sm font-medium">{profile.education}</p>
      <SkillList skillTags={skillTags} />
      {profile.publicProfessionalLink && <a className="mt-8 inline-block text-emerald-800 underline" href={profile.publicProfessionalLink}>View Public Professional Link</a>}
    </article>
  );
}

function SkillList({ skillTags }: { skillTags: string[] }) {
  if (skillTags.length === 0) return null;
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {skillTags.map((skill) => <li key={skill} className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">{skill}</li>)}
    </ul>
  );
}
