import { ARCHETYPE_STYLES } from './constants.js';

export const getUnitStyles = (unit) => {
  const archetype = unit.getArchetype();
  return ARCHETYPE_STYLES[archetype] || ARCHETYPE_STYLES.Neutral;
};

export const getUnitTypeIcon = (unit) => {
  const type = unit.type.toLowerCase();
  return TYPE_ICONS[type] || '❓';
};

export const getUnitHealthColor = (health, maxHealth) => {
  const ratio = health / maxHealth;
  if (ratio > 0.6) return '#22c55e'; // green
  if (ratio > 0.3) return '#eab308'; // yellow
  return '#ef4444'; // red
};

export const getUnitAttackColor = (attack) => {
  if (attack > 5) return '#ef4444'; // red
  if (attack > 3) return '#eab308'; // yellow
  return '#22c55e'; // green
};

export const getUnitCostColor = (cost) => {
  if (cost > 5) return '#ef4444'; // red
  if (cost > 3) return '#eab308'; // yellow
  return '#22c55e'; // green
};

export class UnitStyling {
  static getUnitClass(unit) {
    const classes = ['unit'];
    
    // Add player class
    classes.push(`player-${unit.playerId}`);
    
    // Add archetype class if present
    if (unit.archetype) {
      classes.push(`archetype-${unit.archetype.toLowerCase()}`);
    }
    
    // Add state classes
    if (unit.canMove) classes.push('can-move');
    if (unit.canAttack) classes.push('can-attack');
    if (unit.isSelected) classes.push('selected');
    
    return classes.join(' ');
  }
  
  static getUnitTypeIcon(type) {
    switch (type) {
      case 'Nether': return '🔮';
      case 'Swamp': return '🌿';
      case 'Racetrack': return '🏎️';
      case 'Elderwood': return '🌳';
      default: return '⚔️';
    }
  }
  
  static getUnitHealthColor(health) {
    if (health <= 0) return 'dead';
    if (health <= 2) return 'critical';
    if (health <= 4) return 'low';
    return 'healthy';
  }
  
  static getUnitAttackColor(attack) {
    if (attack <= 0) return 'weak';
    if (attack <= 2) return 'normal';
    if (attack <= 4) return 'strong';
    return 'powerful';
  }
  
  static getArchetypeColor(archetype) {
    switch (archetype?.toLowerCase()) {
      case 'nether': return 'nether';
      case 'swamp': return 'swamp';
      case 'racetrack': return 'racetrack';
      case 'elderwood': return 'elderwood';
      default: return 'default';
    }
  }
  
  static getPlayerColor(playerId) {
    return playerId === 1 ? 'player1' : 'player2';
  }
} 