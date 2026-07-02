import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import { botEnv } from './config';
import { botCommands, nexusConnectCommand } from './commands';
import { handshakeDiscordCommunity } from './handshake';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', () => {
  console.log(`Nexus bot logged in as ${client.user?.tag}`);
  console.log(`Loaded ${botCommands.length} command(s).`);
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== nexusConnectCommand.name) return;

  const communityId = interaction.options.getString('community-id', true);
  const guildName = interaction.options.getString('guild-name', true);
  const memberSyncEnabled = interaction.options.getBoolean('member-sync') ?? true;
  const roleSyncEnabled = interaction.options.getBoolean('role-sync') ?? true;

  if (!interaction.guildId) {
    await interaction.reply({
      content: 'This command can only be used inside a Discord server.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const result = await handshakeDiscordCommunity({
      communityId,
      guildId: interaction.guildId,
      guildName,
      memberSyncEnabled,
      roleSyncEnabled,
    });

    await interaction.editReply(
      `Connected **${guildName}** to community \`${communityId}\`. Bot sync is now active.`,
    );

    console.log('Handshake result:', result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await interaction.editReply(`Failed to connect guild: ${message}`);
  }
});

client.login(botEnv.DISCORD_BOT_TOKEN).catch((error) => {
  console.error('Failed to log in Discord bot:', error);
  process.exit(1);
});
