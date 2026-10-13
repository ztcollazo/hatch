type PublicProfilePageProps = {
  params: Promise<{ handle: string }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { handle } = await params;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-200">
          Published Profile placeholder
        </p>
        <h1 className="mt-4 text-4xl font-bold">/{handle}</h1>
        <p className="mt-4 text-slate-300">
          Future slices can render Profile Snapshot Data for this Handle here.
        </p>
      </section>
    </main>
  );
}
