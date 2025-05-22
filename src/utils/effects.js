import Unit from '../models/Unit.js';
import { YAR_RANGE, ROWS, COLS } from './constants.js';

// Returns a list of valid target units for a given effect and source unit
export const getValidTargets = (effect, sourceUnit, gameState) => {
  if (!effect.requiresTargeting) {
    return [];
  }
  const allUnits = [...gameState.players[0].units, ...gameState.players[1].units];
  const validTargets = [];
  for (const targetUnit of allUnits) {
    // 1. Self-Targeting
    if (effect.targetType === 'self') {
      if (targetUnit.id === sourceUnit.id) {
        validTargets.push(targetUnit);
      }
      continue;
    }
    // 2. Player Ownership
  if (effect.targetType === 'ally' && targetUnit.player !== sourceUnit.player) {
      continue;
  }
  if (effect.targetType === 'enemy' && targetUnit.player === sourceUnit.player) {
      continue;
  }
    // 3. YAR (Your Adjacent Row) Restriction
  if (effect.yar) {
    const sourcePlayer = gameState.players.find(p => p.id === sourceUnit.player);
      const spawnRow = sourcePlayer.id === 1 ? ROWS - 1 : 0;
    const distance = Math.abs(targetUnit.row - spawnRow);
    if (distance > YAR_RANGE) {
        continue;
    }
  }
    // 4. Type Filter
  if (effect.filter && effect.filter.type) {
      const targetType = targetUnit.type?.toLowerCase() || '';
    if (!targetType.includes(effect.filter.type.toLowerCase())) {
        continue;
    }
  }
    // 5. Min Cost Filter
  if (effect.filter && effect.filter.minCost && targetUnit.cost < effect.filter.minCost) {
      continue;
  }
    // 6. Max Cost Filter
  if (effect.filter && effect.filter.maxCost && targetUnit.cost > effect.filter.maxCost) {
      continue;
    }
    // 7. Area-based targeting
    if (effect.area && effect.area !== 'all') {
      if (effect.area === 'adjacent') {
        const rowDiff = Math.abs(sourceUnit.row - targetUnit.row);
        const colDiff = Math.abs(sourceUnit.col - targetUnit.col);
        if (!((rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0))) {
          continue;
        }
      }
      // Add other area logic as needed
    }
    validTargets.push(targetUnit);
  }
  return validTargets;
};

// Central effect execution dispatcher
export const executeEffect = (effect, sourceUnit, targetUnit, gameState) => {
  if (!effect || !effect.type) {
    console.warn('Attempted to execute an invalid effect.', effect);
    return { success: false, reason: 'Invalid effect' };
  }
  let result = { success: false, reason: 'Effect type not handled' };
  switch (effect.type) {
    case 'warshout':
      result = handleWarshout(effect, sourceUnit, targetUnit, gameState);
      break;
    case 'deathblow':
      result = handleDeathblow(effect, sourceUnit, targetUnit, gameState);
      break;
    case 'deathstrike':
      result = handleDeathStrike(effect, sourceUnit, targetUnit, gameState);
      break;
    case 'strike':
      result = handleStrike(effect, sourceUnit, targetUnit, gameState);
      break;
    case 'sacrifice':
      result = handleSacrifice(effect, sourceUnit, targetUnit, gameState);
      break;
    default:
      console.warn('Unknown effect type during execution:', effect.type);
  }
  return result;
};

// Individual effect handlers
export const handleWarshout = (effect, sourceUnit, targetUnit, gameState) => {
  if (!targetUnit) {
    return { success: false, reason: 'No target for Warshout' };
  }
  if (effect.action === 'buff' && effect.value) {
    const duration = effect.duration || 1;
    targetUnit.addBuff({
      attack: effect.value.attack || 0,
      health: effect.value.health || 0,
      duration: duration
    });
    if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
      gameState.gameLog.addLog(`${sourceUnit.cardName} uses Warshout on ${targetUnit.cardName}, giving them +${effect.value.attack} attack and +${effect.value.health} health.`);
    }
    return { success: true };
  }
  return { success: false, reason: 'Invalid Warshout action' };
};

