import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { acceptInvite, getInviteByToken } from '@/lib/invites';

export default async function InviteJoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getServerSession(authOptions);
  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-bold">Invite not found</h1>
          <p className="mt-3 text-sm text-slate-400">That invite link is invalid or has been removed.</p>
          <Link href="/" className="mt-6 inline-block rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  async function acceptInviteAction() {
    'use server';

    const serverSession = await getServerSession(authOptions);
    if (!serverSession?.user?.id) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
    }

    await acceptInvite({ token, userId: serverSession.user.id });
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Invite</p>
        <h1 className="mt-4 text-3xl font-bold">Join {invite.community.name}</h1>
        <p className="mt-3 text-sm text-slate-300">
          Role: {invite.role} · Status: {invite.status}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {invite.email ? `This invite was sent to ${invite.email}.` : 'This is an open invite.'}
        </p>

        {invite.status !== 'pending' ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-300">This invite is no longer available.</p>
            <Link href="/dashboard" className="mt-4 inline-block rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
              Go to dashboard
            </Link>
          </div>
        ) : session ? (
          <form action={acceptInviteAction} className="mt-8 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              Signed in as {session.user?.name || session.user?.email || 'member'}
            </div>
            <button className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
              Accept invite
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-slate-400">Sign in to accept this invite.</p>
            <Link
              href={`/api/auth/signin/discord?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
              className="block rounded-2xl bg-white px-4 py-3 text-center font-semibold text-slate-950"
            >
              Continue with Discord
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
