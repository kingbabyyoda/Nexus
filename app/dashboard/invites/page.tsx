import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/access';

export default async function InvitesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  await requireRole(session.user?.id, 'admin');

  return (
    <main className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Invites</p>
        <h1 className="mt-2 text-4xl font-bold">Invite members</h1>
        <p className="mt-3 text-sm text-slate-400">
          Only owners and admins can manage invite links.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Invite builder</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-300">
          <div className="space-y-2">
            <label className="block text-slate-400">Email address</label>
            <input
              type="email"
              placeholder="member@example.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-slate-400">Role</label>
            <select className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none" defaultValue="member">
              <option value="member">Member</option>
              <option value="staff">Staff</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
            Generate invite link
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Latest invite</h2>
        <p className="mt-4 text-sm text-slate-400">Invite storage and sending will connect next.</p>
      </div>
    </main>
  );
}
