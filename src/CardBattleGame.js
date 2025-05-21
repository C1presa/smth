import { ROWS, COLS, PHASES, STARTING_HAND_SIZE } from './utils/constants.js';
import { getCardByName } from './data/cards.js';
import Player from './models/Player.js';
import Unit from './models/Unit.js';
import * as Effects from './utils/effects.js';

class CardBattleGame {
  constructor(deck1, deck2, isAIOpponent = false) {
      // Save the original deck definitions for resets
  this.deck1 = deck1;
  this.deck2 = deck2;

    // Initialize players
    this.players = [
      new Player(1, this.prepareDeck(deck1), deck1.archetype),
      new Player(2, this.prepareDeck(deck2), deck2.archetype)
    ];
    
    // Shuffle decks
    this.players.forEach(player => player.shuffleDeck());
    
    // Draw starting hands
    this.players.forEach(player => {
      for (let i = 0; i < STARTING_HAND_SIZE; i++) {
        player.drawCard();
      }
    });
    
    // Game state
    this.currentPlayerIndex = 0;
    this.currentPhase = PHASES.DRAW;
    this.turnNumber = 1;
    this.isGameOver = false;
    this.winner = null;
    this.isAIOpponent = isAIOpponent;
    this.isFirstTurn = true;
    this.pendingActions = [];
    this.selectedUnit = null;
    this.selectedEffect = null;
    this.validTargets = [];
    this.originalPhase = PHASES.DRAW;
    this.targetingMode = false; // New: global targeting mode
    this.targetingUnit = null;  // The unit that is choosing
    this.targetingEffect = null; // The effect being resolved
    this.targetingPlayer = null; // The player who must choose
    this.targetingValidTargets = []; // Valid targets for the effect
    this.targetingCallback = null; // Callback to resolve after targeting
  }
  
  // Prepare deck by converting card definitions to actual card instances
  prepareDeck(deckDefinition) {
    const deck = [];
    
    deckDefinition.cards.forEach(cardEntry => {
      for (let i = 0; i < cardEntry.count; i++) {
        const card = { ...cardEntry };
        delete card.count;
        deck.push(card);
      }
    });
    
    return deck;
  }
  
