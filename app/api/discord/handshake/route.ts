import { NextRequest, NextResponse } from 'next/server';
import { upsertDiscordIntegration, updateDiscordIntegrationSettings } from '@/lib/discord';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-discord-bot-secret');
  const expectedSecret = process.env.DISCORD_BOT_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Discord bot secret is not configured.' },
      { status: 503 },
    );
  }

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: {
    communityId?: string;
    guildId?: string;
    guildName?: string;
    memberSyncEnabled?: boolean;
    roleSyncEnabled?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const communityId = body.communityId?.trim();
  const guildId = body.guildId?.trim();
  const guildName = body.guildName?.trim();

  if (!communityId || !guildId || !guildName) {
    return NextResponse.json(
      { error: 'communityId, guildId, and guildName are required.' },
      { status: 400 },
    );
  }

  const integration = await upsertDiscordIntegration({
    communityId,
    guildId,
    guildName,
    botConnected: true,
  });

  await updateDiscordIntegrationSettings({
    communityId,
    memberSyncEnabled: body.memberSyncEnabled,
    roleSyncEnabled: body.roleSyncEnabled,
  });

  return NextResponse.json({
    ok: true,
    integration: {
      communityId: integration.communityId,
      guildId: integration.guildId,
      guildName: integration.guildName,
      botConnected: integration.botConnected,
      lastSyncedAt: integration.lastSyncedAt,
    },
  });
}
