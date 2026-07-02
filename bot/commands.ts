import { SlashCommandBuilder } from 'discord.js';

export const nexusConnectCommand = new SlashCommandBuilder()
  .setName('nexus-connect')
  .setDescription('Connect this Discord server to a Nexus community')
  .addStringOption((option) =>
    option
      .setName('community-id')
      .setDescription('The Nexus community ID')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('guild-name')
      .setDescription('The Discord server name')
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName('member-sync')
      .setDescription('Enable member synchronization')
      .setRequired(false),
  )
  .addBooleanOption((option) =>
    option
      .setName('role-sync')
      .setDescription('Enable role synchronization')
      .setRequired(false),
  );

export const botCommands = [nexusConnectCommand.toJSON()] as const;