export const handleDeathblow = (effect, sourceUnit, targetUnit, gameState) => {
  if (!targetUnit) {
    return { success: false, reason: 'No target for Deathblow' };
  }
  if (effect.action === 'damage' && effect.value) {
    const didDie = targetUnit.takeDamage(effect.value);
    if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
      gameState.gameLog.addLog(`${sourceUnit.cardName}'s Deathblow deals ${effect.value} damage to ${targetUnit.cardName}.`);
    }
    if (didDie && typeof gameState.removeUnit === 'function') {
      gameState.removeUnit(targetUnit);
      if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
        gameState.gameLog.addLog(`${targetUnit.cardName} was defeated by ${sourceUnit.cardName}'s Deathblow.`);
      }
    }
    return { success: true };
  }
  return { success: false, reason: 'Invalid Deathblow action' };
};

export const handleDeathStrike = (effect, sourceUnit, targetUnit, gameState) => {
  if (!targetUnit) {
    return { success: false, reason: 'No target for Deathstrike' };
  }
  if (effect.action === 'damage' && effect.value) {
    const didDie = targetUnit.takeDamage(effect.value);
    if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
      gameState.gameLog.addLog(`${sourceUnit.cardName}'s Deathstrike deals ${effect.value} damage to ${targetUnit.cardName}.`);
    }
    if (didDie && typeof gameState.removeUnit === 'function') {
      gameState.removeUnit(targetUnit);
      if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
        gameState.gameLog.addLog(`${targetUnit.cardName} was defeated by ${sourceUnit.cardName}'s Deathstrike.`);
      }
    }
    return { success: true };
  }
  return { success: false, reason: 'Invalid Deathstrike action' };
};

export const handleStrike = (effect, sourceUnit, targetUnit, gameState) => {
  if (!targetUnit) {
    return { success: false, reason: 'No target for Strike' };
  }
  if (effect.action === 'damage' && effect.value) {
    const didDie = targetUnit.takeDamage(effect.value);
    if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
      gameState.gameLog.addLog(`${sourceUnit.cardName}'s Strike deals ${effect.value} damage to ${targetUnit.cardName}.`);
    }
    if (didDie && typeof gameState.removeUnit === 'function') {
      gameState.removeUnit(targetUnit);
      if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
        gameState.gameLog.addLog(`${targetUnit.cardName} was defeated by ${sourceUnit.cardName}'s Strike.`);
      }
    }
    return { success: true };
  }
  return { success: false, reason: 'Invalid Strike action' };
};

export const handleSacrifice = (effect, sourceUnit, targetUnit, gameState) => {
  if (!sourceUnit) {
    return { success: false, reason: 'No source unit for Sacrifice' };
  }
  if (effect.action === 'damage_self_for_buff' && effect.value && targetUnit) {
    const selfDied = sourceUnit.takeDamage(effect.value.selfDamage);
    if (selfDied && typeof gameState.removeUnit === 'function') {
      gameState.removeUnit(sourceUnit);
      if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
        gameState.gameLog.addLog(`${sourceUnit.cardName} sacrifices itself.`);
      }
    } else if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
      gameState.gameLog.addLog(`${sourceUnit.cardName} takes ${effect.value.selfDamage} damage to sacrifice.`);
    }
    if (effect.value.buff) {
      const duration = effect.duration || 1;
      targetUnit.addBuff({
        attack: effect.value.buff.attack || 0,
        health: effect.value.buff.health || 0,
        duration: duration
      });
      if (gameState.gameLog && typeof gameState.gameLog.addLog === 'function') {
        gameState.gameLog.addLog(`${sourceUnit.cardName}'s sacrifice buffs ${targetUnit.cardName} with +${effect.value.buff.attack} attack and +${effect.value.buff.health} health.`);
      }
    }
    return { success: true };
  }
  return { success: false, reason: 'Invalid Sacrifice action' };
};

// Apply a damage effect
export const applyDamageEffect = (effect, targets, gameState, processedUnits = new Set()) => {
  const amount = effect.value || 1;
  const results = [];
  
  // Validate targets array
  if (!Array.isArray(targets)) {
    console.warn('applyDamageEffect: targets must be an array');
    return { success: false, reason: 'Invalid targets' };
  }
  
  // Filter out null/undefined targets and log for debugging
  const validTargets = targets.filter(target => {
    if (!target) {
      console.warn('Null target filtered out in applyDamageEffect');
      return false;
    }
    return true;
  });
  
  if (validTargets.length === 0) {
    console.warn('No valid targets for damage effect');
    return { success: false, reason: 'No valid targets' };
  }
  
  // Log targets for debugging
  console.log('Applying damage effect to valid targets:', validTargets.map(t => ({
    id: t.id,
    name: t.cardName,
    player: t.player,
    row: t.row,
    col: t.col
  })));
  
  validTargets.forEach(target => {
    if (processedUnits.has(target.id)) {
      // Already processed this unit in this chain
      return;
    }
    const died = target.takeDamage(amount);
    results.push({ target, died, damage: amount });
    
    if (died) {
      processedUnits.add(target.id);
      const player = gameState.players.find(p => p.id === target.player);
      if (player) {
        player.removeUnit(target);
        // Trigger deathblow effects, pass processedUnits
        triggerDeathblowEffects(target, gameState, undefined, processedUnits);
      } else {
        console.warn('Player not found for unit:', target.id);
      }
    }
  });
  
  return { success: true, results };
};

