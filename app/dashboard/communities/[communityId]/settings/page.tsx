import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/access';
import { prisma } from '@/lib/prisma';

export default async function CommunitySettingsPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  await requireRole(session.user?.id, 'admin');

  const community = await prisma.community.findUnique({
    where: { id: communityId },
  });

  if (!community) {
    redirect('/dashboard');
  }

  async function updateCommunityAction(formData: FormData) {
    'use server';

    const name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'admin');

    if (!name) {
      return;
    }

    await prisma.community.update({
      where: { id: community.id },
      data: {
        name,
        description: description || null,
      },
    });

    revalidatePath(`/dashboard/communities/${community.id}/settings`);
    revalidatePath('/dashboard');
  }

  async function deleteCommunityAction() {
    'use server';

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'owner');

    await prisma.community.delete({
      where: { id: community.id },
    });

    revalidatePath('/dashboard');
    redirect('/dashboard');
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Community settings</p>
          <h1 className="mt-2 text-4xl font-bold">{community.name}</h1>
          <p className="mt-3 text-sm text-slate-400">/{community.slug}</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Edit workspace</h2>
        <form action={updateCommunityAction} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm text-slate-400">
              Community name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={community.name}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm text-slate-400">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={community.description || ''}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>
          <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
            Save changes
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-rose-900 bg-rose-950/20 p-6">
        <h2 className="text-xl font-semibold text-rose-200">Danger zone</h2>
        <p className="mt-3 text-sm text-rose-200/80">
          Owners can permanently delete this community and all related data.
        </p>
        <form action={deleteCommunityAction} className="mt-4">
          <button className="rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white">
            Delete community
          </button>
        </form>
      </div>
    </main>
  );
}
