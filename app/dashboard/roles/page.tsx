import { COMMUNITY_ROLES, canManageCommunity, canModerateCommunity, roleLabel } from '@/lib/permissions';

export default function RolesPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Permissions</p>
        <h1 className="mt-2 text-4xl font-bold">Roles</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Define what each role can do inside a community. This is the base layer for approvals,
          moderation, and staff tools.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {COMMUNITY_ROLES.map((role) => (
          <div key={role} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{roleLabel(role)}</h2>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                {role}
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                Can manage community settings: {canManageCommunity(role) ? 'Yes' : 'No'}
              </p>
              <p>
                Can moderate members: {canModerateCommunity(role) ? 'Yes' : 'No'}
              </p>
              <p>
                Suggested use: {role === 'owner' && 'Full control of the workspace.'}
                {role === 'admin' && 'Trusted staff with broad controls.'}
                {role === 'moderator' && 'Handles tickets, warnings, and member issues.'}
                {role === 'member' && 'Standard community access.'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">What comes next</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">Invite roles</div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">Permission checks</div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">Role syncing</div>
        </div>
      </div>
    </main>
  );
}
