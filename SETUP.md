# Setup Instructions

## Prerequisites

- Node.js 18+ and npm installed
- Discord Bot Token (from Discord Developer Portal)

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

Create a `.env` file in the root directory:

```bash
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_test_guild_id_here
```

## Database Setup

The SQLite database will be created automatically on first run at `data/spread2bread.db`.

```bash
# Ensure data directory exists
mkdir -p data
```

## Running

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Deploy Commands

Register slash commands with Discord:

```bash
npm run deploy-commands
```

## Testing

```bash
# Run integration tests
npm test

# Test commands via CLI
npm run test-cmd bread
npm run test-cmd upgrade
```

## Building for Production

```bash
npm run build
npm start
```
