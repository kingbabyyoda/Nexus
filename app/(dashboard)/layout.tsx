export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 p-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Nexus</p>
            <h2 className="mt-2 text-2xl font-bold">Workspace</h2>
          </div>
          <nav className="mt-8 space-y-2 text-sm text-slate-300">
            <a className="block rounded-2xl bg-slate-800 px-4 py-3 text-white" href="/dashboard">
              Dashboard
            </a>
            <a className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="#">
              Members
            </a>
            <a className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="#">
              Applications
            </a>
            <a className="block rounded-2xl px-4 py-3 hover:bg-slate-800" href="#">
              Tickets
            </a>
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
