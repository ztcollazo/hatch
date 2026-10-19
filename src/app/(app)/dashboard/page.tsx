import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  claimProfileHandle,
  publishProfileSnapshot,
  unpublishProfile,
  deleteProfileData,
  saveProfileFullName,
  saveProfileDetails,
  saveProfileImage,
  removeProfileImage,
  updateProfileImageVisibility,
  reorderProfileElements,
  updateProfileElementVisibility,
  reorderProfileSections,
  saveProfileElement,
} from "@/features/professional-profile/actions";
import { ProfileIdentityForm } from "@/features/professional-profile/ProfileIdentityForm";
import { ProfileDetailsForm } from "@/features/professional-profile/ProfileDetailsForm";
import { ProfileImageForm } from "@/features/professional-profile/ProfileImageForm";
import { ProfileElementsForm } from "@/features/professional-profile/ProfileElementsForm";
import { HandleClaimForm } from "@/features/professional-profile/HandleClaimForm";
import { PreviewSwitcher } from "@/features/professional-profile/PreviewSwitcher";
import { loadDraftProfile } from "@/features/professional-profile/profile-view";
import {
  ensureOneProfessionalProfile,
  type SupabaseProfileClient,
} from "@/features/professional-profile/profiles";
import { PublishSnapshotForm } from "@/features/professional-profile/PublishSnapshotForm";
import { ProfileAccountActions } from "@/features/professional-profile/ProfileAccountActions";
import { draftToResumeData } from "@/features/professional-profile/resume-schema";
import type { ProfileElementInput, ProfileElementKind } from "@/features/professional-profile/domain/profile-types";

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
  const imageMetadata = await supabase.from("profile_image_metadata").select("storage_path,alt_text,show_on_profile_page,show_on_resume").eq("profile_id", profile.id).maybeSingle();
  if (imageMetadata.error) throw new Error(imageMetadata.error.message);
  const image = imageMetadata.data?.storage_path ? { path: imageMetadata.data.storage_path, altText: imageMetadata.data.alt_text ?? "Profile image", showOnProfilePage: imageMetadata.data.show_on_profile_page !== false, showOnResume: imageMetadata.data.show_on_resume === true } : null;
  const saveImage = async (path: string, altText: string, visibility: { showOnProfilePage: boolean; showOnResume: boolean }) => { "use server"; return saveProfileImage(profile.id, path, altText, visibility); };
  const removeImage = async () => { "use server"; return removeProfileImage(profile.id); };
  const updateImageVisibility = async (visibility: { showOnProfilePage: boolean; showOnResume: boolean }) => { "use server"; return updateProfileImageVisibility(profile.id, visibility); };
  const publishedSnapshot = await supabase
    .from("profile_snapshots")
    .select("id")
    .eq("profile_id", profile.id)
    .limit(1)
    .maybeSingle();
  const selectedTemplate = profile.profile_template ?? "recruiter-brief";
  const completed = [
    profile.full_name,
    profile.target_role,
    profile.headline,
    draft.bio,
    profile.handle,
  ].filter(Boolean).length;

  // Keep the action boundary in the server component. Passing a bound imported
  // action through a client component can lose the profile-specific arguments;
  // these wrappers bind the profile once and remain proper server actions.
  const publishProfile = async (formData: FormData) => {
    "use server";
    const template = formData.get("template");
    const result = await publishProfileSnapshot(
      profile.id,
      template === "project-showcase" ? "project-showcase" : "recruiter-brief",
    );
    if (!result.ok) return result;
    return { ok: true as const, publishedAt: new Date().toISOString() };
  };
  const unpublish = async () => {
    "use server";
    return unpublishProfile(profile.id);
  };
  const deleteProfile = async () => {
    "use server";
    const result = await deleteProfileData(profile.id);
    if (result.ok) redirect("/");
    return result;
  };
  const reorderItems = async (
    kind: ProfileElementKind,
    ids: string[],
  ) => {
    "use server";
    return reorderProfileElements(profile.id, kind, ids);
  };
  const reorderSections = async (
    kinds: ProfileElementKind[],
  ) => {
    "use server";
    return reorderProfileSections(profile.id, kinds);
  };
  const updateVisibility = async (kind: ProfileElementKind, id: string, visibility: { showOnProfilePage: boolean; showOnResume: boolean }) => { "use server"; return updateProfileElementVisibility(profile.id, kind, id, visibility); };
  const saveElement = async (
    kind: ProfileElementKind,
    values: ProfileElementInput,
  ) => {
    "use server";
    return saveProfileElement(profile.id, kind, values);
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
            <ProfileImageForm profileId={profile.id} initialImage={image} save={saveImage} remove={removeImage} updateVisibility={updateImageVisibility} />
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
            <PublishSnapshotForm
              action={publishProfile}
              handle={profile.handle ?? null}
              selectedTemplate={selectedTemplate}
            />
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
              profileId={profile.id}
              reorderItemsAction={reorderItems}
              reorderSectionsAction={reorderSections}
              saveAction={saveElement}
              visibilityAction={updateVisibility}
              initialSectionOrder={
                draft.sectionOrder as ProfileElementKind[]
              }
              initialItems={{
                ...draft.elements,
                project: draft.projects.map((project) => ({
                  id: project.id,
                  label: project.title,
                  values: {
                    title: project.title,
                    summary: project.summary ?? "",
                    url: project.url ?? "",
                  },
                  show_on_profile_page: project.show_on_profile_page,
                  show_on_resume: project.show_on_resume,
                })),
              }}
            />
          </div>
          <ProfileAccountActions
            unpublish={unpublish}
            deleteProfile={deleteProfile}
            published={Boolean(publishedSnapshot.data)}
          />
        </section>

        <aside id="preview" className="preview-column">
          <div className="preview-sticky">
            <PreviewSwitcher profile={draft} resume={draftToResumeData(draft)} />
          </div>
        </aside>
      </div>
    </main>
  );
}
