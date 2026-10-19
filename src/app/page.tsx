import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

const routeGroups = [
  {
    name: "Draft",
    description: "Shape your story in a private workspace before you share it.",
  },
  {
    name: "Published profile",
    description: "Turn one profile into a polished page people can remember.",
  },
  {
    name: "Ready to share",
    description: "Your profile is ready to share.",
  },
];

type HomeProps = {
  searchParams?: Promise<{ code?: string; token_hash?: string; type?: string }>;
};

export default async function Home({ searchParams }: HomeProps = {}) {
  const supabase = await createClient();
  if ((await supabase.auth.getUser()).data?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackParams = new URLSearchParams();
  if (params?.code) callbackParams.set("code", params.code);
  if (params?.token_hash) callbackParams.set("token_hash", params.token_hash);
  if (params?.type) callbackParams.set("type", params.type);
  if (callbackParams.size > 0)
    redirect("/auth/callback?" + callbackParams.toString());

  return (
    <main className="marketing-shell">
      <header className="site-header">
        <Link href="/" className="brand-mark flex items-center gap-3">
          <span className="brand-glyph">H</span>
          <span>Hatch</span>
        </Link>
        <Link href="/auth/sign-in" className="header-link">
          Sign in
        </Link>
      </header>
      <h2 className="sr-only">Hatch</h2>
      <p className="sr-only">App shell is healthy.</p>
      <section className="marketing-hero">
        <p className="eyebrow">A better starting point</p>
        <h1>
          Make your next
          <br />
          <em>opportunity easier</em> to find.
        </h1>
        <p className="marketing-lede">
          A clear, thoughtful home for your work, your point of view, and the
          details that make you memorable.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/preview">
            Try it out
          </Link>
          <Link className="text-link" href="/auth/sign-in">
            Get started <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="route-grid">
        {routeGroups.map((group) => (
          <article className="feature-card" key={group.name}>
            <span className="feature-dot" />
            <h2>{group.name}</h2>
            <p>{group.description}</p>
          </article>
        ))}
      </section>
      <footer className="site-footer">
        <span>Hatch</span>
        <span>Build something worth remembering.</span>
      </footer>
    </main>
  );
}
