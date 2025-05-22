import { PHASES } from './constants.js';
import * as Effects from './effects.js';

class EffectHandler {
  constructor(game) {
    this.game = game;
  }
  
  executeEffect(unit, effect, target) {
    if (!unit || !effect || !target) {
      return { success: false, reason: 'Missing required parameters' };
    }
    
    // Execute the effect
    const result = Effects.executeEffect(unit, effect, target, this.game);
    
    return { success: true, result };
  }
  
  // Helper method to check if a unit has effects
  hasEffects(unit) {
    return unit && unit.effects && unit.effects.length > 0;
  }
  
  // Helper method to get effects of a specific type
  getEffectsOfType(unit, type) {
    if (!this.hasEffects(unit)) return [];
    return unit.effects.filter(effect => effect.type === type);
  }
}

export default EffectHandler; 