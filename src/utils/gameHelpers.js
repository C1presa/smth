// src/utils/gameHelpers.js - Helper functions for game mechanics

// Calculate damage with modifications
export const calculateDamage = (attacker, defender) => {
    // Base damage is the attacker's attack value
    let damage = attacker.attack;
    
    // Apply any damage modifications from effects here
    // For example, type advantages or special abilities
    
    // Ensure damage is at least 1
    return Math.max(1, damage);
  };
  
  // Check if a position is valid on the game board
  export const isValidPosition = (row, col, rows = 5, cols = 7) => {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  };
  
  // Get adjacent positions
  export const getAdjacentPositions = (row, col) => {
    return [
      { row: row - 1, col: col },     // up
      { row: row + 1, col: col },     // down
      { row: row, col: col - 1 },     // left
      { row: row, col: col + 1 },     // right
      { row: row - 1, col: col - 1 }, // up-left
      { row: row - 1, col: col + 1 }, // up-right
      { row: row + 1, col: col - 1 }, // down-left
      { row: row + 1, col: col + 1 }  // down-right
    ].filter(pos => isValidPosition(pos.row, pos.col));
  };
  
  // Create a unique ID
  export const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };
  
  // Deep clone an object
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  // Calculate if a unit can reach a position in a single move
  export const canReachPosition = (unit, targetRow, targetCol) => {
    const rowDiff = Math.abs(unit.row - targetRow);
    const colDiff = Math.abs(unit.col - targetCol);
    
    // Check if the position is adjacent (including diagonals)
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };
  
  // Get the direction a unit should move based on its player
  export const getMoveDirection = (playerId) => {
    return playerId === 1 ? -1 : 1; // Player 1 moves up, Player 2 moves down
  };
  
  // Check if a unit has reached the opponent's spawn row
  export const hasReachedEnemySpawn = (unit, rows = 5) => {
    const enemySpawnRow = unit.player === 1 ? 0 : rows - 1;
    return unit.row === enemySpawnRow;
  };
  
  // Get spawn row for a player
  export const getSpawnRow = (playerId, rows = 5) => {
    return playerId === 1 ? rows - 1 : 0;
  };
  
  // Format a message for the game log
  export const formatLogMessage = (message, playerName) => {
    if (playerName) {
      return `${playerName}: ${message}`;
    }
    return message;
  };