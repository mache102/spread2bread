# Project Reference

## 1. Project Overview

**Purpose:** Discord bot implementing a competitive "spread jam on bread" game where players earn points through message interactions and level up their bread.

**Stack:** TypeScript, Node.js, Discord.js v14, better-sqlite3

**Repo Layout:** Single-package TypeScript application with Discord bot architecture.

## 2. Architecture

### Modules / Packages
- [src/](src/) – Main application source
  - `commands/` – Slash command handlers
  - `events/` – Discord event handlers
  - `game/` – Core game logic
  - `models/` – Type definitions and interfaces
  - `services/` – Business logic orchestration
  - `storage/` – Database repositories
  - `utils/` – Shared utilities
  - `config.ts` – Configuration loading
  - `index.ts` – Entry point

### Data Flow / State Management
- **Event-Driven:** Discord events trigger handlers in [src/events/](src/events/)
- **Command Pattern:** Slash commands in [src/commands/](src/commands/) delegate to services
- **Service Layer:** [src/services/](src/services/) orchestrates game logic and storage
- **Persistence:** SQLite via [src/storage/](src/storage/) repositories

### Core Utilities
- [src/utils/embeds.ts](src/utils/embeds.ts) – Discord embed formatting (shows `Jam Amount` / `Jam Meter`; supports test mode for showing/hiding max points)
- [src/utils/constants.ts](src/utils/constants.ts) – Game constants and thresholds

## 3. Commonly Used Styles

### Code Style
- TypeScript strict mode enabled
- ESLint configuration: [.eslintrc.json](.eslintrc.json)
- No default exports; named exports only
- Async/await for all asynchronous operations
- Repository pattern for data access

## 4. Features / Components

### Bread & Points System
Core game mechanics for tracking bread levels and point accumulation
- [src/game/breadManager.ts](src/game/breadManager.ts) – Bread level and upgrade logic, randomized max points (guild-configurable)
- [src/game/pointTracker.ts](src/game/pointTracker.ts) – Message tracking and point calculation (now returns per-message point gains for richer logging)
- [src/game/rangeGenerator.ts](src/game/rangeGenerator.ts) – Dynamic upgrade range generation

Notes:
- Channels are **disabled by default**; admins must explicitly enable them via `/admin enable #channel`.
- Jam-boost expiry notifications are **disabled by default**. Use `/admin set-expiry-channel` to enable and configure the channel for a guild.
- Admins can set a per-guild `initialMaxPoints` used for max-point randomization (`/admin set-initial-maxpoints`).
- Run `npm run dev` to enable `isDev` — additional console logs will show point gains, upgrades, boosts and expirations.

### Commands
Player-facing slash commands
- [src/commands/help.ts](src/commands/help.ts) – Display all commands and usage guide
- [src/commands/about.ts](src/commands/about.ts) – Bot information and player statistics
- [src/commands/bread.ts](src/commands/bread.ts) – Display bread status for yourself or another user (optional `user` argument; won’t ping them). Supports test mode for showing max points and ranges
- [src/commands/upgrade.ts](src/commands/upgrade.ts) – Level up bread
- [src/commands/leaderboard.ts](src/commands/leaderboard.ts) – Server rankings
- [src/commands/boost.ts](src/commands/boost.ts) – Activate daily jam boost
- [src/commands/admin.ts](src/commands/admin.ts) – Admin channel configuration, give points/levels, boost expiry setup, initial max-points config

### Event Handlers
Discord event processing
- [src/events/messageCreate.ts](src/events/messageCreate.ts) – Track messages for point distribution
- [src/events/ready.ts](src/events/ready.ts) – Bot initialization

### Services
Business logic orchestration
- [src/services/gameService.ts](src/services/gameService.ts) – Coordinates game operations
- [src/services/jamBoostService.ts](src/services/jamBoostService.ts) – Daily boost management

### Storage Layer
Database access via repositories
- [src/storage/database.ts](src/storage/database.ts) – SQLite connection and schema
- [src/storage/playerRepository.ts](src/storage/playerRepository.ts) – Player data access
- [src/storage/channelRepository.ts](src/storage/channelRepository.ts) – Channel configuration (enable/disable per-channel)
- [src/storage/guildRepository.ts](src/storage/guildRepository.ts) – Per-guild settings (initialMaxPoints, boost expiry channel/enabled)

## 5. Scripts / Dev Tools

Build and development scripts defined in [package.json](package.json):
- `npm run build` – Compile TypeScript
- `npm run dev` – Development with tsx watch mode
- `npm start` – Run compiled code
- `npm test` – Run integration tests with vitest
- `npm run deploy` – Register Discord slash commands
- `npm run test-cmd` – Interactive CLI mock for testing commands locally (no Discord token needed)

Testing infrastructure:
- [tests/integration/](tests/integration/) – End-to-end command tests with vitest
- [scripts/test-commands.ts](scripts/test-commands.ts) – Interactive CLI with Discord mock and embed-to-plaintext converter
- Database reset function in [src/storage/database.ts](src/storage/database.ts) ensures test isolation

## 6. APIs / Integrations

### Discord API
- Discord.js v14 client in [src/index.ts](src/index.ts)
- Gateway intents: `Guilds`, `GuildMessages`
- Slash commands via REST API

### Database
- better-sqlite3 synchronous API
- Schema initialization in [src/storage/database.ts](src/storage/database.ts)

## 7. Notes for Agents

### Development Patterns
- All imports at top of files
- Magic numbers extracted to [src/utils/constants.ts](src/utils/constants.ts)
- Game mechanics constants: POINT_DISTRIBUTION_WINDOW, UPGRADE_RANGES, AESTHETIC_MILESTONES
- Repository pattern separates data access from business logic
- Services coordinate between game logic and storage

### Testing Approach
- Integration tests use separate test database
- CLI harness at [scripts/test-commands.ts](scripts/test-commands.ts) for manual testing
- Mock Discord interactions in tests

### Refactoring Reminders
After major changes, perform minimal-effort refactoring:
- Move all imports to top of file
- Extract magic numbers to constants
- Group related functions with section comments
- Check for duplicate code extraction opportunities
- Update this REFERENCE.md if architecture changes

## 8. References & Docs

- [README.md](README.md) – Project overview and features
- [SETUP.md](SETUP.md) – Installation and configuration
- [design.md](design.md) – Original game design specification
- [prompts.md](prompts.md) – Development guidelines and patterns
