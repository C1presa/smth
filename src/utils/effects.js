import Unit from '../models/Unit.js';
import { YAR_RANGE, ROWS } from './constants.js'; // Added ROWS

// Check if a target is valid based on effect requirements
export const isValidTarget = (effect, sourceUnit, targetUnit, gameState) => {
  if (!effect.requiresTargeting) {
    return false;
  }
  
  // Check if target belongs to the right player
  if (effect.targetType === 'ally' && targetUnit.player !== sourceUnit.player) {
    return false;
  }
  
  if (effect.targetType === 'enemy' && targetUnit.player === sourceUnit.player) {
    return false;
  }
  
  // Check YAR restriction
  if (effect.yar) {
    const sourcePlayer = gameState.players.find(p => p.id === sourceUnit.player);
    const spawnRow = sourcePlayer.id === 1 ? 4 : 0;
    
    // Check if target is within YAR range (2 rows from spawn)
    const distance = Math.abs(targetUnit.row - spawnRow);
    if (distance > YAR_RANGE) {
      return false;
    }
  }
  
  // Check type filter
  if (effect.filter && effect.filter.type) {
    const targetType = targetUnit.type.toLowerCase();
    if (!targetType.includes(effect.filter.type.toLowerCase())) {
      return false;
    }
  }
  
  // Check min cost filter
  if (effect.filter && effect.filter.minCost && targetUnit.cost < effect.filter.minCost) {
    return false;
  }
  
  // Check max cost filter
  if (effect.filter && effect.filter.maxCost && targetUnit.cost > effect.filter.maxCost) {
    return false;
  }
  
  return true;
};

