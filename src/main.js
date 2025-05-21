// Show custom build menu (new method)
import GameMenu, { DeckSelection } from './components/GameMenu.js';
import CardBattleGame from './CardBattleGame.js';
import CardBattleGameUI from './components/CardBattleGameUI.js';
import DeckBuilder from './components/DeckBuilder.js';
import CustomBuildMenu from './components/CustomBuildMenu.js';
import CustomCardBuilder from './components/CustomCardBuilder.js';
import CustomCardsList from './components/CustomCardsList.js';
import predefinedDecks, { createCustomDeck } from './data/decks.js';
import { ROWS, COLS, PHASES, ARCHETYPES } from './utils/constants.js';

class CurveGameUI {
constructor() {
  this.gameInstance = null;
  this.selectedUnit = null;
  
  // Add error handling for the main initialization
  try {
    this.showMainMenu();
  } catch (error) {
    console.error('Error initializing game:', error);
  }
  
  // Bind event listeners
  document.addEventListener('DOMContentLoaded', () => {
    try {
      this.init();
    } catch (error) {
      console.error('Error in DOMContentLoaded:', error);
    }
  });
}

init() {
  // Initialize the game UI
  this.showMainMenu();
}

// Add log entry
addLogEntry(message, type = 'system') {
  const logContent = document.querySelector('.game-log-content');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = message;
  
  logContent.appendChild(entry);
  
  // Auto-scroll to bottom
  logContent.scrollTop = logContent.scrollHeight;
}

// Handle clicking on a unit
handleUnitClick(unit) {
  const currentPlayerIndex = this.gameInstance.currentPlayerIndex;
  const isCurrentPlayerUnit = unit.player === currentPlayerIndex + 1;
  
  // During the advance phase, select the unit to move
  if (this.gameInstance.currentPhase === PHASES.ADVANCE && isCurrentPlayerUnit) {
    this.selectedUnit = unit;
    this.showValidMoves(unit);
    this.addLogEntry(`Selected ${unit.cardName} to move.`, `player${unit.player}`);
  }
  // During the battle phase, select the unit to attack with
  else if (this.gameInstance.currentPhase === PHASES.BATTLE && isCurrentPlayerUnit && !unit.hasAttacked) {
    this.selectedUnit = unit;
    this.showValidAttackTargets(unit);
    this.addLogEntry(`Selected ${unit.cardName} to attack.`, `player${unit.player}`);
  }
  // If opponent unit is clicked during battle and we have a unit selected
  else if (this.gameInstance.currentPhase === PHASES.BATTLE && !isCurrentPlayerUnit && this.selectedUnit) {
    this.attackUnit(unit);
  }
}

// Attack a unit with the selected unit
attackUnit(targetUnit) {
  if (!this.selectedUnit) return;
  
  // Attack the unit
  const result = this.gameInstance.attackWithUnit(this.selectedUnit, targetUnit);
  
  if (result.success) {
    this.addLogEntry(
      `${this.selectedUnit.cardName} attacks ${targetUnit.cardName}!`,
      `player${this.gameInstance.currentPlayerIndex + 1}`
    );
    
    if (result.targetDied) {
      this.addLogEntry(`${targetUnit.cardName} was destroyed!`, `player${this.gameInstance.currentPlayerIndex + 1}`);
    }
    
    if (result.thisDied) {
      this.addLogEntry(`${this.selectedUnit.cardName} was destroyed!`, `player${this.gameInstance.currentPlayerIndex + 1}`);
    }
    
    this.selectedUnit = null;
    this.updateGameState();
    
    // Clear highlights
    document.querySelectorAll('.game-tile').forEach(tile => {
      tile.classList.remove('valid-target');
    });
    
    // Check for game over
    if (result.gameOver) {
      this.handleGameOver(result.winner);
    }
  }
}

// Show valid moves for a unit
showValidMoves(unit) {
  // Clear previous highlights
  document.querySelectorAll('.game-tile').forEach(tile => {
    tile.classList.remove('valid-move', 'valid-target');
  });
  
  // Get valid moves from game logic
  const direction = unit.player === 1 ? -1 : 1; // Player 1 moves up, Player 2 moves down
  const newRow = unit.row + direction;
  
  // Check if new position is on the board and not occupied
  if (newRow >= 0 && newRow < ROWS && !this.gameInstance.isOccupied(newRow, unit.col)) {
    const tile = document.querySelector(`.game-tile[data-row="${newRow}"][data-col="${unit.col}"]`);
    if (tile) {
      tile.classList.add('valid-move');
    }
  }
}

// Show valid attack targets for a unit
showValidAttackTargets(unit) {
  // Clear previous highlights
  document.querySelectorAll('.game-tile').forEach(tile => {
    tile.classList.remove('valid-move', 'valid-target');
  });
  
  // Determine potential attack targets (front and adjacent)
  const { row, col, player } = unit;
  const direction = player === 1 ? -1 : 1; // Player 1 attacks upward
  
  // Front position
  const frontRow = row + direction;
  if (frontRow >= 0 && frontRow < ROWS) {
    // Check front position
    if (this.gameInstance.isOccupied(frontRow, col)) {
      const frontUnit = this.gameInstance.getUnitAt(frontRow, col);
      if (frontUnit && frontUnit.player !== player) {
        const tile = document.querySelector(`.game-tile[data-row="${frontRow}"][data-col="${col}"]`);
        if (tile) tile.classList.add('valid-target');
      }
    }
    
    // Check diagonals
    [-1, 1].forEach(offset => {
      const diagCol = col + offset;
      if (diagCol >= 0 && diagCol < COLS && this.gameInstance.isOccupied(frontRow, diagCol)) {
        const diagUnit = this.gameInstance.getUnitAt(frontRow, diagCol);
        if (diagUnit && diagUnit.player !== player) {
          const tile = document.querySelector(`.game-tile[data-row="${frontRow}"][data-col="${diagCol}"]`);
          if (tile) tile.classList.add('valid-target');
        }
      }
    });
    
    // Check for direct attack on enemy spawn
    if (
      (player === 1 && frontRow === 0 && !this.gameInstance.isOccupied(frontRow, col)) ||
      (player === 2 && frontRow === ROWS - 1 && !this.gameInstance.isOccupied(frontRow, col))
    ) {
      const tile = document.querySelector(`.game-tile[data-row="${frontRow}"][data-col="${col}"]`);
      if (tile) {
        tile.classList.add('valid-target');
        tile.dataset.directAttack = 'true';
      }
    }
  }
}

// Handle direct attack on player
handleDirectAttack(row, col) {
  if (!this.selectedUnit) return;
  
  const targetPlayer = this.gameInstance.getOpponentPlayer();
  const damage = this.selectedUnit.attack;
  
  // Create a fake target for the attack function
  const target = {
    isPlayerHealth: true,
    player: targetPlayer.id,
    row,
    col,
    name: 'Enemy Spawn'
  };
  
  const result = this.gameInstance.attackWithUnit(this.selectedUnit, target);
  
  if (result.success) {
    this.addLogEntry(
      `${this.selectedUnit.cardName} attacks Player ${targetPlayer.id} directly for ${damage} damage!`,
      `player${this.gameInstance.currentPlayerIndex + 1}`
    );
    
    this.selectedUnit = null;
    this.updateGameState();
    
    // Clear highlights
    document.querySelectorAll('.game-tile').forEach(tile => {
      tile.classList.remove('valid-target');
      delete tile.dataset.directAttack;
    });
    
    // Check for game over
    if (result.gameOver) {
      this.handleGameOver(result.winner);
    }
  }
}

// Handle game over
handleGameOver(winner) {
  const winnerName = winner === 1 ? 'Player 1' : 'Player 2';
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  modalContent.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Game Over</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <p>${winnerName} wins the game!</p>
    </div>
    <div class="modal-footer">
      <button class="menu-button primary" id="btn-play-again">Play Again</button>
      <button class="menu-button" id="btn-return-menu">Return to Menu</button>
    </div>
  `;
  
  overlay.appendChild(modalContent);
  document.body.appendChild(overlay);
  
  // Add event listeners
  modalContent.querySelector('.modal-close').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  modalContent.querySelector('#btn-play-again').addEventListener('click', () => {
    document.body.removeChild(overlay);
    this.startGameMode(this.gameInstance.isAIOpponent ? 'ai' : '1v1');
  });
  
  modalContent.querySelector('#btn-return-menu').addEventListener('click', () => {
    document.body.removeChild(overlay);
    this.showMainMenu();
  });
  
  // Log game end
  this.addLogEntry(`Game Over! ${winnerName} wins!`, 'system');
}

// Confirm exiting a game
confirmExitGame() {
  if (confirm('Are you sure you want to exit the current game?')) {
    this.showMainMenu();
  }
}

// Show main menu
showMainMenu() {
  const container = document.getElementById('app');
  this.gameMenu = new GameMenu(container, {
    onPlay1v1: () => this.startDeckSelection('1v1'),
    onPlayAI: () => this.startDeckSelection('ai'),
    // Replace direct DeckBuilder with CustomBuildMenu
    onDeckBuilder: () => this.showCustomBuildMenu()
  });
}
showCardsList() {
  const container = document.getElementById('app');
  
  // Make sure CustomCardsList is imported
  if (typeof CustomCardsList === 'undefined') {
    console.error('CustomCardsList is not defined! Make sure it is imported.');
    alert('Error: CustomCardsList component is missing.');
    this.showCustomBuildMenu(); // Fallback to menu
    return;
  }
  
  this.customCardsList = new CustomCardsList(container, {
    onBack: () => this.showCustomBuildMenu(),
    onEditCard: (card) => this.showCardBuilder(card),
    onPlayWithCard: (card) => {
      // Logic to add the card to a deck or start a game with it
      console.log('Playing with card:', card);
      // For now, just go back to the custom build menu
      this.showCustomBuildMenu();
    }
  });
}
// Show the custom build menu (new method)
showCustomBuildMenu() {
  const container = document.getElementById('app');
  this.customBuildMenu = new CustomBuildMenu(container, {
    onDeckBuilder: () => this.showDeckBuilder(),
    onCardBuilder: () => this.showCardsList(), // Navigate to cards list first
    onBack: () => this.showMainMenu()
  });
}

// Show custom card builder (new method)
showCardBuilder(existingCard = null) {
  const container = document.getElementById('app');
  
  // Use arrow functions to preserve 'this' context and proper navigation
  this.customCardBuilder = new CustomCardBuilder(container, {
    onBack: () => {
      console.log('Back button clicked, navigating to cards list');
      this.showCardsList();
    },
    onCardSaved: (card) => {
      console.log('Card saved:', card);
      
      // Save the card to localStorage
      let customCards = [];
      try {
        const savedCards = localStorage.getItem('curve_custom_cards');
        if (savedCards) {
          customCards = JSON.parse(savedCards);
        }
      } catch (e) {
        console.error('Error loading custom cards:', e);
      }
      
      // Check if we're editing an existing card or adding a new one
      if (existingCard) {
        // Find the card to update
        const index = customCards.findIndex(c => c.name === existingCard.name);
        if (index !== -1) {
          customCards[index] = card;
        } else {
          customCards.push(card);
        }
      } else {
        // Add new card
        customCards.push(card);
      }
      
      // Save back to localStorage
      try {
        localStorage.setItem('curve_custom_cards', JSON.stringify(customCards));
      } catch (e) {
        console.error('Error saving custom cards:', e);
        alert('Failed to save card: ' + e.message);
      }
      
      // Navigate back to the cards list
      console.log('Navigating to cards list after save');
      this.showCardsList();
    },
    existingCard: existingCard
  });
}

// Start deck selection
startDeckSelection(mode) {
  const container = document.getElementById('app');
  this.deckSelection = new DeckSelection(container, {
    onDeckSelected: (archetype) => {
      if (mode === '1v1') {
        // Store first player's deck selection
        this.player1Deck = archetype;
        // Show deck selection for second player
        this.deckSelection = new DeckSelection(container, {
          onDeckSelected: (player2Archetype) => {
            // Start game with both players' deck selections
            this.startGameMode(mode, this.player1Deck, player2Archetype);
          },
          onBack: () => {
            // Go back to first player's selection
            this.startDeckSelection(mode);
          }
        }, 'Player 2');
      } else {
        // For AI mode, just start with single deck selection
        this.startGameMode(mode, archetype);
      }
    },
    onBack: () => this.showMainMenu()
  }, 'Player 1');
}

// Start game mode
startGameMode(mode, player1Deck, player2Deck) {
  try {
    // Get player 1's deck
    let player1DeckObj;
    if (typeof player1Deck === 'string') {
      // Built-in archetype
      player1DeckObj = predefinedDecks[player1Deck] || createCustomDeck('Default', player1Deck);
    } else if (typeof player1Deck === 'object' && Array.isArray(player1Deck.cards)) {
      // Custom deck
      let customCards = [];
      try {
        customCards = JSON.parse(localStorage.getItem('curve_custom_cards')) || [];
      } catch {}
      // Filter out missing cards and warn
      const missingCards = [];
      const validCards = player1Deck.cards.map(cardId => {
        const card = customCards.find(c => c.id == cardId);
        if (!card) {
          missingCards.push(cardId);
          return null;
        }
        return { ...card, count: 1 };
      }).filter(Boolean);
      if (missingCards.length > 0) {
        alert(`Warning: The following card IDs are missing from your custom cards and will be skipped: ${missingCards.join(', ')}`);
      }
      player1DeckObj = {
        name: player1Deck.name || 'Custom Deck',
        archetype: player1Deck.archetype || 'Custom',
        cards: validCards
      };
    } else {
      console.error('Invalid player 1 deck selection:', player1Deck);
      return;
    }

    // Get player 2's deck (or AI deck)
    let player2DeckObj;
    if (mode === 'ai') {
      // For AI mode, use predefined deck
      player2DeckObj = predefinedDecks[ARCHETYPES.NETHER];
    } else {
      // For 1v1 mode, use player 2's selection
      if (typeof player2Deck === 'string') {
        player2DeckObj = predefinedDecks[player2Deck] || createCustomDeck('Default', player2Deck);
      } else if (typeof player2Deck === 'object' && Array.isArray(player2Deck.cards)) {
        let customCards = [];
        try {
          customCards = JSON.parse(localStorage.getItem('curve_custom_cards')) || [];
        } catch {}
        // Filter out missing cards and warn
        const missingCards = [];
        const validCards = player2Deck.cards.map(cardId => {
          const card = customCards.find(c => c.id == cardId);
          if (!card) {
            missingCards.push(cardId);
            return null;
          }
          return { ...card, count: 1 };
        }).filter(Boolean);
        if (missingCards.length > 0) {
          alert(`Warning: The following card IDs are missing from your custom cards and will be skipped: ${missingCards.join(', ')}`);
        }
        player2DeckObj = {
          name: player2Deck.name || 'Custom Deck',
          archetype: player2Deck.archetype || 'Custom',
          cards: validCards
        };
      } else {
        console.error('Invalid player 2 deck selection:', player2Deck);
        return;
      }
    }

    if (!player2DeckObj) {
      console.error('Failed to load player 2 deck');
      return;
    }

    console.log('Player 1 deck:', player1DeckObj);
    console.log('Player 2 deck:', player2DeckObj);

    // Create game instance
    this.gameInstance = new CardBattleGame(player1DeckObj, player2DeckObj, mode === 'ai');

    // Start the game and make sure first turn logic runs
    this.gameInstance.startGame();

    // Verify that pendingActions has Kriper placement
    console.log('Pending actions after startGame:', this.gameInstance.pendingActions);

    // Render the game UI
    const container = document.getElementById('app');
    if (!container) {
      console.error('Game container not found');
      return;
    }

    this.cardBattleGameUI = new CardBattleGameUI(container, this.gameInstance);

    // Additional checks
    if (this.gameInstance.isFirstTurn) {
      console.log('Game is in first turn state');
    }

    console.log('Game started successfully');
  } catch (error) {
    console.error('Error starting game:', error);
  }
}

// Show deck builder
showDeckBuilder() {
  const container = document.getElementById('app');
  this.deckBuilder = new DeckBuilder(container, {
    onBack: () => this.showCustomBuildMenu() // Changed to go back to CustomBuildMenu
  });
}

// Update game state
updateGameState() {
  // Update UI components
  if (this.cardBattleGameUI) {
    this.cardBattleGameUI.update(this.gameInstance);
  }
}
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
new CurveGameUI();
});

export default CurveGameUI;