// Apply a heal effect
export const applyHealEffect = (effect, targets) => {
  const amount = effect.value || 1;
  const results = [];
  
  targets.forEach(target => {
    const oldHealth = target.health;
    target.heal(amount);
    results.push({ target, healed: target.health - oldHealth });
  });
  
  return results;
};

// Apply a buff effect
export const applyBuffEffect = (effect, targets) => {
  const results = [];
  
  targets.forEach(target => {
    target.buff(effect.value);
    results.push({ target, buffed: effect.value });
  });
  
  return results;
};

// Apply a summon effect
export const applySummonEffect = (effect, sourceUnit, gameState) => {
  const sourcePlayer = gameState.players.find(p => p.id === sourceUnit.player);
  const summonValue = effect.value;
  
  // Create a card-like object for the summon
  const summonedCard = {
    name: summonValue.name,
    attack: summonValue.attack,
    health: summonValue.health,
    type: summonValue.type,
    cost: 1, // Default cost for summoned units, can be overridden if specified in summonValue
    effects: summonValue.effects || [], // Pass effects from definition
    description: summonValue.description || 'Summoned unit',
    color: sourceUnit.color, // Inherit color from summoner for consistency
    unitColor: sourceUnit.unitColor,
    highlightColor: sourceUnit.highlightColor,
    icon: sourceUnit.icon
  };
  
  // Create a new unit
  const unit = new Unit(summonedCard, sourcePlayer.id);
  
  // Find a valid position next to the source unit
  const validPositions = [];
  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 },  // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }   // right
  ];
  
  directions.forEach(dir => {
    const newRow = sourceUnit.row + dir.row;
    const newCol = sourceUnit.col + dir.col;
    
    // Check if position is valid (on board and empty)
    if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 7 && 
        !gameState.isOccupied(newRow, newCol)) {
      validPositions.push({ row: newRow, col: newCol });
    }
  });
  
  // If no valid positions, return an empty result
  if (validPositions.length === 0) {
    return { success: false, reason: 'No valid position for summon' };
  }
  
  // Pick a random valid position
  const position = validPositions[Math.floor(Math.random() * validPositions.length)];
  
  // Add the unit to the player's units and place it on the board
  sourcePlayer.addUnit(unit, position.row, position.col);
  
  return { success: true, unit, position };
};

// Apply a draw effect
export const applyDrawEffect = (effect, sourceUnit, gameState) => {
  const player = gameState.players.find(p => p.id === sourceUnit.player);
  const amount = effect.value || 1;
  const results = [];
  
  for (let i = 0; i < amount; i++) {
    const result = player.drawCard();
    if (result) {
      results.push(result);
    }
  }
  
  return results;
};

// Apply a drawSpecific effect
export const applyDrawSpecificEffect = (effect, sourceUnit, gameState) => {
  const player = gameState.players.find(p => p.id === sourceUnit.player);
  const result = player.drawSpecificCard(effect.filter || {});
  
  return result ? [result] : [];
};

