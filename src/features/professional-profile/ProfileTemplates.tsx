import type { DraftElement, DraftProject } from "./profile-view";

export type ProfileTemplateProfile = {
  full_name: string | null;
  target_role: string | null;
  headline: string | null;
  bio: string;
  projects?: DraftProject[] | null;
  elements?: Record<string, DraftElement[]> | null;
  sectionOrder?: string[];
  public_professional_link?: string | null;
};

const elementTitles: Record<string, string> = {
  education: "Education",
  experience: "Experience",
  skill: "Skills",
  "professional-link": "Selected links",
  contact: "Contact",
};
const fieldLabels: Record<string, string> = {
  schoolName: "School",
  degree: "Degree",
  fieldOfStudy: "Field of study",
  startDate: "Started",
  endDate: "Ended",
  roleTitle: "Role",
  organization: "Organization",
  summary: "About",
  url: "Link",
  linkType: "Type",
  actionType: "Action",
};
const getTypeLabel = (value?: string) =>
  ({
    linkedin: "LinkedIn",
    github: "GitHub",
    portfolio: "Portfolio",
    website: "Personal website",
    email: "Email me",
    calendar: "Book a call",
    phone: "Call me",
    other: "Other",
  })[value ?? ""] ?? "Open link";

function ElementCard({ kind, item }: { kind: string; item: DraftElement }) {
  const values = Object.entries(item.values ?? {}).filter(
    ([key, value]) => key !== "label" && key !== "id" && Boolean(value),
  );
  if (kind === "skill")
    return <span className="preview-skill-pill">{item.label}</span>;
  if (kind === "professional-link" || kind === "contact")
    return (
      <a
        className={`preview-action-card preview-action-card--${kind}`}
        href={item.values?.url}
        target="_blank"
        rel="noreferrer"
      >
        <span className="preview-action-icon">↗</span>
        <span className="preview-action-content">
          <strong>{item.label}</strong>
          <small>
            {getTypeLabel(item.values?.linkType || item.values?.actionType)}
          </small>
        </span>
        <span className="preview-action-arrow" aria-hidden="true">
          →
        </span>
      </a>
    );
  return (
    <article className={`preview-element-card preview-element-card--${kind}`}>
      <div className="preview-element-card-heading">
        <div>
          <h4>{item.label}</h4>
          {kind === "education" && item.values?.degree && (
            <p>
              {item.values.degree}
              {item.values.fieldOfStudy ? ` · ${item.values.fieldOfStudy}` : ""}
            </p>
          )}
          {kind === "experience" && item.values?.organization && (
            <p>{item.values.organization}</p>
          )}
        </div>
      </div>
      {values.length > 0 && (
        <dl className="preview-element-facts">
          {values.map(
            ([key, value]) =>
              fieldLabels[key] && (
                <div key={key}>
                  <dt>{fieldLabels[key]}</dt>
                  <dd>{value}</dd>
                </div>
              ),
          )}
        </dl>
      )}
    </article>
  );
}

function ElementList({
  elements,
  sectionOrder,
}: {
  elements?: Record<string, DraftElement[]> | null;
  sectionOrder?: string[];
}) {
  const normalized = Object.fromEntries(
    Object.entries(elements ?? {}).map(([kind, items]) => [
      kind,
      (Array.isArray(items) ? items : [])
        .map((item) => ({
          ...item,
          item_order: item.item_order ?? 0,
          values: item.values ?? {},
        }))
        .sort((a, b) => a.item_order - b.item_order),
    ]),
  );
  const orderedKinds = [
    ...(sectionOrder ?? Object.keys(normalized)),
    ...Object.keys(normalized).filter((kind) => !(sectionOrder ?? []).includes(kind)),
  ];
  return (
    <div className="preview-elements">
      {orderedKinds.map((kind) => {
        const items = normalized[kind] ?? [];
        if (items.length === 0) return null;
        return (
          <section
            className={`preview-element-group preview-element-group--${kind}`}
            key={kind}
          >
            <div className="preview-element-group-heading">
              <p className="site-eyebrow">
                {elementTitles[kind] ?? "Highlights"}
              </p>
              <span>{String(items.length).padStart(2, "0")}</span>
            </div>
            {kind === "skill" ? (
              <div className="preview-skill-list flex gap-3">
                {items.map((item) => (
                  <ElementCard key={item.id} kind={kind} item={item} />
                ))}
              </div>
            ) : (
              <div className="preview-element-card-list">
                {items.map((item) => (
                  <ElementCard key={item.id} kind={kind} item={item} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function ProjectCards({
  profile,
  showcase = false,
}: {
  profile: ProfileTemplateProfile;
  showcase?: boolean;
}) {
  const projects = (profile.projects ?? [])
    .filter((project) => project.show_on_profile_page)
    .sort((a, b) => a.item_order - b.item_order);
  if (projects.length === 0)
    return (
      <p className="preview-empty">Your published projects will appear here.</p>
    );
  return (
    <div
      className={showcase ? "showcase-project-grid" : "recruiter-project-list"}
    >
      {projects.map((project, index) => (
        <article className="preview-project" key={project.id}>
          {showcase && <span className="project-number">0{index + 1}</span>}
          <h3>{project.title}</h3>
          {project.summary && <p>{project.summary}</p>}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-xs mt-4"
            >
              View project
            </a>
          )}
        </article>
      ))}
    </div>
  );
}

export function RecruiterBriefTemplate({
  profile,
}: {
  profile: ProfileTemplateProfile;
}) {
  return (
    <article className="preview-site">
      <header className="recruiter-hero">
        <div>
          <p className="site-eyebrow">Professional profile</p>
          <h2>{profile.full_name || "Your name"}</h2>
          <p className="recruiter-role">
            {profile.target_role || "Your target role"}
          </p>
        </div>
        <span className="availability-badge">Open to opportunities</span>
      </header>
      <div className="recruiter-content">
        <section className="recruiter-summary">
          <h3>Profile summary</h3>
          <p>
            {profile.headline || "Your professional headline will appear here."}
          </p>
          {profile.bio && <p>{profile.bio}</p>}
        </section>
        <section className="recruiter-projects">
          <div className="site-section-heading">
            <p className="site-eyebrow">Relevant work</p>
            <h3>Selected projects</h3>
          </div>
          <ProjectCards profile={profile} />
        </section>
        <ElementList elements={profile.elements} sectionOrder={profile.sectionOrder} />
      </div>
    </article>
  );
}

export function ProjectShowcaseTemplate({
  profile,
}: {
  profile: ProfileTemplateProfile;
}) {
  return (
    <article className="preview-site">
      <header className="showcase-hero">
        <p className="site-eyebrow">Project Showcase / 2026</p>
        <h2>{profile.full_name || "Your name"}</h2>
        <p className="showcase-role">
          {profile.target_role || "Your target role"}
        </p>
        <p className="showcase-headline">
          {profile.headline || "A thoughtful maker building useful things."}
        </p>
      </header>
      <div className="showcase-content">
        {profile.bio && <p className="showcase-bio">{profile.bio}</p>}
        <section className="showcase-projects">
          <div className="site-section-heading">
            <p className="site-eyebrow">Selected work</p>
            <h3>Projects with a point of view.</h3>
          </div>
          <ProjectCards profile={profile} showcase />
        </section>
        <ElementList elements={profile.elements} sectionOrder={profile.sectionOrder} />
      </div>
    </article>
  );
}
