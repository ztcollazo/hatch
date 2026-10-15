import type { DraftElement, DraftProject } from "./profile-view";

export type ProfileTemplateProfile = {
  full_name: string | null;
  target_role: string | null;
  headline: string | null;
  bio: string;
  projects: DraftProject[];
  elements: Record<string, DraftElement[]>;
  public_professional_link?: string | null;
};

const titles: Record<string, string> = {
  education: "Education",
  experience: "Experience",
  skill: "Skills",
  "professional-link": "Selected links",
  contact: "Contact",
};

function Elements({ elements }: { elements: Record<string, DraftElement[]> }) {
  return <div className="preview-elements">{Object.entries(elements).map(([kind, items]) => items.length > 0 && (
    <section className={`preview-element-group preview-element-group--${kind}`} key={kind}>
      <div className="preview-element-group-heading"><p className="site-eyebrow">{titles[kind] ?? "Highlights"}</p><span>{String(items.length).padStart(2, "0")}</span></div>
      <div className={kind === "skill" ? "preview-skill-list flex gap-3" : "preview-element-card-list"}>
        {items.map((item) => kind === "skill" ? <span className="preview-skill-pill" key={item.id}>{item.label}</span> : <article className="preview-element-card" key={item.id}><h4>{item.label}</h4>{Object.entries(item.values).map(([key, value]) => <p key={key}>{value}</p>)}</article>)}
      </div>
    </section>
  ))}</div>;
}

function Projects({ profile, showcase }: { profile: ProfileTemplateProfile; showcase?: boolean }) {
  const projects = profile.projects.filter((project) => project.show_on_profile_page).sort((a, b) => a.item_order - b.item_order);
  return <div className={showcase ? "showcase-project-grid" : "recruiter-project-list"}>
    {projects.map((project, index) => <article className="preview-project" key={project.id}>
      {showcase && <span className="project-number">0{index + 1}</span>}
      <h3>{project.title}</h3>{project.summary && <p>{project.summary}</p>}
      {project.url && <a href={project.url} target="_blank" rel="noreferrer" className="font-bold text-xs mt-4">View project</a>}
    </article>)}
  </div>;
}

export function RecruiterBriefTemplate({ profile }: { profile: ProfileTemplateProfile }) {
  return <article className="preview-site recruiter-site">
    <header className="recruiter-hero"><div><p className="site-eyebrow">Professional profile</p><h2>{profile.full_name || "Your name"}</h2><p className="recruiter-role">{profile.target_role || "Your target role"}</p></div><span className="availability-badge">Open to opportunities</span></header>
    <div className="recruiter-content"><section className="recruiter-summary"><h3>Profile summary</h3><p>{profile.headline || "Your professional headline will appear here."}</p>{profile.bio && <p>{profile.bio}</p>}</section><section className="recruiter-projects"><div className="site-section-heading"><p className="site-eyebrow">Relevant work</p><h3>Selected projects</h3></div><Projects profile={profile} /></section><Elements elements={profile.elements} /></div>
  </article>;
}

export function ProjectShowcaseTemplate({ profile }: { profile: ProfileTemplateProfile }) {
  return <article className="preview-site showcase-site">
    <header className="showcase-hero"><p className="site-eyebrow">Project Showcase / 2026</p><h2>{profile.full_name || "Your name"}</h2><p className="showcase-role">{profile.target_role || "Your target role"}</p><p className="showcase-headline">{profile.headline || "A thoughtful maker building useful things."}</p></header>
    <div className="showcase-content">{profile.bio && <p className="showcase-bio">{profile.bio}</p>}<section className="showcase-projects"><div className="site-section-heading"><p className="site-eyebrow">Selected work</p><h3>Projects with a point of view.</h3></div><Projects profile={profile} showcase /></section><Elements elements={profile.elements} /></div>
  </article>;
}