  // Get current player
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }
  
  // Get opponent player
  getOpponentPlayer() {
    return this.players[1 - this.currentPlayerIndex];
  }
  
  // Start the game
  startGame() {
    // Start with first player
    this.currentPlayerIndex = 0;
    this.currentPhase = PHASES.DRAW;
    
    // Handle first turn special case (both players must place Kriper)
    if (this.isFirstTurn) {
      this.handleFirstTurn();
    }
  }
  
  // Handle special first turn (both players place Kriper)
  handleFirstTurn() {
    // Add Kriper only to the current player first (not both)
    const kriperCard = getCardByName('Kriper');
    
    // Make sure Kriper was found - if not, this could be causing your issue
    if (!kriperCard) {
      console.error('Kriper card not found!');
      return;
    }
    
    const currentPlayer = this.getCurrentPlayer();
    
    const unit = new Unit(kriperCard, currentPlayer.id);
    this.pendingActions.push({
      type: 'placeKriper',
      playerId: currentPlayer.id,
      unit,
      message: `Player ${currentPlayer.id}: You must place your Kriper unit on your spawn row before continuing!`
    });
    
    // Log for debugging
    console.log('First turn setup complete, pendingActions:', this.pendingActions);
  }

  // Add a new method to handle turn transitions with Kriper
  handleTurnTransitionWithKriper() {
    // Empty implementation - we don't want to switch players automatically
    // This allows the current player to complete their full turn
  }
  
  // Check if a position is occupied by any unit
  isOccupied(row, col) {
    for (const player of this.players) {
      if (player.units.some(unit => unit.row === row && unit.col === col)) {
        return true;
      }
    }
    return false;
  }
  
  // Get unit at a specific position
  getUnitAt(row, col) {
    for (const player of this.players) {
      const unit = player.units.find(unit => unit.row === row && unit.col === col);
      if (unit) {
        return unit;
      }
    }
    return null;
  }
  
  // Place a unit on the board
  placeUnit(unit, row, col) {
    // Check if position is valid
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
      return { success: false, reason: 'Invalid position' };
    }
    
    // Check if position is occupied
    if (this.isOccupied(row, col)) {
      return { success: false, reason: 'Position is already occupied' };
    }
    
    // Get the player
    const player = this.players.find(p => p.id === unit.player);
    
    // Check if it's a spawn point for the player
    const spawnRow = player.id === 1 ? 4 : 0;
    if (this.currentPhase === PHASES.PLAY && row !== spawnRow) {
      return { success: false, reason: 'Units must be placed on your spawn row' };
    }
    
    // Place the unit
    player.addUnit(unit, row, col);

    // Handle pending actions (for Kriper placement)
    if (this.pendingActions.length > 0 && 
        this.pendingActions[0].type === 'placeKriper' && 
        this.pendingActions[0].unit.id === unit.id) {
      // Remove the pending action
      this.pendingActions.shift();
      
      // If this was Kriper placement, automatically progress to DRAW phase
      if (this.isFirstTurn) {
        this.currentPhase = PHASES.DRAW;
        // The nextPhase() call will be handled by the UI after this returns
      }
    }
    
    // Check for warshout effects
    const warshoutEffects = unit.effects.filter(effect => effect.type === 'warshout');
    const effectResults = [];
    if (warshoutEffects.length > 0) {
      if (this.board && typeof this.board.animateEffectTrigger === 'function') {
        this.board.animateEffectTrigger(unit, 'warshout');
      }
      for (const effect of warshoutEffects) {
        if (effect.requiresTargeting) {
          // Get valid targets for the effect
          const validTargets = Effects.getValidTargets(effect, unit, this);
          if (validTargets.length > 0) {
            // Use new targeting mode
            this.enterTargetingMode(
              unit,
              effect,
              validTargets,
              this.getCurrentPlayer(),
              (target) => {
                // After target is chosen, resolve the effect
                Effects.executeWarshoutEffect(effect, unit, target, this);
                // Resume phase (UI should call update after this)
              }
            );
            return { success: true, requiresTargeting: true, effect, validTargets };
          } else {
            effectResults.push({
              effect,
              result: { success: false, reason: 'No valid targets for effect' }
            });
          }
        } else {
          // Effect doesn't require targeting, execute immediately
          const result = Effects.executeWarshoutEffect(effect, unit, null, this);
          effectResults.push({ effect, result });
        }
      }
    }
    
    return { success: true, effectResults };
  }
  
  // Execute a warshout effect with a target
  executeWarshoutEffect(targetUnit) {
    if (!this.selectedUnit || !this.selectedEffect) {
      return { success: false, reason: 'No effect selected' };
    }
    
    // Check if target is valid
    if (!this.validTargets.some(target => target.id === targetUnit.id)) {
      return { success: false, reason: 'Invalid target' };
    }
    
    // Execute the effect
    const result = Effects.executeWarshoutEffect(
      this.selectedEffect, 
      this.selectedUnit, 
      targetUnit, 
      this
    );
    
    // Clear the selection and targeting state
    this.selectedUnit = null;
    this.selectedEffect = null;
    this.validTargets = [];
    
    // Restore original phase
    this.currentPhase = this.originalPhase;
    
    return { success: true, result };
  }
  
  // Add new method to handle effect targeting cancellation
  cancelEffectTargeting() {
    // Clear targeting state
    this.selectedUnit = null;
    this.selectedEffect = null;
    this.validTargets = [];
    
    // Restore original phase
    this.currentPhase = this.originalPhase;
    
    return { success: true };
  }
  