// Execute deathblow effects
export const triggerDeathblowEffects = (unit, gameState, killerUnit, processedUnits = new Set()) => {
  if (processedUnits.has(unit.id)) {
    // Prevent infinite recursion
    return [];
  }
  processedUnits.add(unit.id);
  const deathblowEffects = unit.effects.filter(effect => effect.type === 'deathblow');
  const results = [];

  // Helper to get all valid targets for area effects
  function getTargetsForArea(effect) {
    if (effect.targetType === 'enemy') {
      return gameState.players.find(p => p.id !== unit.player).units;
    } else if (effect.targetType === 'ally') {
      return gameState.players.find(p => p.id === unit.player).units;
    } else if (effect.targetType === 'any') {
      return getAllUnits(gameState);
    } else if (effect.targetType === 'self') {
      return [unit];
    }
    return [];
  }

  deathblowEffects.forEach(effect => {
    let targets = [];
    if (effect.area === 'all') {
      targets = getTargetsForArea(effect).filter(Boolean);
    } else {
      // Single target logic
      switch (effect.targetType) {
        case 'self':
          targets = [unit];
          break;
        case 'enemy':
          if (killerUnit && killerUnit.player !== unit.player) targets = [killerUnit];
          break;
        case 'ally':
          if (killerUnit && killerUnit.player === unit.player) targets = [killerUnit];
          break;
        case 'any':
          if (killerUnit) targets = [killerUnit];
          break;
        default:
          targets = [unit];
      }
    }
    // Defensive: filter out undefined/null
    targets = targets.filter(Boolean);

    // If effect requires targeting, enter targeting mode (UI should handle this)
    if (effect.requiresTargeting && targets.length > 0) {
      // Enter targeting mode for the effect (UI will resolve and call back)
      gameState.enterTargetingMode(
        unit,
        effect,
        targets,
        gameState.getCurrentPlayer(),
        (selectedTarget) => {
          // After target is chosen, apply the effect
          if (effect.action === 'damage') {
            applyDamageEffect(effect, [selectedTarget], gameState, processedUnits);
          } else if (effect.action === 'buff' && effect.value) {
            selectedTarget.addBuff({
              attack: effect.value.attack || 0,
              health: effect.value.health || 0,
              duration: 1
            });
          }
        }
      );
      results.push({ requiresTargeting: true, validTargets: targets });
      return;
    }

    switch (effect.action) {
      case 'summon':
        results.push(applySummonEffect(effect, unit, gameState));
        break;
      case 'draw':
        results.push(applyDrawEffect(effect, unit, gameState));
        break;
      case 'drawSpecific':
        results.push(applyDrawSpecificEffect(effect, unit, gameState));
        break;
      case 'damage':
        if (targets.length > 0) {
          results.push(applyDamageEffect(effect, targets, gameState, processedUnits));
        }
        break;
      case 'buff':
        if (targets.length > 0 && effect.value) {
          targets.forEach(target => {
            target.addBuff({
              attack: effect.value.attack || 0,
              health: effect.value.health || 0,
              duration: 1 // Permanent buff
            });
          });
        }
        break;
      default:
        results.push({ success: false, reason: 'Unknown deathblow action' });
    }
  });

  return results;
};

// Check if a unit can be targeted by an effect
export const canTarget = (effect, sourceUnit, gameState) => {
  return getValidTargets(effect, sourceUnit, gameState).length > 0;
};

// Check if a unit can move
export const canUnitMove = (unit, gameState) => {
  // Check if unit has already moved
  if (!unit.canMove()) {
    return false;
  }
  
  // Get the player who owns the unit
  const player = gameState.players.find(p => p.id === unit.player);
  const isPlayer1 = player.id === 1;
  
  // Check if there's a blocking unit ahead
  const direction = isPlayer1 ? -1 : 1; // Player 1 moves up, Player 2 moves down
  const newRow = unit.row + direction;
  
  // Check if new position is on the board
  if (newRow < 0 || newRow >= 5) {
    return false;
  }
  
  // Check if the position is occupied
  if (gameState.isOccupied(newRow, unit.col)) {
    // Check if it's blocked by a taunt unit
    const blockingUnit = gameState.getUnitAt(newRow, unit.col);
    if (blockingUnit.player !== unit.player && blockingUnit.hasTaunt()) {
      return false;
    }
    
    // Also check if there are adjacent taunt units that would block
    const adjacentCols = [unit.col - 1, unit.col + 1];
    for (const col of adjacentCols) {
      if (col >= 0 && col < 7) {
        const adjacentUnit = gameState.getUnitAt(newRow, col);
        if (adjacentUnit && adjacentUnit.player !== unit.player && adjacentUnit.hasTaunt()) {
          return false;
        }
      }
    }
    
    return false;
  }
  
  return true;
};

// Get all units on the board
export const getAllUnits = (gameState) => {
  const allUnits = [];
  gameState.players.forEach(player => {
    player.units.forEach(unit => {
      allUnits.push(unit);
    });
  });
  return allUnits;
};

