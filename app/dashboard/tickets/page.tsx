import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import { assignTicket, createTicket, updateTicketStatus } from '@/lib/tickets';

const CATEGORIES = ['general', 'support', 'report', 'appeal', 'bug', 'partnership'] as const;

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  await requireRole(session.user?.id, 'moderator');

  const manageableCommunities = await prisma.member.findMany({
    where: {
      userId: session.user?.id,
      role: { in: ['owner', 'admin', 'moderator'] },
    },
    include: { community: true },
    orderBy: { joinedAt: 'desc' },
  });

  const communityIds = manageableCommunities.map((membership) => membership.community.id);

  const tickets = await prisma.ticket.findMany({
    where: { communityId: { in: communityIds } },
    include: { community: true },
    orderBy: { updatedAt: 'desc' },
  });

  async function createTicketAction(formData: FormData) {
    'use server';

    const communityId = String(formData.get('communityId') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const category = String(formData.get('category') || 'general').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'moderator');

    if (!communityId || !subject) {
      return;
    }

    await createTicket({
      communityId,
      subject,
      category,
      creatorId: session.user.id,
    });

    revalidatePath('/dashboard/tickets');
    redirect('/dashboard/tickets');
  }

  async function closeTicketAction(formData: FormData) {
    'use server';

    const ticketId = String(formData.get('ticketId') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'moderator');

    if (!ticketId) return;

    await updateTicketStatus({ ticketId, status: 'closed' });
    revalidatePath('/dashboard/tickets');
    redirect('/dashboard/tickets');
  }

  async function reopenTicketAction(formData: FormData) {
    'use server';

    const ticketId = String(formData.get('ticketId') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'moderator');

    if (!ticketId) return;

    await updateTicketStatus({ ticketId, status: 'open' });
    revalidatePath('/dashboard/tickets');
    redirect('/dashboard/tickets');
  }

  async function assignToMeAction(formData: FormData) {
    'use server';

    const ticketId = String(formData.get('ticketId') || '').trim();

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'moderator');

    if (!ticketId) return;

    await assignTicket({ ticketId, assigneeId: session.user.id });
    revalidatePath('/dashboard/tickets');
    redirect('/dashboard/tickets');
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Tickets</p>
        <h1 className="mt-2 text-4xl font-bold">Support queue</h1>
        <p className="mt-3 text-sm text-slate-400">
          Moderators and above can open, assign, and close tickets.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Open a ticket</h2>
          <form action={createTicketAction} className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="space-y-2">
              <label className="block text-slate-400" htmlFor="communityId">Community</label>
              <select
                id="communityId"
                name="communityId"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                defaultValue={manageableCommunities[0]?.community.id || ''}
              >
                {manageableCommunities.length === 0 ? (
                  <option value="">No communities available</option>
                ) : (
                  manageableCommunities.map((membership) => (
                    <option key={membership.community.id} value={membership.community.id}>
                      {membership.community.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-slate-400" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  placeholder="Need help with login"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-400" htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  defaultValue="general"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
              Create ticket
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Queue</h2>
          <div className="mt-4 space-y-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-400">No tickets yet.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{ticket.subject}</p>
                      <p className="mt-1 text-slate-400">{ticket.community.name}</p>
                    </div>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-3 text-slate-400">Category: {ticket.category}</p>
                  <p className="mt-1 text-slate-500">
                    Creator: {ticket.creatorId || 'unknown'} · Assignee: {ticket.assigneeId || 'unassigned'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={assignToMeAction}>
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <button className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-white">
                        Assign to me
                      </button>
                    </form>
                    {ticket.status === 'open' ? (
                      <form action={closeTicketAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <button className="rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white">
                          Close
                        </button>
                      </form>
                    ) : (
                      <form action={reopenTicketAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white">
                          Reopen
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
