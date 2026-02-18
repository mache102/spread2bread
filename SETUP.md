# Setup Instructions

## Prerequisites

- Node.js 18+ and npm installed
- Discord Bot Token (from Discord Developer Portal)

- Discord Bot w/ perms (Send Messages, view Channels, Send Embed Links, View Message History), and create a redirect uri: https://discordapp.com/oauth2/authorize?&client_id=[client_id]&scope=bot; oauth2 perms: bot and applications.commands

## Installation

```bash
# Clone and navigate to the project
cd spread2bread

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Configuration

Create a `.env` file in the root directory and set vars:

```bash
cp .env.example .env
```

## Database Setup

The SQLite database will be created automatically on first run at `data/spread2bread.db`.

```bash
# Ensure data directory exists
mkdir -p data
```

## Running

```bash
# Development mode with auto-reload (sets NODE_ENV=development)
npm run dev

# Production mode (build first with npm run build)
npm start
```

### Dev mode behavior
- When running with `npm run dev` (`NODE_ENV=development`) the app sets an internal `isDev` flag.
- Dev mode enables additional console logging useful for debugging:
  - Logs point gains (user id + username), upgrades, over-jams, boost activations and boost expirations.
  - These logs are only printed when `isDev` is true and do not affect production behavior.
- You can also force dev mode by setting `DEV=1` in your environment.


## Deploy Commands

Register slash commands with Discord:

```bash
npm run deploy
```

## Testing

```bash
# Run integration tests
npm test

# Test commands via interactive CLI (no Discord token needed)
npm run test-cmd

# In the CLI, try:
# /bread, /upgrade, /boost, /leaderboard
# /admin give-points 150
# /admin give-levels 5
# Type 'help' for all commands, 'exit' to quit
```

## Building for Production

```bash
npm run build
npm start
```
