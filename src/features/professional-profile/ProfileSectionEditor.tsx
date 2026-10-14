"use client";

import { useMemo, useState } from "react";

type ProjectItem = {
  id: string;
  title: string;
  summary: string;
  itemOrder: number;
  showOnProfilePage: boolean;
  showOnResume: boolean;
};

type Props = { profileId: string };

export function ProfileSectionEditor({ profileId }: Props) {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [profileImageAltText, setProfileImageAltText] = useState("");
  const [profileImageStoragePath, setProfileImageStoragePath] = useState("");
  const hasProfileImageMetadata = profileImageAltText.trim() || profileImageStoragePath.trim();

  const orderedProjects = useMemo(() => [...projects].sort((a, b) => a.itemOrder - b.itemOrder), [projects]);

  function addProject() {
    if (!projectTitle.trim()) return;
    setProjects((current) => [
      ...current,
      {
        id: profileId + "-project-" + (current.length + 1),
        title: projectTitle,
        summary: projectSummary,
        itemOrder: current.length,
        showOnProfilePage: true,
        showOnResume: false,
      },
    ]);
    setProjectTitle("");
    setProjectSummary("");
  }

  function toggleResume(projectId: string) {
    setProjects((current) => current.map((project) => project.id === projectId ? { ...project, showOnResume: !project.showOnResume } : project));
  }

  function moveProjectUp(projectId: string) {
    setProjects((current) => current.map((project) => project.id === projectId ? { ...project, itemOrder: Math.max(0, project.itemOrder - 1) } : project));
  }

  function removeProject(projectId: string) {
    setProjects((current) => current.filter((project) => project.id !== projectId).map((project, index) => ({ ...project, itemOrder: index })));
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900 p-5">
      <h2 className="text-2xl font-bold">Profile Sections</h2>
      <p className="mt-2 text-sm text-slate-300">Edit typed Profile Sections with Item Order and Output Visibility.</p>

      <div className="mt-6 grid gap-4">
        <label className="block text-sm font-semibold">
          Project title
          <input className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} />
        </label>
        <label className="block text-sm font-semibold">
          Project summary
          <textarea className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" value={projectSummary} onChange={(event) => setProjectSummary(event.target.value)} />
        </label>
        <button className="w-fit rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950" type="button" onClick={addProject}>Add Project</button>
      </div>

      <ul className="mt-6 space-y-4">
        {orderedProjects.map((project) => (
          <li key={project.id} className="rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="mt-1 text-slate-300">{project.summary}</p>
            <p className="mt-2 text-sm text-slate-400">Item Order: {project.itemOrder}</p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={project.showOnResume} onChange={() => toggleResume(project.id)} />
              Show Project on Resume
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={project.showOnProfilePage} readOnly />
              Show Project on Profile Page
            </label>
            <div className="mt-4 flex gap-2">
              <button className="rounded-full border border-white/20 px-4 py-2 text-sm" type="button" onClick={() => moveProjectUp(project.id)}>Move Project Up</button>
              <button className="rounded-full border border-red-200/40 px-4 py-2 text-sm text-red-100" type="button" onClick={() => removeProject(project.id)}>Remove Project</button>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-xl border border-white/10 p-4">
        <h3 className="text-lg font-semibold">Profile Image metadata</h3>
        <label className="mt-4 block text-sm font-semibold">
          Profile Image alt text
          <input className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" value={profileImageAltText} onChange={(event) => setProfileImageAltText(event.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Profile Image storage path
          <input className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" value={profileImageStoragePath} onChange={(event) => setProfileImageStoragePath(event.target.value)} />
        </label>
        {hasProfileImageMetadata && <p className="mt-3 text-emerald-200">Profile Image metadata ready without requiring upload completion.</p>}
      </section>
    </section>
  );
}
