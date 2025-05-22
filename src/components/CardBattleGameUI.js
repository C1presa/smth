// CardBattleGameUI.js - Corrected implementation
import GameBoard from './GameBoard.js';
import PlayerHand from './PlayerHand.js';
import PlayerStats from './PlayerStats.js';
import GameLog from './GameLog.js';
import { PHASES } from '../utils/constants.js';
import CustomCardBuilder from './CustomCardBuilder.js';
import * as Effects from '../utils/effects.js';
import { getEffectContainerHTML } from '../utils/effectIcons.js';

class CardBattleGameUI {
  constructor(container, gameInstance) {
    this.container = container;
    this.game = gameInstance;
    this.elements = {
      // Pre-initialize all elements to avoid undefined errors
      phaseInfo: null,
      turnCounter: null,
      phaseButton: null,
      player1Stats: null,
      player2Stats: null,
      gameBoard: null,
      boardCenter: null,
      playerHand: null,
      gameLog: null,
      gameMessage: null,
      p2Deck: null,
      p2Grave: null,
      p1Grave: null,
      p1Deck: null
    };
    
    this.createUI();
    this.update();
    this.bindEvents();
  }
  
  createUI() {
    // Verify the container exists
    if (!this.container) {
      console.error('Container element is null or undefined');
      return;
    }
    
    this.container.innerHTML = '';
    
    // Main container with dark background - updated to match CURVE GAME reference
    this.container.style.backgroundColor = '#0f172a'; // Darker background
    this.container.style.backgroundImage = 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'; // Subtle gradient
    this.container.style.height = '100vh';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.overflow = 'hidden';
    
    // Game header with logo and phase info
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '10px 20px';
    header.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
    header.style.backdropFilter = 'blur(10px)';
    header.style.borderBottom = '1px solid #2d3748';
    header.style.height = '60px';
    header.style.minHeight = '60px';
    
    // Game logo
    const gameLogo = document.createElement('div');
    gameLogo.textContent = 'CURVE GAME';
    gameLogo.style.fontSize = '1.5rem';
    gameLogo.style.fontWeight = 'bold';
    gameLogo.style.color = '#f59e0b';
    gameLogo.style.textShadow = '0 0 10px rgba(245, 158, 11, 0.5)';
    
    // Menu button
    const menuButton = document.createElement('button');
    menuButton.textContent = 'Menu';
    menuButton.style.backgroundColor = '#334155';
    menuButton.style.color = 'white';
    menuButton.style.border = 'none';
    menuButton.style.padding = '6px 12px';
    menuButton.style.borderRadius = '4px';
    menuButton.style.fontWeight = 'bold';
    menuButton.style.cursor = 'pointer';
    menuButton.style.transition = 'all 0.2s ease';
    
    menuButton.addEventListener('mouseenter', () => {
      menuButton.style.backgroundColor = '#475569';
    });
    
    menuButton.addEventListener('mouseleave', () => {
      menuButton.style.backgroundColor = '#334155';
    });
    
    menuButton.addEventListener('click', () => {
      if (confirm('Return to main menu? Current game progress will be lost.')) {
        location.reload();
      }
    });
    
    header.appendChild(gameLogo);
    header.appendChild(menuButton);
    
    // Main gameplay area with improved layout
    const gameplayArea = document.createElement('div');
    gameplayArea.style.flex = '1';
    gameplayArea.style.display = 'grid';
    gameplayArea.style.gridTemplateRows = 'auto 1fr auto';
    gameplayArea.style.gridTemplateColumns = 'minmax(100px, 0.8fr) 60px 60px minmax(800px, 5fr) 60px 60px minmax(100px, 0.8fr)';
    gameplayArea.style.gridTemplateAreas = `
      "player2stats p2deck p2grave turn turn turn turn"
      "player2stats p2deck p2grave gameboard p1grave p1deck player1stats"
      ".         .      .      playerhand .      .      .         "
    `;
    gameplayArea.style.gap = '12px';
    gameplayArea.style.padding = '12px';
    gameplayArea.style.height = 'calc(100vh - 60px)';
    gameplayArea.style.overflow = 'hidden';
    
    // Create main areas
    // Player 2 area (left column, top)
    this.elements.player2Stats = document.createElement('div');
    this.elements.player2Stats.style.gridArea = 'player2stats';
    this.elements.player2Stats.style.backgroundColor = 'rgba(30, 58, 138, 0.4)';
    this.elements.player2Stats.style.borderRadius = '8px';
    this.elements.player2Stats.style.padding = '15px';
    this.elements.player2Stats.style.display = 'flex';
    this.elements.player2Stats.style.flexDirection = 'column';
    this.elements.player2Stats.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    this.elements.player2Stats.style.minHeight = '60px';
    this.elements.player2Stats.style.maxHeight = '70px';
    
    // Player 2 Deck
    this.elements.p2Deck = document.createElement('div');
    this.elements.p2Deck.style.gridArea = 'p2deck';
    this.elements.p2Deck.style.display = 'flex';
    this.elements.p2Deck.style.flexDirection = 'column';
    this.elements.p2Deck.style.alignItems = 'center';
    this.elements.p2Deck.style.justifyContent = 'center';
    this.elements.p2Deck.innerHTML = `<div style="width:38px;height:54px;background:#334155;border-radius:6px;box-shadow:0 2px 6px #0003;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;">🂠</div><div style="color:#94a3b8;font-size:0.9rem;margin-top:4px;">Deck</div>`;

    // Player 2 Graveyard
    this.elements.p2Grave = document.createElement('div');
    this.elements.p2Grave.style.gridArea = 'p2grave';
    this.elements.p2Grave.style.display = 'flex';
    this.elements.p2Grave.style.flexDirection = 'column';
    this.elements.p2Grave.style.alignItems = 'center';
    this.elements.p2Grave.style.justifyContent = 'center';
    this.elements.p2Grave.innerHTML = `<div style="width:38px;height:54px;background:#1e293b;border-radius:6px;box-shadow:0 2px 6px #0003;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;">🪦</div><div style="color:#94a3b8;font-size:0.9rem;margin-top:4px;">Grave</div>`;

    // Turn info area (center, top)
    const turnArea = document.createElement('div');
    turnArea.style.gridArea = 'turn';
    turnArea.style.display = 'flex';
    turnArea.style.flexDirection = 'row';
    turnArea.style.alignItems = 'center';
    turnArea.style.gap = '10px';
    turnArea.style.width = 'fit-content';
    turnArea.style.minWidth = 'unset';
    turnArea.style.maxWidth = '420px';
    turnArea.style.padding = '4px 10px';
    turnArea.style.backgroundColor = '#1e293b';
    turnArea.style.borderRadius = '8px';
    turnArea.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';

    // Phase info (left side of turn area)
    const phaseInfoContainer = document.createElement('div');
    phaseInfoContainer.style.display = 'flex';
    phaseInfoContainer.style.flexDirection = 'column';
    phaseInfoContainer.style.gap = '0px';
    phaseInfoContainer.style.maxWidth = '200px';

    this.elements.phaseInfo = document.createElement('div');
    this.elements.phaseInfo.style.color = 'white';
    this.elements.phaseInfo.style.fontSize = '0.95rem';
    this.elements.phaseInfo.style.fontWeight = 'bold';
    this.elements.phaseInfo.style.lineHeight = '1.1';

    this.elements.turnCounter = document.createElement('div');
    this.elements.turnCounter.style.color = '#94a3b8';
    this.elements.turnCounter.style.fontSize = '0.8rem';
    this.elements.turnCounter.style.lineHeight = '1.1';

    phaseInfoContainer.appendChild(this.elements.phaseInfo);
    phaseInfoContainer.appendChild(this.elements.turnCounter);

    // Phase button (now immediately after phase info)
    this.elements.phaseButton = document.createElement('button');
    this.elements.phaseButton.textContent = 'To Battle Phase';
    this.elements.phaseButton.style.backgroundColor = '#3b82f6';
    this.elements.phaseButton.style.color = 'white';
    this.elements.phaseButton.style.border = 'none';
    this.elements.phaseButton.style.padding = '6px 12px';
    this.elements.phaseButton.style.borderRadius = '4px';
    this.elements.phaseButton.style.fontWeight = 'bold';
    this.elements.phaseButton.style.fontSize = '0.95rem';
    this.elements.phaseButton.style.cursor = 'pointer';
    this.elements.phaseButton.style.transition = 'all 0.2s ease';
    this.elements.phaseButton.style.marginLeft = '8px';

    turnArea.appendChild(phaseInfoContainer);
    turnArea.appendChild(this.elements.phaseButton);
    
    // Game log area (right column)
    this.elements.gameLog = document.createElement('div');
    this.elements.gameLog.style.gridArea = 'player-log';
    this.elements.gameLog.style.backgroundColor = '#1e293b';
    this.elements.gameLog.style.borderRadius = '8px';
    this.elements.gameLog.style.display = 'flex';
    this.elements.gameLog.style.flexDirection = 'column';
    this.elements.gameLog.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    
    // Game board area (center, middle)
    this.elements.gameBoard = document.createElement('div');
    this.elements.gameBoard.style.gridArea = 'gameboard';
    this.elements.gameBoard.style.backgroundColor = '#131c2e';
    this.elements.gameBoard.style.borderRadius = '8px';
    this.elements.gameBoard.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    this.elements.gameBoard.style.display = 'flex';
    this.elements.gameBoard.style.minHeight = '600px';
    
    // Player 1 Graveyard
    this.elements.p1Grave = document.createElement('div');
    this.elements.p1Grave.style.gridArea = 'p1grave';
    this.elements.p1Grave.style.display = 'flex';
    this.elements.p1Grave.style.flexDirection = 'column';
    this.elements.p1Grave.style.alignItems = 'center';
    this.elements.p1Grave.style.justifyContent = 'center';
    this.elements.p1Grave.innerHTML = `<div style="width:38px;height:54px;background:#1e293b;border-radius:6px;box-shadow:0 2px 6px #0003;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;">🪦</div><div style="color:#94a3b8;font-size:0.9rem;margin-top:4px;">Grave</div>`;

    // Player 1 Deck
    this.elements.p1Deck = document.createElement('div');
    this.elements.p1Deck.style.gridArea = 'p1deck';
    this.elements.p1Deck.style.display = 'flex';
    this.elements.p1Deck.style.flexDirection = 'column';
    this.elements.p1Deck.style.alignItems = 'center';
    this.elements.p1Deck.style.justifyContent = 'center';
    this.elements.p1Deck.innerHTML = `<div style="width:38px;height:54px;background:#334155;border-radius:6px;box-shadow:0 2px 6px #0003;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;">🂠</div><div style="color:#94a3b8;font-size:0.9rem;margin-top:4px;">Deck</div>`;

    // Player 1 area (right column, bottom)
    this.elements.player1Stats = document.createElement('div');
    this.elements.player1Stats.style.gridArea = 'player1stats';
    this.elements.player1Stats.style.backgroundColor = 'rgba(153, 27, 27, 0.4)';
    this.elements.player1Stats.style.borderRadius = '8px';
    this.elements.player1Stats.style.padding = '15px';
    this.elements.player1Stats.style.display = 'flex';
    this.elements.player1Stats.style.flexDirection = 'column';
    this.elements.player1Stats.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    this.elements.player1Stats.style.minHeight = '60px';
    this.elements.player1Stats.style.maxHeight = '70px';
    
    // Player hand area (center, bottom)
    this.elements.playerHand = document.createElement('div');
    this.elements.playerHand.style.gridArea = 'playerhand';
    this.elements.playerHand.style.backgroundColor = '#1e293b';
    this.elements.playerHand.style.borderRadius = '8px';
    this.elements.playerHand.style.padding = '10px';
    this.elements.playerHand.style.display = 'flex';
    this.elements.playerHand.style.alignItems = 'center';
    this.elements.playerHand.style.justifyContent = 'center';
    this.elements.playerHand.style.position = 'relative';
    this.elements.playerHand.style.minHeight = '200px';
    this.elements.playerHand.style.maxHeight = '220px';
    this.elements.playerHand.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    
    // Add all areas to the gameplay container
    gameplayArea.appendChild(this.elements.player2Stats);
    gameplayArea.appendChild(this.elements.p2Deck);
    gameplayArea.appendChild(this.elements.p2Grave);
    gameplayArea.appendChild(this.elements.gameBoard);
    gameplayArea.appendChild(this.elements.p1Grave);
    gameplayArea.appendChild(this.elements.p1Deck);
    gameplayArea.appendChild(this.elements.player1Stats);
    gameplayArea.appendChild(this.elements.playerHand);
    
    // Add turnArea to gameplayArea
    gameplayArea.appendChild(turnArea);
    
    // Game message overlay for notifications
    this.elements.gameMessage = document.createElement('div');
    this.elements.gameMessage.style.position = 'fixed';
    this.elements.gameMessage.style.top = '50%';
    this.elements.gameMessage.style.left = '50%';
    this.elements.gameMessage.style.transform = 'translate(-50%, -50%)';
    this.elements.gameMessage.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    this.elements.gameMessage.style.color = 'white';
    this.elements.gameMessage.style.padding = '15px 30px';
    this.elements.gameMessage.style.borderRadius = '8px';
    this.elements.gameMessage.style.zIndex = '100';
    this.elements.gameMessage.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    this.elements.gameMessage.style.display = 'none';
    this.elements.gameMessage.style.fontSize = '1.2rem';
    this.elements.gameMessage.style.fontWeight = 'bold';
    this.elements.gameMessage.style.textAlign = 'center';
    
    // Add main components to the container
    this.container.appendChild(header);
    this.container.appendChild(gameplayArea);
    this.container.appendChild(this.elements.gameMessage);
    
    // Initialize components
    this.gameLog = new GameLog(this.elements.gameLog);
    this.board = new GameBoard(
      this.game, 
      this.elements.gameBoard, 
      {
        onTileClick: (row, col) => this.handleTileClick(row, col),
        onUnitClick: (unit) => this.handleUnitClick(unit)
      }
    );
    
    this.player1Stats = new PlayerStats(
      this.game.players[0],
      this.elements.player1Stats,
      true
    );
    
    this.player2Stats = new PlayerStats(
      this.game.players[1],
      this.elements.player2Stats,
      false
    );
    
    this.playerHand = new PlayerHand(
      this.game.players[0],
      this.elements.playerHand,
      {
        onCardSelected: (index, card) => this.handleCardSelected(index, card),
        onCardDeselected: () => this.handleCardDeselected()
      }
    );
    
    // Log initial game message
    this.gameLog.addEntry('Game started! Place your starting units.', null, 'system');
  }
  
