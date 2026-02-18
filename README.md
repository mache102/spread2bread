# Spread2Bread Discord Bot

A Discord bot game where players compete to achieve the highest level bread on their server.

## Game Concept

Players start with level 1 bread and gain points by having others respond to their messages. When you send a message, the next N messages from other players award you points in decreasing amounts. Build up your points to level up your bread, but timing is everything—upgrade at the perfect moment for massive level gains, or miss the window and lose progress!

## Key Features

- **Message-based Point System**: Earn points when others chat after you
- **Dynamic Upgrade Windows**: Randomized "hotness" ranges keep gameplay exciting
- **Daily Jam Boost**: 15-minute power-up that triples points you give to others
- **Aesthetic Progression**: Unlock new bread types as you level up
- **Server Leaderboard**: Compete for the top spot

## Commands

- `/bread` - View your bread level and hotness meter
- `/upgrade` - Attempt to level up your bread
- `/boost` - Activate your daily jam boost (3x points for 15 minutes)
- `/leaderboard` - See server rankings
- `/admin enable` - Enable bread game in a channel (admin only)
- `/admin disable` - Disable bread game in a channel (admin only)
- `/admin list` - List all active channels (admin only)
- `/admin give-points` - Give/subtract points from a user (admin only)
- `/admin give-levels` - Give/subtract levels from a user (admin only)

## Tech Stack

TypeScript, Discord.js, better-sqlite3, Node.js
