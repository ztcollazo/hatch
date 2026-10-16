import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  claimProfileHandle,
  publishProfileSnapshot,
  saveProfileTemplate,
  saveProfileFullName,
  saveProfileDetails,
} from "@/features/professional-profile/actions";
import { ProfileIdentityForm } from "@/features/professional-profile/ProfileIdentityForm";
import { ProfileDetailsForm } from "@/features/professional-profile/ProfileDetailsForm";
import { ProfileElementsForm } from "@/features/professional-profile/ProfileElementsForm";
import { ProfileProjectsForm } from "@/features/professional-profile/ProfileProjectsForm";
import {
  saveProfileElement,
  saveProfileProject,
} from "@/features/professional-profile/actions";
import { HandleClaimForm } from "@/features/professional-profile/HandleClaimForm";
import { PrivateProfilePreview } from "@/features/professional-profile/PrivateProfilePreview";
import { loadDraftProfile } from "@/features/professional-profile/profile-view";
import {
  ensureOneProfessionalProfile,
  type SupabaseProfileClient,
} from "@/features/professional-profile/profiles";
import { TemplateSelector } from "@/features/professional-profile/TemplateSelector";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const profile = await ensureOneProfessionalProfile(
    supabase as unknown as SupabaseProfileClient,
    user.id,
    user.email ?? "",
  );
  const draft = await loadDraftProfile(supabase as never, profile.id);
  const selectedTemplate = profile.profile_template ?? "recruiter-brief";
  const completed = [
    profile.full_name,
    profile.target_role,
    profile.headline,
    draft.bio,
    profile.handle,
  ].filter(Boolean).length;

  const publishProfile = async (formData: FormData) => {
    "use server";
    const template = formData.get("template");
    await publishProfileSnapshot(
      profile.id,
      template === "project-showcase" ? "project-showcase" : "recruiter-brief",
    );
  };

  return (
    <main className="dashboard-shell min-h-screen text-[#172033]">
      <header className="dashboard-header border-b border-[#d9d5cb] bg-[#f7f5ef]/90 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <Link
            href="/"
            className="brand-mark flex items-center gap-3"
            aria-label="Profile Hub home"
          >
            <span className="brand-glyph">P</span>
            <span>Profile Hub</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-[#6b7280]">
            <span className="hidden sm:inline">{user.email}</span>
            <span className="avatar">
              {(profile.full_name || user.email || "P").charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-8 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(480px,50vw)]">
        <section id="overview" className="min-w-0">
          <div className="dashboard-intro">
            <p className="eyebrow">Your professional home</p>
            <h1>
              Shape a profile
              <br />
              <em>worth remembering.</em>
            </h1>
            <p className="intro-copy">
              A clear place to tell your story, show your strengths, and make
              the next opportunity easier to find.
            </p>
          </div>
          <div className="mobile-progress lg:hidden">
            <div>
              <span>Profile progress</span>
              <strong>{completed}/5 essentials</strong>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[#dfddd6]">
              <div
                className="h-full rounded-full bg-[#3157d5]"
                style={{ width: `${Math.max(18, completed * 20)}%` }}
              />
            </div>
          </div>

          <div id="basics" className="editor-stack">
            <div className="section-heading">
              <div>
                <span className="section-number">01</span>
                <h2>Start with the essentials</h2>
                <p>
                  Give people the quick context they need to understand you.
                </p>
              </div>
              <span className="status-pill">
                {profile.full_name ? "Completed" : "Not started"}
              </span>
            </div>
            <ProfileIdentityForm
              initialFullName={profile.full_name ?? ""}
              save={saveProfileFullName.bind(null, profile.id)}
            />
            <ProfileDetailsForm
              initialDetails={{
                targetRole: profile.target_role ?? "",
                headline: profile.headline ?? "",
                publicProfessionalLink: profile.public_professional_link ?? "",
                bio: draft.bio,
              }}
              save={saveProfileDetails.bind(null, profile.id)}
            />
            <HandleClaimForm
              profileId={profile.id}
              currentHandle={profile.handle ?? null}
              claim={claimProfileHandle}
            />
            <form action={publishProfile} className="mt-6">
              <TemplateSelector selectedTemplate={selectedTemplate} />
              <button
                type="submit"
                className="rounded-full bg-[#3157d5] px-5 py-3 font-semibold text-white"
              >
                Publish Profile Page
              </button>
              <p className="mt-2 text-sm text-[#6b7280]">
                Publishing makes the completed checklist visible at /u/
                {profile.handle ?? "your-handle"}.
              </p>
            </form>
          </div>
          <div id="elements" className="editor-stack">
            <div className="section-heading">
              <div>
                <span className="section-number">02</span>
                <h2>Add proof to your story</h2>
                <p>
                  Experience, skills, and links turn a description into a point
                  of view.
                </p>
              </div>
            </div>
            <ProfileElementsForm
              save={saveProfileElement.bind(null, profile.id)}
              initialItems={draft.elements}
            />
            <ProfileProjectsForm
              projects={draft.projects}
              save={saveProfileProject.bind(null, profile.id)}
            />
          </div>
        </section>

        <aside id="preview" className="preview-column">
          <div className="preview-sticky">
            <PrivateProfilePreview profile={draft} />
          </div>
        </aside>
      </div>
    </main>
  );
}
