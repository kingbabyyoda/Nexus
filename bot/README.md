# Nexus Discord Bot

This folder contains the Discord bot that connects a Discord guild to a Nexus community.

## Scripts
- `npm run bot:register` — registers the `/nexus-connect` slash command
- `npm run bot:dev` — starts the bot client

## Required environment variables
- `DISCORD_BOT_TOKEN`
- `DISCORD_BOT_CLIENT_ID`
- `DISCORD_BOT_SECRET`
- `APP_URL`

## How it works
1. Run the app.
2. Start the bot.
3. Use `/nexus-connect` inside a Discord server.
4. The bot calls Nexus at `/api/discord/handshake` and links the guild to a community.
