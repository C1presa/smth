import { PHASES } from '../utils/constants.js';
import CustomCardBuilder from './CustomCardBuilder.js';
import * as Effects from '../utils/effects.js';
import { getEffectContainerHTML } from '../utils/effectIcons.js';

// GameBoard.js - Corrected implementation
class GameBoard {
  constructor(game, container, callbacks = {}) {
    this.game = game;
    this.container = container;
    this.callbacks = callbacks || {};
    this.tiles = [];
    this.selectedTile = null;
    this.selectedUnit = null;
    this.validMoves = [];
    this.validTargets = [];
    this.currentHighlightType = null; // 'move' or 'attack' or 'target'
    
    this.render();
    this.bindEvents();
    // Add ambient background effects
    this.addAmbientEffects();
  }
  
  render() {
    this.container.innerHTML = '';
    this.container.className = 'game-board';
    
    // Enhanced board styling to match CURVE GAME reference
    this.container.style.display = 'grid';
    this.container.style.gridTemplateRows = 'repeat(5, 1fr)';
    this.container.style.gridTemplateColumns = 'repeat(7, 1fr)';
    this.container.style.gap = '6px';
    this.container.style.padding = '20px';
    this.container.style.height = 'calc(100% - 20px)';
    this.container.style.width = 'calc(100% - 20px)';
    this.container.style.backgroundColor = '#1a1e2e'; // Darker background
    this.container.style.borderRadius = '8px';
    this.container.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.3)';
    
    this.tiles = [];
    
    // Create the board tiles with better sizing and style
    for (let row = 0; row < 5; row++) {
      const rowTiles = [];
      
      for (let col = 0; col < 7; col++) {
        const tile = document.createElement('div');
        tile.className = 'game-tile';
        tile.dataset.row = row;
        tile.dataset.col = col;
        
        // Improved tile styling to match reference
        tile.style.backgroundColor = '#232840'; // Slightly lighter than background
        tile.style.borderRadius = '6px';
        tile.style.position = 'relative';
        tile.style.transition = 'all 0.2s ease';
        tile.style.cursor = 'pointer';
        tile.style.minHeight = '90px';
        tile.style.minWidth = '90px';
        
        // Highlight spawn rows with more visible colors
        if (row === 0) {
          // Player 2 spawn (blue) - Top row
          tile.classList.add('spawn-player2');
          tile.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          tile.style.border = '1px solid rgba(59, 130, 246, 0.4)';
          
          // Add spawn text
          const spawnLabel = document.createElement('div');
          spawnLabel.textContent = 'P2 Spawn';
          spawnLabel.style.position = 'absolute';
          spawnLabel.style.top = '50%';
          spawnLabel.style.left = '50%';
          spawnLabel.style.transform = 'translate(-50%, -50%)';
          spawnLabel.style.fontSize = '0.7rem';
          spawnLabel.style.color = 'rgba(59, 130, 246, 0.7)';
          spawnLabel.style.fontWeight = 'bold';
          spawnLabel.style.pointerEvents = 'none';
          tile.appendChild(spawnLabel);
        } else if (row === 4) {
          // Player 1 spawn (red) - Bottom row
          tile.classList.add('spawn-player1');
          tile.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
          tile.style.border = '1px solid rgba(239, 68, 68, 0.4)';
          
          // Add spawn text
          const spawnLabel = document.createElement('div');
          spawnLabel.textContent = 'P1 Spawn';
          spawnLabel.style.position = 'absolute';
          spawnLabel.style.top = '50%';
          spawnLabel.style.left = '50%';
          spawnLabel.style.transform = 'translate(-50%, -50%)';
          spawnLabel.style.fontSize = '0.7rem';
          spawnLabel.style.color = 'rgba(239, 68, 68, 0.7)';
          spawnLabel.style.fontWeight = 'bold';
          spawnLabel.style.pointerEvents = 'none';
          tile.appendChild(spawnLabel);
        }
        
        // Apply row themes
        if (row === 0 || row === 1) {
          tile.classList.add(`theme-${this.game.players[1]?.archetype?.toLowerCase()}`);
        }
        if (row === 4 || row === 3) {
          tile.classList.add(`theme-${this.game.players[0]?.archetype?.toLowerCase()}`);
        }
        if (row === 2) {
          tile.classList.add('theme-wasteland');
        }
        
        // Overlay SVG for spawn tiles
        let archetype = null;
        if (row === 0) archetype = this.game.players[1]?.archetype;
        if (row === 4) archetype = this.game.players[0]?.archetype;
        if (archetype) {
          tile.innerHTML += this.getArchetypeSVG(archetype);
        }
        
        // Add hover effect
        tile.addEventListener('mouseenter', () => {
          // Disable hover effect during battle or warshout_targeting
          if (
            this.game.currentPhase === 'warshout_targeting' ||
            this.game.currentPhase === PHASES.BATTLE
          ) {
            return;
          }
          if (!tile.classList.contains('valid-move') && !tile.classList.contains('valid-target')) {
            tile.style.backgroundColor = tile.classList.contains('spawn-player1') 
              ? 'rgba(239, 68, 68, 0.2)' 
              : tile.classList.contains('spawn-player2')
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(255, 255, 255, 0.1)';
          }
        });
        
        tile.addEventListener('mouseleave', () => {
          // Disable hover effect during battle or warshout_targeting
          if (
            this.game.currentPhase === 'warshout_targeting' ||
            this.game.currentPhase === PHASES.BATTLE
          ) {
            return;
          }
          if (!tile.classList.contains('valid-move') && !tile.classList.contains('valid-target')) {
            if (tile.classList.contains('spawn-player1')) {
              tile.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            } else if (tile.classList.contains('spawn-player2')) {
              tile.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
            } else {
              tile.style.backgroundColor = '#232840';
            }
          }
        });
        
        rowTiles.push(tile);
        this.container.appendChild(tile);
      }
      
      this.tiles.push(rowTiles);
    }
    
    // Render units on the board
    this.renderUnits();

