export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-400">
            Nexus
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Community management for Roblox, Discord, and gaming groups.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A clean control panel for members, applications, tickets, events,
            and analytics.
          </p>
          <div className="mt-10 flex gap-4">
            <a
              href="/login"
              className="rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:opacity-90"
            >
              Sign in
            </a>
            <a
              href="/dashboard"
              className="rounded-2xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-900"
            >
              Open dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
