import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { botCommands } from './commands';
import { botEnv } from './config';

async function main() {
  const rest = new REST({ version: '10' }).setToken(botEnv.DISCORD_BOT_TOKEN);

  await rest.put(Routes.applicationCommands(botEnv.DISCORD_BOT_CLIENT_ID), {
    body: botCommands,
  });

  console.log(`Registered ${botCommands.length} application command(s).`);
}

main().catch((error) => {
  console.error('Failed to register Discord commands:', error);
  process.exit(1);
});
