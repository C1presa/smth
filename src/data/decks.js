import { ARCHETYPES } from '../utils/constants.js';
import allCards, { getCardsByArchetype } from './cards.js';

// Predefined decks for each archetype
const predefinedDecks = {
  [ARCHETYPES.NETHER]: {
    name: 'Nether Dominance',
    archetype: ARCHETYPES.NETHER,
    cards: getCardsByArchetype(ARCHETYPES.NETHER)
      .filter(card => card.name !== 'Kriper') // Don't include Kriper in predefined decks
      .map(card => ({ ...card, count: 2 })) // Add 2 of each card
  },
  
  [ARCHETYPES.SWAMP]: {
    name: 'Swamp Tactics',
    archetype: ARCHETYPES.SWAMP,
    cards: getCardsByArchetype(ARCHETYPES.SWAMP)
      .filter(card => card.name !== 'Kriper')
      .map(card => ({ ...card, count: 2 }))
  },
  
  [ARCHETYPES.RACETRACK]: {
    name: 'Racetrack Speedsters',
    archetype: ARCHETYPES.RACETRACK,
    cards: getCardsByArchetype(ARCHETYPES.RACETRACK)
      .filter(card => card.name !== 'Kriper')
      .map(card => ({ ...card, count: 2 }))
  },
  
  [ARCHETYPES.ELDERWOOD]: {
    name: 'Elderwood Guardians',
    archetype: ARCHETYPES.ELDERWOOD,
    cards: getCardsByArchetype(ARCHETYPES.ELDERWOOD)
      .filter(card => card.name !== 'Kriper')
      .map(card => ({ ...card, count: 2 }))
  }
};

// Export predefined decks
export default predefinedDecks;

// Helper to check if a deck is valid (30 cards max, no more than 2 of each card, max 1 legendary)
export const isValidDeck = (deck) => {
  // Check total card count (exactly 30 cards)
  const totalCount = deck.cards.reduce((total, card) => total + card.count, 0);
  if (totalCount !== 30) {
    return { valid: false, reason: `Deck must contain exactly 30 cards (currently ${totalCount})` };
  }
  
  // Check if there are more than 2 of any card
  const invalidCards = deck.cards.filter(card => card.count > 2);
  if (invalidCards.length > 0) {
    return { valid: false, reason: `Cannot have more than 2 copies of a card: ${invalidCards.map(c => c.name).join(', ')}` };
  }
  
  // Check if there are more than 1 legendary
  const legendaries = deck.cards.filter(card => card.rarity === 'legendary' && card.count > 0);
  const legendaryCount = legendaries.reduce((total, card) => total + card.count, 0);
  if (legendaryCount > 1) {
    return { valid: false, reason: 'Cannot have more than 1 legendary card in a deck' };
  }
  
  return { valid: true };
};

// Create a new custom deck with default cards
export const createCustomDeck = (name, archetype) => {
  // Start with some basic cards from the archetype
  const archetypeCards = getCardsByArchetype(archetype)
    .filter(card => card.name !== 'Kriper') // Don't include Kriper in custom decks
    .map(card => ({ ...card, count: 1 })); // Add 1 of each card
    
  // Fill in with neutral cards to get closer to 30
  const neutralCards = allCards
    .filter(card => card.id === ARCHETYPES.NEUTRAL && card.name !== 'Kriper')
    .map(card => ({ ...card, count: 1 }))
    .slice(0, 30 - archetypeCards.length);
    
  return {
    name,
    archetype,
    cards: [...archetypeCards, ...neutralCards]
  };
};