  // Keep your existing bindEvents method
  bindEvents() {
    // Phase button click
    this.elements.phaseButton.addEventListener('click', () => {
      if (this.game.targetingMode) {
        // Cancel targeting mode
        this.game.exitTargetingMode(); // Game logic handles phase restoration
        this.board.clearSelection(); // Clear UI selections
        this.board.clearHighlights(); // Clear UI highlights
        // Ensure message overlay is hidden if it was a targeting prompt
        if (this.elements.gameMessage.textContent.startsWith("Select a target for")) {
            this.elements.gameMessage.style.display = 'none';
        }
        this.update(); // Refresh UI to reflect exited targeting mode
      } else {
        // Regular phase progression
        this.nextPhase();
      }
    });
    
    this.elements.phaseButton.addEventListener('mouseenter', () => {
      if (!this.elements.phaseButton.disabled) {
        this.elements.phaseButton.style.backgroundColor = '#2563eb';
      }
    });
    
    this.elements.phaseButton.addEventListener('mouseleave', () => {
      if (!this.elements.phaseButton.disabled) {
        this.elements.phaseButton.style.backgroundColor = '#3b82f6';
      }
    });
    
    // Game board message event
    this.elements.gameBoard.addEventListener('game-message', (e) => {
      this.showMessage(e.detail.message);
    });
  }
  
