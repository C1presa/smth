// CustomCardsList.js - Complete implementation
import CustomCardBuilder from './CustomCardBuilder.js';
import { getEffectContainerHTML } from '../utils/effectIcons.js';

class CustomCardsList {
    constructor(container, callbacks = {}) {
      this.container = container;
      this.callbacks = callbacks || {};
      this.cards = this.loadCustomCards();
      this.render();
    }
  
    loadCustomCards() {
      try {
        const savedCards = JSON.parse(localStorage.getItem('curve_custom_cards')) || [];
        return savedCards.map(card => {
          if (!card.type) {
            card.type = 'cultist';
          }
          card.effects = (card.effects || []).map(effect => {
            if (!effect.type) {
              effect.type = 'custom';
            }
            return effect;
          });
          return card;
        });
      } catch (e) {
        console.error('Error loading custom cards:', e);
        return [];
      }
    }
  
    render() {
      this.container.innerHTML = '';
      
      // Create page wrapper
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.height = '100vh';
      wrapper.style.background = 'linear-gradient(135deg, #181c24 60%, #23283a 100%)';
      wrapper.style.color = 'white';
      wrapper.style.padding = '20px';
      wrapper.style.fontFamily = 'Arial, sans-serif';
      
      // Header with title and back button
      const header = document.createElement('header');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '20px';
      
      const title = document.createElement('h2');
      title.textContent = 'Custom Cards';
      title.style.fontSize = '1.8rem';
      title.style.fontWeight = 'bold';
      title.style.color = '#f59e0b';
      title.style.textShadow = '0 0 10px rgba(245, 158, 11, 0.3)';
      title.style.margin = '0';
      
      const backButton = document.createElement('button');
      backButton.textContent = '← Back';
      backButton.style.padding = '8px 16px';
      backButton.style.backgroundColor = '#334155';
      backButton.style.color = 'white';
      backButton.style.border = 'none';
      backButton.style.borderRadius = '4px';
      backButton.style.cursor = 'pointer';
      backButton.style.fontWeight = 'bold';
      backButton.style.transition = 'background-color 0.2s';
      
      backButton.addEventListener('mouseenter', () => {
        backButton.style.backgroundColor = '#475569';
      });
      
      backButton.addEventListener('mouseleave', () => {
        backButton.style.backgroundColor = '#334155';
      });
      
      backButton.addEventListener('click', () => {
        if (this.callbacks.onBack) {
          this.callbacks.onBack();
        }
      });
      
      header.appendChild(title);
      header.appendChild(backButton);
      wrapper.appendChild(header);
      
      // Actions bar
      const actionsBar = document.createElement('div');
      actionsBar.style.display = 'flex';
      actionsBar.style.justifyContent = 'space-between';
      actionsBar.style.alignItems = 'center';
      actionsBar.style.marginBottom = '20px';
      
      // Create new card button
      const createButton = document.createElement('button');
      createButton.textContent = '+ Create New Card';
      createButton.style.padding = '10px 20px';
      createButton.style.backgroundColor = '#16a34a';
      createButton.style.color = 'white';
      createButton.style.border = 'none';
      createButton.style.borderRadius = '4px';
      createButton.style.cursor = 'pointer';
      createButton.style.fontWeight = 'bold';
      createButton.style.transition = 'background-color 0.2s, transform 0.1s';
      
      createButton.addEventListener('mouseenter', () => {
        createButton.style.backgroundColor = '#15803d';
        createButton.style.transform = 'translateY(-2px)';
      });
      
      createButton.addEventListener('mouseleave', () => {
        createButton.style.backgroundColor = '#16a34a';
        createButton.style.transform = 'translateY(0)';
      });
      
      createButton.addEventListener('click', () => {
        if (this.callbacks.onEditCard) {
          this.callbacks.onEditCard(); // No card param means create new
        }
      });
      
      // Export cards button
      const exportButton = document.createElement('button');
      exportButton.textContent = 'Export Cards';
      exportButton.style.padding = '10px 20px';
      exportButton.style.backgroundColor = '#f59e0b';
      exportButton.style.color = 'white';
      exportButton.style.border = 'none';
      exportButton.style.borderRadius = '4px';
      exportButton.style.cursor = 'pointer';
      exportButton.style.fontWeight = 'bold';
      exportButton.style.transition = 'background-color 0.2s, transform 0.1s';
      exportButton.addEventListener('mouseenter', () => {
        exportButton.style.backgroundColor = '#d97706';
        exportButton.style.transform = 'translateY(-2px)';
      });
      exportButton.addEventListener('mouseleave', () => {
        exportButton.style.backgroundColor = '#f59e0b';
        exportButton.style.transform = 'translateY(0)';
      });
      exportButton.addEventListener('click', () => {
        CustomCardsList.exportAllCards();
      });
      
      // Import cards button and hidden file input
      const importButton = document.createElement('button');
      importButton.textContent = 'Import Cards';
      importButton.style.padding = '10px 20px';
      importButton.style.backgroundColor = '#3b82f6';
      importButton.style.color = 'white';
      importButton.style.border = 'none';
      importButton.style.borderRadius = '4px';
      importButton.style.cursor = 'pointer';
      importButton.style.fontWeight = 'bold';
      importButton.style.transition = 'background-color 0.2s, transform 0.1s';
      importButton.addEventListener('mouseenter', () => {
        importButton.style.backgroundColor = '#2563eb';
        importButton.style.transform = 'translateY(-2px)';
      });
      importButton.addEventListener('mouseleave', () => {
        importButton.style.backgroundColor = '#3b82f6';
        importButton.style.transform = 'translateY(0)';
      });
      
      // Hidden file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json,application/json';
      fileInput.style.display = 'none';
      fileInput.addEventListener('change', (e) => {
        CustomCardsList.importCards(e);
      });
      importButton.addEventListener('click', () => {
        fileInput.value = '';
        fileInput.click();
      });
      
      actionsBar.appendChild(createButton);
      actionsBar.appendChild(exportButton);
      actionsBar.appendChild(importButton);
      actionsBar.appendChild(fileInput);
      wrapper.appendChild(actionsBar);
      
      // --- Export/Import button row (centered, with icons) ---
      const exportImportContainer = document.createElement('div');
      exportImportContainer.style.display = 'flex';
      exportImportContainer.style.justifyContent = 'center';
      exportImportContainer.style.gap = '10px';
      exportImportContainer.style.marginTop = '20px';

      // Export button
      const exportButton2 = document.createElement('button');
      exportButton2.textContent = '📤 Export All Cards';
      exportButton2.style.padding = '8px 16px';
      exportButton2.style.backgroundColor = '#3b82f6';
      exportButton2.style.color = 'white';
      exportButton2.style.border = 'none';
      exportButton2.style.borderRadius = '4px';
      exportButton2.style.cursor = 'pointer';
      exportButton2.style.fontWeight = 'bold';
      exportButton2.addEventListener('click', () => CustomCardsList.exportAllCards());

      // Import button (styled label) and hidden file input
      const importLabel = document.createElement('label');
      importLabel.textContent = '📥 Import Cards';
      importLabel.style.padding = '8px 16px';
      importLabel.style.backgroundColor = '#8b5cf6';
      importLabel.style.color = 'white';
      importLabel.style.border = 'none';
      importLabel.style.borderRadius = '4px';
      importLabel.style.cursor = 'pointer';
      importLabel.style.fontWeight = 'bold';
      importLabel.style.display = 'inline-block';

      const importInput = document.createElement('input');
      importInput.type = 'file';
      importInput.accept = '.json,application/json';
      importInput.style.display = 'none';
      importInput.addEventListener('change', (e) => CustomCardsList.importCards(e));
      importLabel.appendChild(importInput);

      exportImportContainer.appendChild(exportButton2);
      exportImportContainer.appendChild(importLabel);
      wrapper.appendChild(exportImportContainer);
      
      // Cards grid
      const cardsContainer = document.createElement('div');
      cardsContainer.style.flex = '1';
      cardsContainer.style.overflow = 'auto';
      
      if (this.cards.length === 0) {
        // No cards message
        const noCards = document.createElement('div');
        noCards.style.display = 'flex';
        noCards.style.flexDirection = 'column';
        noCards.style.alignItems = 'center';
        noCards.style.justifyContent = 'center';
        noCards.style.height = '100%';
        noCards.style.padding = '40px';
        noCards.style.backgroundColor = 'rgba(15, 23, 42, 0.4)';
        noCards.style.borderRadius = '8px';
        noCards.style.textAlign = 'center';
        
        const noCardsIcon = document.createElement('div');
        noCardsIcon.textContent = '🃏';
        noCardsIcon.style.fontSize = '4rem';
        noCardsIcon.style.marginBottom = '20px';
        
        const noCardsText = document.createElement('div');
        noCardsText.textContent = 'No custom cards yet';
        noCardsText.style.fontSize = '1.2rem';
        noCardsText.style.fontWeight = 'bold';
        noCardsText.style.marginBottom = '10px';
        
        const noCardsSubtext = document.createElement('div');
        noCardsSubtext.textContent = 'Click the button above to create your first card!';
        noCardsSubtext.style.color = '#94a3b8';
        
        noCards.appendChild(noCardsIcon);
        noCards.appendChild(noCardsText);
        noCards.appendChild(noCardsSubtext);
        
        cardsContainer.appendChild(noCards);
      } else {
        // Create cards grid
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
        grid.style.gap = '20px';
        
        // Add cards to grid
        this.cards.forEach(card => {
          const cardElement = this.createCardElement(card);
          grid.appendChild(cardElement);
        });
        
        cardsContainer.appendChild(grid);
      }
      
      wrapper.appendChild(cardsContainer);
      this.container.appendChild(wrapper);
    }
    
