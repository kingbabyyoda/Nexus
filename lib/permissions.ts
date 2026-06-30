export type CommunityRole = 'owner' | 'admin' | 'moderator' | 'member';

export const COMMUNITY_ROLES: CommunityRole[] = ['owner', 'admin', 'moderator', 'member'];

export function canManageCommunity(role: CommunityRole) {
  return role === 'owner' || role === 'admin';
}

export function canModerateCommunity(role: CommunityRole) {
  return role === 'owner' || role === 'admin' || role === 'moderator';
}

export function roleLabel(role: CommunityRole) {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    case 'moderator':
      return 'Moderator';
    default:
      return 'Member';
  }
}