  // Keep your existing update method
  update() {
    this.board.clearHighlights();
    this.board.clearValidTargets();
    this.elements.gameMessage.textContent = '';
    if (
      this.game.targetingMode.active &&
      this.game.targetingMode.sourceUnit &&
      this.game.targetingMode.effect
    ) {
      this.board.highlightValidTargets(this.game.targetingMode.validTargets);
      this.showMessage(this.game.targetingMode.message);
    }
    // Update phase info
    this.updatePhaseInfo();
    
    // Update player stats
    const currentPlayerIndex = this.game.currentPlayerIndex;
    
    this.player1Stats.updatePlayer(
      this.game.players[0],
      currentPlayerIndex === 0
    );
    
    this.player2Stats.updatePlayer(
      this.game.players[1],
      currentPlayerIndex === 1
    );
    
    // Update player hand
    this.playerHand.updatePlayer(this.game.players[currentPlayerIndex]);
    
    // Update board
    this.board.update();
    
    // Check for game over
    if (this.game.isGameOver) {
      this.handleGameOver();
    }
    
    // Update phase button text and state for targeting mode handled in updatePhaseInfo

    // Update UI based on targeting mode
    if (this.game.targetingMode.active) {
      this.showTargetingUI();
    } else {
      this.hideTargetingUI();
    }
  }
  
