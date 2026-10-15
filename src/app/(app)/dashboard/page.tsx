import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { claimProfileHandle, saveProfileFullName, saveProfileDetails } from "@/features/professional-profile/actions";
import { ProfileIdentityForm } from "@/features/professional-profile/ProfileIdentityForm";
import { ProfileDetailsForm } from "@/features/professional-profile/ProfileDetailsForm";
import { ProfileElementsForm } from "@/features/professional-profile/ProfileElementsForm";
import { saveProfileElement } from "@/features/professional-profile/actions";
import { HandleClaimForm } from "@/features/professional-profile/HandleClaimForm";
import { PrivateProfilePreview } from "@/features/professional-profile/PrivateProfilePreview";
import { loadDraftProfile } from "@/features/professional-profile/profile-view";
import { ensureOneProfessionalProfile, type SupabaseProfileClient } from "@/features/professional-profile/profiles";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const profile = await ensureOneProfessionalProfile(supabase as unknown as SupabaseProfileClient, user.id, user.email ?? "");
  const draft = await loadDraftProfile(supabase as never, profile.id);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><section className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-200">
          Section Editing Dashboard
        </p>
        <h1 className="mt-4 text-4xl font-bold">Draft Profile workspace</h1>
        <p className="mt-4 text-slate-300">
          Your one Professional Profile is ready for Profile Sections, Output Visibility, publishing, and Resume export.
        </p>
        <dl className="mt-8 rounded-2xl bg-slate-900 p-5">
          <dt className="text-sm font-semibold text-slate-400">Full name</dt>
          <dd className="mt-1 text-xl">{profile.full_name}</dd>
        </dl>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:items-start"><div><ProfileIdentityForm initialFullName={profile.full_name ?? ""} save={saveProfileFullName.bind(null, profile.id)} />
        <ProfileDetailsForm initialDetails={{ targetRole: profile.target_role ?? "", headline: profile.headline ?? "", publicProfessionalLink: profile.public_professional_link ?? "", bio: draft.bio }} save={saveProfileDetails.bind(null, profile.id)} />
        <HandleClaimForm
          profileId={profile.id}
          currentHandle={profile.handle ?? null}
          claim={claimProfileHandle}
        />
        <ProfileElementsForm save={saveProfileElement.bind(null, profile.id)} initialItems={draft.elements} />
        </div><PrivateProfilePreview profile={draft} /></div>
      </section>
    </main>
  );
}
