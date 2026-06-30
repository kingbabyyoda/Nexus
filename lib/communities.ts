import { prisma } from '@/lib/prisma';

export async function getCommunities() {
  return prisma.community.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          members: true,
          applications: true,
          tickets: true,
          events: true,
        },
      },
    },
  });
}

export async function createCommunity(
  name: string,
  description?: string,
  ownerUserId?: string,
) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  const community = await prisma.community.create({
    data: {
      name,
      slug: `${slug || 'community'}-${Date.now().toString().slice(-5)}`,
      description: description?.trim() || null,
    },
  });

  if (ownerUserId) {
    await prisma.member.create({
      data: {
        userId: ownerUserId,
        communityId: community.id,
        role: 'owner',
      },
    });
  }

  return community;
}