  // Keep your existing updatePhaseInfo method but improve it
  updatePhaseInfo() {
    let phaseText = '';
    let buttonEnabled = true;
    let buttonText = 'Next Phase';
    const currentPlayer = this.game.getCurrentPlayer();
    const playerName = currentPlayer.id === 1 ? 'Player 1' : 'Player 2';

    if (this.game.targetingMode && this.game.targetingMode.active) {
      phaseText = `${playerName} - Select Target for ${this.game.targetingMode.sourceUnit.cardName}'s ${this.game.targetingMode.effect.type} effect`;
      buttonText = 'Cancel Targeting';
      buttonEnabled = true;
    } else if (this.game.pendingActions.length > 0 && this.game.pendingActions[0].type === 'placeKriper') {
      phaseText = `${playerName} - Place Your Kriper`;
      buttonEnabled = false;
    } else {
      switch (this.game.currentPhase) {
        case PHASES.DRAW:
          phaseText = `${playerName}'s Draw Phase`;
          buttonText = 'Draw Card';
          buttonEnabled = true;
          break;
        case PHASES.ADVANCE:
          phaseText = `${playerName}'s Advance Phase`;
          buttonText = 'Advance Units';
          buttonEnabled = true;
          break;
        case PHASES.PLAY:
          phaseText = `${playerName}'s Play Phase`;
          buttonText = 'To Battle Phase';
          buttonEnabled = true;
          break;
        case PHASES.BATTLE:
          phaseText = `${playerName}'s Battle Phase`;
          buttonText = 'End Turn';
          buttonEnabled = true;
          break;
        case PHASES.END:
          phaseText = `${playerName}'s End Phase`;
          buttonText = 'End Turn';
          buttonEnabled = true;
          break;
        default:
          phaseText = `${playerName}'s Turn (${this.capitalizeFirstLetter(this.game.currentPhase)})`;
          buttonEnabled = true;
          break;
      }
    }

    this.elements.phaseInfo.innerHTML = `
      <div class="phase-text">${phaseText}</div>
      <div class="turn-text">Turn ${this.game.turnNumber}</div>
    `;
    this.elements.phaseButton.textContent = buttonText;
    this.elements.phaseButton.disabled = !buttonEnabled;
  }
  
  // Keep the rest of your existing methods
  autoProgressPhases() {
    const phase = this.game.currentPhase;
    const currentPlayer = this.game.getCurrentPlayer();
    
    if (phase === PHASES.BATTLE) {
      // Check if all units have attacked
      const allUnitsAttacked = currentPlayer.units.every(unit => unit.hasAttacked) || 
                              currentPlayer.units.length === 0;
      
      if (allUnitsAttacked) {
        setTimeout(() => {
          this.showMessage("All units have attacked. Ending turn...");
          this.nextPhase(); // This will now directly end the turn
        }, 1000);
      }
    }
  }
  
