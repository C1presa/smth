import { ARCHETYPES, RARITIES, UNIT_TYPES, TYPE_ICONS, ARCHETYPE_STYLES } from '../utils/constants.js';

// Helper function to create cards with proper styling based on archetype
const createCard = (data) => {
  const { id } = data;
  const style = ARCHETYPE_STYLES[id] || ARCHETYPE_STYLES.Neutral;
  
  return {
    ...data,
    ...style,
    icon: data.type ? TYPE_ICONS[data.type.split(',')[0].trim()] || '❓' : '❓'
  };
};

// Define all available cards in the game
const allCards = [
  // Starting unit - given to all players at beginning
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Kriper',
    cost: 1,
    attack: 1,
    health: 1,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.LURKER,
    description: 'A basic unit.',
    effects: []
  }),
  
  // Nether cards
  createCard({
    id: ARCHETYPES.NETHER,
    name: 'In-fur-nal Ritualist',
    cost: 6,
    attack: 4,
    health: 4,
    rarity: RARITIES.LEGENDARY,
    type: `${UNIT_TYPES.DEMON}, ${UNIT_TYPES.CULTIST}`,
    description: 'Warshout: Target a friendly unit to Sacrifice that costs 5 or more, draw 3 cards and deal 2 damage to all enemy units.',
    effects: [
      {
        type: 'warshout',
        requiresTargeting: true,
        targetType: 'ally',
        filter: { minCost: 5 },
        action: 'sacrifice',
        bonusOnKill: { 
          draw: 3,
          damage: {
            value: 2,
            targetType: 'enemy',
            area: 'all'
          }
        }
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.NETHER,
    name: 'Flame Guardian',
    cost: 3,
    attack: 2,
    health: 4,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.DEMON,
    description: 'Taunt. Warshout: Deal 1 damage to all enemy units.',
    effects: [
      { type: 'taunt' },
      {
        type: 'warshout',
        requiresTargeting: false,
        targetType: 'enemy',
        filter: {},
        action: 'damage',
        value: 1,
        area: 'all'
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.NETHER,
    name: 'Soul Harvester',
    cost: 4,
    attack: 3,
    health: 2,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.CULTIST,
    description: 'Deathblow: Draw a card.',
    effects: [
      {
        type: 'deathblow',
        requiresTargeting: false,
        action: 'draw',
        value: 1
      }
    ]
  }),
  
  // Swamp cards
  createCard({
    id: ARCHETYPES.SWAMP,
    name: 'Venomous Lurker',
    cost: 2,
    attack: 2,
    health: 1,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.LURKER,
    description: 'Warshout: Deal 1 damage to a unit.',
    effects: [
      {
        type: 'warshout',
        requiresTargeting: true,
        targetType: 'any',
        filter: {},
        action: 'damage',
        value: 1
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.SWAMP,
    name: 'Bog Healer',
    cost: 3,
    attack: 1,
    health: 4,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.LURKER,
    description: 'Warshout: Heal a friendly unit for 2 health. YAR',
    yar: true,
    effects: [
      {
        type: 'warshout',
        requiresTargeting: true,
        targetType: 'ally',
        filter: {},
        action: 'heal',
        value: 2,
        yar: true
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.SWAMP,
    name: 'Marsh Guardian',
    cost: 5,
    attack: 3,
    health: 6,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.BEAST,
    description: 'Taunt. Deathblow: Summon a 1/1 Lurker.',
    effects: [
      { type: 'taunt' },
      {
        type: 'deathblow',
        requiresTargeting: false,
        action: 'summon',
        value: { name: 'Lurker Spawn', attack: 1, health: 1, type: UNIT_TYPES.LURKER }
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.SWAMP,
    name: 'Ancient Bog Guardian',
    cost: 7,
    attack: 5,
    health: 7,
    rarity: RARITIES.LEGENDARY,
    type: UNIT_TYPES.BEAST,
    description: 'Taunt. Warshout: Heal all friendly units for 3 health and give them +1/+1. YAR',
    yar: true,
    effects: [
      { type: 'taunt' },
      {
        type: 'warshout',
        requiresTargeting: false,
        targetType: 'ally',
        filter: {},
        action: 'buff',
        value: { health: 3, attack: 1, health: 1 },
        area: 'all',
        yar: true
      }
    ]
  }),
  
  // Racetrack cards
  createCard({
    id: ARCHETYPES.RACETRACK,
    name: 'Speed Demon',
    cost: 4,
    attack: 4,
    health: 2,
    rarity: RARITIES.COMMON,
    type: `${UNIT_TYPES.DEMON}, ${UNIT_TYPES.RACER}`,
    description: 'Warshout: This unit can move an additional space this turn.',
    effects: [
      {
        type: 'warshout',
        requiresTargeting: false,
        action: 'buff',
        value: { extraMove: 1 }
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.RACETRACK,
    name: 'Pit Crew',
    cost: 2,
    attack: 1,
    health: 3,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.RACER,
    description: 'Warshout: Give a friendly Racer +1/+1. YAR',
    yar: true,
    effects: [
      {
        type: 'warshout',
        requiresTargeting: true,
        targetType: 'ally',
        filter: { type: UNIT_TYPES.RACER },
        action: 'buff',
        value: { attack: 1, health: 1 },
        yar: true
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.RACETRACK,
    name: 'Checkpoint Guard',
    cost: 3,
    attack: 2,
    health: 3,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.RACER,
    description: 'Taunt. Deathblow: Draw a Racer card from your deck.',
    effects: [
      { type: 'taunt' },
      {
        type: 'deathblow',
        requiresTargeting: false,
        action: 'drawSpecific',
        filter: { type: UNIT_TYPES.RACER }
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.RACETRACK,
    name: 'Grand Prix Champion',
    cost: 8,
    attack: 6,
    health: 6,
    rarity: RARITIES.LEGENDARY,
    type: UNIT_TYPES.RACER,
    description: 'Warshout: Give all friendly Racers +2/+2 and they can move an additional space this turn.',
    effects: [
      {
        type: 'warshout',
        requiresTargeting: false,
        targetType: 'ally',
        filter: { type: UNIT_TYPES.RACER },
        action: 'buff',
        value: { attack: 2, health: 2, extraMove: 1 },
        area: 'all'
      }
    ]
  }),
  
  // Elderwood cards
  createCard({
    id: ARCHETYPES.ELDERWOOD,
    name: 'Ancient Protector',
    cost: 5,
    attack: 3,
    health: 5,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.BEAST,
    description: 'Taunt. Warshout: Give all friendly beasts +0/+1.',
    effects: [
      { type: 'taunt' },
      {
        type: 'warshout',
        requiresTargeting: false,
        targetType: 'ally',
        filter: { type: UNIT_TYPES.BEAST },
        action: 'buff',
        value: { health: 1 },
        area: 'all'
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.ELDERWOOD,
    name: 'Forest Shaman',
    cost: 3,
    attack: 2,
    health: 2,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.BEAST,
    description: 'Warshout: Heal a friendly Beast for 3 health. YAR',
    yar: true,
    effects: [
      {
        type: 'warshout',
        requiresTargeting: true,
        targetType: 'ally',
        filter: { type: UNIT_TYPES.BEAST },
        action: 'heal',
        value: 3,
        yar: true
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.ELDERWOOD,
    name: 'Insect Swarm',
    cost: 2,
    attack: 1,
    health: 1,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.INSECT,
    description: 'Warshout: Summon a 1/1 Insect.',
    effects: [
      {
        type: 'warshout',
        requiresTargeting: false,
        action: 'summon',
        value: { name: 'Insect Token', attack: 1, health: 1, type: UNIT_TYPES.INSECT }
      }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.ELDERWOOD,
    name: 'Ancient Forest Guardian',
    cost: 9,
    attack: 7,
    health: 7,
    rarity: RARITIES.LEGENDARY,
    type: UNIT_TYPES.BEAST,
    description: 'Taunt. Warshout: Summon two 3/3 Beasts with Taunt.',
    effects: [
      { type: 'taunt' },
      {
        type: 'warshout',
        requiresTargeting: false,
        action: 'summon',
        value: { 
          name: 'Forest Guardian', 
          attack: 3, 
          health: 3, 
          type: UNIT_TYPES.BEAST,
          effects: [{ type: 'taunt' }]
        },
        count: 2
      }
    ]
  }),
  
  // Neutral cards
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Mercenary',
    cost: 2,
    attack: 2,
    health: 2,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.CULTIST,
    description: 'A balanced unit.',
    effects: []
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Hired Guard',
    cost: 3,
    attack: 2,
    health: 3,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.CULTIST,
    description: 'Taunt',
    effects: [
      { type: 'taunt' }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'War Beast',
    cost: 4,
    attack: 4,
    health: 3,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.BEAST,
    description: 'A powerful attacker.',
    effects: []
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Stalwart Defender',
    cost: 5,
    attack: 3,
    health: 5,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.CULTIST,
    description: 'Taunt',
    effects: [
      { type: 'taunt' }
    ]
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Elite Warrior',
    cost: 6,
    attack: 5,
    health: 5,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.CULTIST,
    description: 'A powerful unit.',
    effects: []
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Giant Beast',
    cost: 7,
    attack: 6,
    health: 6,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.BEAST,
    description: 'A mighty beast.',
    effects: []
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Grand Champion',
    cost: 8,
    attack: 7,
    health: 7,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.CULTIST,
    description: 'A powerful champion.',
    effects: []
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Ancient Behemoth',
    cost: 9,
    attack: 8,
    health: 8,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.BEAST,
    description: 'A colossal creature.',
    effects: []
  }),
  
  createCard({
    id: ARCHETYPES.NEUTRAL,
    name: 'Legendary Champion',
    cost: 10,
    attack: 10,
    health: 10,
    rarity: RARITIES.COMMON,
    type: UNIT_TYPES.CULTIST,
    description: 'The ultimate warrior.',
    effects: []
  })
];

// Export the complete card collection
export default allCards;

// Helper function to get cards by archetype
export const getCardsByArchetype = (archetype) => {
  return allCards.filter(card => card.id === archetype || (archetype !== ARCHETYPES.NEUTRAL && card.id === ARCHETYPES.NEUTRAL));
};

// Helper function to get neutral cards
export const getNeutralCards = () => {
  return allCards.filter(card => card.id === ARCHETYPES.NEUTRAL);
};

// Get a card by name
export const getCardByName = (name) => {
  const found = allCards.find(card => card.name === name);
  if (found) return found;
  // Try to find in custom cards (localStorage)
  try {
    const customCards = JSON.parse(localStorage.getItem('curve_custom_cards')) || [];
    return customCards.find(card => card.name === name) || undefined;
  } catch {
    return undefined;
  }
};