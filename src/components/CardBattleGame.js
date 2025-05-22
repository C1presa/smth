handleUnitAttack = (attackingUnit, targetUnit) => {
  if (!attackingUnit || !targetUnit) return;
  
  // Handle Strike effects before the attack
  const strikeEffects = attackingUnit.effects.filter(effect => effect.type === 'Strike');
  if (strikeEffects.length > 0) {
    handleStrike(attackingUnit, targetUnit, this.state);
  }
  
  // Perform the attack
  const { targetDied, thisDied } = attackingUnit.attack(targetUnit);
  
  // Handle DeathStrike effects if the target died
  if (targetDied) {
    handleDeathStrike(attackingUnit, targetUnit, this.state);
  }
  
  // Update game state
  this.setState(prevState => {
    const newState = { ...prevState };
    
    // Remove dead units
    if (targetDied) {
      newState.units = newState.units.filter(unit => unit.id !== targetUnit.id);
    }
    if (thisDied) {
      newState.units = newState.units.filter(unit => unit.id !== attackingUnit.id);
    }
    
    return newState;
  });
  
  // Reset turn state for all units at the end of the turn
  this.resetTurnState();
};

class CardBattleGame {
  constructor(deck1, deck2, isAIOpponent = false) {
    // ... existing code ...
    this.targetingMode = {
      active: false,
      sourceUnit: null,
      effect: null,
      validTargets: [],
      callback: null,
      message: ''
    };
  }

  // Enter targeting mode for effects that require targeting
  enterTargetingMode(sourceUnit, effect, validTargets, currentPlayer, callback) {
    this.targetingMode = {
      active: true,
      sourceUnit,
      effect,
      validTargets,
      callback,
      message: this.getTargetingMessage(effect)
    };
    
    // Highlight valid targets
    validTargets.forEach(target => {
      target.isHighlighted = true;
    });
    
    // Update UI to show targeting mode
    this.updateUI();
  }

  // Exit targeting mode
  exitTargetingMode() {
    // Remove highlights from all units
    this.players.forEach(player => {
      player.units.forEach(unit => {
        unit.isHighlighted = false;
      });
    });
    
    this.targetingMode = {
      active: false,
      sourceUnit: null,
      effect: null,
      validTargets: [],
      callback: null,
      message: ''
    };
    
    this.updateUI();
  }

  // Get targeting message based on effect type
  getTargetingMessage(effect) {
    if (!effect) return '';
    
    switch (effect.type) {
      case 'strike':
        return `Select a target for ${effect.action} effect`;
      case 'deathstrike':
        return `Select a target for Deathstrike effect`;
      default:
        return 'Select a target';
    }
  }

  // Handle unit click during targeting mode
  handleUnitClick(unit) {
    if (!this.targetingMode.active) return;
    
    // Check if clicked unit is a valid target
    if (!this.targetingMode.validTargets.includes(unit)) {
      return;
    }
    
    // Execute the callback with the selected target
    if (this.targetingMode.callback) {
      this.targetingMode.callback(unit);
    }
    
    // Exit targeting mode
    this.exitTargetingMode();
  }

  // Update UI to show targeting mode
  updateUI() {
    // Update game board to show highlighted units
    this.gameBoard.update();
    
    // Show targeting message if in targeting mode
    if (this.targetingMode.active) {
      this.showMessage(this.targetingMode.message);
    }
  }

  // Show message to player
  showMessage(message) {
    const messageElement = document.getElementById('game-message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = 'block';
    }
  }

  // ... existing code ...
} 