import { getCardByName } from '../data/cards.js';

class Unit {
  constructor(card, player) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.cardName = card.name;
    this.player = player;
    this.attack = card.attack;
    this.health = card.health;
    this.maxHealth = card.health;
    this.cost = card.cost;
    this.type = card.type;
    this.effects = [...card.effects];
    this.description = card.description;
    this.color = card.color;
    this.unitColor = card.unitColor;
    this.highlightColor = card.highlightColor;
    this.icon = card.icon;
    this.hasMoved = false;
    this.hasAttacked = false;
    this.extraMove = 0;
    this.row = null;
    this.col = null;
    this.yar = card.yar || false;
    this.activeBuffs = [];
  }

  // Check if unit has a specific effect type
  hasEffect(effectType) {
    return this.effects.some(effect => effect.type === effectType);
  }

  // Check if unit has taunt
  hasTaunt() {
    return this.hasEffect('taunt');
  }

  // Take damage
  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  // Heal
  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  // Buff stats
  buff(stats) {
    if (stats.attack) {
      this.attack += stats.attack;
    }
    if (stats.health) {
      this.health += stats.health;
      this.maxHealth += stats.health;
    }
    if (stats.extraMove) {
      this.extraMove += stats.extraMove;
    }
  }

  // Add a temporary or permanent buff
  addBuff(buff) {
    // Apply the buff
    if (buff.attack) this.attack += buff.attack;
    if (buff.health) {
      this.health += buff.health;
      this.maxHealth += buff.health;
    }
    if (buff.extraMove) this.extraMove += buff.extraMove;
    // If duration is specified, store the buff for later removal
    if (buff.duration) {
      this.activeBuffs.push({ ...buff });
    }
  }

  // Remove a buff (revert its effects)
  removeBuff(buff) {
    if (buff.attack) this.attack -= buff.attack;
    if (buff.health) {
      this.health -= buff.health;
      this.maxHealth -= buff.health;
      if (this.health > this.maxHealth) this.health = this.maxHealth;
    }
    if (buff.extraMove) this.extraMove -= buff.extraMove;
  }

  // Reset turn state and remove expired buffs
  resetTurn() {
    this.hasMoved = false;
    this.hasAttacked = false;
    this.extraMove = 0;
    // Remove buffs with duration 1 (until end of turn)
    if (this.activeBuffs && this.activeBuffs.length > 0) {
      this.activeBuffs = this.activeBuffs.filter(buff => {
        if (buff.duration) {
          buff.duration--;
          if (buff.duration <= 0) {
            this.removeBuff(buff);
            return false;
          }
        }
        return true;
      });
    }
  }

  // Get card reference
  getCard() {
    return getCardByName(this.cardName);
  }

  // Move to a new position
  moveTo(row, col) {
    this.row = row;
    this.col = col;
    this.hasMoved = true;
  }

  // Check if unit can move
  canMove() {
    return !this.hasMoved || this.extraMove > 0;
  }

  // Check if unit can attack
  canAttack() {
    return !this.hasAttacked;
  }

  // Handle attack
  performAttack(target) {
    this.hasAttacked = true;
    
    // Target takes damage, but attacker doesn't when attacking on their turn
    const targetDied = target.takeDamage(this.attack);
    
    // Attacker doesn't take damage anymore when attacking on their turn
    const thisDied = false;
    
    return { targetDied, thisDied };
  }
}

export default Unit;