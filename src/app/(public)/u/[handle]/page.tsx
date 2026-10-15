import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadPublishedProfile } from "@/features/professional-profile/snapshots";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const profile = await loadPublishedProfile((await createClient()) as never, handle);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.full_name} · ${profile.target_role}`,
    description: profile.headline ?? "Professional Profile",
    robots: profile.search_indexing ? "index, follow" : "noindex, nofollow",
    openGraph: { title: `${profile.full_name} · ${profile.target_role}`, description: profile.headline ?? "Professional Profile", type: "profile" },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await loadPublishedProfile((await createClient()) as never, handle);
  if (!profile) notFound();
  return (
    <main aria-label="Published profile" className="mx-auto max-w-3xl px-6 py-16">
      {profile.profile_template === "project-showcase" ? (
        <>
          <p className="text-sm uppercase tracking-widest">Project Showcase</p>
          <h1 className="mt-3 text-5xl font-bold">{profile.full_name}</h1>
          <p className="mt-4 text-xl">{profile.headline}</p>
          {profile.bio && <p className="mt-8 whitespace-pre-wrap">{profile.bio}</p>}
          <section className="mt-10"><h2>Selected work</h2>{profile.projects.map((project) => <article key={project.id}><h3>{project.title}</h3><p>{project.summary}</p></article>)}</section>
        </>
      ) : (
        <>
          <p className="text-sm uppercase tracking-widest">Professional Profile</p>
          <h1 className="mt-3 text-5xl font-bold">{profile.full_name}</h1>
          <p className="mt-4 text-xl">{profile.target_role}</p>
          <p className="mt-2">{profile.headline}</p>
          {profile.bio && <p className="mt-8 whitespace-pre-wrap">{profile.bio}</p>}
          {profile.projects.length > 0 && <section className="mt-10"><h2>Selected projects</h2>{profile.projects.map((project) => <article key={project.id}><h3>{project.title}</h3><p>{project.summary}</p></article>)}</section>}
        </>
      )}
    </main>
  );
}