    createCardElement(card) {
      // Card element
      const cardElement = document.createElement('div');
      cardElement.style.backgroundColor = '#1e293b';
      cardElement.style.borderRadius = '10px';
      cardElement.style.overflow = 'hidden';
      cardElement.style.display = 'flex';
      cardElement.style.flexDirection = 'column';
      cardElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      cardElement.style.cursor = 'pointer';
      cardElement.style.transition = 'transform 0.2s, box-shadow 0.2s';
      
      // Card hover effect
      cardElement.addEventListener('mouseenter', () => {
        cardElement.style.transform = 'translateY(-5px)';
        cardElement.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
      });
      
      cardElement.addEventListener('mouseleave', () => {
        cardElement.style.transform = 'translateY(0)';
        cardElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      });
      
      // Click to view card details
      cardElement.addEventListener('click', () => {
        this.showCardDetails(card);
      });
      
      // Archetype color banner
      const archetypeColors = {
        'Nether': '#a21caf',
        'Swamp': '#16a34a',
        'Racetrack': '#f59e0b',
        'Elderwood': '#22d3ee',
        'Neutral': '#64748b'
      };
      const color = archetypeColors[card.id] || '#64748b';
      
      const banner = document.createElement('div');
      banner.style.height = '8px';
      banner.style.backgroundColor = color;
      cardElement.appendChild(banner);
      
      // Card header with name and cost
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.padding = '12px 15px';
      
      const name = document.createElement('div');
      name.textContent = card.name;
      name.style.fontWeight = 'bold';
      name.style.color = 'white';
      
      const cost = document.createElement('div');
      cost.textContent = card.cost;
      cost.style.width = '25px';
      cost.style.height = '25px';
      cost.style.borderRadius = '50%';
      cost.style.backgroundColor = '#3b82f6';
      cost.style.color = 'white';
      cost.style.display = 'flex';
      cost.style.alignItems = 'center';
      cost.style.justifyContent = 'center';
      cost.style.fontWeight = 'bold';
      
      header.appendChild(name);
      header.appendChild(cost);
      cardElement.appendChild(header);
      
      // Card stats
      const stats = document.createElement('div');
      stats.style.display = 'flex';
      stats.style.justifyContent = 'space-between';
      stats.style.alignItems = 'center';
      stats.style.padding = '5px 15px 15px 15px';
      
      const type = document.createElement('div');
      type.textContent = this.capitalizeFirstLetter(card.type);
      type.style.color = '#94a3b8';
      type.style.fontSize = '0.9rem';
      
      const attackHealth = document.createElement('div');
      attackHealth.style.display = 'flex';
      attackHealth.style.gap = '10px';
      
      const attack = document.createElement('div');
      attack.textContent = `${card.attack}`;
      attack.style.color = '#ef4444';
      attack.style.fontWeight = 'bold';
      
      const health = document.createElement('div');
      health.textContent = `${card.health}`;
      health.style.color = '#22c55e';
      health.style.fontWeight = 'bold';
      
      attackHealth.appendChild(attack);
      attackHealth.appendChild(health);
      
      stats.appendChild(type);
      stats.appendChild(attackHealth);
      cardElement.appendChild(stats);
      
      return cardElement;
    }
    
