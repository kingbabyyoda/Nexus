import { prisma } from '@/lib/prisma';

export async function createTicket(input: {
  communityId: string;
  subject: string;
  category: string;
  creatorId?: string | null;
}) {
  return prisma.ticket.create({
    data: {
      communityId: input.communityId,
      subject: input.subject,
      category: input.category,
      creatorId: input.creatorId || null,
      status: 'open',
      transcript: '',
    },
  });
}

export async function updateTicketStatus(input: {
  ticketId: string;
  status: 'open' | 'closed';
}) {
  return prisma.ticket.update({
    where: { id: input.ticketId },
    data: { status: input.status },
  });
}

export async function assignTicket(input: {
  ticketId: string;
  assigneeId: string | null;
}) {
  return prisma.ticket.update({
    where: { id: input.ticketId },
    data: { assigneeId: input.assigneeId },
  });
}
