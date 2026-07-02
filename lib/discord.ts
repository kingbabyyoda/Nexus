import { prisma } from '@/lib/prisma';

export async function upsertDiscordIntegration(input: {
  communityId: string;
  guildId: string;
  guildName: string;
  botConnected?: boolean;
}) {
  return prisma.discordIntegration.upsert({
    where: { communityId: input.communityId },
    update: {
      guildId: input.guildId,
      guildName: input.guildName,
      botConnected: input.botConnected ?? true,
      lastSyncedAt: new Date(),
    },
    create: {
      communityId: input.communityId,
      guildId: input.guildId,
      guildName: input.guildName,
      botConnected: input.botConnected ?? true,
      lastSyncedAt: new Date(),
    },
  });
}

export async function updateDiscordIntegrationSettings(input: {
  communityId: string;
  memberSyncEnabled?: boolean;
  roleSyncEnabled?: boolean;
}) {
  return prisma.discordIntegration.update({
    where: { communityId: input.communityId },
    data: {
      memberSyncEnabled: input.memberSyncEnabled ?? true,
      roleSyncEnabled: input.roleSyncEnabled ?? true,
      lastSyncedAt: new Date(),
    },
  });
}

export async function disconnectDiscordIntegration(communityId: string) {
  return prisma.discordIntegration.delete({
    where: { communityId },
  });
}

export async function syncDiscordIntegration(communityId: string) {
  return prisma.discordIntegration.update({
    where: { communityId },
    data: { lastSyncedAt: new Date() },
  });
}
