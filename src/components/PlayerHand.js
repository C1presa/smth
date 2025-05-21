// PlayerHand.js - Simplified implementation
import CustomCardBuilder from './CustomCardBuilder.js';

class PlayerHand {
  constructor(player, container, callbacks) {
    this.player = player;
    this.container = container;
    this.callbacks = callbacks || {};
    this.selectedCard = null;
    
    this.renderHand();
  }
  
  // Render the player's hand with improved styling
  renderHand() {
    // Clear existing content
    this.container.innerHTML = '';
    
    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.style.display = 'flex';
    cardsContainer.style.justifyContent = 'center';
    cardsContainer.style.alignItems = 'flex-end';
    cardsContainer.style.position = 'relative';
    cardsContainer.style.height = '100%';
    cardsContainer.style.padding = '10px';
    cardsContainer.style.perspective = '1000px';
    
    // Calculate card dimensions
    const cardCount = this.player.hand.length;
    const cardWidth = Math.min(120, this.container.clientWidth / (cardCount + 1));
    const cardHeight = cardWidth * 1.4;
    const centerPosition = cardCount / 2 - 0.5;
    
    // Create and position each card
    this.player.hand.forEach((card, index) => {
      const isPlayable = this.player.mana >= card.cost;
      const cardElement = this.createCardElement(card, index, cardWidth, cardHeight, isPlayable);
      
      // Calculate fan layout positioning
      const offsetFromCenter = index - centerPosition;
      const rotationDegree = offsetFromCenter * 5; // 5 degrees per card
      const horizontalOffset = offsetFromCenter * 5; // 5px horizontal shift
      const verticalOffset = Math.abs(offsetFromCenter) * 2; // Slight vertical curve
      
      cardElement.style.transform = `rotate(${rotationDegree}deg) translateX(${horizontalOffset}px) translateY(${verticalOffset}px)`;
      cardElement.style.transformOrigin = "bottom center";
      cardElement.style.margin = "0 -15px"; // Overlap cards slightly
      
      // Add dynamic hover effect
      cardElement.addEventListener('mouseenter', () => {
        if (isPlayable) {
          cardElement.style.transform = `rotate(${rotationDegree/2}deg) translateY(-30px) scale(1.1)`;
          cardElement.style.zIndex = "100";
        }
      });
      
      cardElement.addEventListener('mouseleave', () => {
        if (this.selectedCard !== index) {
          cardElement.style.transform = `rotate(${rotationDegree}deg) translateX(${horizontalOffset}px) translateY(${verticalOffset}px)`;
          cardElement.style.zIndex = index;
        }
      });
      
      cardsContainer.appendChild(cardElement);
    });
    
    this.container.appendChild(cardsContainer);
  }
  
  // Create an individual card element with enhanced styling
  createCardElement(card, index, width, height, isPlayable) {
    const isSelected = this.selectedCard === index;
    
    const typeIcons = {
      'demon': '👹',
      'cultist': '🧙',
      'beast': '🐗',
      'insect': '🐛',
      'undead': '💀',
      'racer': '🏎️',
      'lurker': '👁️'
    };
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.index = index;
    cardElement.style.width = `${width}px`;
    cardElement.style.height = `${height}px`;
    cardElement.style.position = 'relative';
    cardElement.style.borderRadius = '12px';
    cardElement.style.overflow = 'hidden';
    cardElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.15)';
    cardElement.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    cardElement.style.background = '#1e293b';
    cardElement.style.display = 'flex';
    cardElement.style.flexDirection = 'column';
    cardElement.style.transform = 'perspective(800px) rotateX(3deg)';
    cardElement.style.transformStyle = 'preserve-3d';
    
