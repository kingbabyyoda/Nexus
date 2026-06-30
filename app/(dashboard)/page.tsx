const stats = [
  { label: 'Members', value: '128' },
  { label: 'Applications', value: '14' },
  { label: 'Tickets', value: '6' },
  { label: 'Events', value: '3' },
];

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Overview</p>
        <h1 className="mt-2 text-4xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Recent activity</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <p>• New application submitted by Ethan</p>
            <p>• Ticket opened in #support</p>
            <p>• Event scheduled for Friday night</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <p>• Connect Discord OAuth</p>
            <p>• Add member profiles</p>
            <p>• Build application forms</p>
          </div>
        </div>
      </div>
    </main>
  );
}
