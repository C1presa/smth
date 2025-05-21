// DeckBuilder: Pure vanilla JS deck builder UI
// No React imports or JSX, just DOM manipulation

import CustomCardBuilder from './CustomCardBuilder.js';

// Helper to capitalize first letter
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class DeckBuilder {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.selectedArchetype = null;
    this.currentDeck = [];
    this.deckName = '';
    this.filters = {
      mana: 'all',
      effects: [],
      unitTypes: [],
      rarity: 'all',
      search: ''
    };
    this.gridView = true;
    this.showArchetypeSelection = true;
    
    // Load data
    this.archetypes = [
      { name: 'Nether', value: 'nether', color: '#a21caf', icon: '❄️', desc: 'Dark cultists and demonic beings from the Nether.', allowedTypes: ['Demon', 'Cultist', 'Undead'] },
      { name: 'Swamp', value: 'swamp', color: '#16a34a', icon: '🐸', desc: 'Creatures and spirits of the murky swamps.', allowedTypes: ['Lurker', 'Beast', 'Insect'] },
      { name: 'Racetrack', value: 'racetrack', color: '#f59e0b', icon: '🏁', desc: 'Speedsters and mechanical racers.', allowedTypes: ['Racer'] },
      { name: 'Elderwood', value: 'elderwood', color: '#22d3ee', icon: '🌲', desc: 'Ancient beasts and wise spirits of the forest.', allowedTypes: ['Beast', 'Insect'] }
    ];
    
    this.manaOptions = [
      { name: 'All Costs', value: 'all' },
      ...Array.from({ length: 10 }, (_, i) => ({ name: i + 1, value: i + 1 }))
    ];
    
    this.effectTypes = ['Warshout', 'Deathblow', 'Taunt'];
    this.unitTypes = ['Demon', 'Cultist', 'Undead', 'Lurker', 'Beast', 'Insect', 'Racer'];
    this.rarityTypes = ['Common', 'Legendary'];
    
    // Load cards and decks
    const customCards = this.loadCustomCards();
    this.allCards = customCards.length > 0 ? customCards : [];
    this.savedDecks = this.loadSavedDecks();
    
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.minHeight = '100vh';
    this.container.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
    this.container.style.padding = '32px';
    this.container.style.gap = '24px';

    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '24px';

    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back to Menu';
    backButton.style.background = '#23283a';
    backButton.style.color = 'white';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '8px';
    backButton.style.padding = '12px 24px';
    backButton.style.cursor = 'pointer';
    backButton.onclick = () => this.callbacks.onBack && this.callbacks.onBack();
    header.appendChild(backButton);

    // Title
    const title = document.createElement('h1');
    title.textContent = 'Deck Builder';
    title.style.color = 'white';
    title.style.margin = '0';
    header.appendChild(title);

    // Card Builder button
    const cardBuilderButton = document.createElement('button');
    cardBuilderButton.textContent = 'Card Builder';
    cardBuilderButton.style.background = '#23283a';
    cardBuilderButton.style.color = 'white';
    cardBuilderButton.style.border = 'none';
    cardBuilderButton.style.borderRadius = '8px';
    cardBuilderButton.style.padding = '12px 24px';
    cardBuilderButton.style.cursor = 'pointer';
    cardBuilderButton.onclick = () => this.callbacks.onCardBuilder && this.callbacks.onCardBuilder();
    header.appendChild(cardBuilderButton);

    this.container.appendChild(header);

    // Show archetype selection if no archetype is selected
    if (this.showArchetypeSelection) {
      this.renderArchetypeSelection();
    } else {
      this.renderDeckBuilder();
    }
  }

  renderArchetypeSelection() {
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'center';
    content.style.gap = '32px';

    const title = document.createElement('h2');
    title.textContent = 'Select an Archetype';
    title.style.color = 'white';
    content.appendChild(title);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '24px';
    grid.style.maxWidth = '800px';
    grid.style.width = '100%';

    this.archetypes.forEach(archetype => {
      const card = document.createElement('div');
      card.style.background = archetype.color;
      card.style.color = 'white';
      card.style.borderRadius = '12px';
      card.style.padding = '24px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
      card.style.cursor = 'pointer';
      card.style.transition = 'transform 0.15s';
      
      card.innerHTML = `
        <div style="font-size:2rem;">${archetype.icon}</div>
        <div style="font-size:1.5rem;margin:12px 0;">${archetype.name}</div>
        <div style="text-align:center;margin-bottom:12px;">${archetype.desc}</div>
        <div style="font-size:0.9rem;opacity:0.9;">Allowed Types: ${archetype.allowedTypes.join(', ')}</div>
      `;
      
      card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.04)');
      card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
      card.onclick = () => {
        this.selectedArchetype = archetype;
        this.showArchetypeSelection = false;
        this.render();
      };
      
      grid.appendChild(card);
    });

    content.appendChild(grid);
    this.container.appendChild(content);
  }

  renderDeckBuilder() {
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.gap = '24px';
    content.style.flex = '1';

    // Left Column: Filters & Cards
    const leftColumn = this.createLeftColumn();
    content.appendChild(leftColumn);

    // Center Column: Deck Stats
    const centerColumn = this.createCenterColumn();
    content.appendChild(centerColumn);

    // Right Column: Deck Contents
    const rightColumn = this.createRightColumn();
    content.appendChild(rightColumn);

    this.container.appendChild(content);
  }

  createLeftColumn() {
    const column = document.createElement('div');
    column.style.flex = '2';
    column.style.background = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)';
    column.style.borderRadius = '14px';
    column.style.padding = '24px';
    column.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    column.style.display = 'flex';
    column.style.flexDirection = 'column';
    column.style.gap = '24px';

    // Filter Bar
    const filterBar = document.createElement('div');
    filterBar.style.display = 'flex';
    filterBar.style.flexDirection = 'column';
    filterBar.style.gap = '16px';

    // Mana Cost Filter Buttons
    const manaFilters = document.createElement('div');
    manaFilters.style.display = 'flex';
    manaFilters.style.gap = '8px';
    manaFilters.style.flexWrap = 'wrap';
    manaFilters.style.background = '#131a2b';
    manaFilters.style.padding = '12px';
    manaFilters.style.borderRadius = '8px';

    // Add "All" button
    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.style.background = this.filters.mana === 'all' ? 'linear-gradient(to right, #3b82f6, #2563eb)' : '#1e293b';
    allButton.style.color = 'white';
    allButton.style.border = 'none';
    allButton.style.borderRadius = '6px';
    allButton.style.padding = '8px 16px';
    allButton.style.cursor = 'pointer';
    allButton.style.transition = 'all 0.2s ease';
    allButton.style.boxShadow = this.filters.mana === 'all' ? '0 2px 8px rgba(59, 130, 246, 0.5)' : 'none';
    allButton.onclick = () => {
      this.filters.mana = 'all';
      this.render();
    };
    manaFilters.appendChild(allButton);

    // Add mana cost buttons (0-10+)
    for (let i = 0; i <= 10; i++) {
      const manaButton = document.createElement('button');
      manaButton.textContent = i === 10 ? '10+' : i;
      manaButton.style.background = this.filters.mana === i.toString() ? 'linear-gradient(to right, #3b82f6, #2563eb)' : '#1e293b';
      manaButton.style.color = 'white';
      manaButton.style.border = 'none';
      manaButton.style.borderRadius = '6px';
      manaButton.style.padding = '8px 16px';
      manaButton.style.cursor = 'pointer';
      manaButton.style.transition = 'all 0.2s ease';
      manaButton.style.boxShadow = this.filters.mana === i.toString() ? '0 2px 8px rgba(59, 130, 246, 0.5)' : 'none';
      manaButton.onclick = () => {
        this.filters.mana = i.toString();
        this.render();
      };
      manaFilters.appendChild(manaButton);
    }
    filterBar.appendChild(manaFilters);

    // Search Bar with improved styling
    const searchContainer = document.createElement('div');
    searchContainer.style.position = 'relative';
    searchContainer.style.width = '100%';
    searchContainer.style.background = '#131a2b';
    searchContainer.style.padding = '12px';
    searchContainer.style.borderRadius = '8px';

    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search cards...';
    searchBar.style.width = '100%';
    searchBar.style.padding = '8px 12px';
    searchBar.style.borderRadius = '6px';
    searchBar.style.border = '1px solid #334155';
    searchBar.style.background = '#1e293b';
    searchBar.style.color = 'white';
    searchBar.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';

    // Add search icon
    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = '🔍';
    searchIcon.style.position = 'absolute';
    searchIcon.style.left = '12px';
    searchIcon.style.top = '50%';
    searchIcon.style.transform = 'translateY(-50%)';
    searchIcon.style.opacity = '0.7';
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchBar);

    // Add debouncing to search
    let searchTimeout;
    searchBar.oninput = (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.filters.search = e.target.value;
        this.render();
      }, 300);
    };
    filterBar.appendChild(searchContainer);

    // Additional Filters
    const additionalFilters = document.createElement('div');
    additionalFilters.style.display = 'flex';
    additionalFilters.style.gap = '16px';
    additionalFilters.style.flexWrap = 'wrap';

    // Effect Type Filter
    const effectFilter = this.createFilterSection('Effects', this.effectTypes, 'effects', true);
    additionalFilters.appendChild(effectFilter);

    // Unit Type Filter
    const unitTypeFilter = this.createFilterSection('Unit Types', this.unitTypes, 'unitTypes', true);
    additionalFilters.appendChild(unitTypeFilter);

    // Rarity Filter
    const rarityFilter = this.createFilterSection('Rarity', this.rarityTypes, 'rarity');
    additionalFilters.appendChild(rarityFilter);

    filterBar.appendChild(additionalFilters);
    column.appendChild(filterBar);

    // Card Grid with improved styling
    const cardGrid = document.createElement('div');
    cardGrid.style.display = 'grid';
    cardGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    cardGrid.style.gap = '16px';
    cardGrid.style.overflowY = 'auto';
    cardGrid.style.maxHeight = '600px';
    cardGrid.style.padding = '8px';

    // Filter and display cards
    const filteredCards = this.filterCards();
    filteredCards.forEach(card => {
      const cardElement = this.createCardElement(card);
      cardGrid.appendChild(cardElement);
    });

    column.appendChild(cardGrid);
    return column;
  }

  createCenterColumn() {
    const column = document.createElement('div');
    column.style.flex = '1';
    column.style.background = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)';
    column.style.borderRadius = '14px';
    column.style.padding = '24px';
    column.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    column.style.display = 'flex';
    column.style.flexDirection = 'column';
    column.style.gap = '24px';

    // Deck Stats
    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'flex';
    statsContainer.style.flexDirection = 'column';
    statsContainer.style.gap = '16px';

    // Mana Curve Chart
    const manaCurve = this.createManaCurveChart();
    statsContainer.appendChild(manaCurve);

    // Unit Type Distribution
    const unitDistribution = this.createUnitTypeDistribution();
    statsContainer.appendChild(unitDistribution);

    // Effect Type Distribution
    const effectDistribution = this.createEffectTypeDistribution();
    statsContainer.appendChild(effectDistribution);

    column.appendChild(statsContainer);

    // Save Button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Deck';
    saveButton.style.background = 'linear-gradient(to right, #16a34a, #22c55e)';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '8px';
    saveButton.style.padding = '12px 24px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
    saveButton.style.transition = 'all 0.2s ease';

    saveButton.addEventListener('mouseenter', () => {
      saveButton.style.transform = 'translateY(-2px)';
      saveButton.style.boxShadow = '0 6px 15px rgba(22, 163, 74, 0.5)';
    });
    saveButton.addEventListener('mouseleave', () => {
      saveButton.style.transform = 'translateY(0)';
      saveButton.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
    });
    saveButton.onclick = () => this.saveDeck();
    column.appendChild(saveButton);

    return column;
  }

  createRightColumn() {
    const column = document.createElement('div');
    column.style.flex = '1';
    column.style.background = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)';
    column.style.borderRadius = '14px';
    column.style.padding = '24px';
    column.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    column.style.display = 'flex';
    column.style.flexDirection = 'column';
    column.style.gap = '24px';

    // Deck Header
    const deckHeader = document.createElement('div');
    deckHeader.style.display = 'flex';
    deckHeader.style.justifyContent = 'space-between';
    deckHeader.style.alignItems = 'center';
    deckHeader.style.marginBottom = '16px';

    // Deck Name Input
    const deckNameInput = document.createElement('input');
    deckNameInput.type = 'text';
    deckNameInput.placeholder = 'Enter deck name...';
    deckNameInput.value = this.deckName;
    deckNameInput.style.width = '100%';
    deckNameInput.style.padding = '12px';
    deckNameInput.style.borderRadius = '8px';
    deckNameInput.style.border = '1px solid #334155';
    deckNameInput.style.background = '#131a2b';
    deckNameInput.style.color = 'white';
    deckNameInput.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
    deckNameInput.oninput = (e) => {
      this.deckName = e.target.value;
    };
    deckHeader.appendChild(deckNameInput);

    // Card Count
    const deckCount = document.createElement('div');
    deckCount.textContent = `${this.currentDeck.length}/30 Cards`;
    deckCount.style.color = 'white';
    deckCount.style.fontSize = '1.1rem';
    deckCount.style.fontWeight = 'bold';
    deckHeader.appendChild(deckCount);

    column.appendChild(deckHeader);

    // Deck Cards List
    const deckCardsList = document.createElement('div');
    deckCardsList.style.display = 'flex';
    deckCardsList.style.flexDirection = 'column';
    deckCardsList.style.gap = '8px';
    deckCardsList.style.overflowY = 'auto';
    deckCardsList.style.maxHeight = '400px';
    deckCardsList.style.padding = '8px';
    deckCardsList.style.background = '#181c24';
    deckCardsList.style.borderRadius = '8px';

    this.currentDeck.forEach(card => {
      const cardElement = this.createDeckCardElement(card);
      deckCardsList.appendChild(cardElement);
    });

    column.appendChild(deckCardsList);

    // Deck Stats
    const deckStats = document.createElement('div');
    deckStats.style.display = 'flex';
    deckStats.style.flexDirection = 'column';
    deckStats.style.gap = '16px';

    // Mana Curve
    const manaCurve = document.createElement('div');
    manaCurve.style.background = '#181c24';
    manaCurve.style.borderRadius = '8px';
    manaCurve.style.padding = '16px';

    const manaCurveTitle = document.createElement('h3');
    manaCurveTitle.textContent = 'Mana Curve';
    manaCurveTitle.style.color = 'white';
    manaCurveTitle.style.margin = '0 0 16px 0';
    manaCurve.appendChild(manaCurveTitle);

    const manaCurveChart = document.createElement('div');
    manaCurveChart.style.display = 'flex';
    manaCurveChart.style.alignItems = 'flex-end';
    manaCurveChart.style.gap = '4px';
    manaCurveChart.style.height = '100px';

    // Calculate mana distribution
    const manaCounts = Array(10).fill(0);
    this.currentDeck.forEach(card => {
      if (card.mana <= 10) {
        manaCounts[card.mana - 1]++;
      }
    });

    const maxCount = Math.max(...manaCounts, 1); // Prevent division by zero

    manaCounts.forEach((count, index) => {
      const barContainer = document.createElement('div');
      barContainer.style.display = 'flex';
      barContainer.style.flexDirection = 'column';
      barContainer.style.alignItems = 'center';
      barContainer.style.flex = '1';
      barContainer.style.gap = '4px';

      const bar = document.createElement('div');
      bar.style.width = '100%';
      bar.style.background = '#3b82f6';
      bar.style.height = `${(count / maxCount) * 100}%`;
      bar.style.borderRadius = '4px 4px 0 0';
      bar.style.transition = 'height 0.3s ease';

      const label = document.createElement('div');
      label.textContent = count;
      label.style.color = 'white';
      label.style.fontSize = '0.8rem';

      const costLabel = document.createElement('div');
      costLabel.textContent = index + 1;
      costLabel.style.color = '#666';
      costLabel.style.fontSize = '0.8rem';

      barContainer.appendChild(label);
      barContainer.appendChild(bar);
      barContainer.appendChild(costLabel);
      manaCurveChart.appendChild(barContainer);
    });

    manaCurve.appendChild(manaCurveChart);
    deckStats.appendChild(manaCurve);

    // Unit Type Distribution
    const unitDistribution = this.createUnitTypeDistribution();
    deckStats.appendChild(unitDistribution);

    // Effect Type Distribution
    const effectDistribution = this.createEffectTypeDistribution();
    deckStats.appendChild(effectDistribution);

    column.appendChild(deckStats);

    // Button Container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '12px';
    buttonContainer.style.marginTop = 'auto';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Deck';
    saveButton.style.flex = '1';
    saveButton.style.background = '#22c55e';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '8px';
    saveButton.style.padding = '12px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.fontWeight = 'bold';
    saveButton.style.transition = 'background-color 0.2s';
    saveButton.onclick = () => this.saveDeck();
    buttonContainer.appendChild(saveButton);

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Deck';
    clearButton.style.flex = '1';
    clearButton.style.background = '#ef4444';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '8px';
    clearButton.style.padding = '12px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.fontWeight = 'bold';
    clearButton.style.transition = 'background-color 0.2s';
    clearButton.onclick = () => {
      this.currentDeck = [];
      this.render();
    };
    buttonContainer.appendChild(clearButton);

    column.appendChild(buttonContainer);

    return column;
  }

  createDeckCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.style.background = '#23283a';
    cardDiv.style.color = 'white';
    cardDiv.style.borderRadius = '6px';
    cardDiv.style.padding = '12px';
    cardDiv.style.display = 'flex';
    cardDiv.style.justifyContent = 'space-between';
    cardDiv.style.alignItems = 'center';
    cardDiv.style.cursor = 'pointer';
    cardDiv.style.transition = 'background-color 0.2s';

    const cardInfo = document.createElement('div');
    cardInfo.style.display = 'flex';
    cardInfo.style.alignItems = 'center';
    cardInfo.style.gap = '12px';

    const cardIcon = document.createElement('div');
    cardIcon.textContent = card.icon;
    cardIcon.style.fontSize = '1.2rem';
    cardInfo.appendChild(cardIcon);

    const cardDetails = document.createElement('div');
    cardDetails.style.display = 'flex';
    cardDetails.style.flexDirection = 'column';
    cardDetails.style.gap = '2px';

    const cardName = document.createElement('div');
    cardName.textContent = card.name;
    cardName.style.fontWeight = 'bold';
    cardDetails.appendChild(cardName);

    const cardStats = document.createElement('div');
    cardStats.style.display = 'flex';
    cardStats.style.gap = '8px';
    cardStats.style.fontSize = '0.9rem';
    cardStats.style.opacity = '0.8';
    cardStats.innerHTML = `
      <span style="color:#fca5a5;">${card.attack}</span>
      <span style="color:#86efac;">${card.health}</span>
      <span style="color:#3b82f6;">${card.mana}</span>
    `;
    cardDetails.appendChild(cardStats);

    cardInfo.appendChild(cardDetails);
    cardDiv.appendChild(cardInfo);

    const removeButton = document.createElement('button');
    removeButton.textContent = '×';
    removeButton.style.background = 'none';
    removeButton.style.border = 'none';
    removeButton.style.color = '#ef4444';
    removeButton.style.fontSize = '1.2rem';
    removeButton.style.cursor = 'pointer';
    removeButton.style.padding = '4px 8px';
    removeButton.style.borderRadius = '4px';
    removeButton.style.transition = 'background-color 0.2s';
    removeButton.onclick = (e) => {
      e.stopPropagation();
      this.removeFromDeck(card.id);
    };
    cardDiv.appendChild(removeButton);

    // Add hover effect
    cardDiv.addEventListener('mouseenter', () => {
      cardDiv.style.background = '#2d3446';
    });
    cardDiv.addEventListener('mouseleave', () => {
      cardDiv.style.background = '#23283a';
    });

    return cardDiv;
  }

  // Helper methods for creating UI components
  createFilterSection(title, options, filterKey, isMultiSelect = false) {
    const section = document.createElement('div');
    section.style.display = 'flex';
    section.style.flexDirection = 'column';
    section.style.gap = '8px';

    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.style.color = 'white';
    sectionTitle.style.margin = '0';
    section.appendChild(sectionTitle);

    if (isMultiSelect) {
      options.forEach(option => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '8px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${filterKey}-${option.toLowerCase()}`;
        checkbox.checked = this.filters[filterKey].includes(option);
        checkbox.onchange = (e) => {
          if (e.target.checked) {
            this.filters[filterKey].push(option);
          } else {
            this.filters[filterKey] = this.filters[filterKey].filter(item => item !== option);
          }
          this.render();
        };

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option;
        label.style.color = 'white';

        container.appendChild(checkbox);
        container.appendChild(label);
        section.appendChild(container);
      });
    } else {
      const select = document.createElement('select');
      select.style.padding = '8px';
      select.style.borderRadius = '6px';
      select.style.border = '1px solid #444';
      select.style.background = '#181c24';
      select.style.color = 'white';
      select.style.width = '100%';

      options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value || option;
        opt.textContent = option.name || option;
        select.appendChild(opt);
      });

      select.value = this.filters[filterKey];
      select.onchange = (e) => {
        this.filters[filterKey] = e.target.value;
        this.render();
      };

      section.appendChild(select);
    }

    return section;
  }

  createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-item';
    cardDiv.dataset.id = card.id;
    
    // Set card background based on rarity
    const rarityColor = card.rarity === 'Legendary' ? '#ffd700' : '#ffffff';
    cardDiv.style.background = `linear-gradient(135deg, ${rarityColor}22, ${rarityColor}11)`;
    cardDiv.style.border = `2px solid ${rarityColor}44`;
    cardDiv.style.borderRadius = '12px';
    cardDiv.style.padding = '16px';
    cardDiv.style.position = 'relative';
    cardDiv.style.transition = 'transform 0.2s, box-shadow 0.2s';
    cardDiv.style.cursor = 'pointer';
    cardDiv.style.display = 'flex';
    cardDiv.style.flexDirection = 'column';
    cardDiv.style.gap = '8px';
    cardDiv.style.height = '240px';

    // Card mana cost
    const manaCost = document.createElement('div');
    manaCost.style.position = 'absolute';
    manaCost.style.top = '12px';
    manaCost.style.left = '12px';
    manaCost.style.width = '32px';
    manaCost.style.height = '32px';
    manaCost.style.background = '#3b82f6';
    manaCost.style.borderRadius = '50%';
    manaCost.style.display = 'flex';
    manaCost.style.alignItems = 'center';
    manaCost.style.justifyContent = 'center';
    manaCost.style.color = 'white';
    manaCost.style.fontWeight = 'bold';
    manaCost.style.fontSize = '1.2rem';
    manaCost.style.border = '2px solid #1d4ed8';
    manaCost.textContent = card.mana;
    cardDiv.appendChild(manaCost);

    // Card name
    const cardName = document.createElement('div');
    cardName.style.fontWeight = 'bold';
    cardName.style.fontSize = '1.1rem';
    cardName.style.color = 'white';
    cardName.style.marginTop = '24px';
    cardName.style.textAlign = 'center';
    cardName.textContent = card.name;
    cardDiv.appendChild(cardName);

    // Card type icon
    const typeIcon = document.createElement('div');
    typeIcon.style.fontSize = '2rem';
    typeIcon.style.textAlign = 'center';
    typeIcon.style.margin = '8px 0';
    typeIcon.textContent = card.icon;
    cardDiv.appendChild(typeIcon);

    // Card description
    const description = document.createElement('div');
    description.style.fontSize = '0.9rem';
    description.style.color = '#ccc';
    description.style.textAlign = 'center';
    description.style.flex = '1';
    description.innerHTML = CustomCardBuilder.prototype.formatCardDescription(card.description);
    cardDiv.appendChild(description);

    // Card stats
    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'flex';
    statsContainer.style.justifyContent = 'center';
    statsContainer.style.gap = '16px';
    statsContainer.style.marginTop = 'auto';

    const attackStat = document.createElement('div');
    attackStat.style.background = '#ef4444';
    attackStat.style.color = 'white';
    attackStat.style.width = '32px';
    attackStat.style.height = '32px';
    attackStat.style.borderRadius = '50%';
    attackStat.style.display = 'flex';
    attackStat.style.alignItems = 'center';
    attackStat.style.justifyContent = 'center';
    attackStat.style.fontWeight = 'bold';
    attackStat.textContent = card.attack;

    const healthStat = document.createElement('div');
    healthStat.style.background = '#22c55e';
    healthStat.style.color = 'white';
    healthStat.style.width = '32px';
    healthStat.style.height = '32px';
    healthStat.style.borderRadius = '50%';
    healthStat.style.display = 'flex';
    healthStat.style.alignItems = 'center';
    healthStat.style.justifyContent = 'center';
    healthStat.style.fontWeight = 'bold';
    healthStat.textContent = card.health;

    statsContainer.appendChild(attackStat);
    statsContainer.appendChild(healthStat);
    cardDiv.appendChild(statsContainer);

    // Card count badge
    const countInDeck = this.currentDeck.filter(c => c.id === card.id).length;
    if (countInDeck > 0) {
      const countBadge = document.createElement('div');
      countBadge.style.position = 'absolute';
      countBadge.style.top = '12px';
      countBadge.style.right = '12px';
      countBadge.style.background = '#3b82f6';
      countBadge.style.color = 'white';
      countBadge.style.padding = '4px 8px';
      countBadge.style.borderRadius = '12px';
      countBadge.style.fontSize = '0.9rem';
      countBadge.style.fontWeight = 'bold';
      countBadge.textContent = `${countInDeck}/${card.rarity === 'Legendary' ? '1' : '∞'}`;
      cardDiv.appendChild(countBadge);

      if (card.rarity === 'Legendary' && countInDeck === 1) {
        cardDiv.style.opacity = '0.7';
      }
    }

    // Add hover effects
    cardDiv.addEventListener('mouseenter', () => {
      cardDiv.style.transform = 'scale(1.05)';
      cardDiv.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
      this.showCardDetail(card, event);
    });

    cardDiv.addEventListener('mouseleave', () => {
      cardDiv.style.transform = 'scale(1)';
      cardDiv.style.boxShadow = 'none';
      this.hideCardDetail();
    });

    cardDiv.onclick = () => this.addToDeck(card);
    return cardDiv;
  }

  showCardDetail(card, event) {
    let detailPopup = document.querySelector('.card-detail-popup');
    if (!detailPopup) {
      detailPopup = document.createElement('div');
      detailPopup.className = 'card-detail-popup';
      document.body.appendChild(detailPopup);
    }

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    detailPopup.style.position = 'fixed';
    detailPopup.style.left = `${mouseX + 20}px`;
    detailPopup.style.top = `${mouseY - 100}px`;
    detailPopup.style.zIndex = '1000';
    detailPopup.style.background = '#23283a';
    detailPopup.style.borderRadius = '12px';
    detailPopup.style.padding = '16px';
    detailPopup.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    detailPopup.style.minWidth = '300px';
    detailPopup.style.color = 'white';

    detailPopup.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:1.5rem;font-weight:bold;">${card.name}</div>
          <div style="background:#3b82f6;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">${card.mana}</div>
        </div>
        <div style="font-size:2rem;text-align:center;">${card.icon}</div>
        <div style="color:#ccc;text-align:center;">${CustomCardBuilder.prototype.formatCardDescription(card.description)}</div>
        <div style="display:flex;justify-content:center;gap:16px;">
          <div style="background:#ef4444;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">${card.attack}</div>
          <div style="background:#22c55e;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">${card.health}</div>
        </div>
        <div style="display:flex;justify-content:space-between;color:#ccc;font-size:0.9rem;">
          <span>${card.unitType}</span>
          <span>${card.effectType}</span>
        </div>
      </div>
    `;

    detailPopup.style.display = 'block';
  }

  hideCardDetail() {
    const detailPopup = document.querySelector('.card-detail-popup');
    if (detailPopup) {
      detailPopup.style.display = 'none';
    }
  }

  updateManaCurve() {
    const manaCounts = Array(11).fill(0);
    this.currentDeck.forEach(card => {
      const cost = Math.min(card.mana, 10);
      manaCounts[cost]++;
    });

    const maxCount = Math.max(...manaCounts, 1);
    const curveContainer = document.querySelector('.mana-curve-chart');
    if (!curveContainer) return;

    curveContainer.innerHTML = '';

    for (let i = 0; i <= 10; i++) {
      const barContainer = document.createElement('div');
      barContainer.style.display = 'flex';
      barContainer.style.flexDirection = 'column';
      barContainer.style.alignItems = 'center';
      barContainer.style.flex = '1';
      barContainer.style.gap = '4px';

      const bar = document.createElement('div');
      bar.style.width = '100%';
      bar.style.background = '#3b82f6';
      bar.style.height = `${(manaCounts[i] / maxCount) * 100}%`;
      bar.style.borderRadius = '4px 4px 0 0';
      bar.style.transition = 'height 0.3s ease';

      const countLabel = document.createElement('div');
      countLabel.textContent = manaCounts[i] || '';
      countLabel.style.color = 'white';
      countLabel.style.fontSize = '0.8rem';

      const costLabel = document.createElement('div');
      costLabel.textContent = i === 10 ? '10+' : i;
      costLabel.style.color = '#666';
      costLabel.style.fontSize = '0.8rem';

      barContainer.appendChild(countLabel);
      barContainer.appendChild(bar);
      barContainer.appendChild(costLabel);
      curveContainer.appendChild(barContainer);
    }
  }

  createManaCurveChart() {
    const container = document.createElement('div');
    container.style.background = '#181c24';
    container.style.borderRadius = '8px';
    container.style.padding = '16px';

    const title = document.createElement('h3');
    title.textContent = 'Mana Curve';
    title.style.color = 'white';
    title.style.margin = '0 0 16px 0';
    container.appendChild(title);

    // Simple bar chart implementation
    const chart = document.createElement('div');
    chart.style.display = 'flex';
    chart.style.alignItems = 'flex-end';
    chart.style.gap = '4px';
    chart.style.height = '100px';

    const manaCounts = Array(10).fill(0);
    this.currentDeck.forEach(card => {
      if (card.mana <= 10) {
        manaCounts[card.mana - 1]++;
      }
    });

    manaCounts.forEach((count, index) => {
      const bar = document.createElement('div');
      bar.style.flex = '1';
      bar.style.background = '#3b82f6';
      bar.style.height = `${(count / Math.max(...manaCounts)) * 100}%`;
      bar.style.borderRadius = '4px 4px 0 0';
      chart.appendChild(bar);
    });

    container.appendChild(chart);
    return container;
  }

  createUnitTypeDistribution() {
    const container = document.createElement('div');
    container.style.background = '#181c24';
    container.style.borderRadius = '8px';
    container.style.padding = '16px';

    const title = document.createElement('h3');
    title.textContent = 'Unit Type Distribution';
    title.style.color = 'white';
    title.style.margin = '0 0 16px 0';
    container.appendChild(title);

    const distribution = {};
    this.unitTypes.forEach(type => {
      distribution[type] = 0;
    });

    this.currentDeck.forEach(card => {
      if (card.unitType) {
        distribution[card.unitType]++;
      }
    });

    Object.entries(distribution).forEach(([type, count]) => {
      if (count > 0) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '8px';
        row.style.color = 'white';

        const typeLabel = document.createElement('span');
        typeLabel.textContent = type;
        row.appendChild(typeLabel);

        const countLabel = document.createElement('span');
        countLabel.textContent = count;
        row.appendChild(countLabel);

        container.appendChild(row);
      }
    });

    return container;
  }

  createEffectTypeDistribution() {
    const container = document.createElement('div');
    container.style.background = '#181c24';
    container.style.borderRadius = '8px';
    container.style.padding = '16px';

    const title = document.createElement('h3');
    title.textContent = 'Effect Type Distribution';
    title.style.color = 'white';
    title.style.margin = '0 0 16px 0';
    container.appendChild(title);

    const distribution = {};
    this.effectTypes.forEach(type => {
      distribution[type] = 0;
    });

    this.currentDeck.forEach(card => {
      if (card.effectType) {
        distribution[card.effectType]++;
      }
    });

    Object.entries(distribution).forEach(([type, count]) => {
      if (count > 0) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '8px';
        row.style.color = 'white';

        const typeLabel = document.createElement('span');
        typeLabel.textContent = type;
        row.appendChild(typeLabel);

        const countLabel = document.createElement('span');
        countLabel.textContent = count;
        row.appendChild(countLabel);

        container.appendChild(row);
      }
    });

    return container;
  }

  // Card management methods
  addToDeck(card) {
    if (!this.isCardCompatible(card)) {
      alert(`This card is not compatible with your selected archetype (${this.selectedArchetype.name})!`);
      return;
    }

    const cardCount = this.currentDeck.filter(c => c.id === card.id).length;
    if (card.rarity === 'Legendary' && cardCount >= 1) {
      alert('You can only include 1 copy of a Legendary card!');
      return;
    }

    if (this.currentDeck.length >= 30) {
      alert('Your deck is full!');
      return;
    }

    this.currentDeck.push(card);
    this.render();
  }

  removeFromDeck(cardId) {
    this.currentDeck = this.currentDeck.filter(c => c.id !== cardId);
    this.render();
  }

  isCardCompatible(card) {
    if (!this.selectedArchetype) return true;
    
    // For neutral cards, always allow
    if (card.archetype === 'Neutral') return true;
    
    // For archetype-specific cards, check matching archetype
    if (card.archetype === this.selectedArchetype.value) return true;
    
    // For unit type compatibility
    const archetypeUnitTypes = {
      'nether': ['demon', 'cultist', 'undead'],
      'elderwood': ['beast', 'insect'],
      'swamp': ['lurker', 'beast', 'insect'],
      'racetrack': ['racer']
    };
    
    // If card has no unit type, check if it's neutral
    if (!card.unitType) return card.archetype === 'Neutral';
    
    // If card type is in the allowed types for this archetype
    const allowedTypes = archetypeUnitTypes[this.selectedArchetype.value] || [];
    return allowedTypes.includes(card.unitType.toLowerCase());
  }

  filterCards() {
    return this.allCards.filter(card => {
      // Search filter - improved with trim and case-insensitive matching
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase().trim();
        const cardName = card.name.toLowerCase();
        const cardDesc = card.description.toLowerCase();
        if (!cardName.includes(searchTerm) && !cardDesc.includes(searchTerm)) {
          return false;
        }
      }

      // Mana filter
      if (this.filters.mana !== 'all' && card.mana !== parseInt(this.filters.mana)) {
        return false;
      }

      // Effect type filter - improved with case-insensitive matching
      if (this.filters.effects.length > 0) {
        const cardEffect = card.effectType?.toLowerCase();
        const hasMatchingEffect = this.filters.effects.some(effect => 
          effect.toLowerCase() === cardEffect
        );
        if (!hasMatchingEffect) return false;
      }

      // Unit type filter - improved with case-insensitive matching
      if (this.filters.unitTypes.length > 0) {
        const cardType = card.unitType?.toLowerCase();
        const hasMatchingType = this.filters.unitTypes.some(type => 
          type.toLowerCase() === cardType
        );
        if (!hasMatchingType) return false;
      }

      // Rarity filter - improved with case-insensitive matching
      if (this.filters.rarity !== 'all') {
        const cardRarity = card.rarity?.toLowerCase();
        const selectedRarity = this.filters.rarity.toLowerCase();
        if (cardRarity !== selectedRarity) return false;
      }

      return true;
    });
  }

  saveDeck() {
    if (!this.deckName) {
      alert('Please enter a deck name');
      return;
    }

    if (this.currentDeck.length !== 30) {
      alert('Your deck must contain exactly 30 cards!');
      return;
    }

    const deck = {
      name: this.deckName,
      archetype: this.selectedArchetype.value,
      cards: this.currentDeck.map(c => c.id)
    };

    this.savedDecks = this.savedDecks.filter(d => d.name !== deck.name);
    this.savedDecks.push(deck);
    localStorage.setItem('curve_decks', JSON.stringify(this.savedDecks));
    this.render();
  }

  loadDeck(name) {
    const deck = this.savedDecks.find(d => d.name === name);
    if (deck) {
      this.deckName = deck.name;
      this.selectedArchetype = this.archetypes.find(a => a.value === deck.archetype);
      // Only use cards that exist in allCards (custom cards)
      const missingCards = [];
      this.currentDeck = deck.cards.map(id => {
        const card = this.allCards.find(c => c.id === id);
        if (!card) missingCards.push(id);
        return card;
      }).filter(Boolean);
      if (missingCards.length > 0) {
        alert(`Warning: The following card IDs are missing from your custom cards and will be skipped: ${missingCards.join(', ')}`);
      }
      this.showArchetypeSelection = false;
      this.render();
    }
  }

  deleteDeck(name) {
    this.savedDecks = this.savedDecks.filter(d => d.name !== name);
    localStorage.setItem('curve_decks', JSON.stringify(this.savedDecks));
    this.render();
  }

  loadCustomCards() {
    try {
      const cards = JSON.parse(localStorage.getItem('curve_custom_cards')) || [];
      // Ensure all cards have required properties and map type/cost/effect
      return cards.map(card => ({
        ...card,
        archetype: card.archetype || 'Neutral',
        unitType: card.unitType || card.type || 'Neutral',
        mana: card.mana ?? card.cost ?? 1,
        effectType: card.effectType || (card.effects && card.effects[0]?.type ? capitalizeFirst(card.effects[0].type) : 'None'),
        rarity: card.rarity || 'Common'
      }));
    } catch {
      return [];
    }
  }

  loadSavedDecks() {
    try {
      return JSON.parse(localStorage.getItem('curve_decks')) || [];
    } catch {
      return [];
    }
  }

  generatePlaceholderCards() {
    let cards = [];
    for (let i = 1; i <= 24; i++) {
      const isNeutral = i % 8 === 0; // Make every 8th card neutral
      const archetype = isNeutral ? 'Neutral' : ['nether', 'swamp', 'racetrack', 'elderwood'][i % 4];
      const unitType = ['Demon', 'Cultist', 'Beast', 'Insect', 'Racer', 'Lurker', 'Undead'][i % 7];
      
      cards.push({
        id: i,
        name: `Scout ${i}`,
        archetype: archetype,
        mana: (i % 8) + 1,
        attack: (i % 8) + 1,
        health: (i % 8) + 2,
        rarity: i % 5 === 0 ? 'Legendary' : 'Common',
        icon: '🃏',
        description: `${archetype} Scout ${i}`,
        unitType: unitType,
        effectType: ['Warshout', 'Deathblow', 'Taunt'][i % 3]
      });
    }
    return cards;
  }
}

export default DeckBuilder; 