    showCardDetails(card) {
      // Create a modal for displaying card details
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.zIndex = '1000';
      overlay.style.backdropFilter = 'blur(5px)';
      
      // Modal content
      const modal = document.createElement('div');
      modal.style.backgroundColor = '#1e293b';
      modal.style.width = '90%';
      modal.style.maxWidth = '800px';
      modal.style.borderRadius = '12px';
      modal.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.3)';
      modal.style.display = 'flex';
      modal.style.flexDirection = 'column';
      modal.style.maxHeight = '90vh';
      modal.style.overflow = 'hidden';
      
      // Modal header
      const header = document.createElement('div');
      header.style.padding = '20px';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.borderBottom = '1px solid #334155';
      
      const title = document.createElement('h3');
      title.textContent = card.name;
      title.style.margin = '0';
      title.style.fontSize = '1.5rem';
      title.style.fontWeight = 'bold';
      title.style.color = 'white';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.backgroundColor = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'white';
      closeBtn.style.fontSize = '1.8rem';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.width = '40px';
      closeBtn.style.height = '40px';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.display = 'flex';
      closeBtn.style.justifyContent = 'center';
      closeBtn.style.alignItems = 'center';
      closeBtn.style.transition = 'background-color 0.2s';
      
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      });
      
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = 'transparent';
      });
      
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      
      // Modal body
      const body = document.createElement('div');
      body.style.display = 'flex';
      body.style.padding = '20px';
      body.style.gap = '30px';
      body.style.flex = '1';
      body.style.overflow = 'auto';
      
      // Create a larger card preview
      const cardPreview = document.createElement('div');
      cardPreview.style.width = '300px';
      cardPreview.style.flexShrink = '0';
      cardPreview.style.borderRadius = '15px';
      cardPreview.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
      cardPreview.style.overflow = 'hidden';
      cardPreview.style.display = 'flex';
      cardPreview.style.flexDirection = 'column';
      cardPreview.style.backgroundColor = '#0f172a';
      
      // Archetype colors
      const archetypeColors = {
        'Nether': '#a21caf',
        'Swamp': '#16a34a',
        'Racetrack': '#f59e0b',
        'Elderwood': '#22d3ee',
        'Neutral': '#64748b'
      };
      const gradientColor = archetypeColors[card.id] || '#64748b';
      
      // Card header with name and cost
      const cardHeader = document.createElement('div');
      cardHeader.style.padding = '20px';
      cardHeader.style.display = 'flex';
      cardHeader.style.justifyContent = 'space-between';
      cardHeader.style.alignItems = 'center';
      cardHeader.style.backgroundImage = `linear-gradient(to bottom right, ${gradientColor}, ${gradientColor}66)`;
      
      const cardName = document.createElement('div');
      cardName.textContent = card.name;
      cardName.style.fontSize = '1.3rem';
      cardName.style.fontWeight = 'bold';
      cardName.style.color = 'white';
      cardName.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
      
      const cardCost = document.createElement('div');
      cardCost.style.width = '40px';
      cardCost.style.height = '40px';
      cardCost.style.borderRadius = '50%';
      cardCost.style.backgroundColor = '#3b82f6';
      cardCost.style.display = 'flex';
      cardCost.style.justifyContent = 'center';
      cardCost.style.alignItems = 'center';
      cardCost.style.fontWeight = 'bold';
      cardCost.style.fontSize = '1.4rem';
      cardCost.style.color = 'white';
      cardCost.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      cardCost.textContent = card.cost;
      
      cardHeader.appendChild(cardName);
      cardHeader.appendChild(cardCost);
      
      // Card image/icon
      const typeIcons = {
        'demon': '👹',
        'cultist': '🧙',
        'beast': '🐗',
        'insect': '🐛',
        'undead': '💀',
        'racer': '🏎️',
        'lurker': '👁️'
      };
      
      const cardImageContainer = document.createElement('div');
      cardImageContainer.style.display = 'flex';
      cardImageContainer.style.justifyContent = 'center';
      cardImageContainer.style.alignItems = 'center';
      cardImageContainer.style.backgroundColor = '#1a2234';
      cardImageContainer.style.height = '180px';
      
      const cardImage = document.createElement('div');
      cardImage.style.fontSize = '5rem';
      cardImage.textContent = typeIcons[card.type.toLowerCase()] || '⚔️';
      
      cardImageContainer.appendChild(cardImage);
      
      // Card type
      const cardType = document.createElement('div');
      cardType.style.padding = '10px 20px';
      cardType.style.color = '#94a3b8';
      cardType.style.fontSize = '0.9rem';
      cardType.style.borderBottom = '1px solid #334155';
      cardType.textContent = this.capitalizeFirstLetter(card.type) + (card.rarity === 'legendary' ? ' • Legendary' : '');
      
      // Card description
      const cardDesc = document.createElement('div');
      cardDesc.style.padding = '15px 20px';
      cardDesc.style.color = '#cbd5e1';
      cardDesc.style.fontSize = '1rem';
      cardDesc.style.lineHeight = '1.4';
      cardDesc.style.flex = '1';
      cardDesc.innerHTML = CustomCardBuilder.prototype.formatCardDescription(card.description);
      
      // Card stats at bottom
      const cardStats = document.createElement('div');
      cardStats.style.display = 'flex';
      cardStats.style.justifyContent = 'space-between';
      cardStats.style.padding = '15px 20px';
      cardStats.style.borderTop = '1px solid #334155';
      cardStats.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
      
      const cardAttack = document.createElement('div');
      cardAttack.style.display = 'flex';
      cardAttack.style.alignItems = 'center';
      cardAttack.style.gap = '8px';
      cardAttack.style.fontSize = '1.2rem';
      cardAttack.style.color = '#ef4444';
      cardAttack.style.fontWeight = 'bold';
      cardAttack.innerHTML = `<span>⚔️</span> ${card.attack}`;
      
      const cardHealth = document.createElement('div');
      cardHealth.style.display = 'flex';
      cardHealth.style.alignItems = 'center';
      cardHealth.style.gap = '8px';
      cardHealth.style.fontSize = '1.2rem';
      cardHealth.style.color = '#22c55e';
      cardHealth.style.fontWeight = 'bold';
      cardHealth.innerHTML = `<span>❤️</span> ${card.health}`;
      
      cardStats.appendChild(cardAttack);
      cardStats.appendChild(cardHealth);
      
      // Assemble card preview
      cardPreview.appendChild(cardHeader);
      cardPreview.appendChild(cardImageContainer);
      cardPreview.appendChild(cardType);
      cardPreview.appendChild(cardDesc);
      cardPreview.appendChild(cardStats);
      
      // Card details
      const cardDetails = document.createElement('div');
      cardDetails.style.flex = '1';
      
      // Card effects
      const effectsTitle = document.createElement('h4');
      effectsTitle.textContent = 'Card Effects';
      effectsTitle.style.margin = '0 0 15px 0';
      effectsTitle.style.color = '#94a3b8';
      effectsTitle.style.fontSize = '1.1rem';
      effectsTitle.style.fontWeight = 'bold';
      
      const effectsList = document.createElement('div');
      effectsList.style.display = 'flex';
      effectsList.style.flexDirection = 'column';
      effectsList.style.gap = '10px';
      
      if (card.effects && card.effects.length > 0) {
        // Add effect icons
        const effectIconsContainer = document.createElement('div');
        effectIconsContainer.innerHTML = getEffectContainerHTML(card.effects);
        effectsList.appendChild(effectIconsContainer);

        // Add full descriptions
        card.effects.forEach(effect => {
          const effectItem = document.createElement('div');
          effectItem.style.backgroundColor = '#0f172a';
          effectItem.style.borderRadius = '8px';
          effectItem.style.padding = '12px';
          effectItem.innerHTML = CustomCardBuilder.prototype.formatEffectDescription(effect);
          effectsList.appendChild(effectItem);
        });
      } else {
        // No effects
        const noEffects = document.createElement('div');
        noEffects.style.color = '#64748b';
        noEffects.style.fontStyle = 'italic';
        noEffects.textContent = 'This card has no special effects.';
        effectsList.appendChild(noEffects);
      }
      
      cardDetails.appendChild(effectsTitle);
      cardDetails.appendChild(effectsList);
      
      // Action buttons
      const actionButtons = document.createElement('div');
      actionButtons.style.display = 'flex';
      actionButtons.style.gap = '15px';
      actionButtons.style.marginTop = '25px';
      
      // Play with Card button
      const playWithCardButton = document.createElement('button');
      playWithCardButton.textContent = '🎮 Play with Card';
      playWithCardButton.style.flex = '1';
      playWithCardButton.style.padding = '10px';
      playWithCardButton.style.backgroundColor = '#22c55e';
      playWithCardButton.style.color = 'white';
      playWithCardButton.style.border = 'none';
      playWithCardButton.style.borderRadius = '6px';
      playWithCardButton.style.fontWeight = 'bold';
      playWithCardButton.style.cursor = 'pointer';
      
      playWithCardButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (this.callbacks.onPlayWithCard) {
          this.callbacks.onPlayWithCard(card);
        }
      });
      
      // Edit button
      const editButton = document.createElement('button');
      editButton.textContent = '✏️ Edit Card';
      editButton.style.flex = '1';
      editButton.style.padding = '10px';
      editButton.style.backgroundColor = '#3b82f6';
      editButton.style.color = 'white';
      editButton.style.border = 'none';
      editButton.style.borderRadius = '6px';
      editButton.style.fontWeight = 'bold';
      editButton.style.cursor = 'pointer';
      
      editButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (this.callbacks.onEditCard) {
          this.callbacks.onEditCard(card);
        }
      });
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '🗑️ Delete';
      deleteButton.style.padding = '10px';
      deleteButton.style.backgroundColor = '#ef4444';
      deleteButton.style.color = 'white';
      deleteButton.style.border = 'none';
      deleteButton.style.borderRadius = '6px';
      deleteButton.style.fontWeight = 'bold';
      deleteButton.style.cursor = 'pointer';
      
      deleteButton.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${card.name}"?`)) {
          this.deleteCard(card.name);
          document.body.removeChild(overlay);
        }
      });
      
      actionButtons.appendChild(playWithCardButton);
      actionButtons.appendChild(editButton);
      actionButtons.appendChild(deleteButton);
      cardDetails.appendChild(actionButtons);
      
      body.appendChild(cardPreview);
      body.appendChild(cardDetails);
      
      modal.appendChild(header);
      modal.appendChild(body);
      overlay.appendChild(modal);
      
      document.body.appendChild(overlay);
    }
    
    deleteCard(cardName) {
      // Find the card index
      const cardIndex = this.cards.findIndex(card => card.name === cardName);
      if (cardIndex === -1) return;
      
      // Remove the card
      this.cards.splice(cardIndex, 1);
      
      // Update localStorage
      try {
        localStorage.setItem('curve_custom_cards', JSON.stringify(this.cards));
        
        // Re-render the list
        this.render();
      } catch (e) {
        console.error('Error saving cards after deletion:', e);
        alert('Error deleting card: ' + e.message);
      }
    }
    
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Add static export/import methods to the class
    // Export all custom cards
    static exportAllCards() {
      try {
        const customCards = JSON.parse(localStorage.getItem('curve_custom_cards') || '[]');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customCards, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "curve_custom_cards.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        return true;
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed: " + error.message);
        return false;
      }
    }

    // Import cards from file
    static importCards(fileEvent) {
      const file = fileEvent.target.files[0];
      if (!file) return false;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedCards = JSON.parse(e.target.result);
          // Merge with existing cards (avoiding duplicates by name)
          const existingCards = JSON.parse(localStorage.getItem('curve_custom_cards') || '[]');
          const existingNames = new Set(existingCards.map(card => card.name));
          const newCards = importedCards.filter(card => !existingNames.has(card.name));
          const mergedCards = [...existingCards, ...newCards];
          localStorage.setItem('curve_custom_cards', JSON.stringify(mergedCards));
          // Refresh the UI
          location.reload();
          return true;
        } catch (error) {
          console.error("Import failed:", error);
          alert("Failed to import cards: " + error.message);
          return false;
        }
      };
      reader.readAsText(file);
    }
  }
  
  // Helper to format effect targets for display
  function formatTarget(target) {
    const map = {
      any_unit: 'a unit',
      enemy_unit: 'an enemy unit',
      ally_unit: 'an ally unit',
      all_units: 'all units',
      all_enemies: 'all enemy units',
      all_allies: 'all ally units',
      self: 'self',
      player: 'player',
      opponent: 'opponent'
    };
    return map[target] || target || '';
  }
  
  export default CustomCardsList;