  nextPhase() {
    // Store current phase for comparison
    const currentPhase = this.game.currentPhase;
    
    // Proceed to next phase
    const result = this.game.nextPhase();
    
    if (result.success) {
      // Log phase change
      const currentPlayer = this.game.getCurrentPlayer();
      const playerName = currentPlayer.id === 1 ? 'Player 1' : 'Player 2';
      
      this.gameLog.logPhase(this.game.currentPhase, currentPlayer.id);
      
      // Update UI
      this.update();
      
      // Don't auto-advance if we're in Kriper placement phase
      if (this.game.currentPhase === 'kriper_placement') {
        return;
      }
      
      // Only auto-advance from DRAW -> ADVANCE
      if (currentPhase === PHASES.DRAW && this.game.currentPhase === PHASES.ADVANCE) {
        setTimeout(() => {
          this.showMessage("Advancing units...");
          this.nextPhase(); // Move to PLAY
        }, 1000);
        return;
      }
      // Only auto-advance from ADVANCE -> PLAY
      if (currentPhase === PHASES.ADVANCE && this.game.currentPhase === PHASES.PLAY) {
        setTimeout(() => {
          this.showMessage("Play phase started.");
          this.update();
        }, 500);
        return;
      }
      // Do NOT auto-advance after PLAY or BATTLE. User must click to proceed.
      // If it's AI's turn, process it
      if (this.game.isAIOpponent && this.game.currentPlayerIndex === 1) {
        setTimeout(() => {
          this.game.processAITurn();
          this.update();
        }, 1000);
      }
    } else if (result.reason === 'Must place Kriper first') {
      // Show message about Kriper placement
      this.showMessage(result.reason);
    }
  }
  
  // Keep your card handling methods
  handleCardSelected(index, card) {
    // Set the selected card index on the game
    this.game.selectedCardIndex = index;
    
    // Show message
    this.showMessage(`Select a position on your spawn row`);
  }
  
  handleCardDeselected() {
    // Clear the selected card
    this.game.selectedCardIndex = null;
  }
  
  // Enhanced game over handler with better styling
  handleGameOver() {
    const winner = this.game.players[this.game.winner - 1];
    const winnerName = `Player ${winner.id}`;
    
    // Create game over overlay with improved styling
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#1e293b';
    modal.style.borderRadius = '12px';
    modal.style.padding = '40px';
    modal.style.maxWidth = '500px';
    modal.style.width = '90%';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.5)';
    modal.style.border = '1px solid #334155';
    
    // Victory graphic
    const victoryIcon = document.createElement('div');
    victoryIcon.innerHTML = '🏆';
    victoryIcon.style.fontSize = '4rem';
    victoryIcon.style.marginBottom = '20px';
    
    const title = document.createElement('h2');
    title.textContent = 'Game Over';
    title.style.color = '#f8fafc';
    title.style.fontSize = '2.5rem';
    title.style.marginBottom = '10px';
    title.style.fontWeight = 'bold';
    
    const message = document.createElement('p');
    message.textContent = `${winnerName} wins the game!`;
    message.style.color = '#cbd5e1';
    message.style.fontSize = '1.2rem';
    message.style.marginBottom = '30px';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '15px';
    
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';
    playAgainButton.style.backgroundColor = '#3b82f6';
    playAgainButton.style.color = 'white';
    playAgainButton.style.border = 'none';
    playAgainButton.style.padding = '12px 24px';
    playAgainButton.style.borderRadius = '6px';
    playAgainButton.style.cursor = 'pointer';
    playAgainButton.style.fontWeight = 'bold';
    playAgainButton.style.transition = 'all 0.2s';
    playAgainButton.style.fontSize = '1rem';
    
    playAgainButton.addEventListener('mouseenter', () => {
      playAgainButton.style.backgroundColor = '#2563eb';
      playAgainButton.style.transform = 'translateY(-2px)';
    });
    
    playAgainButton.addEventListener('mouseleave', () => {
      playAgainButton.style.backgroundColor = '#3b82f6';
      playAgainButton.style.transform = 'translateY(0)';
    });
    
    playAgainButton.onclick = () => {
      document.body.removeChild(overlay);
      location.reload(); // Reload the page to start again
    };
    
    const menuButton = document.createElement('button');
    menuButton.textContent = 'Main Menu';
    menuButton.style.backgroundColor = '#475569';
    menuButton.style.color = 'white';
    menuButton.style.border = 'none';
    menuButton.style.padding = '12px 24px';
    menuButton.style.borderRadius = '6px';
    menuButton.style.cursor = 'pointer';
    menuButton.style.fontWeight = 'bold';
    menuButton.style.transition = 'all 0.2s';
    menuButton.style.fontSize = '1rem';
    
    menuButton.addEventListener('mouseenter', () => {
      menuButton.style.backgroundColor = '#64748b';
      menuButton.style.transform = 'translateY(-2px)';
    });
    
    menuButton.addEventListener('mouseleave', () => {
      menuButton.style.backgroundColor = '#475569';
      menuButton.style.transform = 'translateY(0)';
    });
    
    menuButton.onclick = () => {
      document.body.removeChild(overlay);
      location.reload(); // Reload to main menu
    };
    
    buttonContainer.appendChild(playAgainButton);
    buttonContainer.appendChild(menuButton);
    
    modal.appendChild(victoryIcon);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    
    document.body.appendChild(overlay);
    
