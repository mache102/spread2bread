// Game Mechanics Constants

export const POINT_DISTRIBUTION_WINDOW = 10;
export const INITIAL_BREAD_LEVEL = 1;
export const INITIAL_MAX_POINTS = 300;
export const MAX_POINTS_VARIATION_PERCENTAGE = 0.2; // +/- 20% variation for max points on reset
export const LEVEL_LOSS_PERCENTAGE = 0.1;

// Jam Boost
export const BOOST_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const BOOST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
export const BOOST_MULTIPLIER = 3;

// Upgrade Ranges (base configuration)
export const UPGRADE_RANGES = [
  { levelBonus: 1, jamLevel: 'Light' },
  { levelBonus: 2, jamLevel: 'Spread' },
  { levelBonus: 4, jamLevel: 'Generous' },
  { levelBonus: 10, jamLevel: 'Glazed' },
  { levelBonus: 20, jamLevel: 'Glorious' },
  { levelBonus: 50, jamLevel: 'PERFECT' },
];

export const NOT_READY_JAM = 'Not Ready';

// Aesthetic Milestones
export const AESTHETIC_MILESTONES = [
  { level: 0, name: '🍞 Plain Bread' },
  { level: 5, name: '🍞 Whole Wheat' },
  { level: 10, name: '🥐 Croissant' },
  { level: 25, name: '🥖 Baguette' },
  { level: 50, name: '🧇 Waffle' },
  { level: 100, name: '🥯 Bagel' },
  { level: 250, name: '🥨 Pretzel' },
  { level: 500, name: '🎂 Cake' },
  { level: 1000, name: '👑 Royal Bread' },
  { level: 2000, name: '💎 Diamond Bread' },
  { level: 3000, name: '🚀 Rocket Bread' },
  { level: 4000, name: '🌟 Celestial Bread' },
  { level: 5000, name: '🌌 Cosmic Bread' },
  { level: 7500, name: '🔥 Inferno Bread' },
  { level: 10000, name: '♾️ Infinity Bread' },
];

// Range Generation
export const RANGE_SPLIT_MIN = 0.5;
export const RANGE_SPLIT_MAX = 0.8;
export const RANGE_SPLITS = UPGRADE_RANGES.length; // 6 splits + 1 final range = 7 total (1 Not Ready + 6 upgrade tiers)

// Jam Meter Display
export const BAR_LENGTH = 10;
export const BAR_FILLED = '█';
export const BAR_EMPTY = '░';

// Display formatting
export const POINTS_DISPLAY_DECIMALS = 2;
