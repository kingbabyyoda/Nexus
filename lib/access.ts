import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { CommunityRole } from '@/lib/permissions';

const ROLE_RANK: Record<CommunityRole, number> = {
  owner: 4,
  admin: 3,
  moderator: 2,
  member: 1,
};

export async function getUserHighestRole(userId?: string | null): Promise<CommunityRole | null> {
  if (!userId) return null;

  const memberships = await prisma.member.findMany({
    where: { userId },
    select: { role: true },
  });

  if (memberships.length === 0) return null;

  return memberships.reduce<CommunityRole>((highest, membership) => {
    return ROLE_RANK[membership.role as CommunityRole] > ROLE_RANK[highest]
      ? (membership.role as CommunityRole)
      : highest;
  }, memberships[0].role as CommunityRole);
}

export async function requireRole(
  userId: string | undefined,
  minimumRole: 'moderator' | 'admin' | 'owner',
) {
  const highestRole = await getUserHighestRole(userId);

  if (!highestRole) {
    redirect('/dashboard/onboarding');
  }

  const requiredRank =
    minimumRole === 'owner' ? 4 : minimumRole === 'admin' ? 3 : 2;
  const currentRank = ROLE_RANK[highestRole];

  if (currentRank < requiredRank) {
    redirect('/dashboard');
  }

  return highestRole;
}
