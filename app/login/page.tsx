import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nexus</p>
        <h1 className="mt-4 text-3xl font-bold">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Sign in with Discord to access your workspace.
        </p>
        <a
          href="/api/auth/signin/discord?callbackUrl=%2Fdashboard"
          className="mt-8 block w-full rounded-2xl bg-white px-4 py-3 text-center font-semibold text-slate-950"
        >
          Continue with Discord
        </a>
        <p className="mt-4 text-xs text-slate-500">
          By continuing, you will use the Discord account linked to your community.
        </p>
        <div className="mt-6 text-center text-sm text-slate-400">
          <Link href="/">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
