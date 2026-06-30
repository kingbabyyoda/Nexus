import { prisma } from '@/lib/prisma';

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { joinedAt: 'desc' },
    include: {
      user: true,
      community: true,
    },
  });

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Members</p>
        <h1 className="mt-2 text-4xl font-bold">Member management</h1>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">All members</h2>
            <p className="mt-1 text-sm text-slate-400">People linked to communities in Nexus.</p>
          </div>
          <a
            href="/dashboard/invites"
            className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Invite member
          </a>
        </div>

        <div className="mt-6 space-y-3 text-sm text-slate-300">
          {members.length === 0 ? (
            <p>No members yet. They will appear here after you connect them to a community.</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {member.user.name || member.user.email || member.user.id}
                    </p>
                    <p className="text-slate-400">{member.community.name}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {member.role}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Joined {member.joinedAt.toLocaleDateString()} · Community /{member.community.slug}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
