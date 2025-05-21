// src/components/PlayerStats.js
class PlayerStats {
  constructor(player, container, isCurrentPlayer = false) {
    this.player = player;
    this.container = container;
    this.isCurrentPlayer = isCurrentPlayer;
    
    this.render();
  }
  
  // Render player stats with enhanced styling to match reference design
  render() {
    this.container.innerHTML = '';
    this.container.className = `player-stats ${this.isCurrentPlayer ? 'current' : ''}`;
    
    // MAJOR CHANGE: Make layout horizontal instead of vertical
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'row'; // changed from column
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'space-between';
    this.container.style.height = 'auto'; // Automatic height instead of 100%
    this.container.style.padding = '8px'; // Reduced padding
    
    // Create left section with player icon and name
    const playerInfo = document.createElement('div');
    playerInfo.style.display = 'flex';
    playerInfo.style.alignItems = 'center';
    playerInfo.style.gap = '8px';
    
    // Player icon (smaller)
    const playerIcon = document.createElement('div');
    playerIcon.style.width = '24px';
    playerIcon.style.height = '24px';
    playerIcon.style.borderRadius = '50%';
    playerIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    playerIcon.style.display = 'flex';
    playerIcon.style.alignItems = 'center';
    playerIcon.style.justifyContent = 'center';
    playerIcon.style.fontSize = '0.9rem';
    playerIcon.textContent = this.player.id === 1 ? '🔴' : '🔵';
    
    // Player name (smaller)
    const playerName = document.createElement('div');
    playerName.style.fontWeight = 'bold';
    playerName.style.fontSize = '0.8rem';
    playerName.textContent = `Player ${this.player.id}`;
    
    playerInfo.appendChild(playerIcon);
    playerInfo.appendChild(playerName);
    
    // Create compact stats section
    const statsSection = document.createElement('div');
    statsSection.style.display = 'flex';
    statsSection.style.alignItems = 'center';
    statsSection.style.gap = '12px';
    
    // Health (compact display with icon)
    const healthStat = document.createElement('div');
    healthStat.style.display = 'flex';
    healthStat.style.alignItems = 'center';
    healthStat.style.gap = '4px';
    healthStat.innerHTML = `<span style="color:#ef4444;font-size:0.9rem;">❤️</span><span style="font-weight:bold;">${this.player.health}</span>`;
    
    // Mana (compact display with icon)
    const manaStat = document.createElement('div');
    manaStat.style.display = 'flex';
    manaStat.style.alignItems = 'center';
    manaStat.style.gap = '4px';
    manaStat.innerHTML = `<span style="color:#3b82f6;font-size:0.9rem;">⚡</span><span style="font-weight:bold;">${this.player.mana}/${this.player.maxMana}</span>`;
    
    // Deck (compact display with icon)
    const deckStat = document.createElement('div');
    deckStat.style.display = 'flex';
    deckStat.style.alignItems = 'center';
    deckStat.style.gap = '4px';
    deckStat.innerHTML = `<span style="color:#94a3b8;font-size:0.9rem;">🃏</span><span style="font-weight:bold;">${this.player.deck.length}</span>`;
    
    // Graveyard (compact display with icon)
    const graveStat = document.createElement('div');
    graveStat.style.display = 'flex';
    graveStat.style.alignItems = 'center';
    graveStat.style.gap = '4px';
    graveStat.innerHTML = `<span style="color:#94a3b8;font-size:0.9rem;">⚰️</span><span style="font-weight:bold;">${this.player.graveyard.length}</span>`;
    
    // Units (compact display with icon)
    const unitsStat = document.createElement('div');
    unitsStat.style.display = 'flex';
    unitsStat.style.alignItems = 'center';
    unitsStat.style.gap = '4px';
    unitsStat.innerHTML = `<span style="color:#94a3b8;font-size:0.9rem;">⚔️</span><span style="font-weight:bold;">${this.player.units.length}</span>`;
    
    // Add all stats
    statsSection.appendChild(healthStat);
    statsSection.appendChild(manaStat);
    statsSection.appendChild(deckStat);
    statsSection.appendChild(graveStat);
    statsSection.appendChild(unitsStat);
    
    // Add turn indicator if current player
    if (this.isCurrentPlayer) {
      const turnIndicator = document.createElement('div');
      turnIndicator.style.marginLeft = '8px';
      turnIndicator.style.fontSize = '0.7rem';
      turnIndicator.style.color = '#fcd34d';
      turnIndicator.style.backgroundColor = 'rgba(252, 211, 77, 0.2)';
      turnIndicator.style.padding = '2px 6px';
      turnIndicator.style.borderRadius = '4px';
      turnIndicator.innerHTML = '⭐ Your Turn';
      statsSection.appendChild(turnIndicator);
    }
    
    // Add sections to container
    this.container.appendChild(playerInfo);
    this.container.appendChild(statsSection);
  }
  