    // Log in the game log
    this.gameLog.addEntry(`Game Over! ${winnerName} wins!`, null, 'system');
  }
  
  // Improved message display
  showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.textContent = message;
    
    // Add targeting-specific styling if in targeting mode
    if (this.game.targetingMode.active) {
      messageElement.classList.add('targeting-message');
    }
    
    this.elements.gameMessage.appendChild(messageElement);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  }

  // Add new event handling methods
  handleTileClick(row, col) {
    // If in targeting mode, don't handle tile clicks
    if (this.game.targetingMode.active) {
      return;
    }

    console.log(`Tile clicked at row ${row}, col ${col}`);
    
    // Priority: Handle Kriper placement if needed
    if (this.game.isFirstTurn && this.game.pendingActions.length > 0 && 
        this.game.pendingActions[0].type === 'placeKriper') {
      
      const pendingAction = this.game.pendingActions[0];
      const unit = pendingAction.unit;
      
      // Check if it's the correct spawn row
      const spawnRow = unit.player === 1 ? 4 : 0;
      if (row !== spawnRow) {
        this.showMessage("You must place Kriper on your spawn row!");
        return;
      }
      
      // Place the unit
      const result = this.game.placeUnit(unit, row, col);
      if (result.success) {
        this.gameLog.addEntry(`Player ${unit.player} placed Kriper at row ${row}, col ${col}`, unit.player);
        
        // Show message to continue turn
        const playerName = unit.player === 1 ? 'Player 1' : 'Player 2';
        this.showMessage(`${playerName}, drawing card...`);
        
        // Update UI
        this.update();
        
        // Set phase to DRAW and let normal auto-advance handle the rest
        this.game.currentPhase = PHASES.DRAW;
        setTimeout(() => {
          this.nextPhase();
        }, 1000);
      } else {
        this.showMessage(result.reason);
      }
      
      return;
    }
    
    // For battle phase and unit attacks
    if (this.game.currentPhase === PHASES.BATTLE && this.board.selectedUnit) {
      const tile = this.board.tiles[row][col];
      
      // Check if this is a valid target tile
      if (tile.classList.contains('valid-target')) {
        // Check if this is a direct attack on player's spawn row
        if (tile.dataset.directAttack === 'true') {
          console.log("Attempting direct spawn attack");
          
          // Create a target object for the spawn tile
          const targetPlayer = this.board.selectedUnit.player === 1 ? 2 : 1;
          const target = {
            isPlayerHealth: true,
            player: targetPlayer,
            row: row,
            col: col,
            name: 'Enemy Spawn'
          };
          
          // Use the game's built-in logic to attack the spawn
          const result = this.game.attackWithUnit(this.board.selectedUnit, target);
          
          if (result.success) {
            console.log("Spawn attack successful:", result);
            
            // Play spawn attack animation
            this.board.animateSpawnAttack(this.board.selectedUnit, row, col);
            
            // Log the attack
            this.gameLog.addEntry(
              `${this.board.selectedUnit.cardName} attacks enemy spawn for ${this.board.selectedUnit.attack} damage!`,
              this.board.selectedUnit.player
            );
            
            // Clear selection and update the board
            this.board.clearSelection();
            this.update();
            
            // Check for game over
            if (result.gameOver) {
              this.handleGameOver();
            }
          } else {
            console.error("Spawn attack failed:", result.reason);
            this.showMessage(result.reason);
          }
          return;
        }
        
        // For regular unit targets, continue with existing logic
        const targetUnit = this.game.getUnitAt(row, col);
        if (targetUnit && targetUnit.player !== this.board.selectedUnit.player) {
          const result = this.game.attackWithUnit(this.board.selectedUnit, targetUnit);
          
          if (result.success) {
            // Create attack animation
            this.animateAttack(this.board.selectedUnit, targetUnit);
            
            // Log the attack
            this.gameLog.addEntry(`${this.board.selectedUnit.cardName} attacks ${targetUnit.cardName}`, this.board.selectedUnit.player);
            
            if (result.targetDied) {
              this.gameLog.addEntry(`${targetUnit.cardName} was destroyed!`, this.board.selectedUnit.player);
            }
            
            this.board.clearSelection();
            this.update();
            
            // Check for game over
            if (this.game.isGameOver) {
              this.handleGameOver();
            }
          } else {
            this.showMessage(result.reason);
          }
        }
        return;
      }
    }
    
    // For regular play phase
    if (this.game.currentPhase === PHASES.PLAY && this.game.selectedCardIndex !== null) {
      const cardIndex = this.game.selectedCardIndex;
      
      // Play the card at the selected position
      const result = this.game.playCard(cardIndex, row, col);
      
      if (result.success) {
        // Log the play
        const player = this.game.getCurrentPlayer();
        const card = result.unit.getCard();
        this.gameLog.addEntry(`Player ${player.id} played ${card.name}`, player.id);
        
        // Add legendary card placement animation
        if (card.rarity === 'legendary') {
          console.log('Playing legendary card animation for:', card.name);
          // Create a floating card element
          const floatingCard = document.createElement('div');
          floatingCard.style.position = 'fixed';
          floatingCard.style.top = '-200px';
          floatingCard.style.left = '50%';
          floatingCard.style.transform = 'translateX(-50%)';
          floatingCard.style.width = '200px';
          floatingCard.style.height = '300px';
          floatingCard.style.backgroundColor = '#1e293b';
          floatingCard.style.borderRadius = '10px';
          floatingCard.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
          floatingCard.style.zIndex = '1000';
          floatingCard.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
          floatingCard.style.overflow = 'hidden';
          floatingCard.style.display = 'flex';
          floatingCard.style.flexDirection = 'column';
          
          // Archetype colors
          const archetypeColors = {
            'Nether': '#a21caf',
            'Swamp': '#16a34a',
            'Racetrack': '#f59e0b',
            'Elderwood': '#22d3ee',
            'Neutral': '#64748b'
          };
          
          // Type icons
          const typeIcons = {
            'demon': '👹',
            'cultist': '🧙',
            'beast': '🐗',
            'insect': '🐛',
            'undead': '💀',
            'racer': '🏎️',
            'lurker': '👁️'
          };
          
          // 1/3 - Top section with archetype color and type icon
          const topSection = document.createElement('div');
          topSection.style.height = '33.33%';
          topSection.style.backgroundImage = `linear-gradient(135deg, ${archetypeColors[card.archetype] || '#64748b'}, ${archetypeColors[card.archetype] || '#64748b'}66)`;
          topSection.style.display = 'flex';
          topSection.style.flexDirection = 'column';
          topSection.style.justifyContent = 'space-between';
          topSection.style.padding = '15px';
          topSection.style.position = 'relative';
          
          // Type icon
          const typeIcon = document.createElement('div');
          typeIcon.textContent = typeIcons[card.type] || '⚔️';
          typeIcon.style.fontSize = '3rem';
          typeIcon.style.textAlign = 'center';
          typeIcon.style.marginTop = '10px';
          
          // Mana cost
          const manaCost = document.createElement('div');
          manaCost.textContent = card.cost;
          manaCost.style.position = 'absolute';
          manaCost.style.top = '10px';
          manaCost.style.right = '10px';
          manaCost.style.width = '30px';
          manaCost.style.height = '30px';
          manaCost.style.backgroundColor = '#3b82f6';
          manaCost.style.borderRadius = '50%';
          manaCost.style.display = 'flex';
          manaCost.style.justifyContent = 'center';
          manaCost.style.alignItems = 'center';
          manaCost.style.fontWeight = 'bold';
          manaCost.style.color = 'white';
          manaCost.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
          
          topSection.appendChild(typeIcon);
          topSection.appendChild(manaCost);
          
          // 2/3 - Middle section with effect description
          const middleSection = document.createElement('div');
          middleSection.style.height = '33.33%';
          middleSection.style.backgroundColor = card.rarity === 'legendary' ? '#f59e0b' : '#1e293b';
          middleSection.style.padding = '15px';
          middleSection.style.display = 'flex';
          middleSection.style.alignItems = 'center';
          middleSection.style.justifyContent = 'center';
          middleSection.style.textAlign = 'center';
          middleSection.style.position = 'relative';
          middleSection.style.fontSize = '0.9rem';
          middleSection.style.lineHeight = '1.4';
          middleSection.style.overflow = 'hidden';
          middleSection.style.textOverflow = 'ellipsis';
          middleSection.style.whiteSpace = 'nowrap';
          
          // Add effect icons
          if (card.effects && card.effects.length > 0) {
            middleSection.innerHTML = getEffectContainerHTML(card.effects);
          } else {
            middleSection.textContent = 'No effects';
          }
          
          // Add full description as tooltip
          if (card.description) {
            middleSection.title = card.description;
          }
          
          // 3/3 - Bottom section with stats
          const bottomSection = document.createElement('div');
          bottomSection.style.height = '33.33%';
          bottomSection.style.backgroundColor = '#0f172a';
          bottomSection.style.padding = '15px';
          bottomSection.style.display = 'flex';
          bottomSection.style.justifyContent = 'space-between';
          bottomSection.style.alignItems = 'center';
          bottomSection.style.borderTop = '1px solid #334155';
          
          // Attack stat
          const attackStat = document.createElement('div');
          attackStat.style.display = 'flex';
          attackStat.style.alignItems = 'center';
          attackStat.style.gap = '5px';
          attackStat.innerHTML = `<span style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">⚔️ ${card.attack}</span>`;
          
          // Health stat
          const healthStat = document.createElement('div');
          healthStat.style.display = 'flex';
          healthStat.style.alignItems = 'center';
          healthStat.style.gap = '5px';
          healthStat.innerHTML = `<span style="color: #22c55e; font-weight: bold; font-size: 1.2rem;">❤️ ${card.health}</span>`;
          
          bottomSection.appendChild(attackStat);
          bottomSection.appendChild(healthStat);
          
          // Assemble the card
          floatingCard.appendChild(topSection);
          floatingCard.appendChild(middleSection);
          floatingCard.appendChild(bottomSection);
          
          // Add to document
          document.body.appendChild(floatingCard);
          
          // Get target position
          const tile = this.board.tiles[row][col];
          const tileRect = tile.getBoundingClientRect();
          
          // Animate the card
          requestAnimationFrame(() => {
            floatingCard.style.top = `${tileRect.top}px`;
            floatingCard.style.left = `${tileRect.left}px`;
            floatingCard.style.transform = 'scale(0.5)';
            floatingCard.style.opacity = '0';
          });
          
          // Create a golden flash effect
          const flash = document.createElement('div');
          flash.style.position = 'absolute';
          flash.style.top = '0';
          flash.style.left = '0';
          flash.style.right = '0';
          flash.style.bottom = '0';
          flash.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
          flash.style.borderRadius = '4px';
          flash.style.animation = 'legendary-flash 1.5s ease-out';
          tile.appendChild(flash);
          
          // Add keyframes for the flash animation
          if (!document.querySelector('#legendary-animation')) {
            const style = document.createElement('style');
            style.id = 'legendary-animation';
            style.textContent = `
              @keyframes legendary-flash {
                0% { 
                  opacity: 0;
                  transform: scale(0.5);
                  box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
                }
                50% { 
                  opacity: 1;
                  transform: scale(1.2);
                  box-shadow: 0 0 50px 20px rgba(255, 215, 0, 0.7);
                }
                100% { 
                  opacity: 0;
                  transform: scale(1);
                  box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
                }
              }
            `;
            document.head.appendChild(style);
          }
          
          // Remove elements after animation
          setTimeout(() => {
            document.body.removeChild(floatingCard);
            tile.removeChild(flash);
          }, 1500);
          
          // Add a sound effect (if you have one)
          // this.playSound('legendary_play');
        }
        
        // Check if the play requires targeting for effects
        if (result.requiresTargeting) {
          this.showMessage("Select a target for the effect");
          this.board.showValidTargets(result.unit, result.validTargets);
        } else {
          // Clear the selection
          this.playerHand.clearSelection();
          this.game.selectedCardIndex = null;
        }
        
        // Update the UI
        this.update();
      } else {
        this.showMessage(result.reason);
      }
    }
  }

  handleUnitClick(unit) {
    if (!unit) return;

    // If in targeting mode, handle target selection
    if (this.game.targetingMode.active) {
      if (this.game.targetingMode.validTargets.some(t => t.id === unit.id)) {
        this.game.targetingMode.resolveCallback(unit);
        this.showMessage(this.game.targetingMode.message);
      }
      return;
    }

    // Regular unit click handling
    const currentPlayerIndex = this.game.currentPlayerIndex;
    const isCurrentPlayerUnit = unit.player === currentPlayerIndex + 1;

    if (this.game.currentPhase === PHASES.BATTLE && isCurrentPlayerUnit && !unit.hasAttacked) {
      this.selectedUnit = unit;
      this.showValidAttackTargets(unit);
      this.showMessage(`Selected ${unit.cardName} to attack.`);
    } else if (this.game.currentPhase === PHASES.BATTLE && !isCurrentPlayerUnit && this.selectedUnit) {
      this.attackUnit(unit);
    }
  }

  // Add this method to CardBattleGameUI.js to animate attacks
  animateAttack(attacker, defender) {
    // Find the DOM elements
    const attackerElement = document.querySelector(`.unit[data-unit-id="${attacker.id}"]`);
    const defenderElement = document.querySelector(`.unit[data-unit-id="${defender.id}"]`);
    
    if (!attackerElement || !defenderElement) return;
    
    // Create a visual effect for the attack
    const effect = document.createElement('div');
    effect.style.position = 'absolute';
    effect.style.width = '20px';
    effect.style.height = '20px';
    effect.style.borderRadius = '50%';
    effect.style.backgroundColor = '#ef4444';
    effect.style.boxShadow = '0 0 10px #ef4444';
    effect.style.zIndex = '100';
    
    // Calculate positions
    const attackerRect = attackerElement.getBoundingClientRect();
    const defenderRect = defenderElement.getBoundingClientRect();
    
    // Position the effect at attacker's center
    effect.style.left = `${attackerRect.left + attackerRect.width/2 - 10}px`;
    effect.style.top = `${attackerRect.top + attackerRect.height/2 - 10}px`;
    
    // Add to document
    document.body.appendChild(effect);
    
    // Animate the effect to the defender
    setTimeout(() => {
      effect.style.transition = 'all 0.3s ease-in';
      effect.style.left = `${defenderRect.left + defenderRect.width/2 - 10}px`;
      effect.style.top = `${defenderRect.top + defenderRect.height/2 - 10}px`;
    }, 50);
    
    // Make defender flash when hit
    setTimeout(() => {
      effect.remove();
      
      // Flash defender
      defenderElement.style.animation = 'damagePulse 0.5s';
      
      // Create and add keyframes for animation
      if (!document.querySelector('#damage-animation')) {
        const style = document.createElement('style');
        style.id = 'damage-animation';
        style.textContent = `
          @keyframes damagePulse {
            0% { filter: brightness(1); }
            30% { filter: brightness(3); background-color: #ef4444; }
            100% { filter: brightness(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }, 300);
  }

  // Add helper method for capitalizing first letter
  capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  showTargetingUI() {
    // Highlight valid targets
    this.game.targetingMode.validTargets.forEach(target => {
      const tile = this.board.tiles[target.row][target.col];
      if (tile) {
        tile.classList.add('valid-target');
        tile.style.backgroundColor = 'rgba(147, 51, 234, 0.15)';
        tile.style.boxShadow = 'inset 0 0 0 2px rgba(147, 51, 234, 0.5)';
      }
    });

    // Show targeting message
    this.showMessage(this.game.targetingMode.message);
  }

  hideTargetingUI() {
    // Clear targeting highlights
    document.querySelectorAll('.valid-target').forEach(tile => {
      tile.classList.remove('valid-target');
      tile.style.backgroundColor = '';
      tile.style.boxShadow = '';
    });
  }
}

export default CardBattleGameUI;