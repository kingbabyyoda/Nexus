import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { createInvite } from '@/lib/invites';

export default async function InvitesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  await requireRole(session.user?.id, 'admin');

  const manageableCommunities = await prisma.member.findMany({
    where: {
      userId: session.user?.id,
      role: { in: ['owner', 'admin'] },
    },
    include: { community: true },
    orderBy: { joinedAt: 'desc' },
  });

  const communityIds = manageableCommunities.map((membership) => membership.community.id);
  const invites = await prisma.invite.findMany({
    where: {
      communityId: { in: communityIds },
    },
    include: {
      community: true,
      acceptedBy: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  async function createInviteAction(formData: FormData) {
    'use server';

    const communityId = String(formData.get('communityId') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const role = String(formData.get('role') || 'member').trim();
    const expiresInHours = String(formData.get('expiresInHours') || '48').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!communityId) {
      return;
    }

    const expirationHours = Number.parseInt(expiresInHours, 10);
    const expiresAt = Number.isFinite(expirationHours) && expirationHours > 0
      ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
      : null;

    await createInvite({
      communityId,
      role,
      email: email || null,
      expiresAt,
    });

    revalidatePath('/dashboard/invites');
    redirect('/dashboard/invites');
  }

  return (
    <main className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Invites</p>
        <h1 className="mt-2 text-4xl font-bold">Invite members</h1>
        <p className="mt-3 text-sm text-slate-400">
          Only owners and admins can manage invite links.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Invite builder</h2>
        <form action={createInviteAction} className="mt-4 space-y-4 text-sm text-slate-300">
          <div className="space-y-2">
            <label className="block text-slate-400" htmlFor="communityId">Community</label>
            <select
              id="communityId"
              name="communityId"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              defaultValue={manageableCommunities[0]?.community.id || ''}
            >
              {manageableCommunities.length === 0 ? (
                <option value="">No communities available</option>
              ) : (
                manageableCommunities.map((membership) => (
                  <option key={membership.community.id} value={membership.community.id}>
                    {membership.community.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-slate-400">Email address</label>
              <input
                name="email"
                type="email"
                placeholder="member@example.com"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-slate-400">Role</label>
              <select
                name="role"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                defaultValue="member"
              >
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400">Expires in hours</label>
            <input
              name="expiresInHours"
              type="number"
              min="1"
              defaultValue="48"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>

          <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
            Generate invite link
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Recent invites</h2>
        <div className="mt-4 space-y-3">
          {invites.length === 0 ? (
            <p className="text-sm text-slate-400">No invites yet.</p>
          ) : (
            invites.map((invite) => (
              <div key={invite.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{invite.community.name}</p>
                    <p className="mt-1 text-slate-400">/{invite.community.slug}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {invite.status}
                  </span>
                </div>
                <p className="mt-3 text-slate-400">Role: {invite.role}</p>
                <p className="mt-1 text-slate-400">Link: /invite/{invite.token}</p>
                <p className="mt-1 text-slate-500">
                  {invite.email || 'Open invite'} ·{' '}
                  {invite.expiresAt ? `Expires ${invite.expiresAt.toLocaleString()}` : 'No expiry'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
