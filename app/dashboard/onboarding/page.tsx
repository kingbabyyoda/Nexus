import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <main className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Getting started</p>
        <h1 className="mt-2 text-4xl font-bold">Welcome to Nexus</h1>
        <p className="mt-3 text-sm text-slate-400">
          Set up your first community, then start adding members, applications, and tickets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">1. Create a community</h2>
          <p className="mt-3 text-sm text-slate-300">
            Give your workspace a name and a short description.
          </p>
          <Link
            href="/dashboard/communities/new"
            className="mt-6 inline-block rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Create community
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">2. Invite people</h2>
          <p className="mt-3 text-sm text-slate-300">
            Once the community exists, bring in staff and members.
          </p>
          <Link
            href="/dashboard/invites"
            className="mt-6 inline-block rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-white"
          >
            Go to invites
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">3. Build your workflow</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">Applications</div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">Tickets</div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">Events</div>
        </div>
      </div>
    </main>
  );
}
