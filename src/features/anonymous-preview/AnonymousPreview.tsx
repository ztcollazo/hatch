"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProfileTemplateProfile } from "../professional-profile/ui/preview/ProfileTemplates";
import {
  ProjectShowcaseTemplate,
  RecruiterBriefTemplate,
} from "../professional-profile/ui/preview/ProfileTemplates";
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
const fields: Array<{
  name: keyof MinimumCredibleProfile;
  label: string;
  placeholder: string;
}> = [
  { name: "fullName", label: "Full name", placeholder: "e.g. Maya Chen" },
  {
    name: "targetRole",
    label: "What are you looking for?",
    placeholder: "e.g. Frontend Intern",
  },
  {
    name: "headline",
    label: "Headline",
    placeholder: "e.g. React student building helpful tools",
  },
  {
    name: "education",
    label: "Education",
    placeholder: "e.g. State University, B.S. Computer Science",
  },
  {
    name: "project",
    label: "Project",
    placeholder: "e.g. Campus Events Finder",
  },
  {
    name: "skillTags",
    label: "Skills",
    placeholder: "e.g. React, TypeScript, Supabase",
  },
  {
    name: "publicProfessionalLink",
    label: "Professional link",
    placeholder: "e.g. https://github.com/maya",
  },
];

export function AnonymousPreview() {
  const [profile, setProfile] = useState(emptyProfile);
  const [template, setTemplate] = useState<TemplateChoice>("recruiter-brief");
  const skillTags = useMemo(
    () =>
      profile.skillTags
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    [profile.skillTags],
  );
  const hasProfileData = Object.values(profile).some((value) => value.trim());
  const previewProfile = useMemo<ProfileTemplateProfile>(
    () => ({
      full_name: profile.fullName || null,
      target_role: profile.targetRole || null,
      headline: profile.headline || null,
      bio: "",
      projects: profile.project
        ? [
            {
              id: "anonymous-project",
              title: profile.project,
              summary: null,
              url: null,
              item_order: 0,
              show_on_profile_page: true,
              show_on_resume: false,
            },
          ]
        : [],
      elements: {
        ...(profile.education
          ? {
              education: [
                {
                  id: "anonymous-education",
                  label: profile.education,
                  item_order: 0,
                  values: { schoolName: profile.education },
                  show_on_profile_page: true,
                  show_on_resume: false,
                },
              ],
            }
          : {}),
        ...(skillTags.length
          ? {
              skill: skillTags.map((skill, index) => ({
                id: `anonymous-skill-${index}`,
                label: skill,
                item_order: index,
                values: {},
                show_on_profile_page: true,
                show_on_resume: false,
              })),
            }
          : {}),
        ...(profile.publicProfessionalLink
          ? {
              "professional-link": [
                {
                  id: "anonymous-link",
                  label: profile.publicProfessionalLink,
                  item_order: 0,
                  values: { url: profile.publicProfessionalLink },
                  show_on_profile_page: true,
                  show_on_resume: false,
                },
              ],
            }
          : {}),
      },
      sectionOrder: ["education", "skill", "professional-link"],
    }),
    [profile, skillTags],
  );
  const updateField = (name: keyof MinimumCredibleProfile, value: string) =>
    setProfile((current) => ({ ...current, [name]: value }));

  return (
    <main className="anonymous-preview-shell dashboard-shell min-h-screen text-[#172033]">
      <header className="dashboard-header border-b border-[#d9d5cb] bg-[#f7f5ef]/90 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-360 items-center justify-between gap-4">
          <Link
            href="/"
            className="brand-mark flex items-center gap-3"
            aria-label="Hatch home"
          >
            <span className="brand-glyph">H</span>
            <span>Hatch</span>
          </Link>
          <span className="preview-mode-badge">Try it out</span>
        </div>
      </header>
      <div className="anonymous-preview-layout mx-auto grid max-w-360 gap-8 px-5 py-8 md:px-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(480px,1.18fr)]">
        <section className="anonymous-editor">
          <div className="dashboard-intro">
            <p className="eyebrow">Try it out</p>
            <h1>Build a starter profile.</h1>
            <p className="intro-copy">
              Enter local details to see how your story comes together. Nothing
              is saved or published until you create an account.
            </p>
          </div>
          <form
            className="profile-elements anonymous-fields mt-6 grid gap-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="section-heading">
              <div>
                <span className="section-number">01</span>
                <h2>Start with the essentials</h2>
                <p>
                  Give people the quick context they need to understand you.
                </p>
              </div>
            </div>
            {fields.map((field) => (
              <label key={field.name} className="block text-sm font-medium">
                {field.label}
                <input
                  className="mt-1 w-full rounded-lg px-3 py-2"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={profile[field.name]}
                  onChange={(event) =>
                    updateField(field.name, event.target.value)
                  }
                />
              </label>
            ))}
            <fieldset className="anonymous-template-fieldset">
              <legend>Choose a Template</legend>
              <label className="radio-label">
                <input
                  type="radio"
                  name="template"
                  checked={template === "recruiter-brief"}
                  onChange={() => setTemplate("recruiter-brief")}
                  aria-label="Quick intro look"
                />{" "}
                Quick intro
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="template"
                  checked={template === "project-showcase"}
                  onChange={() => setTemplate("project-showcase")}
                  aria-label="Project spotlight look"
                />{" "}
                Project spotlight
              </label>
            </fieldset>
          </form>
        </section>
        <section
          aria-label="profile page Preview"
          className="anonymous-preview-panel profile-preview"
        >
          <div className="preview-toolbar">
            <div>
              <p className="preview-toolbar-kicker">
                {template === "recruiter-brief"
                  ? "Quick intro preview"
                  : "Project spotlight preview"}
              </p>
              <p className="preview-toolbar-note">
                Your local preview updates as you type.
              </p>
            </div>
          </div>
          <div
            className={`preview-viewport ${template === "project-showcase" ? "showcase-site" : "recruiter-site"}`}
          >
            {!hasProfileData ? (
              <div className="preview-empty-state">
                <p>
                  Start entering your details to see your profile take shape.
                </p>
              </div>
            ) : template === "recruiter-brief" ? (
              <RecruiterBriefTemplate profile={previewProfile} />
            ) : (
              <ProjectShowcaseTemplate profile={previewProfile} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