    // Large, centered type icon
    const centerTypeIcon = document.createElement('div');
    centerTypeIcon.textContent = typeIcons[card.type?.toLowerCase()] || '⚔️';
    centerTypeIcon.style.fontSize = '2rem';
    centerTypeIcon.style.textAlign = 'center';
    centerTypeIcon.style.margin = '8px 0';
    centerTypeIcon.style.filter = 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5))';
    cardElement.appendChild(centerTypeIcon);
    
    // Top bar with name and mana cost
    const topBar = document.createElement('div');
    topBar.style.display = 'flex';
    topBar.style.justifyContent = 'space-between';
    topBar.style.alignItems = 'center';
    topBar.style.padding = '0 8px';
    
    const nameElement = document.createElement('div');
    nameElement.textContent = card.name;
    nameElement.style.fontSize = '0.75rem';
    nameElement.style.fontWeight = 'bold';
    nameElement.style.color = '#ffffff';
    nameElement.style.textShadow = '0 0 5px rgba(59, 130, 246, 0.7)';
    nameElement.style.padding = '2px 4px';
    nameElement.style.maxWidth = '80%';
    nameElement.style.overflow = 'hidden';
    nameElement.style.textOverflow = 'ellipsis';
    nameElement.style.whiteSpace = 'nowrap';
    
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
    cardElement.appendChild(topBar);
    
    // Description
    const desc = document.createElement('div');
    desc.innerHTML = CustomCardBuilder.prototype.formatCardDescription(card.description);
    desc.style.fontSize = '0.8rem';
    desc.style.color = '#cbd5e1';
    desc.style.textAlign = 'center';
    desc.style.flex = '1';
    desc.style.padding = '4px 8px';
    cardElement.appendChild(desc);
    
    // Stat bar at the bottom
    const statContainer = document.createElement('div');
    statContainer.style.display = 'flex';
    statContainer.style.justifyContent = 'space-between';
    statContainer.style.marginTop = 'auto';
    statContainer.style.padding = '0 8px 8px 8px';
    
    const attackStat = document.createElement('div');
    attackStat.style.display = 'flex';
    attackStat.style.alignItems = 'center';
    attackStat.style.background = 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)';
    attackStat.style.borderRadius = '10px';
    attackStat.style.padding = '2px 8px';
    attackStat.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
    attackStat.innerHTML = `<span style="font-size:0.8rem;margin-right:3px;">⚔️</span>${card.attack}`;
    statContainer.appendChild(attackStat);
    
    const healthStat = document.createElement('div');
    healthStat.style.display = 'flex';
    healthStat.style.alignItems = 'center';
    healthStat.style.background = 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)';
    healthStat.style.borderRadius = '10px';
    healthStat.style.padding = '2px 8px';
    healthStat.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
    healthStat.innerHTML = `<span style="font-size:0.8rem;margin-right:3px;">❤️</span>${card.health}`;
    statContainer.appendChild(healthStat);
    
    cardElement.appendChild(statContainer);
    
    // 3D tilt/hover effects
    cardElement.addEventListener('mouseenter', () => {
      if (isPlayable) {
        cardElement.style.transform = 'perspective(800px) rotateX(5deg) translateY(-5px) scale(1.05)';
        cardElement.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.5)';
        cardElement.style.zIndex = '100';
      }
    });
    cardElement.addEventListener('mouseleave', () => {
      if (this.selectedCard !== index) {
        cardElement.style.transform = 'perspective(800px) rotateX(3deg)';
        cardElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.15)';
        cardElement.style.zIndex = index;
      }
    });
    
    // Playability and mana pulse (keep your previous logic)
    if (!isPlayable) {
      cardElement.style.opacity = '0.6';
      cardElement.style.filter = 'grayscale(40%)';
      cardElement.style.cursor = 'not-allowed';
    } else {
      cardElement.style.boxShadow = `0 0 8px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)`;
    }
    if (card.cost > this.player.mana) {
      manaElement.style.backgroundColor = '#ef4444';
      manaElement.style.animation = 'pulseMana 1.5s infinite';
      if (!document.getElementById('pulseMana-keyframes')) {
        const style = document.createElement('style');
        style.id = 'pulseMana-keyframes';
        style.textContent = `
          @keyframes pulseMana {
            0% { box-shadow: 0 0 0 0 #ef4444; }
            50% { box-shadow: 0 0 8px 4px #ef4444; }
            100% { box-shadow: 0 0 0 0 #ef4444; }
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Tooltip and click logic (keep as before)
    cardElement.addEventListener('mouseenter', () => this.showCardTooltip(card, cardElement));
    cardElement.addEventListener('mouseleave', () => this.hideCardTooltip());
    if (isPlayable) {
      cardElement.addEventListener('click', () => {
        this.handleCardClick(index, card);
      });
    }
    return cardElement;
  }
  
  // Helper function to get default icon by type
  getDefaultIcon(type) {
    switch (type) {
      case 'Nether': return '🔮';
      case 'Swamp': return '🌿';
      case 'Racetrack': return '🏎️';
      case 'Elderwood': return '🌳';
      default: return '⚔️';
    }
  }
  
  // Show detailed tooltip when hovering over a card
  showCardTooltip(card, element) {
    this.hideCardTooltip();
    const tooltip = document.createElement('div');
    tooltip.style.position = 'fixed';
    tooltip.style.width = '360px';
    tooltip.style.maxHeight = '320px';
    tooltip.style.overflowY = 'auto';
    tooltip.style.padding = '15px';
    tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    tooltip.style.borderRadius = '8px';
    tooltip.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    
    // Full card details and description with formatting
    tooltip.innerHTML = `
      <div style="font-weight:bold;font-size:1.1rem;margin-bottom:5px;color:#fff;">${card.name}</div>
      <div style="color:#94a3b8;font-size:0.8rem;margin-bottom:10px;">${card.type || 'Unit'}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:5px 10px;margin-bottom:10px;">
        <div style="color:#94a3b8;">Cost:</div>
        <div style="color:#3b82f6;font-weight:bold;">${card.cost}</div>
        <div style="color:#94a3b8;">Attack:</div>
        <div style="color:#ef4444;font-weight:bold;">${card.attack}</div>
        <div style="color:#94a3b8;">Health:</div>
        <div style="color:#22c55e;font-weight:bold;">${card.health}</div>
      </div>
      <div style="background:rgba(30,41,59,0.7);padding:8px;border-radius:5px;font-size:0.95rem;word-break:break-word;white-space:pre-line;max-width:340px;">${CustomCardBuilder.prototype.formatCardDescription(card.description)}</div>
    `;
    
    // Position tooltip next to the card
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;
    
    document.body.appendChild(tooltip);
    this.cardTooltip = tooltip;
  }
  
  // Hide card tooltip
  hideCardTooltip() {
    if (this.cardTooltip && this.cardTooltip.parentNode) {
      document.body.removeChild(this.cardTooltip);
      this.cardTooltip = null;
    }
  }
  
  // Handle card click - select or deselect
  handleCardClick(index, card) {
    // Toggle selection
    if (this.selectedCard === index) {
      this.selectedCard = null;
      
      // Deselect callback
      if (this.callbacks.onCardDeselected) {
        this.callbacks.onCardDeselected();
      }
    } else {
      this.selectedCard = index;
      
      // Select callback
      if (this.callbacks.onCardSelected) {
        this.callbacks.onCardSelected(index, card);
      }
    }
    
    // Re-render to update selection visuals
    this.renderHand();
  }
  
  // Update player reference and re-render
  updatePlayer(player) {
    this.player = player;
    this.renderHand();
  }
  
  // Get selected card index
  getSelectedCardIndex() {
    return this.selectedCard;
  }
  
  // Clear selection
  clearSelection() {
    this.selectedCard = null;
    this.renderHand();
  }
}

export default PlayerHand;