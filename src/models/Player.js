import { STARTING_HEALTH, STARTING_MANA, MAX_MANA, FATIGUE_DAMAGE, FATIGUE_TURN } from '../utils/constants.js';
import Unit from './Unit.js';

class Player {
  constructor(id, deck, archetype) {
    this.id = id;
    this.health = STARTING_HEALTH;
    this.mana = STARTING_MANA;
    this.maxMana = STARTING_MANA;
    this.hand = [];
    this.deck = [...deck]; // Copy the deck
    this.graveyard = [];
    this.units = []; // Units on the battlefield
    this.turnCount = 0;
    this.archetype = archetype;
  }

  // Start a new turn
  startTurn(turnNumber) {
    this.turnCount++;
    
    // Calculate appropriate maxMana
    // Both players should get mana increases at the same time
    // Turn 1: 1 mana
    // Turn 2: 2 mana
    // Turn 3: 3 mana
    // Turn 4: 4 mana
    // Turn 5: 5 mana
    this.maxMana = Math.min(MAX_MANA, turnNumber);
    
    // Replenish mana to max
    this.mana = this.maxMana;
    
    // Rehydrate units to ensure all are Unit instances
    this.units = this.units.map(u => u instanceof Unit ? u : new Unit(u, this.id));
    
    // Reset units' state
    this.units.forEach(unit => unit.resetTurn());
  }

  // Draw a card from the deck
  drawCard() {
    if (this.deck.length === 0) {
      // Fatigue damage if deck is empty
      this.takeDamage(this.calculateFatigueDamage());
      return null;
    }
    
    const card = this.deck.shift();
    
    // If hand is full, card goes to graveyard
    if (this.hand.length >= 7) {
      this.graveyard.push(card);
      return { card, discarded: true };
    }
    
    this.hand.push(card);
    return { card, discarded: false };
  }
  
  // Calculate fatigue damage
  calculateFatigueDamage() {
    // Start with base fatigue damage
    let damage = FATIGUE_DAMAGE;
    
    // Increase fatigue damage after turn 15
    if (this.turnCount > FATIGUE_TURN) {
      damage += Math.floor((this.turnCount - FATIGUE_TURN) / 2);
    }
    
    return damage;
  }

  // Specific card draw based on criteria (type, cost, etc.)
  drawSpecificCard(filter) {
    // Find card matching filter
    const index = this.deck.findIndex(card => {
      if (filter.type && !card.type.includes(filter.type)) {
        return false;
      }
      if (filter.minCost && card.cost < filter.minCost) {
        return false;
      }
      if (filter.maxCost && card.cost > filter.maxCost) {
        return false;
      }
      return true;
    });

    if (index === -1) {
      return null; // No matching card found
    }

    // Remove card from deck and add to hand
    const card = this.deck.splice(index, 1)[0];
    
    // If hand is full, card goes to graveyard
    if (this.hand.length >= 7) {
      this.graveyard.push(card);
      return { card, discarded: true };
    }
    
    this.hand.push(card);
    return { card, discarded: false };
  }

  // Play a card from hand
  playCard(cardIndex) {
    if (cardIndex < 0 || cardIndex >= this.hand.length) {
      return { success: false, reason: 'Invalid card index' };
    }

    const card = this.hand[cardIndex];
    
    // Check if player has enough mana
    if (card.cost > this.mana) {
      return { success: false, reason: 'Not enough mana' };
    }

    // Remove card from hand
    this.hand.splice(cardIndex, 1);
    
    // Spend mana
    this.mana -= card.cost;
    
    // Create a new unit from the card
    const unit = new Unit(card, this.id);
    
    return { success: true, unit };
  }

  // Add a unit to the battlefield
  addUnit(unit, row, col) {
    // Validate unit
    if (!unit) {
      throw new Error('Cannot add null unit to battlefield');
    }

    // Validate position
    if (typeof row !== 'number' || typeof col !== 'number' || 
        row < 0 || col < 0 || row >= 5 || col >= 5) {
      throw new Error('Invalid position for unit placement');
    }

    // Check if position is already occupied
    if (this.units.some(u => u.row === row && u.col === col)) {
      throw new Error('Position is already occupied');
    }

    unit.row = row;
    unit.col = col;
    this.units.push(unit);
  }

  // Remove a unit from the battlefield and add to graveyard
  removeUnit(unit) {
    const index = this.units.findIndex(u => u.id === unit.id);
    if (index !== -1) {
      const [removedUnit] = this.units.splice(index, 1);
      this.graveyard.push(removedUnit.getCard());
      return true;
    }
    return false;
  }

  // Take damage to player health
  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0; // Returns true if player is defeated
  }

  // Shuffle the deck
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
  
  // Check if the player has any units on the opponent's spawn row
  hasUnitOnEnemySpawn() {
    const enemySpawnRow = this.id === 1 ? 0 : 4; // Top row for player 2, bottom row for player 1
    return this.units.some(unit => unit.row === enemySpawnRow);
  }
  
  // Get a unit at specific position
  getUnitAt(row, col) {
    return this.units.find(unit => unit.row === row && unit.col === col);
  }
}

export default Player;