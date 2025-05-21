// Game constants
export const ROWS = 5;
export const COLS = 7;
export const STARTING_HEALTH = 30;
export const STARTING_HAND_SIZE = 3;
export const STARTING_MANA = 1;
export const MAX_MANA = 10;
export const HAND_SIZE_LIMIT = 7;
export const FATIGUE_DAMAGE = 1;
export const FATIGUE_TURN = 15;

// Game phases
export const PHASES = {
  DRAW: 'draw',
  ADVANCE: 'advance',
  PLAY: 'play',
  BATTLE: 'battle',
  END: 'end'
};

// Card archetypes
export const ARCHETYPES = {
  NETHER: 'Nether',
  SWAMP: 'Swamp',
  RACETRACK: 'Racetrack',
  ELDERWOOD: 'Elderwood',
  NEUTRAL: 'Neutral'
};

// Unit types
export const UNIT_TYPES = {
  DEMON: 'demon',
  CULTIST: 'cultist',
  BEAST: 'beast',
  INSECT: 'insect',
  UNDEAD: 'undead',
  RACER: 'racer',
  LURKER: 'lurker'
};

// Card rarities
export const RARITIES = {
  COMMON: 'common',
  LEGENDARY: 'legendary'
};

// Effect types
export const EFFECT_TYPES = {
  WARSHOUT: 'warshout',
  DEATHBLOW: 'deathblow',
  DEATHSTRIKE: 'deathstrike',
  STRIKE: 'strike',
  SACRIFICE: 'sacrifice',
  TAUNT: 'taunt'
};

// Targeting types
export const TARGET_TYPES = {
  ALLY: 'ally',
  ENEMY: 'enemy',
  ANY: 'any',
  NONE: 'none'
};

// YAR (Your Area Ruling) - range is 2 rows from spawn
export const YAR_RANGE = 2;

// Colors for different archetypes
export const ARCHETYPE_STYLES = {
  Nether: {
    color: 'bg-gradient-to-br from-red-700 to-red-900 border-red-500',
    unitColor: 'from-red-600 to-red-800',
    highlightColor: 'shadow-red-500/50'
  },
  Swamp: {
    color: 'bg-gradient-to-br from-green-700 to-green-900 border-green-500',
    unitColor: 'from-green-600 to-green-800',
    highlightColor: 'shadow-green-500/50'
  },
  Racetrack: {
    color: 'bg-gradient-to-br from-blue-700 to-blue-900 border-blue-500',
    unitColor: 'from-blue-600 to-blue-800',
    highlightColor: 'shadow-blue-500/50'
  },
  Elderwood: {
    color: 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-500',
    unitColor: 'from-amber-600 to-amber-800',
    highlightColor: 'shadow-amber-500/50'
  },
  Neutral: {
    color: 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500',
    unitColor: 'from-gray-600 to-gray-800',
    highlightColor: 'shadow-gray-500/50'
  }
};

// Unit type icons
export const TYPE_ICONS = {
  demon: '👹',
  cultist: '🧙',
  beast: '🐗',
  insect: '🐛',
  undead: '💀',
  racer: '🏎️',
  lurker: '👁️'
};

export const ARCHETYPE_DESCRIPTIONS = {
  Nether: 'Dark cultists and demonic beings from the Nether.',
  Swamp: 'Creatures and spirits of the murky swamps.',
  Racetrack: 'Speedsters and mechanical racers.',
  Elderwood: 'Ancient beasts and wise spirits of the forest.',
  Neutral: 'Wanderers and mercenaries from all lands.'
};