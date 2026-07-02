import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import {
  disconnectDiscordIntegration,
  syncDiscordIntegration,
  updateDiscordIntegrationSettings,
  upsertDiscordIntegration,
} from '@/lib/discord';

export default async function DiscordIntegrationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  await requireRole(session.user?.id, 'admin');

  const communities = await prisma.member.findMany({
    where: {
      userId: session.user?.id,
      role: { in: ['owner', 'admin'] },
    },
    include: {
      community: {
        include: {
          discordIntegration: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  async function connectDiscordAction(formData: FormData) {
    'use server';

    const communityId = String(formData.get('communityId') || '').trim();
    const guildId = String(formData.get('guildId') || '').trim();
    const guildName = String(formData.get('guildName') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!communityId || !guildId || !guildName) {
      return;
    }

    await upsertDiscordIntegration({
      communityId,
      guildId,
      guildName,
      botConnected: true,
    });

    revalidatePath('/dashboard/discord');
    redirect('/dashboard/discord');
  }

  async function saveDiscordSettingsAction(formData: FormData) {
    'use server';

    const communityId = String(formData.get('communityId') || '').trim();
    const memberSyncEnabled = formData.get('memberSyncEnabled') === 'on';
    const roleSyncEnabled = formData.get('roleSyncEnabled') === 'on';

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!communityId) {
      return;
    }

    await updateDiscordIntegrationSettings({
      communityId,
      memberSyncEnabled,
      roleSyncEnabled,
    });

    revalidatePath('/dashboard/discord');
    redirect('/dashboard/discord');
  }

  async function syncNowAction(formData: FormData) {
    'use server';

    const communityId = String(formData.get('communityId') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!communityId) {
      return;
    }

    await syncDiscordIntegration(communityId);
    revalidatePath('/dashboard/discord');
    redirect('/dashboard/discord');
  }

  async function disconnectAction(formData: FormData) {
    'use server';

    const communityId = String(formData.get('communityId') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!communityId) {
      return;
    }

    await disconnectDiscordIntegration(communityId);
    revalidatePath('/dashboard/discord');
    redirect('/dashboard/discord');
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Discord</p>
        <h1 className="mt-2 text-4xl font-bold">Discord integration</h1>
        <p className="mt-3 text-sm text-slate-400">
          Connect a guild to a community, then enable member and role sync.
        </p>
      </div>

      <div className="space-y-4">
        {communities.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">You do not manage any communities yet.</p>
          </div>
        ) : (
          communities.map((membership) => {
            const integration = membership.community.discordIntegration;

            return (
              <div key={membership.community.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{membership.community.slug}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">{membership.community.name}</h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {integration ? `Connected to ${integration.guildName} (${integration.guildId})` : 'No Discord guild connected yet.'}
                    </p>
                  </div>
                  {integration ? (
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {integration.botConnected ? 'Bot connected' : 'Bot offline'}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <form action={connectDiscordAction} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                    <input type="hidden" name="communityId" value={membership.community.id} />
                    <p className="font-semibold text-white">Connect or update guild</p>
                    <div className="space-y-2">
                      <label className="block text-slate-400" htmlFor={`guildId-${membership.community.id}`}>
                        Guild ID
                      </label>
                      <input
                        id={`guildId-${membership.community.id}`}
                        name="guildId"
                        defaultValue={integration?.guildId || ''}
                        placeholder="123456789012345678"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-400" htmlFor={`guildName-${membership.community.id}`}>
                        Guild name
                      </label>
                      <input
                        id={`guildName-${membership.community.id}`}
                        name="guildName"
                        defaultValue={integration?.guildName || ''}
                        placeholder="Nexus Server"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
                      {integration ? 'Update guild' : 'Connect guild'}
                    </button>
                  </form>

                  <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">Sync controls</p>
                    {integration ? (
                      <>
                        <form action={saveDiscordSettingsAction} className="space-y-3">
                          <input type="hidden" name="communityId" value={membership.community.id} />
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              name="memberSyncEnabled"
                              defaultChecked={integration.memberSyncEnabled}
                              className="h-4 w-4"
                            />
                            Enable member sync
                          </label>
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              name="roleSyncEnabled"
                              defaultChecked={integration.roleSyncEnabled}
                              className="h-4 w-4"
                            />
                            Enable role sync
                          </label>
                          <button className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-white">
                            Save sync settings
                          </button>
                        </form>

                        <form action={syncNowAction}>
                          <input type="hidden" name="communityId" value={membership.community.id} />
                          <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white">
                            Sync now
                          </button>
                        </form>

                        <form action={disconnectAction}>
                          <input type="hidden" name="communityId" value={membership.community.id} />
                          <button className="rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white">
                            Disconnect
                          </button>
                        </form>

                        <p className="text-xs text-slate-500">
                          Last synced: {integration.lastSyncedAt ? integration.lastSyncedAt.toLocaleString() : 'Never'}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-400">Connect a guild to unlock sync controls.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
