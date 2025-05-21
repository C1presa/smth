// Debug utilities for the game
const DEBUG = {
  enabled: true,
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  
  // Log levels
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  
  // Current log level value
  get currentLevel() {
    return this.levels[this.logLevel] || 0;
  },
  
  // Logging methods
  log: function(message, level = 'info', data = null) {
    if (!this.enabled) return;
    
    const logLevel = this.levels[level] || 0;
    if (logLevel < this.currentLevel) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  },
  
  debug: function(message, data = null) {
    this.log(message, 'debug', data);
  },
  
  info: function(message, data = null) {
    this.log(message, 'info', data);
  },
  
  warn: function(message, data = null) {
    this.log(message, 'warn', data);
  },
  
  error: function(message, data = null) {
    this.log(message, 'error', data);
  },
  
  // Game state debugging
  logGameState: function(game) {
    if (!this.enabled) return;
    
    this.info('Current Game State:', {
      turn: game.turnNumber,
      phase: game.currentPhase,
      currentPlayer: game.currentPlayerIndex + 1,
      isFirstTurn: game.isFirstTurn,
      pendingActions: game.pendingActions,
      players: game.players.map(p => ({
        id: p.id,
        health: p.health,
        mana: p.mana,
        units: p.units.length,
        hand: p.hand.length
      }))
    });
  },
  
  // Unit debugging
  logUnit: function(unit) {
    if (!this.enabled) return;
    
    this.info('Unit State:', {
      id: unit.id,
      name: unit.cardName,
      player: unit.player,
      position: { row: unit.row, col: unit.col },
      stats: {
        attack: unit.attack,
        health: unit.health,
        maxHealth: unit.maxHealth
      },
      state: {
        hasMoved: unit.hasMoved,
        hasAttacked: unit.hasAttacked
      }
    });
  },
  
  // Board state debugging
  logBoardState: function(board) {
    if (!this.enabled) return;
    
    const boardState = board.tiles.map((row, rowIndex) => 
      row.map((tile, colIndex) => {
        const unit = board.game.getUnitAt(rowIndex, colIndex);
        return unit ? {
          unitId: unit.id,
          unitName: unit.cardName,
          player: unit.player
        } : null;
      })
    );
    
    this.info('Board State:', boardState);
  },
  
  // Event debugging
  logEvent: function(eventName, data = null) {
    if (!this.enabled) return;
    
    this.debug(`Event: ${eventName}`, data);
  },
  
  // Performance monitoring
  performance: {
    marks: {},
    
    start: function(label) {
      this.marks[label] = performance.now();
    },
    
    end: function(label) {
      if (!this.marks[label]) {
        console.warn(`No performance mark found for: ${label}`);
        return;
      }
      
      const duration = performance.now() - this.marks[label];
      DEBUG.info(`Performance [${label}]: ${duration.toFixed(2)}ms`);
      delete this.marks[label];
    }
  },
  
  // Error tracking
  trackError: function(error, context = {}) {
    this.error('Game Error:', {
      message: error.message,
      stack: error.stack,
      context
    });
  }
};

// Export the debug utilities
export default DEBUG; 