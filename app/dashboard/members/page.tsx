import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/access';
import type { CommunityRole } from '@/lib/permissions';

const EDITABLE_ROLES: CommunityRole[] = ['owner', 'admin', 'moderator', 'member'];

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  await requireRole(session.user?.id, 'moderator');

  async function updateMemberRoleAction(formData: FormData) {
    'use server';

    const memberId = String(formData.get('memberId') || '').trim();
    const role = String(formData.get('role') || 'member').trim() as CommunityRole;

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!memberId || !EDITABLE_ROLES.includes(role)) {
      return;
    }

    await prisma.member.update({
      where: { id: memberId },
      data: { role },
    });

    revalidatePath('/dashboard/members');
    redirect('/dashboard/members');
  }

  async function removeMemberAction(formData: FormData) {
    'use server';

    const memberId = String(formData.get('memberId') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!memberId) {
      return;
    }

    await prisma.member.delete({
      where: { id: memberId },
    });

    revalidatePath('/dashboard/members');
    redirect('/dashboard/members');
  }

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
        <p className="mt-3 text-sm text-slate-400">
          Moderators can view members. Admins and owners can change roles or remove members.
        </p>
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

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <form action={updateMemberRoleAction} className="flex flex-wrap gap-3">
                    <input type="hidden" name="memberId" value={member.id} />
                    <select
                      name="role"
                      defaultValue={member.role}
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-white"
                    >
                      Update role
                    </button>
                  </form>

                  <form action={removeMemberAction}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <button
                      type="submit"
                      className="rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
