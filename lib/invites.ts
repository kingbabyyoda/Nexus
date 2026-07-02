import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function createInvite(input: {
  communityId: string;
  role: string;
  email?: string | null;
  expiresAt?: Date | null;
}) {
  return prisma.invite.create({
    data: {
      communityId: input.communityId,
      role: input.role,
      email: input.email?.trim() || null,
      expiresAt: input.expiresAt ?? null,
      token: randomUUID(),
    },
  });
}

export async function getInviteByToken(token: string) {
  return prisma.invite.findUnique({
    where: { token },
    include: { community: true, acceptedBy: true },
  });
}

export async function acceptInvite(input: {
  token: string;
  userId: string;
}) {
  const invite = await prisma.invite.findUnique({
    where: { token: input.token },
    include: { community: true },
  });

  if (!invite || invite.status !== 'pending') {
    return null;
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'expired' },
    });
    return null;
  }

  const existingMember = await prisma.member.findUnique({
    where: {
      userId_communityId: {
        userId: input.userId,
        communityId: invite.communityId,
      },
    },
  });

  if (!existingMember) {
    await prisma.member.create({
      data: {
        userId: input.userId,
        communityId: invite.communityId,
        role: invite.role,
      },
    });
  }

  return prisma.$transaction(async (tx) => {
    const updatedInvite = await tx.invite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedByUserId: input.userId,
      },
      include: {
        community: true,
      },
    });

    return updatedInvite;
  });
}
