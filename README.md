# Spread2Bread Discord Bot

A Discord bot game where players compete to achieve the highest level bread on their server.

## Game Concept

Players start with level 1 bread and gain points by having others respond to their messages. When you send a message, the next N messages from other players award you points in decreasing amounts. Build up your points to level up your bread, but timing is everything—upgrade at the perfect moment for massive level gains, or miss the window and lose progress!

## Key Features

- **Message-based Point System**: Earn points when others chat after you
- **Dynamic Upgrade Windows**: Randomized "jam amount" ranges keep gameplay exciting
- **Daily Jam Boost**: 15-minute power-up that triples points you give to others
- **Aesthetic Progression**: Unlock new bread types as you level up
- **Server Leaderboard**: Compete for the top spot

## Commands

- `/help` - View all available commands and usage guide
- `/about` - Learn about the bot and see player statistics
- `/bread [user]` - View your or another user's bread level and jam meter (won't ping them)
- `/upgrade` - Attempt to level up your bread
- `/boost` - Activate your daily jam boost (3x points for 15 minutes)
- `/leaderboard` - See server rankings
- `/admin enable` - Enable bread game in a channel (admin only)
- `/admin disable` - Disable bread game in a channel (admin only)
- `/admin list` - List all active channels (admin only)
- `/admin give-points` - Give/subtract points from a user (admin only)
- `/admin give-levels` - Give/subtract levels from a user (admin only)
- `/admin set-expiry-channel` - Configure channel for jam-boost expiry notifications (disabled by default)
- `/admin disable-expiry-notifiers` - Disable jam-boost expiry notifications for this guild
- `/admin set-initial-maxpoints` - Set the guild's initial max points used for randomization (min 10)
- `/admin show-points` - View a user's current points/maxPoints (admin only)

## Tech Stack

TypeScript, Discord.js, better-sqlite3, Node.js

## Demo

### Quick Demo with Mock CLI

You can test all features locally without a Discord bot using the interactive CLI:

```bash
npm run test-cmd
```

Once started, try these commands in order to walk through all features:

```
/help
/about
/bread @someone
/admin give-points 150
/bread
/upgrade
/bread
/admin give-levels 10
/bread
/boost
/leaderboard
/admin list
exit
```

### Bot Usage Screenshot

![Bot Usage](docs/screenshot-placeholder.png)
*Screenshot coming soon - bot in action on Discord*