// Play a card from hand
playCard(cardIndex, row, col) {
  const player = this.getCurrentPlayer();
  
  // Check if it's the play phase
  if (this.currentPhase !== PHASES.PLAY) {
    return { success: false, reason: 'Not in play phase' };
  }
  
  // Validate card index
  if (typeof cardIndex !== 'number' || cardIndex < 0 || cardIndex >= player.hand.length) {
    return { success: false, reason: 'Invalid card index' };
  }
  
  // Play the card from player's hand
  const result = player.playCard(cardIndex);
  
  if (!result.success || !result.unit) {
    return result;
  }
  
  // Place the unit on the board
  const placeResult = this.placeUnit(result.unit, row, col);
  
  if (!placeResult.success) {
    // If placement fails, return the card to hand and refund mana
    // Use the original card object from the result
    if (result.unit && typeof result.unit.getCard === 'function') {
      const card = result.unit.getCard();
      if (card) {
        player.hand.push(card);
        player.mana += result.unit.cost; // Refund mana
      }
    }
    return placeResult;
  }
  
  // Return success with the unit and any additional placement results
  return { 
    success: true, 
    unit: result.unit,  // Explicitly include the unit
    ...placeResult 
  };
}
  // Move a unit
  moveUnit(unit, newRow, newCol) {
    // Check if it's the advance phase
    if (this.currentPhase !== PHASES.ADVANCE) {
      return { success: false, reason: 'Not in advance phase' };
    }
    
    // Check if unit belongs to current player
    if (unit.player !== this.getCurrentPlayer().id) {
      return { success: false, reason: 'Not your unit' };
    }
    
    // Check if unit can move
    if (!Effects.canUnitMove(unit, this)) {
      return { success: false, reason: 'Unit cannot move' };
    }
    
    // Check if new position is valid
    if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
      return { success: false, reason: 'Invalid position' };
    }
    
    // Check if position is occupied
    if (this.isOccupied(newRow, newCol)) {
      return { success: false, reason: 'Position is already occupied' };
    }
    
    // Move the unit
    const oldRow = unit.row;
    const oldCol = unit.col;
    unit.moveTo(newRow, newCol);
    
    // Check for win condition (unit reached enemy spawn row)
    const enemySpawnRow = unit.player === 1 ? 0 : 4;
    if (newRow === enemySpawnRow) {
      this.endGame(unit.player);
      return { 
        success: true, 
        gameOver: true, 
        winner: unit.player, 
        reason: 'Unit reached enemy spawn row' 
      };
    }
    
    return { success: true, oldRow, oldCol, newRow, newCol };
  }
  
  // Attack with a unit
  attackWithUnit(unit, target) {
    console.log('[Game] attackWithUnit called:', { unit, target, phase: this.currentPhase });
    // Check if it's battle phase
    if (this.currentPhase !== PHASES.BATTLE) {
      console.warn('[Game] Not in battle phase');
      return { success: false, reason: 'Not in battle phase' };
    }
    // Check if unit belongs to current player
    if (unit.player !== this.getCurrentPlayer().id) {
      console.warn('[Game] Not your unit');
      return { success: false, reason: 'Not your unit' };
    }
    // Check if unit has already attacked
    if (unit.hasAttacked) {
      console.warn('[Game] Unit has already attacked');
      return { success: false, reason: 'Unit has already attacked' };
    }
    // Get valid targets for the attack
    const validTargets = Effects.getPotentialAttackTargets(unit, this);
    console.log('[Game] Valid targets:', validTargets);
    // Check if target is valid
    const isValidTarget = validTargets.some(t => 
      (t.isPlayerHealth && target.isPlayerHealth && t.row === target.row && t.col === target.col) ||
      (!t.isPlayerHealth && !target.isPlayerHealth && t.id === target.id)
    );
    if (!isValidTarget) {
      console.warn('[Game] Invalid target', { target, validTargets });
      return { success: false, reason: 'Invalid target' };
    }
    
    // Check for taunt units
    const hasTauntTargets = validTargets.some(t => !t.isPlayerHealth && t.hasTaunt && t.hasTaunt());
    
    if (hasTauntTargets && (!target.hasTaunt || !target.hasTaunt())) {
        return { success: false, reason: 'Must attack taunt units first' };
    }

    // --- STRIKE EFFECTS ---
    const strikeEffects = unit.effects.filter(effect => effect.type === 'strike');
    let strikeHandled = false;
    for (const effect of strikeEffects) {
        if (this.board && typeof this.board.animateEffectTrigger === 'function') {
          this.board.animateEffectTrigger(unit, 'strike');
        }
        if (effect.requiresTargeting) {
            const validStrikeTargets = Effects.getValidTargets(effect, unit, this);
            if (validStrikeTargets.length > 0) {
                this.enterTargetingMode(
                    unit,
                    effect,
                    validStrikeTargets,
                    this.getCurrentPlayer(),
                    (selectedTarget) => {
                        Effects.handleStrike(unit, effect, this, selectedTarget);
                        // After targeting, continue with the attack
                        this.attackWithUnit(unit, target);
                    }
                );
                return { success: true, requiresTargeting: true, effect, validTargets: validStrikeTargets };
            }
        } else {
            Effects.handleStrike(unit, effect, this);
            strikeHandled = true;
        }
    }
    if (!strikeHandled && strikeEffects.length > 0) {
        // If there were strike effects but none handled, skip
    }

    // Handle spawn tile attack
    if (target.isPlayerHealth) {
        // Deal damage to player
        const opponent = this.getOpponentPlayer();
        const damage = unit.attack;
        const defeated = opponent.takeDamage(damage);
        
        // Mark unit as having attacked
        unit.hasAttacked = true;
        
        if (defeated) {
            this.endGame(unit.player);
            return { 
                success: true, 
                gameOver: true, 
                winner: unit.player, 
                reason: 'Opponent health reduced to 0' 
            };
        }
        
        return { 
            success: true, 
            targetType: 'player', 
            damage, 
            remainingHealth: opponent.health 
        };
    }

    // Handle unit attack
    const result = unit.performAttack(target);
    
    // --- DEATHBLOW/DEATHSTRIKE EFFECTS ---
    if (result.targetDied) {
        const targetPlayer = this.players.find(p => p.id === target.player);
        if (targetPlayer) {
            targetPlayer.removeUnit(target);
            
            // First, check for deathstrike effects on the attacker
            const deathstrikeEffects = unit.effects.filter(effect => effect.type === 'deathstrike');
            if (deathstrikeEffects.length > 0) {
                if (this.board && typeof this.board.animateEffectTrigger === 'function') {
                  this.board.animateEffectTrigger(unit, 'deathstrike');
                }
                for (const effect of deathstrikeEffects) {
                    // Ensure requiresTargeting is true for deathstrike effects
                    if (!effect.requiresTargeting) {
                        effect.requiresTargeting = true;
                    }
                    
                    const validDeathstrikeTargets = Effects.getValidTargets(effect, unit, this);
                    if (validDeathstrikeTargets.length > 0) {
                        this.enterTargetingMode(
                            unit,
                            effect,
                            validDeathstrikeTargets,
                            this.getCurrentPlayer(),
                            (selectedTarget) => {
                                Effects.handleDeathStrike(unit, effect, this, selectedTarget);
                            }
                        );
                        return { success: true, requiresTargeting: true, effect, validTargets: validDeathstrikeTargets };
                    }
                }
            }
            
            // Then check for deathblow effects on the killed unit
            const deathblowEffects = target.effects.filter(effect => effect.type === 'deathblow');
            if (deathblowEffects.length > 0) {
              if (this.board && typeof this.board.animateEffectTrigger === 'function') {
                this.board.animateEffectTrigger(target, 'deathblow');
              }
            }
            for (const effect of deathblowEffects) {
                if (effect.requiresTargeting) {
                    const validDeathblowTargets = Effects.getValidTargets(effect, target, this);
                    if (validDeathblowTargets.length > 0) {
                        this.enterTargetingMode(
                            target,
                            effect,
                            validDeathblowTargets,
                            this.getCurrentPlayer(),
                            (selectedTarget) => {
                                Effects.triggerDeathblowEffects(target, this, selectedTarget);
                            }
                        );
                        return { success: true, requiresTargeting: true, effect, validTargets: validDeathblowTargets };
                    }
                } else {
                    Effects.triggerDeathblowEffects(target, this);
                }
            }
        }
    }
    
    // Check if all units have attacked after this attack
    const currentPlayer = this.getCurrentPlayer();
    const allUnitsAttacked = currentPlayer.units.every(u => u.hasAttacked);
    
    return { 
        success: true, 
        ...result,
        allUnitsAttacked // Add this flag to inform UI that all units have attacked
    };
  }
  
  // Advance to next phase
  nextPhase() {
    // Check for pending Kriper placement before proceeding
    if (this.pendingActions.length > 0 && this.pendingActions[0].type === 'placeKriper') {
      return { success: false, reason: 'Must place Kriper first' };
    }

    const currentPlayer = this.getCurrentPlayer();
    
    switch (this.currentPhase) {
      case PHASES.DRAW:
        // Draw a card
        currentPlayer.drawCard();
        
        // Always move to ADVANCE phase, even on first turn
        this.currentPhase = PHASES.ADVANCE;
        break;
        
      case PHASES.ADVANCE:
        // Advance units and move to play phase
        this.advanceAllUnits();
        this.currentPhase = PHASES.PLAY;
        break;
        
      case PHASES.PLAY:
        // Move to battle phase
        this.currentPhase = PHASES.BATTLE;
        break;
        
      case PHASES.BATTLE:
        // Move directly to next player's turn
        this.endTurn();
        break;
        
      case PHASES.END:
        // End turn and switch players
        this.endTurn();
        break;
    }
    
    // If this is the first turn and we've completed a full turn for both players
    if (this.isFirstTurn && this.currentPlayerIndex === 0 && this.currentPhase === PHASES.DRAW) {
      this.isFirstTurn = false;
    }
    
    return { success: true, phase: this.currentPhase };
  }
  
  // Auto-advance all units of current player
  advanceAllUnits() {
    const player = this.getCurrentPlayer();
    const direction = player.id === 1 ? -1 : 1; // Player 1 moves up, Player 2 moves down
    
    // Sort units by row to avoid collisions
    // Player 1 should process from top to bottom, Player 2 from bottom to top
    const sortedUnits = [...player.units].sort((a, b) => 
      player.id === 1 ? a.row - b.row : b.row - a.row
    );
    
    // Move each unit if possible
    for (const unit of sortedUnits) {
      // Skip if unit can't move
      if (!Effects.canUnitMove(unit, this)) {
        continue;
      }
      
      const newRow = unit.row + direction;
      
      // Skip if new position is off the board
      if (newRow < 0 || newRow >= ROWS) {
        continue;
      }
      
      // Skip if new position is occupied
      if (this.isOccupied(newRow, unit.col)) {
        continue;
      }
      
      // Move the unit
      unit.moveTo(newRow, unit.col);
      
      // Check for win condition (unit reached enemy spawn row)
      const enemySpawnRow = unit.player === 1 ? 0 : 4;
      if (newRow === enemySpawnRow) {
        this.endGame(unit.player);
        return;
      }
    }
  }
  
  // End turn and switch to next player
  endTurn() {
    // Remove temporary buffs from the current player's units before switching
    const outgoingPlayer = this.getCurrentPlayer();
    outgoingPlayer.units.forEach(unit => unit.resetTurn());
    // Switch players
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
    // If switching to Player 1, increment turn number first
    if (this.currentPlayerIndex === 0) {
      this.turnNumber++;
    }
    // Reset to draw phase
    this.currentPhase = PHASES.DRAW;
    // Start new turn for next player, pass global turn number
    this.getCurrentPlayer().startTurn(this.turnNumber);
    // If this is the second player's first turn and we're still in first turn mode
    if (this.isFirstTurn && this.currentPlayerIndex === 1) {
      // Add Kriper for second player
      const kriperCard = getCardByName('Kriper');
      const currentPlayer = this.getCurrentPlayer();
      const unit = new Unit(kriperCard, currentPlayer.id);
      this.pendingActions.push({
        type: 'placeKriper',
        playerId: currentPlayer.id,
        unit,
        message: `Player ${currentPlayer.id}: You must place your Kriper unit on your spawn row before continuing!`
      });
    }
    // If we've completed both players' first turns, mark first turn as complete
    if (this.isFirstTurn && this.currentPlayerIndex === 0 && this.currentPhase === PHASES.DRAW) {
      this.isFirstTurn = false;
    }
  }
  
  // End the game
  endGame(winnerId) {
    this.isGameOver = true;
    this.winner = winnerId;
  }
  
  // Process an AI turn if applicable
  processAITurn() {
    if (this.isAIOpponent && this.currentPlayerIndex === 1 && !this.isGameOver) {
      // Implement AI logic here
      // This would involve making decisions for each phase automatically
      
      // Draw phase
      this.nextPhase();
      
      // Advance phase
      this.nextPhase();
      
      // Play phase - AI should play cards if it can
      // For each card in hand, try to play it if enough mana
      const ai = this.getCurrentPlayer();
      let cardPlayed = false;
      
      do {
        cardPlayed = false;
        
        // Find a card we can afford to play
        const cardIndex = ai.hand.findIndex(card => card.cost <= ai.mana);
        
        if (cardIndex !== -1) {
          const card = ai.hand[cardIndex];
          
          // Find an empty spot on AI's spawn row
          const spawnRow = ai.id === 1 ? 4 : 0;
          for (let col = 0; col < COLS; col++) {
            if (!this.isOccupied(spawnRow, col)) {
              // Play the card
              const result = this.playCard(cardIndex, spawnRow, col);
              
              if (result.success) {
                cardPlayed = true;
                
                // Handle targeting if needed
                if (result.requiresTargeting && result.validTargets.length > 0) {
                  // AI simply picks the first valid target
                  const target = result.validTargets[0];
                  this.executeWarshoutEffect(target);
                }
              }
              
              break;
            }
          }
        }
      } while (cardPlayed && ai.hand.some(card => card.cost <= ai.mana));
      
      // Move to battle phase
      this.nextPhase();
      
      // Battle phase - AI attacks with all units that can attack
      ai.units.forEach(unit => {
        const targets = Effects.getPotentialAttackTargets(unit, this);
        
        if (targets.length > 0) {
          // Prioritize player health attack if possible
          const playerHealthTarget = targets.find(t => t.isPlayerHealth);
          
          if (playerHealthTarget) {
            this.attackWithUnit(unit, playerHealthTarget);
          } else {
            // Otherwise, pick the highest value target
            // Simple heuristic: lowest health / highest attack = best target
            const bestTarget = targets.reduce((best, current) => {
              const bestValue = best.health / best.attack;
              const currentValue = current.health / current.attack;
              return currentValue < bestValue ? current : best;
            }, targets[0]);
            
            this.attackWithUnit(unit, bestTarget);
          }
        }
      });
      
      // End turn
      this.nextPhase();
    }
  }
  
  // Get valid spawn positions for a player
  getValidSpawnPositions(playerId) {
    const spawnRow = playerId === 1 ? 4 : 0;
    const validPositions = [];
    
    for (let col = 0; col < COLS; col++) {
      if (!this.isOccupied(spawnRow, col)) {
        validPositions.push({ row: spawnRow, col });
      }
    }
    
    return validPositions;
  }
  
  // Add the new methods here
  // Get potential attack targets for a unit
  getPotentialAttackTargets(unit) {
    return Effects.getPotentialAttackTargets(unit, this);
  }
  
  // Check if a unit can move
  canUnitMove(unit) {
    return Effects.canUnitMove(unit, this);
  }
  
  // Check if a unit can attack
  canUnitAttack(unit) {
    return Effects.canUnitAttack(unit, this);
  }
  
  // Get all pending actions
  getPendingActions() {
    return this.pendingActions;
  }
  
  // Reset the game state
  resetGame() {
    // Reset players
    this.players.forEach(player => {
      player.health = STARTING_HEALTH;
      player.mana = STARTING_MANA;
      player.maxMana = STARTING_MANA;
      player.hand = [];
      player.units = [];
      player.graveyard = [];
      
      // Reset deck
      player.deck = this.prepareDeck(player.id === 1 ? this.deck1 : this.deck2);
      player.archetype = (player.id === 1 ? this.deck1 : this.deck2).archetype;
      player.shuffleDeck();
      
      // Draw starting hand
      for (let i = 0; i < STARTING_HAND_SIZE; i++) {
        player.drawCard();
      }
    });
    
    // Reset game state
    this.currentPlayerIndex = 0;
    this.currentPhase = PHASES.DRAW;
    this.turnNumber = 1;
    this.isGameOver = false;
    this.winner = null;
    this.isFirstTurn = true;
    this.pendingActions = [];
    this.selectedUnit = null;
    this.selectedEffect = null;
    this.validTargets = [];
    
    // Handle first turn special case
    this.handleFirstTurn();
  }

  // Add targeting mode methods
  enterTargetingMode(unit, effect, validTargets, player, callback) {
    // Save current phase
    this.originalPhase = this.currentPhase;
    
    // Set targeting mode state
    this.targetingMode = true;
    this.targetingUnit = unit;
    this.targetingEffect = effect;
    this.targetingPlayer = player;
    this.targetingValidTargets = validTargets;
    this.targetingCallback = callback;
    
    // Change phase to targeting
    this.currentPhase = 'targeting';
    
    return { success: true };
  }

  exitTargetingMode() {
    // Clear targeting mode state
    this.targetingMode = false;
    this.targetingUnit = null;
    this.targetingEffect = null;
    this.targetingPlayer = null;
    this.targetingValidTargets = [];
    this.targetingCallback = null;
    
    // Restore original phase
    this.currentPhase = this.originalPhase;
    
    return { success: true };
  }

  handleTargetSelection(target) {
    if (!this.targetingMode || !this.targetingCallback) {
      return { success: false, reason: 'Not in targeting mode' };
    }
    
    // Check if target is valid
    if (!this.targetingValidTargets.some(t => t.id === target.id)) {
      return { success: false, reason: 'Invalid target' };
    }
    
    // Execute the callback with the selected target
    this.targetingCallback(target);
    
    // Exit targeting mode
    this.exitTargetingMode();
    
    return { success: true };
  }
}

export default CardBattleGame;