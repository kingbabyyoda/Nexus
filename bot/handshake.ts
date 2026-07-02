import { botEnv } from './config';

export async function handshakeDiscordCommunity(input: {
  communityId: string;
  guildId: string;
  guildName: string;
  memberSyncEnabled?: boolean;
  roleSyncEnabled?: boolean;
}) {
  const response = await fetch(`${botEnv.APP_URL}/api/discord/handshake`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-discord-bot-secret': botEnv.DISCORD_BOT_SECRET,
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    ok?: boolean;
  };

  if (!response.ok) {
    throw new Error(data.error || `Handshake failed with status ${response.status}`);
  }

  return data;
}