    // Add big corner SVGs for the current player's archetype (as DOM nodes, not innerHTML)
    const archetype = this.game.players[this.game.currentPlayerIndex]?.archetype;
    if (archetype) {
      const corners = ['tl', 'tr', 'bl', 'br'];
      corners.forEach(corner => {
        const svgString = this.getCornerSVG(archetype, corner);
        if (svgString) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = svgString;
          const svgElem = tempDiv.firstElementChild;
          if (svgElem) this.container.appendChild(svgElem);
        }
      });
    }
  }
  
  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const tile = e.target.closest('.game-tile');
      if (!tile) return;
      
      const row = parseInt(tile.dataset.row);
      const col = parseInt(tile.dataset.col);
      
      // If a unit was clicked, handle unit click
      const unitElement = e.target.closest('.unit');
      if (unitElement) {
        console.log('Unit clicked:', unitElement.dataset.unitId);
        const unitId = unitElement.dataset.unitId;
        const unit = this.findUnitById(unitId);
        console.log('Found unit:', unit);
        if (unit && this.callbacks.onUnitClick) {
          // Add defensive checks for unit properties
          if (typeof unit.canAttack === 'function' && 'hasAttacked' in unit) {
            console.log('Calling onUnitClick with unit:', unit);
            this.callbacks.onUnitClick(unit);
          } else {
            console.warn('Invalid unit object:', unit);
          }
        }
      }
      
      // Handle tile click
      if (this.callbacks.onTileClick) {
        this.callbacks.onTileClick(row, col);
      }
    });
  }
  
  handleTileClick(row, col) {
    console.log(`GameBoard.handleTileClick: ${row}, ${col}`);
    
    // If a unit is selected and we're in move mode
    if (this.selectedUnit && this.currentHighlightType === 'move') {
      // Check if the clicked position is a valid move
      if (this.isValidMove(row, col)) {
        // If there's a callback for handling moves, use it
        if (this.callbacks.onMoveUnit) {
          this.callbacks.onMoveUnit(this.selectedUnit, row, col);
        } else {
          // Otherwise, use the game's built-in logic
          const result = this.game.moveUnit(this.selectedUnit, row, col);
          if (result.success) {
            // Clear selection and update the board
            this.clearSelection();
            this.update();
          }
        }
      }
      return;
    }
    
    // If a unit is selected and we're in attack mode targeting a tile for direct attack
    if (this.selectedUnit && this.currentHighlightType === 'attack') {
      const tile = this.tiles[row][col];
      
      // Check if this is a direct attack on player's spawn row
      if (tile.classList.contains('valid-target') && tile.dataset.directAttack === 'true') {
        const target = {
          isPlayerHealth: true,
          player: this.selectedUnit.player === 1 ? 2 : 1,
          row,
          col,
          name: 'Enemy Spawn'
        };
        
        // If there's a callback for handling attacks, use it
        if (this.callbacks.onAttackTarget) {
          this.callbacks.onAttackTarget(this.selectedUnit, target);
        } else {
          // Otherwise, use the game's built-in logic
          const result = this.game.attackWithUnit(this.selectedUnit, target);
          if (result.success) {
            // Clear selection and update the board
            this.clearSelection();
            this.update();
          }
        }
      }
      return;
    }
    
    // If a unit is selected and we're in targeting mode for an effect
    if (this.selectedUnit && this.currentHighlightType === 'target') {
      if (this.isValidTarget(row, col)) {
        const targetUnit = this.game.getUnitAt(row, col);
        if (targetUnit && this.callbacks.onEffectTarget) {
          this.callbacks.onEffectTarget(targetUnit);
        }
      }
      return;
    }
    
    // If no unit is selected, just check if a unit is at the clicked position
    const clickedUnit = this.game.getUnitAt(row, col);
    if (clickedUnit && this.callbacks.onUnitClick) {
      this.callbacks.onUnitClick(clickedUnit);
    }
  }
  
  renderUnits() {
    // Clear existing units
    document.querySelectorAll('.unit').forEach(el => el.remove());
    
    // Render units for both players
    this.game.players.forEach(player => {
      player.units.forEach(unit => {
        this.renderUnit(unit);
      });
    });
  }
  
  renderUnit(unit) {
    const typeIcons = {
      'demon': '👹',
      'cultist': '🧙',
      'beast': '🐗',
      'insect': '🐛',
      'undead': '💀',
      'racer': '🏎️',
      'lurker': '👁️'
    };
    const { row, col } = unit;
    if (row === null || col === null || unit.health <= 0) return; // Don't render dead units
    
    const tile = this.tiles[row][col];
    if (!tile) return;

    // Remove any existing unit
    const oldUnit = tile.querySelector('.unit');
    if (oldUnit) oldUnit.remove();

    // Get card data
    const card = unit.getCard ? unit.getCard() : unit;
    
    // Define colors for archetypes with richer gradients
    const archetypeGradients = {
      'Nether': 'linear-gradient(135deg, #a21caf 0%, #4a044e 100%)',
      'Swamp': 'linear-gradient(135deg, #16a34a 0%, #052e16 100%)',
      'Racetrack': 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
      'Elderwood': 'linear-gradient(135deg, #22d3ee 0%, #164e63 100%)',
      'Neutral': 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)'
    };

    // Create main card element with curved design
    const cardElement = document.createElement('div');
    cardElement.className = `unit player${unit.player}`;
    cardElement.dataset.unitId = unit.id;
    
    // Style the base card with glass-like effect
    cardElement.style.width = '100%';
    cardElement.style.height = '100%';
    cardElement.style.borderRadius = '12px';
    cardElement.style.background = archetypeGradients[card.archetype] || archetypeGradients.Neutral;
    cardElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.15)';
    cardElement.style.transform = 'perspective(800px) rotateX(3deg)';
    cardElement.style.transformStyle = 'preserve-3d';
    cardElement.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // Add backlight glow effect for player identification
    const backlight = document.createElement('div');
    backlight.style.position = 'absolute';
    backlight.style.inset = '0';
    backlight.style.background = unit.player === 1 ? 
      'radial-gradient(circle at center, rgba(239, 68, 68, 0.25), transparent 70%)' : 
      'radial-gradient(circle at center, rgba(59, 130, 246, 0.25), transparent 70%)';
    backlight.style.opacity = '0.8';
    backlight.style.zIndex = '1';
    cardElement.appendChild(backlight);

    // Card content container (relative to the backlight)
    const content = document.createElement('div');
    content.style.position = 'relative';
    content.style.zIndex = '2';
    content.style.height = '100%';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.padding = '5px';

    // Larger, centered type icon
    const centerTypeIcon = document.createElement('div');
    centerTypeIcon.textContent = typeIcons[card.type?.toLowerCase()] || '⚔️';
    centerTypeIcon.style.fontSize = '2rem';
    centerTypeIcon.style.textAlign = 'center';
    centerTypeIcon.style.margin = '8px 0';
    centerTypeIcon.style.filter = 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5))';
    content.appendChild(centerTypeIcon);

    // Top bar with name and mana cost
    const topBar = document.createElement('div');
    topBar.style.display = 'flex';
    topBar.style.justifyContent = 'space-between';
    topBar.style.alignItems = 'center';
    
    // Name with glow based on player color
    const nameElement = document.createElement('div');
    nameElement.textContent = card.name;
    nameElement.style.fontSize = '0.75rem';
    nameElement.style.fontWeight = 'bold';
    nameElement.style.color = '#ffffff';
    nameElement.style.textShadow = unit.player === 1 ? 
      '0 0 5px rgba(239, 68, 68, 0.7)' : 
      '0 0 5px rgba(59, 130, 246, 0.7)';
    nameElement.style.padding = '2px 4px';
    nameElement.style.maxWidth = '80%';
    nameElement.style.overflow = 'hidden';
    nameElement.style.textOverflow = 'ellipsis';
    nameElement.style.whiteSpace = 'nowrap';
    
    // Mana crystal with 3D effect
    const manaElement = document.createElement('div');
    manaElement.textContent = card.cost || 0;
    manaElement.style.width = '18px';
    manaElement.style.height = '18px';
    manaElement.style.borderRadius = '50%';
    manaElement.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
    manaElement.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    manaElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)';
    manaElement.style.display = 'flex';
    manaElement.style.alignItems = 'center';
    manaElement.style.justifyContent = 'center';
    manaElement.style.color = 'white';
    manaElement.style.fontWeight = 'bold';
    manaElement.style.fontSize = '0.7rem';
    manaElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
    
    topBar.appendChild(nameElement);
    topBar.appendChild(manaElement);
    content.appendChild(topBar);
    
    // Center - card art / type image with icon
    const artContainer = document.createElement('div');
    artContainer.style.flex = '1';
    artContainer.style.display = 'flex';
    artContainer.style.alignItems = 'center';
    artContainer.style.justifyContent = 'center';
    artContainer.style.padding = '2px 0';
    artContainer.style.position = 'relative';
    
    // Card art background - subtle abstract pattern based on archetype
    const artBackground = document.createElement('div');
    artBackground.style.position = 'absolute';
    artBackground.style.inset = '0';
    artBackground.style.opacity = '0.15';
    artBackground.style.backgroundSize = 'cover';
    artBackground.style.backgroundPosition = 'center';
    
    // Different patterns for different archetypes
    const patterns = {
      'Nether': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMEMxMyAwIDAgMTMgMCAzMHMxMyAzMCAzMCAzMCAzMC0xMyAzMC0zMFM0NyAwIDMwIDB6bTAgNTRDMTYgNTQgNiA0NCA2IDMwUzE2IDYgMzAgNnMyNCA5LjkgMjQgMjRjMCAxMy05LjkgMjQtMjQgMjR6Ii8+PC9zdmc+')",
      'Swamp': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEwLjkuMWMtLjcuMS0xLjUuMy0yLjEuNyAxIC43IDEuOS0uMSAyLjQuOCAxLjEgMS41LTEuOCAxLjQtMi44IDEuMS0xLS4zLTIuMS0uNC0zLjEtLjItLjYuMS0xLjEuMy0xLjcuNi43LjIgMS4zLjUgMiAuOC43LjIgMS40LjUgMi4xLjgtMSAuNi0yLjIuNy0yLjggMS45LS42IDEtLjIgMi4yLS4xIDMuMi43LS4zIDEuMy0uOSAyLjItLjkuMi41LjMgMSAuNiAxLjVoLjNjLS4yLS41LS4zLTEuMS0uNS0xLjYuNC4xLjcuMy45LjYuNS0uMy0uMS0uOS0uMy0xLjItLjItLjQtLjMtLjguMy0xLjEuNS0uMyAxLjMtLjMgMS4zLjQtLjIuNC0uNy42LS45IDEtLjIuMy0uNC43LS4yIDEgLjMtLjMuNy0uNSAxLjEtLjYuNy0uMiAxLjMtLjMgMi0uMi0uOS4zLS44IDEuMy0xLjMgMS44LS41LjUtMS4xIDEtMS43IDEuNS4yLjMuNi4xLjkuMi4zLjEuNS40LjguNi41LS40LjktLjkgMS42LS43LS4xLjMtLjIuNi0uMi45LjUuMS45LS40IDEuNC0uNy0uNi0uNi0xLjYtLjctMi4xLTEuMy0uMS0uMS0uMi0uMy0uMi0uNS44LS4yIDEuNy0uNCAxLjktMS4yLjMtLjggMC0xLjctLjQtMi40LS4xLS4yLS4yLS41LS4yLS43LjQtLjUuOS0xIDEuNy0uOS4xLjcuNSAxLjIuOSAxLjggLjQuNi44IDEuNyAxLjUgMS45LjYuMiAxLjMtLjEgMS43LjctLjEuMS0uMi4zLS4zLjQuNi4xIDEuMS0uMSAxLjctLjJzMS4yLS4zIDEuOC0uMmMtLjUuNC0xLjIuOS0xLjggMS4xLS41LjItMS4yLjQtMS40LjktLjEuNS0uMS45LS4xIDEuNC0uMy4xLS41LS4zLS44LS4yLS40LjItLjYuNy0uOCAxLjEuNi0uMSAxLjQtLjEgMS44LS42LjItLjMuNC0uNi42LS45LjgtLjMgMS43LS4zIDIuNi0uNC0xIDAtMS41IDEuMS0yLjQgMS41LjQuNS43LS4zIDEuMS0uMy0uMy4zLS41LjYtLjcgMS0uMy0uMS0uNi0uMy0uOS0uNS0xIC42LS42IDEuOS0uNSAyLjktLjEuNS0uNC45LS42IDEuMy4yLjMuNS0uNC41LS42LjIgMCAuNC4xLjYuMS40IDAgLjctLjMuOS0uNS0uOC0uMi0xLjIuNi0yIC41LS44LS4xLTEuNC0uNy0yLjEtMS4xLjQtLjUgMS4xLS44IDEuNy0xLjIuNy0uNSAxLjEtMS4zIDEuNi0xLjkuMi0uMi4zLS41LjMtLjcuMy0uNi43LTEuMSAxLjEtMS44LjEtLjIuMi0uNC4xLS42LS4xLS4yLS4zLS40LS40LS43LS40LS42LS42LTEuNi4xLTEuOS0uNC43LTEuMyAxLjQtMS4yIDIuMy0xLjEtLjMtMS43LS4zLTIuMS0uMy0xIC4yLTEuNy43LTIuNSAxLjEtLjktLjQtMS45LS42LTIuOS0uMy0xIC4yLTEuOS43LTIuOSAxLjEtLjEtLjYtLjEtMS4zLS4xLTEuOS4xLTEtLjItMi0uNC0zLjEtLjItMS4xLS4zLTIuMi0uNy0zLjN6Ii8+PC9zdmc+');",
      'Racetrack': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwSDB2MmgyMHYxOGgyVjIyaDEydjE4aDJWMjJoNHYtMmgtNFYwSDM0djIwSDE4VjBoLTJ2MjBINHYtMkgwdjJoMnYtMjBoMnYyMGgxNFYyeiIvPjwvc3ZnPg==')",
      'Elderwood': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHBhdGggZD0iTTIxLDMwaDhjMC41NSwwLDEtMC40NSwxLTFzLTAuNDUtMS0xLTFoLThjLTAuNTUsMC0xLDAuNDUtMSwxUzIwLjQ1LDMwLDIxLDMweiBNMjEsMjJoOGMwLjU1LDAsMS0wLjQ1LDEtMSBzLTAuNDUtMS0xLTFoLThjLTAuNTUsMC0xLDAuNDUtMSwxUzIwLjQ1LDIyLDIxLDIyeiBNMjQsNDRjLTkuOTQsMC0xOC04LjA2LTE4LTE4VjEzdHM3LjQ1LDEwLDlDMTYuOSwyNSwxNiwyOS0xLDI5IGMwLDkuOTQsOC4wNiwxOCwxOCwxOGM2LDAsNS0xMCwxNS0xMGwtNS41LTIuNUMzNS44LDM2LjIyLDMwLDQ0LDI0LDQ0eiBNMjcsMThIMTl2LTJoOFYxOHogTTQ1LjcsMzcuNGwtMS41LTEuNSBjLTAuOCwwLjMtMS43LDAuNS0yLjcsMC41bDEuNSwxLjVDNDQtMC45LDQ1LDAuMyw0NS43LDM3LjR6IE0wLDM3LjRsMTAuMy0xMC4zYy0wLjktMS41LTIuMS0zLjEtNC0zLjFsMC01TDIuMiwxNC45TDAsMTdMMCwzNy40eiBNMCwxMmwxMiwzTDQsMTJWMGwwLDB2MTJ6Ii8+PC9zdmc+')",
      'Neutral': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDQwYzExIDAgMjAtOSAyMC0yMFMzMSAwIDIwIDBTMCA5IDAgMjBzOSAyMCAyMCAyMHptMC0yYzEwIDAgMTgtOCAxOC0xOFMzMCAyIDIwIDIgMiAxMCAyIDIwczggMTggMTggMTh6TTQgMjBjMCA5IDcgMTYgMTYgMTZzMTYtNyAxNi0xNlMyOSA0IDIwIDQgNCAzMSA0IDIwem0xNCAwbDYtNnY0aDRsLTYgNnYtNGgtNHoiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')"
    };
    
    artBackground.style.backgroundImage = patterns[card.archetype] || patterns.Neutral;
    artContainer.appendChild(artBackground);
    
    // Bottom bar with stats and effects
    const bottomBar = document.createElement('div');
    bottomBar.style.display = 'flex';
    bottomBar.style.justifyContent = 'space-between';
    bottomBar.style.alignItems = 'center';
    
    // Make stats more prominent
    const statContainer = document.createElement('div');
    statContainer.style.display = 'flex';
    statContainer.style.justifyContent = 'space-between';
    statContainer.style.marginTop = 'auto';

    const attackStat = document.createElement('div');
    attackStat.style.display = 'flex';
    attackStat.style.alignItems = 'center';
    attackStat.style.background = 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)';
    attackStat.style.borderRadius = '10px';
    attackStat.style.padding = '2px 8px';
    attackStat.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
    attackStat.innerHTML = `<span style="font-size:0.8rem;margin-right:3px;">⚔️</span>${unit.attack}`;
    statContainer.appendChild(attackStat);
    
    // Effects in the middle - small icons
    const effectsContainer = document.createElement('div');
    effectsContainer.style.display = 'flex';
    effectsContainer.style.gap = '3px';
    
    // Effect icons configuration
    const effectIcons = {
      'strike': { symbol: '⚡', color: '#FF9500' },
      'deathstrike': { symbol: '☠️', color: '#8C5AF8' },
      'deathblow': { symbol: '💥', color: '#E83B3B' },
      'taunt': { symbol: '🛡️', color: '#FFD700' },
      'warshout': { symbol: '📣', color: '#3ABEFF' }
    };
    
    // Add effect icons if present
    if (unit.effects && unit.effects.length > 0) {
      // Get unique effect types
      const effectTypes = new Set();
      unit.effects.forEach(effect => {
        if (effect && effect.type) {
          effectTypes.add(effect.type.toLowerCase());
        }
      });
      
      // Create icon for each effect type
      effectTypes.forEach(type => {
        const effect = effectIcons[type] || { symbol: '❓', color: '#64748B' };
        
        const effectIcon = document.createElement('div');
        effectIcon.textContent = effect.symbol;
        effectIcon.style.width = '16px';
        effectIcon.style.height = '16px';
        effectIcon.style.borderRadius = '50%';
        effectIcon.style.backgroundColor = effect.color;
        effectIcon.style.display = 'flex';
        effectIcon.style.alignItems = 'center';
        effectIcon.style.justifyContent = 'center';
        effectIcon.style.fontSize = '0.6rem';
        effectIcon.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
        
        // Add tooltip for effect description
        effectIcon.title = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${unit.description || 'Special ability'}`;
        
        effectsContainer.appendChild(effectIcon);
      });
    } else {
      // No effects text
      const noEffects = document.createElement('div');
      noEffects.textContent = 'No effects';
      noEffects.style.fontSize = '0.6rem';
      noEffects.style.color = 'rgba(255, 255, 255, 0.5)';
      effectsContainer.appendChild(noEffects);
    }
    
    // Health stat pill
    const healthStat = document.createElement('div');
    healthStat.style.display = 'flex';
    healthStat.style.alignItems = 'center';
    healthStat.style.background = 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)';
    healthStat.style.borderRadius = '10px';
    healthStat.style.padding = '1px 6px';
    healthStat.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
    
    // Health icon
    const healthIcon = document.createElement('span');
    healthIcon.textContent = '❤️';
    healthIcon.style.fontSize = '0.6rem';
    healthIcon.style.marginRight = '3px';
    
    // Health value
    const healthValue = document.createElement('span');
    healthValue.textContent = unit.health;
    healthValue.style.fontWeight = 'bold';
    healthValue.style.fontSize = '0.85rem';
    healthValue.style.color = 'white';
    healthValue.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
    
    healthStat.appendChild(healthIcon);
    healthStat.appendChild(healthValue);
    
    statContainer.appendChild(effectsContainer);
    statContainer.appendChild(healthStat);
    
    content.appendChild(statContainer);
    cardElement.appendChild(content);
    
    // Add state indicator (only show ATTACKED)
    if (unit.hasAttacked) {
      const stateIndicator = document.createElement('div');
      stateIndicator.style.position = 'absolute';
      stateIndicator.style.inset = '0';
      stateIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      stateIndicator.style.zIndex = '3';
      stateIndicator.style.borderRadius = '12px';
      stateIndicator.style.display = 'flex';
      stateIndicator.style.alignItems = 'center';
      stateIndicator.style.justifyContent = 'center';
      stateIndicator.style.pointerEvents = 'none';
      const stateText = document.createElement('div');
      stateText.textContent = 'ATTACKED';
      stateText.style.color = 'white';
      stateText.style.fontWeight = 'bold';
      stateText.style.fontSize = '0.8rem';
      stateText.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8)';
      stateText.style.transform = 'rotate(-30deg)';
      stateIndicator.appendChild(stateText);
      cardElement.appendChild(stateIndicator);
    }
    
    // Add Taunt indicator if applicable
    if (typeof unit.hasTaunt === 'function' && unit.hasTaunt()) {
      const tauntIndicator = document.createElement('div');
      tauntIndicator.style.position = 'absolute';
      tauntIndicator.style.top = '-5px';
      tauntIndicator.style.left = '50%';
      tauntIndicator.style.transform = 'translateX(-50%)';
      tauntIndicator.style.backgroundColor = '#FFD700';
      tauntIndicator.style.color = '#000';
      tauntIndicator.style.padding = '1px 5px';
      tauntIndicator.style.borderRadius = '5px';
      tauntIndicator.style.fontSize = '0.6rem';
      tauntIndicator.style.fontWeight = 'bold';
      tauntIndicator.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
      tauntIndicator.style.zIndex = '3';
      tauntIndicator.textContent = 'TAUNT';
      
      cardElement.appendChild(tauntIndicator);
    }
    
    // Add hover effects
    cardElement.addEventListener('mouseenter', () => {
      cardElement.style.transform = 'perspective(800px) rotateX(5deg) translateY(-5px) scale(1.05)';
      cardElement.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.5)';
      cardElement.style.zIndex = '20';
    });
    cardElement.addEventListener('mouseleave', () => {
      cardElement.style.transform = 'perspective(800px) rotateX(3deg)';
      cardElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.15)';
      cardElement.style.zIndex = '1';
    });
    
    // Add interactive tooltip functionality
    cardElement.addEventListener('mouseenter', () => this.showUnitTooltip(unit, cardElement));
    cardElement.addEventListener('mouseleave', () => this.hideUnitTooltip());

    // Add to the tile
    tile.appendChild(cardElement);
    
    // Optional: Add subtle animation on first render
    requestAnimationFrame(() => {
      cardElement.style.animation = 'unitAppear 0.3s forwards';
    });
    
    // Add keyframes for appear animation if not already present
    if (!document.querySelector('#unit-animations')) {
      const style = document.createElement('style');
      style.id = 'unit-animations';
      style.textContent = `
        @keyframes unitAppear {
          from { transform: scale(0.9); opacity: 0.7; }
          to { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // New method to show unit tooltip on hover
  showUnitTooltip(unit, element) {
    // Remove any existing tooltip
    this.hideUnitTooltip();
    
    // Get position of the unit element
    const rect = element.getBoundingClientRect();
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'unit-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.zIndex = '1000';
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;
    tooltip.style.width = '180px';
    tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    tooltip.style.borderRadius = '8px';
    tooltip.style.padding = '10px';
    tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    tooltip.style.pointerEvents = 'none';
    
    // Unit name
    const name = document.createElement('div');
    name.style.fontWeight = 'bold';
    name.style.fontSize = '0.9rem';
    name.style.marginBottom = '5px';
    name.style.color = unit.player === 1 ? '#ef4444' : '#3b82f6';
    name.textContent = unit.cardName;
    
    // Stats
    const stats = document.createElement('div');
    stats.style.display = 'grid';
    stats.style.gridTemplateColumns = 'auto 1fr';
    stats.style.gap = '4px 10px';
    stats.style.fontSize = '0.8rem';
    stats.style.marginBottom = '8px';
    
    // Attack
    const attackLabel = document.createElement('div');
    attackLabel.style.color = '#94a3b8';
    attackLabel.textContent = 'Attack:';
    
    const attackValue = document.createElement('div');
    attackValue.style.color = '#ef4444';
    attackValue.style.fontWeight = 'bold';
    attackValue.textContent = unit.attack;
    
    // Health
    const healthLabel = document.createElement('div');
    healthLabel.style.color = '#94a3b8';
    healthLabel.textContent = 'Health:';
    
    const healthValue = document.createElement('div');
    healthValue.style.color = '#22c55e';
    healthValue.style.fontWeight = 'bold';
    healthValue.textContent = `${unit.health}/${unit.maxHealth}`;
    
    // Mana cost
    const costLabel = document.createElement('div');
    costLabel.style.color = '#94a3b8';
    costLabel.textContent = 'Cost:';
    
    const costValue = document.createElement('div');
    costValue.style.color = '#3b82f6';
    costValue.style.fontWeight = 'bold';
    costValue.textContent = unit.cost;
    
    // Add all stats
    stats.appendChild(costLabel);
    stats.appendChild(costValue);
    stats.appendChild(attackLabel);
    stats.appendChild(attackValue);
    stats.appendChild(healthLabel);
    stats.appendChild(healthValue);
    
    // Add taunt if present
    if (typeof unit.hasTaunt === 'function' && unit.hasTaunt()) {
      const taunt = document.createElement('div');
      taunt.style.backgroundColor = 'rgba(250, 204, 21, 0.2)';
      taunt.style.color = '#fbbf24';
      taunt.style.padding = '4px 8px';
      taunt.style.borderRadius = '4px';
      taunt.style.fontSize = '0.8rem';
      taunt.style.marginBottom = '8px';
      taunt.textContent = '🛡️ Taunt: Enemies must attack this unit first';
      tooltip.appendChild(name);
      tooltip.appendChild(stats);
      tooltip.appendChild(taunt);
    } else {
      tooltip.appendChild(name);
      tooltip.appendChild(stats);
    }
    
    // Add description if available
    if (unit.description) {
      const desc = document.createElement('div');
      desc.style.fontSize = '0.8rem';
      desc.style.color = '#cbd5e1';
      desc.style.lineHeight = '1.3';
      desc.textContent = unit.description;
      tooltip.appendChild(desc);
    }
    
    document.body.appendChild(tooltip);
    this.unitTooltip = tooltip;
    
    // Adjust position if tooltip is out of viewport
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
      tooltip.style.left = `${rect.left - tooltipRect.width - 10}px`;
    }
    if (tooltipRect.bottom > window.innerHeight) {
      tooltip.style.top = `${rect.bottom - tooltipRect.height}px`;
    }
  }
  
  // Hide unit tooltip
  hideUnitTooltip() {
    if (this.unitTooltip && this.unitTooltip.parentNode) {
      document.body.removeChild(this.unitTooltip);
      this.unitTooltip = null;
    }
  }
  
  // Keep the rest of your existing methods
  selectUnit(unit) {
    this.selectedUnit = unit;
    this.selectedTile = this.tiles[unit.row][unit.col];
    this.selectedTile.style.boxShadow = 'inset 0 0 0 3px #fbbf24';
    
    // Add pulsing effect to selected unit
    const unitElement = this.selectedTile.querySelector('.unit');
    if (unitElement) {
      unitElement.style.animation = 'unitPulse 1s infinite';
      if (!document.querySelector('#unit-pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'unit-pulse-animation';
        style.textContent = `
          @keyframes unitPulse {
            0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
            100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
  
  clearSelection() {
    if (this.selectedUnit) {
      const unitElement = this.selectedTile.querySelector('.unit');
      if (unitElement) {
        unitElement.style.animation = '';
      }
    }
    
    this.selectedUnit = null;
    
    if (this.selectedTile) {
      this.selectedTile.style.boxShadow = '';
      this.selectedTile = null;
    }
    
    // Clear all highlights
    document.querySelectorAll('.game-tile').forEach(tile => {
      tile.classList.remove('valid-move', 'valid-target');
      tile.style.backgroundColor = '';
      tile.style.boxShadow = '';
      delete tile.dataset.directAttack;
    });
    
    // Restore spawn row coloring
    document.querySelectorAll('.spawn-player1').forEach(tile => {
      tile.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
    });
    
    document.querySelectorAll('.spawn-player2').forEach(tile => {
      tile.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
    });
    
    this.validMoves = [];
    this.validTargets = [];
    this.currentHighlightType = null;
  }
  
  clearHighlights() {
    // Clear all highlights
    document.querySelectorAll('.game-tile').forEach(tile => {
      tile.classList.remove('valid-move', 'valid-target');
      tile.style.backgroundColor = '';
      tile.style.boxShadow = '';
      tile.style.position = 'relative'; // Reset position
      tile.style.setProperty('--after-display', 'none'); // Remove any after elements
      delete tile.dataset.directAttack;
    });
    
    // Restore spawn row coloring
    document.querySelectorAll('.spawn-player1').forEach(tile => {
      tile.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
    });
    
    document.querySelectorAll('.spawn-player2').forEach(tile => {
      tile.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
    });
    
    this.validMoves = [];
    this.validTargets = [];
    this.currentHighlightType = null;
  }
  
  // Keep your existing methods for showing valid moves, etc.
  showValidMoves(unit) {
    this.clearHighlights();
    this.currentHighlightType = 'move';
    
    // Determine move direction based on player
    const direction = unit.player === 1 ? -1 : 1;
    const newRow = unit.row + direction;
    
    // Check if new position is on the board and not occupied
    if (newRow >= 0 && newRow < 5 && !this.game.isOccupied(newRow, unit.col)) {
      this.validMoves.push({ row: newRow, col: unit.col });
      
      // Highlight valid move
      this.tiles[newRow][unit.col].classList.add('valid-move');
      this.tiles[newRow][unit.col].style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
      this.tiles[newRow][unit.col].style.boxShadow = 'inset 0 0 0 2px rgba(34, 197, 94, 0.7)';
    }
  }
  
  showValidAttackTargets(unit) {
    this.clearHighlights();
    this.currentHighlightType = 'attack';
    
    // Use the Effects utility to get valid targets
    const targets = Effects.getPotentialAttackTargets(unit, this.game);
    
    // Highlight each valid target
    targets.forEach(target => {
      // Check if it's a valid target position
      if (target.row !== undefined && target.col !== undefined) {
        const tile = this.tiles[target.row][target.col];
        if (tile) {
          tile.classList.add('valid-target');
          
          // Different styling for unit targets vs spawn targets
          if (target.isPlayerHealth) {
            // Spawn target styling
            tile.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
            tile.style.boxShadow = 'inset 0 0 0 3px rgba(239, 68, 68, 0.9)';
            tile.dataset.directAttack = 'true';
          } else {
            // Unit target styling
            tile.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
            tile.style.boxShadow = 'inset 0 0 0 3px rgba(239, 68, 68, 0.8)';
          }
        }
      }
    });
    
    // Save valid targets for later checking
    this.validTargets = targets.map(target => ({
      row: target.row,
      col: target.col,
      isPlayerHealth: target.isPlayerHealth
    }));
  }
  
  showValidTargets(sourceUnit, targets) {
    this.clearHighlights();
    this.currentHighlightType = 'target';
    this.selectedUnit = sourceUnit;
    // Save original game phase and temporarily set to targeting
    this.game.originalPhase = this.game.currentPhase;
    this.originalPhase = this.game.currentPhase;
    this.game.currentPhase = 'warshout_targeting';
    // Highlight the source unit
    this.selectedTile = this.tiles[sourceUnit.row][sourceUnit.col];
    this.selectedTile.style.boxShadow = 'inset 0 0 0 2px #fbbf24';
    // Make sure targets is an array and contains valid entries
    if (!Array.isArray(targets) || targets.length === 0) {
      console.warn('No valid targets provided to showValidTargets');
      return;
    }
    // Highlight all valid targets
    targets.forEach(target => {
      // Make sure target is a valid object with row and col properties
      if (!target || typeof target.row !== 'number' || typeof target.col !== 'number') {
        console.warn('Invalid target in showValidTargets:', target);
        return;
      }
      if (!target.isPlayerHealth) { // Only highlight unit targets
        this.validTargets.push({ row: target.row, col: target.col });
        // Highlight valid target with improved styling
        const tile = this.tiles[target.row][target.col];
        tile.classList.add('valid-target');
        tile.style.backgroundColor = 'rgba(147, 51, 234, 0.15)';
        tile.style.boxShadow = 'inset 0 0 0 2px rgba(147, 51, 234, 0.5)';
        tile.style.position = 'relative'; // Ensure proper positioning
        // Remove any after pseudo-elements
        tile.style.setProperty('--after-display', 'none');
      }
    });
  }
  
  isValidMove(row, col) {
    return this.validMoves.some(move => move.row === row && move.col === col);
  }
  
  isValidTarget(row, col) {
    return this.validTargets.some(target => target.row === row && target.col === col);
  }
  
  showMessage(message) {
    // Emit an event that CardBattleGameUI can listen for
    const event = new CustomEvent('game-message', { detail: { message } });
    this.container.dispatchEvent(event);
  }
  
  update() {
    this.renderUnits();
  }

  // Method to animate a single unit movement
  animateUnitMovement(unitId, fromRow, fromCol, toRow, toCol, duration = 500) {
    const unitElement = this.container.querySelector(`[data-unit-id="${unitId}"]`);
    if (!unitElement) return;

    // Store original position
    const originalPosition = {
      top: unitElement.style.top,
      left: unitElement.style.left,
      right: unitElement.style.right,
      bottom: unitElement.style.bottom
    };

    // Calculate movement
    const fromTile = this.tiles[fromRow][fromCol];
    const toTile = this.tiles[toRow][toCol];
    const fromRect = fromTile.getBoundingClientRect();
    const toRect = toTile.getBoundingClientRect();
    const deltaX = toRect.left - fromRect.left;
    const deltaY = toRect.top - fromRect.top;

    // Add transition
    unitElement.style.transition = `transform ${duration}ms ease-out`;
    unitElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // After animation completes, reset position and update
    setTimeout(() => {
      unitElement.style.transition = '';
      unitElement.style.transform = '';
      unitElement.style.top = originalPosition.top;
      unitElement.style.left = originalPosition.left;
      unitElement.style.right = originalPosition.right;
      unitElement.style.bottom = originalPosition.bottom;
    }, duration);
  }

  // Method to animate multiple units moving simultaneously
  animateMultipleUnitMovements(movements, duration = 500) {
    if (!movements || movements.length === 0) return;
    
    // Animate each movement
    movements.forEach(movement => {
      const { unit, from, to } = movement;
      this.animateUnitMovement(
        unit.id,
        from.row,
        from.col,
        to.row,
        to.col,
        duration
      );
    });
    
    // Update the board after all animations complete
    setTimeout(() => {
      this.update();
    }, duration + 50);
  }

  // Method to handle auto-advance animations
  handleAutoAdvanceAnimation(units) {
    const movements = units.map(unit => {
      const direction = unit.player === 1 ? -1 : 1;
      const newRow = unit.row + direction;
      
      return {
        unit,
        from: { row: unit.row, col: unit.col },
        to: { row: newRow, col: unit.col }
      };
    });

    this.animateMultipleUnitMovements(movements);
  }

  // Method to animate a spawn point attack
  animateSpawnAttack(attacker, targetRow, targetCol) {
    // Find the attacker element
    const attackerElement = document.querySelector(`.unit[data-unit-id="${attacker.id}"]`);
    const targetTile = this.tiles[targetRow][targetCol];
    
    if (!attackerElement || !targetTile) return;
    
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
    const targetRect = targetTile.getBoundingClientRect();
    
    // Position the effect at attacker's center
    effect.style.left = `${attackerRect.left + attackerRect.width/2 - 10}px`;
    effect.style.top = `${attackerRect.top + attackerRect.height/2 - 10}px`;
    
    // Add to document
    document.body.appendChild(effect);
    
    // Animate the effect to the target
    setTimeout(() => {
      effect.style.transition = 'all 0.3s ease-in';
      effect.style.left = `${targetRect.left + targetRect.width/2 - 10}px`;
      effect.style.top = `${targetRect.top + targetRect.height/2 - 10}px`;
    }, 50);
    
    // Create explosion effect at the target location
    setTimeout(() => {
      effect.remove();
      
      // Create explosion effect
      const explosion = document.createElement('div');
      explosion.style.position = 'absolute';
      explosion.style.width = '60px';
      explosion.style.height = '60px';
      explosion.style.borderRadius = '50%';
      explosion.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
      explosion.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.7)';
      explosion.style.left = `${targetRect.left + targetRect.width/2 - 30}px`;
      explosion.style.top = `${targetRect.top + targetRect.height/2 - 30}px`;
      explosion.style.zIndex = '100';
      explosion.style.transform = 'scale(0)';
      
      document.body.appendChild(explosion);
      
      // Animate explosion
      requestAnimationFrame(() => {
        explosion.style.transition = 'all 0.4s ease-out';
        explosion.style.transform = 'scale(1.5)';
        explosion.style.opacity = '0';
      });
      
      // Flash target tile
      targetTile.style.animation = 'spawnDamage 0.5s';
      
      // Create and add keyframes for animation
      if (!document.querySelector('#spawn-damage-animation')) {
        const style = document.createElement('style');
        style.id = 'spawn-damage-animation';
        style.textContent = `
          @keyframes spawnDamage {
            0% { background-color: rgba(239, 68, 68, 0.1); }
            40% { background-color: rgba(239, 68, 68, 0.7); }
            100% { background-color: rgba(239, 68, 68, 0.1); }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Remove explosion element after animation completes
      setTimeout(() => {
        explosion.remove();
      }, 400);
    }, 300);
    
    // Add damage number animation
    const damageNumber = document.createElement('div');
    damageNumber.textContent = `-${attacker.attack}`;
    damageNumber.style.position = 'absolute';
    damageNumber.style.color = '#ef4444';
    damageNumber.style.fontWeight = 'bold';
    damageNumber.style.fontSize = '24px';
    damageNumber.style.left = `${targetRect.left + targetRect.width/2}px`;
    damageNumber.style.top = `${targetRect.top + targetRect.height/2}px`;
    damageNumber.style.zIndex = '101';
    damageNumber.style.textShadow = '0 0 5px rgba(0,0,0,0.7)';
    
    document.body.appendChild(damageNumber);
    
    // Animate damage number
    setTimeout(() => {
      damageNumber.style.transition = 'all 1s ease-out';
      damageNumber.style.transform = 'translateY(-30px)';
      damageNumber.style.opacity = '0';
    }, 50);
    
    // Remove damage number after animation
    setTimeout(() => {
      damageNumber.remove();
    }, 1050);
  }

  animateLegendaryPlacement(unit) {
    const tile = this.tiles[unit.row][unit.col];
    const unitElement = tile.querySelector(`.unit[data-unit-id="${unit.id}"]`);
    
    if (!unitElement) return;

    // Create flash effect
    const flash = document.createElement('div');
    flash.className = 'legendary-flash';
    flash.style.position = 'absolute';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.borderRadius = '4px';
    flash.style.background = 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0) 70%)';
    flash.style.animation = 'legendary-flash 1s ease-out forwards';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '100';

    // Add the flash element to the tile
    tile.appendChild(flash);

    // Remove the flash element after animation completes
    flash.addEventListener('animationend', () => {
      flash.remove();
    });

    // Add a subtle scale animation to the unit
    unitElement.style.animation = 'legendary-unit-appear 0.5s ease-out forwards';
  }

  // Helper: Return SVG string for archetype overlay (3D style)
  getArchetypeSVG(archetype) {
    switch (archetype) {
      case 'Nether':
        return `<svg class='tile-overlay-3d' viewBox='0 0 64 32' width='64' height='32'><rect x='8' y='16' width='48' height='12' fill='#2d133b' stroke='#a21caf' stroke-width='2'/><polygon points='8,28 32,4 56,28' fill='#a21caf' stroke='#fff' stroke-width='1'/><rect x='28' y='20' width='8' height='8' fill='#ff3c3c'/><polyline points='16,28 16,20 24,20 24,28' fill='none' stroke='#ff3c3c' stroke-width='2'/><polyline points='40,28 40,20 48,20 48,28' fill='none' stroke='#ff3c3c' stroke-width='2'/></svg>`;
      case 'Swamp':
        return `<svg class='tile-overlay-3d' viewBox='0 0 64 32' width='64' height='32'><rect x='20' y='18' width='24' height='10' fill='#4b6043' stroke='#2d4a1a' stroke-width='2'/><polygon points='20,18 32,8 44,18' fill='#7bb661' stroke='#2d4a1a' stroke-width='1'/><rect x='28' y='22' width='4' height='6' fill='#2d4a1a'/><rect x='36' y='22' width='4' height='6' fill='#2d4a1a'/><ellipse cx='12' cy='28' rx='6' ry='4' fill='#3a5c2d'/><rect x='8' y='16' width='4' height='8' fill='#2d4a1a'/><polyline points='10,16 6,10 12,14' fill='none' stroke='#2d4a1a' stroke-width='2'/></svg>`;
      case 'Elderwood':
        return `<svg class='tile-overlay-3d' viewBox='0 0 64 32' width='64' height='32'><ellipse cx='32' cy='20' rx='18' ry='10' fill='#22d3ee' opacity='0.2'/><rect x='28' y='18' width='8' height='8' fill='#4e944f' stroke='#14532d' stroke-width='2'/><ellipse cx='32' cy='14' rx='12' ry='6' fill='#a7f3d0'/><circle cx='32' cy='12' r='4' fill='#22d3ee' stroke='#fff' stroke-width='1'/><text x='32' y='25' font-size='6' text-anchor='middle' fill='#fff' font-family='serif'>✦</text></svg>`;
      case 'Racetrack':
        return `<svg class='tile-overlay-3d' viewBox='0 0 64 32' width='64' height='32'><rect x='12' y='20' width='40' height='8' fill='#f59e0b' stroke='#b45309' stroke-width='2'/><polygon points='12,20 32,8 52,20' fill='#fff' stroke='#f59e0b' stroke-width='1'/><rect x='28' y='24' width='8' height='4' fill='#b45309'/><line x1='12' y1='28' x2='52' y2='28' stroke='#fff' stroke-width='2' stroke-dasharray='4,2'/><rect x='8' y='20' width='4' height='8' fill='#b45309'/><rect x='52' y='20' width='4' height='8' fill='#b45309'/></svg>`;
      default:
        return '';
    }
  }

  // Helper: Return SVG string for a big corner decoration for an archetype and corner
  getCornerSVG(archetype, corner) {
    // corner: 'tl', 'tr', 'bl', 'br'
    let transform = '';
    if (corner === 'tr') transform = 'scale(-1,1)';
    if (corner === 'bl') transform = 'scale(1,-1)';
    if (corner === 'br') transform = 'scale(-1,-1)';
    switch (archetype) {
      case 'Nether':
        // Demonic skull with horns
        return `<svg class='board-corner-svg' viewBox='0 0 120 120' width='120' height='120' style='${corner === 'tr' ? 'right:0;top:0;' : corner === 'tl' ? 'left:0;top:0;' : corner === 'bl' ? 'left:0;bottom:0;' : 'right:0;bottom:0;'}'><g transform='${transform} translate(60,60)'><ellipse cx='0' cy='20' rx='36' ry='40' fill='#2d133b' stroke='#a21caf' stroke-width='6'/><ellipse cx='-16' cy='10' rx='8' ry='12' fill='#fff'/><ellipse cx='16' cy='10' rx='8' ry='12' fill='#fff'/><ellipse cx='-16' cy='13' rx='3' ry='5' fill='#a21caf'/><ellipse cx='16' cy='13' rx='3' ry='5' fill='#a21caf'/><path d='M-36,-10 Q-50,-40 0,-60 Q50,-40 36,-10' fill='none' stroke='#a21caf' stroke-width='8'/></g></svg>`;
      case 'Swamp':
        // Twisted tree
        return `<svg class='board-corner-svg' viewBox='0 0 120 120' width='120' height='120' style='${corner === 'tr' ? 'right:0;top:0;' : corner === 'tl' ? 'left:0;top:0;' : corner === 'bl' ? 'left:0;bottom:0;' : 'right:0;bottom:0;'}'><g transform='${transform} translate(60,100)'><rect x='-10' y='0' width='20' height='40' fill='#4b6043' stroke='#2d4a1a' stroke-width='6'/><path d='M0,0 Q-30,-40 0,-80 Q30,-40 0,0' fill='none' stroke='#7bb661' stroke-width='10'/><ellipse cx='-20' cy='-40' rx='16' ry='10' fill='#7bb661' opacity='0.7'/><ellipse cx='20' cy='-40' rx='16' ry='10' fill='#7bb661' opacity='0.7'/></g></svg>`;
      case 'Elderwood':
        // Ancient rune stone
        return `<svg class='board-corner-svg' viewBox='0 0 120 120' width='120' height='120' style='${corner === 'tr' ? 'right:0;top:0;' : corner === 'tl' ? 'left:0;top:0;' : corner === 'bl' ? 'left:0;bottom:0;' : 'right:0;bottom:0;'}'><g transform='${transform} translate(60,100)'><ellipse cx='0' cy='0' rx='36' ry='20' fill='#22d3ee' opacity='0.2'/><rect x='-18' y='-40' width='36' height='40' rx='12' fill='#4e944f' stroke='#14532d' stroke-width='6'/><text x='0' y='-10' font-size='32' text-anchor='middle' fill='#fff' font-family='serif'>✦</text></g></svg>`;
      case 'Racetrack':
        // Checkered flag and gear
        return `<svg class='board-corner-svg' viewBox='0 0 120 120' width='120' height='120' style='${corner === 'tr' ? 'right:0;top:0;' : corner === 'tl' ? 'left:0;top:0;' : corner === 'bl' ? 'left:0;bottom:0;' : 'right:0;bottom:0;'}'><g transform='${transform} translate(60,100)'><rect x='-30' y='-20' width='60' height='20' fill='#f59e0b' stroke='#b45309' stroke-width='6'/><g><rect x='-24' y='-16' width='8' height='8' fill='#fff'/><rect x='-16' y='-16' width='8' height='8' fill='#23283a'/><rect x='-8' y='-16' width='8' height='8' fill='#fff'/><rect x='0' y='-16' width='8' height='8' fill='#23283a'/><rect x='8' y='-16' width='8' height='8' fill='#fff'/><rect x='16' y='-16' width='8' height='8' fill='#23283a'/></g><circle cx='0' cy='10' r='16' fill='#b45309' stroke='#fff' stroke-width='4'/></g></svg>`;
      default:
        return '';
    }
  }

  findUnitById(unitId) {
    if (!unitId) {
      console.log('No unitId provided to findUnitById');
      return null;
    }
    
    console.log('Searching for unit with ID:', unitId);
    
    // Search through all tiles for the unit
    for (let row = 0; row < this.tiles.length; row++) {
      for (let col = 0; col < this.tiles[row].length; col++) {
        const tile = this.tiles[row][col];
        const unitElement = tile.querySelector('.unit');
        if (unitElement && unitElement.dataset.unitId === unitId) {
          console.log('Found unit element at row:', row, 'col:', col);
          // Get the unit from the game state
          const unit = this.game.getUnitAt(row, col);
          console.log('Retrieved unit from game state:', unit);
          // Validate the unit has required properties
          if (unit && typeof unit.canAttack === 'function' && 'hasAttacked' in unit) {
            return unit;
          }
          console.warn('Unit found but missing required properties');
          return null;
        }
      }
    }
    console.log('No unit found with ID:', unitId);
    return null;
  }

  // --- Effect Animation Methods ---
  animateEffectTrigger(unit, effectType) {
    const tile = this.tiles[unit.row][unit.col];
    const unitElement = tile.querySelector('.unit');
    if (!unitElement) return;

    // Create effect container
    const effectContainer = document.createElement('div');
    effectContainer.className = `effect-animation ${effectType}-animation`;
    unitElement.appendChild(effectContainer);

    // Different animations for different effects
    switch(effectType) {
      case 'strike':
        this.animateStrikeEffect(effectContainer);
        break;
      case 'deathstrike':
        this.animateDeathstrikeEffect(effectContainer);
        break;
      case 'deathblow':
        this.animateDeathblowEffect(effectContainer);
        break;
      case 'warshout':
        this.animateWarshoutEffect(effectContainer);
        break;
      case 'taunt':
        this.animateTauntEffect(effectContainer);
        break;
      default:
        this.animateGenericEffect(effectContainer);
    }

    // Remove the effect container after animation
    setTimeout(() => {
      effectContainer.remove();
    }, 2000);
  }

  animateStrikeEffect(container) {
    const effect = document.createElement('div');
    effect.className = 'strike-effect';
    container.appendChild(effect);

    // Add impact effect
    const impact = document.createElement('div');
    impact.className = 'strike-impact';
    container.appendChild(impact);

    // Remove effects after animation
    setTimeout(() => {
        effect.remove();
        impact.remove();
    }, 1000);
  }

  animateDeathstrikeEffect(container) {
    const skull = document.createElement('div');
    skull.className = 'deathstrike-skull';
    skull.textContent = '💀';
    container.appendChild(skull);

    // Add impact effect
    const impact = document.createElement('div');
    impact.className = 'deathstrike-impact';
    container.appendChild(impact);

    // Animate skull
    skull.style.animation = 'deathstrike-effect 1s ease-out forwards';

    // Remove effects after animation
    setTimeout(() => {
        skull.remove();
        impact.remove();
    }, 1000);
  }

  animateDeathblowEffect(container) {
    // Create particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'deathblow-particle';
        particle.style.setProperty('--angle', `${(i * 45)}deg`);
        container.appendChild(particle);
    }

    // Add impact effect
    const impact = document.createElement('div');
    impact.className = 'deathblow-impact';
    container.appendChild(impact);

    // Remove effects after animation
    setTimeout(() => {
        container.querySelectorAll('.deathblow-particle').forEach(p => p.remove());
        impact.remove();
    }, 1000);
  }

  animateWarshoutEffect(container) {
    const ring = document.createElement('div');
    ring.className = 'warshout-ring';
    container.appendChild(ring);

    // Add impact effect
    const impact = document.createElement('div');
    impact.className = 'warshout-impact';
    container.appendChild(impact);

    // Remove effects after animation
    setTimeout(() => {
        ring.remove();
        impact.remove();
    }, 1000);
  }

  animateTauntEffect(container) {
    const shield = document.createElement('div');
    shield.className = 'taunt-shield';
    shield.textContent = '🛡️';
    container.appendChild(shield);

    // Add impact effect
    const impact = document.createElement('div');
    impact.className = 'taunt-impact';
    container.appendChild(impact);

    // Remove effects after animation
    setTimeout(() => {
        shield.remove();
        impact.remove();
    }, 1000);
  }

  animateGenericEffect(container) {
    const effect = document.createElement('div');
    effect.className = 'generic-effect';
    container.appendChild(effect);

    // Add impact effect
    const impact = document.createElement('div');
    impact.className = 'generic-impact';
    container.appendChild(impact);

    // Remove effects after animation
    setTimeout(() => {
        effect.remove();
        impact.remove();
    }, 1000);
  }

  animateAttack(attacker, target) {
    const attackerElement = document.querySelector(`[data-unit-id="${attacker.id}"]`);
    const targetElement = document.querySelector(`[data-unit-id="${target.id}"]`);
    
    if (!attackerElement || !targetElement) return;
    
    // Create attack effect
    const effect = document.createElement('div');
    effect.style.position = 'absolute';
    effect.style.width = '20px';
    effect.style.height = '20px';
    effect.style.borderRadius = '50%';
    effect.style.backgroundColor = '#ef4444';
    effect.style.boxShadow = '0 0 10px #ef4444';
    effect.style.zIndex = '100';
    
    // Position at attacker
    const attackerRect = attackerElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    effect.style.left = `${attackerRect.left + attackerRect.width/2 - 10}px`;
    effect.style.top = `${attackerRect.top + attackerRect.height/2 - 10}px`;
    document.body.appendChild(effect);
    
    // Animate to target
    setTimeout(() => {
      effect.style.transition = 'all 0.3s ease-in';
      effect.style.left = `${targetRect.left + targetRect.width/2 - 10}px`;
      effect.style.top = `${targetRect.top + targetRect.height/2 - 10}px`;
    }, 50);
    
    // Show impact at target
    setTimeout(() => {
      effect.remove();
      targetElement.style.animation = 'attackEffect 0.5s';
    }, 350);
  }

  addAmbientEffects() {
    // Create subtle grid pattern
    const gridPattern = document.createElement('div');
    gridPattern.className = 'board-grid-pattern';
    gridPattern.style.position = 'absolute';
    gridPattern.style.inset = '0';
    gridPattern.style.backgroundImage = 'radial-gradient(#334155 1px, transparent 1px)';
    gridPattern.style.backgroundSize = '25px 25px';
    gridPattern.style.opacity = '0.2';
    gridPattern.style.pointerEvents = 'none';
    this.container.appendChild(gridPattern);
    // Create floating particles
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'board-particle';
      particle.style.position = 'absolute';
      particle.style.width = '2px';
      particle.style.height = '2px';
      particle.style.backgroundColor = '#f8fafc';
      particle.style.borderRadius = '50%';
      particle.style.opacity = '0';
      particle.style.pointerEvents = 'none';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      // Set animation
      particle.style.animation = `floatParticle ${5 + Math.random() * 10}s linear infinite`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      this.container.appendChild(particle);
    }
    // Add keyframes if not present
    if (!document.querySelector('#board-animations')) {
      const style = document.createElement('style');
      style.id = 'board-animations';
      style.textContent = `
        @keyframes floatParticle {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate(60px, -60px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Highlight valid target units for targeting mode
  highlightValidTargets(targets) {
    this.clearValidTargets(); // Clear previous highlights
    this.validTargets = targets;
    this.currentHighlightType = 'target';
    targets.forEach(unit => {
      const unitElement = document.getElementById(`unit-${unit.id}`);
      if (unitElement) {
        unitElement.classList.add('highlight-target');
      }
    });
    // Optionally, highlight tiles as well if desired
  }

  // Clear all valid target highlights
  clearValidTargets() {
    if (Array.isArray(this.validTargets)) {
      this.validTargets.forEach(unit => {
        const unitElement = document.getElementById(`unit-${unit.id}`);
        if (unitElement) {
          unitElement.classList.remove('highlight-target');
        }
      });
    }
    this.validTargets = [];
    this.currentHighlightType = null;
  }
}

export default GameBoard;