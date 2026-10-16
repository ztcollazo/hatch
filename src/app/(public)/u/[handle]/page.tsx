import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadPublishedProfile } from "@/features/professional-profile/snapshots";
import {
  ProjectShowcaseTemplate,
  RecruiterBriefTemplate,
} from "@/features/professional-profile/ProfileTemplates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await loadPublishedProfile(
    (await createClient()) as never,
    handle,
  );
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.full_name} · ${profile.target_role}`,
    description: profile.headline ?? "Professional Profile",
    robots: profile.search_indexing ? "index, follow" : "noindex, nofollow",
    openGraph: {
      title: `${profile.full_name} · ${profile.target_role}`,
      description: profile.headline ?? "Professional Profile",
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await loadPublishedProfile(
    (await createClient()) as never,
    handle,
  );
  if (!profile) notFound();
  return (
    <main aria-label="Published profile" className="min-h-screen w-full py-0">
      {profile.profile_template === "project-showcase" ? (
        <ProjectShowcaseTemplate profile={profile} />
      ) : (
        <RecruiterBriefTemplate profile={profile} />
      )}
    </main>
  );
}