// Get units with taunt ability
export const getTauntUnits = (gameState, playerId) => {
  return getAllUnits(gameState).filter(unit => 
    unit.player !== playerId && unit.hasTaunt()
  );
};

// Check if a unit can be moved
export const canMoveUnit = (unit, gameState) => {
  if (!unit.canMove()) return false;
  
  const direction = unit.player === 1 ? -1 : 1;
  const newRow = unit.row + direction;
  
  // Check if new position is on the board
  if (newRow < 0 || newRow >= 5) return false;
  
  // Check if position is occupied
  if (gameState.isOccupied(newRow, unit.col)) return false;
  
  return true;
};

// Check if a unit can attack
export const canUnitAttack = (unit, gameState) => {
  // Check if unit has already attacked
  if (unit.hasAttacked) {
    return false;
  }
  
  // Get potential targets
  const targets = getPotentialAttackTargets(unit, gameState);
  
  // Check if there are any valid targets
  return targets.length > 0;
};

// Get potential attack targets for a unit
export const getPotentialAttackTargets = (unit, gameState) => {
  const potentialTargets = [];
  const { row, col, player } = unit;
  
  // Get the opponent
  const opponent = gameState.players.find(p => p.id !== player);
  const opponentSpawnRow = opponent.id === 1 ? 4 : 0;
  
  // Check for targets in front and diagonally adjacent
  const targetPositions = [
    { row: row - 1, col: col },     // Front (up)
    { row: row + 1, col: col },     // Front (down)
    { row: row - 1, col: col - 1 }, // Diagonal left (up)
    { row: row - 1, col: col + 1 }, // Diagonal right (up)
    { row: row + 1, col: col - 1 }, // Diagonal left (down)
    { row: row + 1, col: col + 1 }  // Diagonal right (down)
  ];
  
  // Check each position for enemy units and spawn attacks
  targetPositions.forEach(pos => {
    // Check if position is on the board
    if (pos.row >= 0 && pos.row < 5 && pos.col >= 0 && pos.col < 7) {
      // Check for enemy units
      const targetUnit = gameState.getUnitAt(pos.row, pos.col);
      if (targetUnit && targetUnit.player !== player) {
        potentialTargets.push(targetUnit);
      }
      
      // Check if this position is on the enemy spawn row AND empty
      // This allows attacking specific spawn tiles directly
      if (pos.row === opponentSpawnRow && !gameState.isOccupied(pos.row, pos.col)) {
      potentialTargets.push({
        isPlayerHealth: true,
        player: opponent.id,
          row: pos.row,
          col: pos.col,
        name: 'Enemy Spawn'
      });
    }
  }
  });
  
  // Filter targets if there are taunt units
  const hasTauntTargets = potentialTargets.some(target => !target.isPlayerHealth && target.hasTaunt && target.hasTaunt());
  
  if (hasTauntTargets) {
    return potentialTargets.filter(target => !target.isPlayerHealth && target.hasTaunt && target.hasTaunt());
  }
  
  return potentialTargets;
};

// Helper function to get valid targets for an effect
function getValidTargetsForEffect(effect, sourceUnit, gameState) {
  if (!effect || !sourceUnit) return [];
  
  const targets = [];
  const sourcePlayer = gameState.players.find(p => p.id === sourceUnit.player);
  const enemyPlayer = gameState.players.find(p => p.id !== sourceUnit.player);
  
  switch (effect.targetType) {
    case 'self':
      targets.push(sourceUnit);
      break;
    case 'ally':
      targets.push(...sourcePlayer.units);
      break;
    case 'enemy':
      targets.push(...enemyPlayer.units);
      break;
    case 'any':
      targets.push(...sourcePlayer.units, ...enemyPlayer.units);
      break;
  }
  
  return targets;
}

// Update the applyEffect function to handle new effects
function applyEffect(unit, effect, gameState) {
    if (!effect || !effect.type) return;
    
    switch (effect.type) {
        case 'warshout':
            handleWarshout(effect, unit, null, gameState);
            break;
            
        case 'deathblow':
            handleDeathblow(effect, unit, null, gameState);
            break;
            
        case 'deathstrike':
            handleDeathStrike(effect, unit, null, gameState);
            break;
            
        case 'strike':
            handleStrike(effect, unit, null, gameState);
            break;
            
        case 'taunt':
            // Taunt is handled in the targeting logic
            break;
            
        default:
            console.warn('Unknown effect type:', effect.type);
    }
}