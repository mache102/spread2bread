// Game Mechanics Constants

export const TRACK_MESSAGE_COUNT = 10;
export const INITIAL_BREAD_LEVEL = 1;
export const INITIAL_MAX_POINTS = 300;
export const LEVEL_LOSS_PERCENTAGE = 0.1;

// Jam Boost
export const BOOST_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const BOOST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
export const BOOST_MULTIPLIER = 3;

// Upgrade Ranges (base configuration)
export const UPGRADE_RANGES = [
  { levelBonus: 1, hotnessLevel: 'Warm' },
  { levelBonus: 2, hotnessLevel: 'Hot' },
  { levelBonus: 4, hotnessLevel: 'Very Hot' },
  { levelBonus: 10, hotnessLevel: 'Blazing' },
  { levelBonus: 20, hotnessLevel: 'Scorching' },
  { levelBonus: 50, hotnessLevel: 'PERFECT' },
];

export const NOT_READY_HOTNESS = 'Not Ready';

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
  { level: 2500, name: '💎 Diamond Bread' },
  { level: 5000, name: '🌟 Celestial Bread' },
  { level: 10000, name: '🌌 Cosmic Bread' },
];

// Range Generation
export const RANGE_SPLIT_MIN = 0.5;
export const RANGE_SPLIT_MAX = 1.0;
export const RANGE_SPLITS = 5;

// Hotness Bar Display
export const BAR_LENGTH = 10;
export const BAR_FILLED = '█';
export const BAR_EMPTY = '░';
