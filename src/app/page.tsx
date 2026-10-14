import { redirect } from "next/navigation";

const routeGroups = [
  {
    name: "Draft Profile",
    description: "Private authenticated routes can grow here for editing Profile Sections.",
  },
  {
    name: "Published Profile",
    description: "Public routes can render Profile Snapshot Data for shared Profile Pages.",
  },
  {
    name: "Supabase Ready",
    description: "Client and server helpers are configured for future auth and data slices.",
  },
];

type HomeProps = {
  searchParams?: Promise<{ code?: string; token_hash?: string; type?: string }>;
};

export default async function Home({ searchParams }: HomeProps = {}) {
  const params = await searchParams;
  const callbackParams = new URLSearchParams();

  if (params?.code) callbackParams.set("code", params.code);
  if (params?.token_hash) callbackParams.set("token_hash", params.token_hash);
  if (params?.type) callbackParams.set("type", params.type);

  if (callbackParams.size > 0) {
    redirect("/auth/callback?" + callbackParams.toString());
  }
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-4 inline-flex w-fit rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-200">
          App shell is healthy
        </p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Professional Profile Hub
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          A deployable Next.js app foundation for helping students turn one Professional Profile into polished public and exportable outputs.
        </p>
        <a className="mt-8 inline-flex w-fit rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200" href="/preview">
          Try the Anonymous Preview
        </a>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {routeGroups.map((group) => (
            <article key={group.name} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{group.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
