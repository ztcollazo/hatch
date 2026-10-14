import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { claimProfileHandle } from "@/features/professional-profile/actions";
import { HandleClaimForm } from "@/features/professional-profile/HandleClaimForm";
import { ProfileSectionEditor } from "@/features/professional-profile/ProfileSectionEditor";
import { ensureOneProfessionalProfile, type SupabaseProfileClient } from "@/features/professional-profile/profiles";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const profile = await ensureOneProfessionalProfile(supabase as unknown as SupabaseProfileClient, user.id, user.email ?? "");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
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
        <HandleClaimForm
          profileId={profile.id}
          currentHandle={profile.handle ?? null}
          claim={claimProfileHandle}
        />
        <ProfileSectionEditor profileId={profile.id} />
      </section>
    </main>
  );
}
