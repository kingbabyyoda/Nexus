export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nexus</p>
        <h1 className="mt-4 text-3xl font-bold">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Discord login will be wired up next.
        </p>
        <a
          href="/api/auth/signin/discord"
          className="mt-8 block w-full rounded-2xl bg-white px-4 py-3 text-center font-semibold text-slate-950"
        >
          Continue with Discord
        </a>
      </div>
    </main>
  );
}
