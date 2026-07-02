import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCommunities } from '@/lib/communities';

export default async function DashboardPage() {
  const [session, communities] = await Promise.all([
    getServerSession(authOptions),
    getCommunities(),
  ]);

  const totals = communities.reduce(
    (acc, community) => {
      acc.members += community._count.members;
      acc.applications += community._count.applications;
      acc.tickets += community._count.tickets;
      acc.events += community._count.events;
      return acc;
    },
    { members: 0, applications: 0, tickets: 0, events: 0 },
  );

  const stats = [
    { label: 'Communities', value: String(communities.length) },
    { label: 'Members', value: String(totals.members) },
    { label: 'Applications', value: String(totals.applications) },
    { label: 'Tickets', value: String(totals.tickets) },
  ];

  return (
    <main className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Overview</p>
          <h1 className="mt-2 text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            {session?.user?.name || session?.user?.email || 'Your workspace'}
          </p>
        </div>
        <Link
          href="/dashboard/communities/new"
          className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950"
        >
          Create community
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {communities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8">
          <h2 className="text-xl font-semibold">You are almost there</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Create your first community to unlock members, invites, applications, and tickets.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/onboarding"
              className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950"
            >
              Start onboarding
            </Link>
            <Link
              href="/dashboard/communities/new"
              className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-white"
            >
              Create community
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Your communities</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {communities.map((community) => (
                <div key={community.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{community.name}</p>
                      <p className="mt-1 text-slate-400">/{community.slug}</p>
                    </div>
                    <Link
                      href={`/dashboard/communities/${community.id}/settings`}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400"
                    >
                      Settings
                    </Link>
                  </div>
                  <p className="mt-2 text-slate-300">{community.description || 'No description yet.'}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {community._count.members} members · {community._count.applications} applications ·{' '}
                    {community._count.tickets} tickets
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Next steps</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <p>• Enforce roles on invites, members, and permissions pages</p>
              <p>• Connect Discord OAuth</p>
              <p>• Build application forms</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
