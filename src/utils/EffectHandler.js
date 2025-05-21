import { PHASES } from './constants.js';
import * as Effects from './effects.js';

class EffectHandler {
  constructor(game) {
    this.game = game;
    this.sourceUnit = null;
    this.effect = null;
    this.validTargets = [];
    this.originalPhase = null;
  }
  
  startTargeting(sourceUnit, effect) {
    this.sourceUnit = sourceUnit;
    this.effect = effect;
    this.originalPhase = this.game.currentPhase;
    this.game.currentPhase = PHASES.TARGETING;
    this.validTargets = Effects.getValidTargets(effect, sourceUnit, this.game);
    return this.validTargets;
  }
  
  executeEffect(targetUnit) {
    if (!this.sourceUnit || !this.effect) {
      return { success: false, reason: 'No effect selected' };
    }
    
    // Check if target is valid
    if (!this.validTargets.some(target => target.id === targetUnit.id)) {
      return { success: false, reason: 'Invalid target' };
    }
    
    // Execute the effect
    const result = Effects.executeWarshoutEffect(
      this.effect, 
      this.sourceUnit, 
      targetUnit, 
      this.game
    );
    
    // Clear the selection and targeting state
    this.reset();
    
    return { success: true, result };
  }
  
  cancelTargeting() {
    this.reset();
    return { success: true };
  }
  
  reset() {
    this.sourceUnit = null;
    this.effect = null;
    this.validTargets = [];
    if (this.originalPhase) {
      this.game.currentPhase = this.originalPhase;
      this.originalPhase = null;
    }
  }
  
  // Helper method to check if we're currently in targeting mode
  isTargeting() {
    return this.sourceUnit !== null && this.effect !== null;
  }
  
  // Helper method to get current valid targets
  getValidTargets() {
    return this.validTargets;
  }
  
  // Helper method to check if a unit is a valid target
  isValidTarget(unit) {
    return this.validTargets.some(target => target.id === unit.id);
  }
}

export default EffectHandler; 