// Get valid targets for an effect
export const getValidTargets = (effect, sourceUnit, gameState) => {
  if (!effect.requiresTargeting) {
    return [];
  }
  
  const allUnits = [];
  gameState.players.forEach(player => {
    player.units.forEach(unit => {
      allUnits.push(unit);
    });
  });
  
  return allUnits.filter(unit => isValidTarget(effect, sourceUnit, unit, gameState));
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

// Apply a sacrifice effect
export const applySacrificeEffect = (effect, target, gameState) => {
  const player = gameState.players.find(p => p.id === target.player);
  const died = target.takeDamage(target.health); // Ensure the unit dies
  
  if (died) {
    player.removeUnit(target);
    
    // Don't trigger deathstrike for sacrificed units
    // Instead, handle bonus effects from the sacrifice
    if (effect.bonusOnKill) {
      const bonusResults = [];
      
      if (effect.bonusOnKill.draw) {
        // Create a simple effect object for drawing, target is the source of the draw for player context
        const drawEffectValue = { value: effect.bonusOnKill.draw };
        const drawResults = applyDrawEffect(drawEffectValue, target, gameState);
        bonusResults.push(...drawResults);
      }
      if (effect.bonusOnKill.damage) {
        const damageEffect = effect.bonusOnKill.damage; // This is { value: X, targetType: Y, area: Z }
        const damageTargets = [];
        // Determine who the 'enemy' or 'ally' is relative to the sacrificed unit (target)
        const sacrificedUnitPlayerId = target.player;

        gameState.players.forEach(player => {
          if (damageEffect.targetType === 'enemy' && player.id !== sacrificedUnitPlayerId) {
            damageTargets.push(...player.units.filter(Boolean));
          } else if (damageEffect.targetType === 'ally' && player.id === sacrificedUnitPlayerId) {
            // This case might be unusual for a sacrifice bonus (damaging own units) but included for completeness
            damageTargets.push(...player.units.filter(Boolean));
          } else if (damageEffect.targetType === 'any') { // 'any' would target all units including the sacrificer's other units
            damageTargets.push(...player.units.filter(Boolean));
          }
        });

        if (damageTargets.length > 0) {
          // applyDamageEffect expects an effect object containing 'value'
          // and potentially other properties if its logic is more complex (e.g., filters).
          // Here, we construct a minimal effect object for applyDamageEffect.
          const effectForDamageApplication = { 
            value: damageEffect.value 
            // If applyDamageEffect needed 'area' or 'targetType' it should be passed from damageEffect here.
            // However, applyDamageEffect typically gets a pre-filtered list of targets.
          };
          // For a sacrifice bonus, this is typically a new chain of events.
          // If applyDamageEffect uses processedUnits to prevent re-processing, a new Set might be appropriate.
          const damageResults = applyDamageEffect(effectForDamageApplication, damageTargets, gameState, new Set()); 
          // Decide if these results need to be added to bonusResults or handled otherwise.
          // For now, just logging that it happened.
          console.log('Sacrifice bonus damage applied:', damageResults);
        }
      }
      
      return { target, died: true, bonusResults };
    }
  }
  
  return { target, died };
};

// Execute a warshout effect
export const executeWarshoutEffect = (effect, sourceUnit, targetUnit, gameState) => {
  // Log player units for debugging
  console.log('Executing warshout effect:', {
    effect,
    sourceUnit: sourceUnit ? {
      id: sourceUnit.id,
      name: sourceUnit.cardName,
      player: sourceUnit.player,
      row: sourceUnit.row,
      col: sourceUnit.col
    } : null,
    targetUnit: targetUnit ? { id: targetUnit.id, name: targetUnit.cardName, player: targetUnit.player, row: targetUnit.row, col: targetUnit.col } : null
  });

  let actualTargets = [];
  // This flag helps manage if we should proceed to the main action switch.
  // It's not strictly necessary if all actions correctly handle empty actualTargets.
  // let applyActionToTargets = true; 

  if (effect.requiresTargeting) {
    if (!targetUnit) {
      console.warn('Effect requires targeting but no target provided for effect:', effect);
      return { success: false, reason: 'Effect requires targeting, no target provided' };
    }
    actualTargets = [targetUnit];
  } else {
    // No targeting required explicitly by player choice
    if (effect.area === 'all') {
      // Collect all units based on effect.targetType (ally, enemy, any)
      gameState.players.forEach(player => {
        let isCorrectPlayerType = false;
        if (effect.targetType === 'ally' && player.id === sourceUnit.player) isCorrectPlayerType = true;
        else if (effect.targetType === 'enemy' && player.id !== sourceUnit.player) isCorrectPlayerType = true;
        else if (effect.targetType === 'any') isCorrectPlayerType = true;
        // If no targetType specified for an 'all' area effect, it might imply all units of the source player, or all units globally.
        // Current card definitions (e.g. Flame Guardian) specify targetType with area: 'all'.
        // If a card had area:'all' and no targetType, sourceUnit.player's units is a safe assumption.
        else if (!effect.targetType && player.id === sourceUnit.player) isCorrectPlayerType = true;


        if (isCorrectPlayerType) {
          player.units.forEach(unitOnBoard => {
            if (!unitOnBoard) {
              console.warn('Null unit found in player.units during AoE target collection:', player.id);
              return; // Skip this null unit
            }

            let passesFilters = true;
            // Apply additional filters if present (e.g., type, minCost, maxCost)
            if (effect.filter) {
              if (effect.filter.type && !unitOnBoard.type.toLowerCase().includes(effect.filter.type.toLowerCase())) {
                passesFilters = false;
              }
              if (effect.filter.minCost && unitOnBoard.cost < effect.filter.minCost) {
                passesFilters = false;
              }
              if (effect.filter.maxCost && unitOnBoard.cost > effect.filter.maxCost) {
                passesFilters = false;
              }
              // Potentially add other filters here
            }
            if (passesFilters) {
              actualTargets.push(unitOnBoard);
            }
          });
        }
      });

      // Apply YAR filter if the effect has the YAR property and it's an AoE effect
      if (effect.yar) {
        const sourcePlayer = gameState.players.find(p => p.id === sourceUnit.player);
        // Assuming player 1 spawn is row 4, player 2 is row 0. Needs to be robust if ROWS changes.
        const spawnRow = sourcePlayer.id === 1 ? (gameState.board?.rows ?? ROWS) - 1 : 0; 
        actualTargets = actualTargets.filter(t => Math.abs(t.row - spawnRow) <= YAR_RANGE);
      }
      
      console.log(`Effect targets (AoE for ${effect.action}):`, actualTargets.map(t => ({ id: t.id, name: t.cardName })));
      if (actualTargets.length === 0 && effect.action !== 'draw' && effect.action !== 'drawSpecific') {
        // Don't stop for draw effects as they don't need targets. Summons also might not need board targets.
        console.log('No valid targets found for AoE effect, returning early');
        return { success: true, message: 'No valid targets found for AoE effect' };
      }
    } else {
      // This branch handles effects that don't require targeting AND are not area: 'all'.
      // Typically, these are self-targeting (e.g., Speed Demon's buff, Insect Swarm's summon).
      // The target is the unit that generated the effect.
      actualTargets = [sourceUnit];
    }
  }
  
  // Early exit if no targets for actions that absolutely require one.
  // Draw, DrawSpecific, and Summon (which defaults to sourceUnit for placement context) can proceed.
  if (actualTargets.length === 0 && !['draw', 'drawSpecific', 'summon'].includes(effect.action)) {
    console.log('No actual targets for action:', effect.action, ' Source:', sourceUnit.cardName);
    return { success: true, message: 'No targets for action.' };
  }

  // Execute the effect based on action type
  switch (effect.action) {
    case 'damage': 
      // applyDamageEffect expects an array of targets.
      return { success: true, results: applyDamageEffect(effect, actualTargets, gameState).results };
    
    case 'heal':
      // applyHealEffect expects an array of targets.
      return { success: true, results: applyHealEffect(effect, actualTargets) };
    
    case 'buff':
      // applyBuffEffect expects an array of targets.
      return { success: true, results: applyBuffEffect(effect, actualTargets) };
    
    case 'sacrifice': 
      // Sacrifice should always have a single, specific target due to requiresTargeting: true.
      // If actualTargets[0] is undefined here, it's an issue with prior logic or effect definition.
      if (!actualTargets[0]) return {success: false, reason: "Sacrifice action missing target."};
      return { success: true, result: applySacrificeEffect(effect, actualTargets[0], gameState) };
    
    case 'summon': {
      const results = [];
      const count = effect.count || 1; // Get count from effect, default to 1
      for (let i = 0; i < count; i++) {
        // Summons originate from the sourceUnit's position context.
        const result = applySummonEffect(effect, sourceUnit, gameState); 
        results.push(result); // Collect result of each summon attempt
        if (!result.success) {
            console.warn(`Summon ${i+1} of ${count} failed for ${sourceUnit.cardName}: ${result.reason}`);
            // Optionally, break if one summon fails (e.g., no space)
            // break; 
        }
      }
      return { success: true, results };
    }
    
    case 'draw': 
      // Draw is for the sourceUnit's player.
      return { success: true, results: applyDrawEffect(effect, sourceUnit, gameState) };
    
    case 'compound':
      // For effects like Ancient Bog Guardian (heal all allies + buff all allies)
      if (effect.subEffects && Array.isArray(effect.subEffects)) {
        const compoundResults = [];
        effect.subEffects.forEach(subEffect => {
          // actualTargets here would be all friendly units (filtered by YAR if applicable)
          // Each subEffect is an object like { action: 'heal', value: 3 }
          switch (subEffect.action) {
            case 'heal':
              compoundResults.push(...applyHealEffect(subEffect, actualTargets));
              break;
            case 'buff':
              compoundResults.push(...applyBuffEffect(subEffect, actualTargets));
              break;
            // Extend with other actions if compound effects can do more
            default:
              console.warn('Unknown sub-action in compound effect:', subEffect.action);
          }
        });
        return { success: true, results: compoundResults };
      }
      return { success: false, reason: 'Compound action missing or invalid subEffects' };
    case 'drawSpecific':
      return { success: true, results: applyDrawSpecificEffect(effect, sourceUnit, gameState) };
    default:
      console.warn('Unknown action type:', effect.action);
      return { success: false, reason: 'Unknown action type' };
  }
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

// Handle Strike effect
export function handleStrike(unit, effect, gameState, selectedTarget = null) {
  if (!effect) return;
  
  // Get valid targets for the effect
  const validTargets = getValidTargetsForEffect(effect, unit, gameState);
  
  // If effect requires targeting and there are valid targets
  if (effect.requiresTargeting && validTargets.length > 0 && !selectedTarget) {
    // Enter targeting mode
    gameState.enterTargetingMode(
      unit,
      effect,
      validTargets,
      gameState.getCurrentPlayer(),
      (target) => {
        // Apply initial effect
        if (effect.action !== 'none') {
          switch (effect.action) {
            case 'damage':
              target.takeDamage(effect.value || 1);
              break;
            case 'heal':
              target.heal(effect.value || 1);
              break;
          }
        }
        
        // Apply followup effect
        if (effect.followup && effect.followup.action !== 'none') {
          switch (effect.followup.action) {
            case 'buff':
              if (effect.followup.value) {
                const duration = effect.followup.duration === 'permanent' ? 'permanent' : 1;
                target.addBuff({
                  attack: effect.followup.value.attack || 0,
                  health: effect.followup.value.health || 0,
                  duration: duration
                });
              }
              break;
          }
        }
      }
    );
    return { requiresTargeting: true, validTargets };
  }
  
  // If we have a selected target or no targeting required, apply effect
  const target = selectedTarget || unit;
  
  // Apply initial effect
  if (effect.action !== 'none') {
    switch (effect.action) {
      case 'damage':
        target.takeDamage(effect.value || 1);
        break;
      case 'heal':
        target.heal(effect.value || 1);
        break;
    }
  }
  
  // Apply followup effect
  if (effect.followup && effect.followup.action !== 'none') {
    switch (effect.followup.action) {
      case 'buff':
        if (effect.followup.value) {
          const duration = effect.followup.duration === 'permanent' ? 'permanent' : 1;
          target.addBuff({
            attack: effect.followup.value.attack || 0,
            health: effect.followup.value.health || 0,
            duration: duration
          });
        }
        break;
    }
  }
  
  return { success: true };
}

// Handle DeathStrike effect
export function handleDeathStrike(unit, effect, gameState, selectedTarget = null) {
  if (!effect) return;
  
  // Get valid targets for the effect
  const validTargets = getValidTargetsForEffect(effect, unit, gameState);
  
  // If effect requires targeting and there are valid targets
  if (effect.requiresTargeting && validTargets.length > 0 && !selectedTarget) {
    // Enter targeting mode
    gameState.enterTargetingMode(
      unit,
      effect,
      validTargets,
      gameState.getCurrentPlayer(),
      (target) => {
        // Apply the effect to the selected target
        if (effect.action !== 'none') {
          switch (effect.action) {
            case 'damage':
              target.takeDamage(effect.value || 1);
              break;
            case 'heal':
              target.heal(effect.value || 1);
              break;
            case 'buff':
              if (effect.value) {
                const duration = effect.duration === 'permanent' ? 'permanent' : 1;
                target.addBuff({
                  attack: effect.value.attack || 0,
                  health: effect.value.health || 0,
                  duration: duration
                });
              }
              break;
          }
        }
      }
    );
    return { requiresTargeting: true, validTargets };
  }
  
  // If we have a selected target or no targeting required, apply effect
  const target = selectedTarget || unit;
  
  // Apply the effect
  if (effect.action !== 'none') {
    switch (effect.action) {
      case 'damage':
        target.takeDamage(effect.value || 1);
        break;
      case 'heal':
        target.heal(effect.value || 1);
        break;
      case 'buff':
        if (effect.value) {
          const duration = effect.duration === 'permanent' ? 'permanent' : 1;
          target.addBuff({
            attack: effect.value.attack || 0,
            health: effect.value.health || 0,
            duration: duration
          });
        }
        break;
    }
  }
  
  return { success: true };
}

// Update the applyEffect function to handle new effects
function applyEffect(unit, effect, gameState) {
    if (!effect || !effect.type) return;
    
    switch (effect.type) {
        case 'warshout':
            handleWarshout(unit, effect, gameState);
            break;
            
        case 'deathblow':
            handleDeathblow(unit, effect, gameState);
            break;
            
        case 'deathstrike':
            handleDeathStrike(unit, effect, gameState);
            break;
            
        case 'strike':
            handleStrike(unit, effect, gameState);
            break;
            
        case 'taunt':
            // Taunt is handled in the targeting logic
            break;
            
        default:
            console.warn('Unknown effect type:', effect.type);
    }
}