  // Show graveyard tooltip with enhanced styling
  showGraveyardTooltip(element) {
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'graveyard-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.width = '240px';
    tooltip.style.maxHeight = '300px';
    tooltip.style.overflow = 'auto';
    tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    tooltip.style.borderRadius = '8px';
    tooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    tooltip.style.zIndex = '100';
    tooltip.style.border = '1px solid #334155';
    
    // Get position of the element
    const rect = element.getBoundingClientRect();
    
    // Position tooltip - right side of player stats panel
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;
    
    // Create header
    const header = document.createElement('div');
    header.style.padding = '10px';
    header.style.borderBottom = '1px solid #334155';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '0.9rem';
    header.textContent = 'Graveyard';
    tooltip.appendChild(header);
    
    // Create card list container
    const cardList = document.createElement('div');
    cardList.style.padding = '5px';
    
    // Check if graveyard is empty
    if (this.player.graveyard.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.style.padding = '10px';
      emptyMessage.style.color = '#94a3b8';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.fontStyle = 'italic';
      emptyMessage.textContent = 'No cards in graveyard';
      cardList.appendChild(emptyMessage);
    } else {
      // Add each card to the list
      this.player.graveyard.forEach(card => {
        const cardItem = document.createElement('div');
        cardItem.style.display = 'flex';
        cardItem.style.alignItems = 'center';
        cardItem.style.padding = '6px 8px';
        cardItem.style.borderRadius = '4px';
        cardItem.style.marginBottom = '2px';
        cardItem.style.transition = 'background-color 0.2s ease';
        
        // Add hover effect
        cardItem.addEventListener('mouseenter', () => {
          cardItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        cardItem.addEventListener('mouseleave', () => {
          cardItem.style.backgroundColor = '';
        });
        
        // Card mana cost indicator
        const cardCost = document.createElement('div');
        cardCost.style.width = '20px';
        cardCost.style.height = '20px';
        cardCost.style.borderRadius = '50%';
        cardCost.style.backgroundColor = '#3b82f6';
        cardCost.style.color = 'white';
        cardCost.style.display = 'flex';
        cardCost.style.alignItems = 'center';
        cardCost.style.justifyContent = 'center';
        cardCost.style.fontWeight = 'bold';
        cardCost.style.fontSize = '0.7rem';
        cardCost.style.marginRight = '8px';
        cardCost.textContent = card.cost;
        
        // Card info (name and stats)
        const cardInfo = document.createElement('div');
        cardInfo.style.flex = '1';
        cardInfo.style.overflow = 'hidden';
        
        const cardName = document.createElement('div');
        cardName.style.fontWeight = 'bold';
        cardName.style.fontSize = '0.8rem';
        cardName.style.whiteSpace = 'nowrap';
        cardName.style.overflow = 'hidden';
        cardName.style.textOverflow = 'ellipsis';
        cardName.textContent = card.name;
        
        const cardType = document.createElement('div');
        cardType.style.fontSize = '0.7rem';
        cardType.style.color = '#94a3b8';
        cardType.textContent = card.type || 'Unit';
        
        cardInfo.appendChild(cardName);
        cardInfo.appendChild(cardType);
        
        // Card stats
        const cardStats = document.createElement('div');
        cardStats.style.display = 'flex';
        cardStats.style.gap = '6px';
        cardStats.style.marginLeft = '8px';
        
        const attackStat = document.createElement('div');
        attackStat.style.color = '#ef4444';
        attackStat.style.fontSize = '0.8rem';
        attackStat.style.fontWeight = 'bold';
        attackStat.textContent = `${card.attack}`;
        
        const separator = document.createElement('div');
        separator.style.color = '#64748b';
        separator.textContent = '/';
        
        const healthStat = document.createElement('div');
        healthStat.style.color = '#22c55e';
        healthStat.style.fontSize = '0.8rem';
        healthStat.style.fontWeight = 'bold';
        healthStat.textContent = `${card.health}`;
        
        cardStats.appendChild(attackStat);
        cardStats.appendChild(separator);
        cardStats.appendChild(healthStat);
        
        cardItem.appendChild(cardCost);
        cardItem.appendChild(cardInfo);
        cardItem.appendChild(cardStats);
        
        cardList.appendChild(cardItem);
      });
    }
    
    tooltip.appendChild(cardList);
    document.body.appendChild(tooltip);
    
    // Store reference for removal
    this.graveyardTooltip = tooltip;
    
    // Adjust position if off screen
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
      tooltip.style.left = `${rect.left - tooltipRect.width - 10}px`;
    }
    if (tooltipRect.bottom > window.innerHeight) {
      tooltip.style.top = `${rect.top - (tooltipRect.bottom - window.innerHeight)}px`;
    }
  }
  
  // Hide tooltip
  hideGraveyardTooltip() {
    if (this.graveyardTooltip && this.graveyardTooltip.parentNode) {
      document.body.removeChild(this.graveyardTooltip);
      this.graveyardTooltip = null;
    }
  }
  
  // Update player and re-render
  updatePlayer(player, isCurrentPlayer) {
    this.player = player;
    this.isCurrentPlayer = isCurrentPlayer;
    this.render();
  }
}

export default PlayerStats;