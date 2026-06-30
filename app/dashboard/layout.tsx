import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/sign-out-button';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 p-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nexus</p>
            <h2 className="mt-2 text-2xl font-bold">Workspace</h2>
            <p className="mt-2 text-sm text-slate-400">
              Signed in as {session.user?.name || session.user?.email || 'member'}
            </p>
          </div>
          <nav className="mt-8 space-y-2 text-sm text-slate-300">
            <Link className="block rounded-2xl bg-slate-800 px-4 py-3 text-white" href="/dashboard">
              Dashboard
            </Link>
            <Link className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="/dashboard/members">
              Members
            </Link>
            <Link className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="/dashboard/roles">
              Roles
            </Link>
            <Link className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="/dashboard/invites">
              Invites
            </Link>
            <a className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="#">
              Applications
            </a>
            <a className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="#">
              Tickets
            </a>
            <SignOutButton />
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
