class CustomCardBuilder {
    constructor(container, callbacks = {}) {
      // Ensure container exists
      if (!container) {
        throw new Error('Container element is required');
      }
      
      this.container = container;
      this.callbacks = callbacks || {}; // Ensure callbacks is an object
      
      // Initialize with existing card if provided, otherwise use defaults
      if (callbacks?.existingCard) { // Using optional chaining
        this.card = JSON.parse(JSON.stringify(callbacks.existingCard));
        this.isEditing = true;
      } else {
        // Default card values
        this.card = {
                id: Date.now().toString(), // Set now to ensure a unique ID
          archetype: 'Neutral',
          name: 'Custom Card',
          cost: 1,
          attack: 1,
          health: 1,
          rarity: 'common',
          type: 'cultist',
          description: 'A custom card.',
          yar: false,
          effects: []
        };
        this.isEditing = false;
      }
  
        // Initialize effect builders
        this.effects = [];
        if (this.card.effects && this.card.effects.length > 0) {
            this.effects = JSON.parse(JSON.stringify(this.card.effects));
        }
  
      // Initialize archetypes and other static data
      this.archetypes = [
        { name: 'Nether', value: 'Nether', color: '#a21caf', icon: '❄️' },
        { name: 'Swamp', value: 'Swamp', color: '#16a34a', icon: '🐸' },
        { name: 'Racetrack', value: 'Racetrack', color: '#f59e0b', icon: '🏁' },
        { name: 'Elderwood', value: 'Elderwood', color: '#22d3ee', icon: '🌲' },
        { name: 'Neutral', value: 'Neutral', color: '#64748b', icon: '⚔️' }
      ];
  
      this.unitTypes = [
        { name: 'Demon', value: 'demon', icon: '👹' },
        { name: 'Cultist', value: 'cultist', icon: '🧙' },
        { name: 'Beast', value: 'beast', icon: '🐗' },
        { name: 'Insect', value: 'insect', icon: '🐛' },
        { name: 'Undead', value: 'undead', icon: '💀' },
        { name: 'Racer', value: 'racer', icon: '🏎️' },
        { name: 'Lurker', value: 'lurker', icon: '👁️' }
      ];
  
      this.effectTypes = [
        { name: 'None', value: '' },
        { name: 'Taunt', value: 'taunt' },
        { name: 'Warshout', value: 'warshout' },
        { name: 'Deathblow', value: 'deathblow' },
        { name: 'DeathStrike', value: 'deathstrike' },
        { name: 'Strike', value: 'strike' }
      ];
  
      this.targetTypes = [
        { name: 'None', value: '' },
        { name: 'Ally', value: 'ally' },
        { name: 'Enemy', value: 'enemy' },
        { name: 'Any', value: 'any' }
      ];
  
      this.rarities = [
        { name: 'Common', value: 'common' },
        { name: 'Legendary', value: 'legendary' }
      ];
        
        // Effect action types
        this.actionTypes = [
            { name: 'Damage', value: 'damage' },
            { name: 'Heal', value: 'heal' },
            { name: 'Buff', value: 'buff' },
            { name: 'Draw Cards', value: 'draw' },
            { name: 'Summon', value: 'summon' }
      ];
  
      // Initialize the UI
      this.render();
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
      title.textContent = this.isEditing ? `Edit Card: ${this.card.name}` : 'Custom Card Builder';
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
  
      // Main content grid
      const content = document.createElement('div');
      content.style.display = 'grid';
      content.style.gridTemplateColumns = '1fr 350px 1fr';
      content.style.gridGap = '30px';
      content.style.flex = '1';
      content.style.overflow = 'auto';
  
      // Left column: Card attributes
      const leftColumn = document.createElement('div');
      leftColumn.style.gridColumn = '1';
      leftColumn.style.backgroundColor = '#1e293b';
      leftColumn.style.padding = '20px';
      leftColumn.style.borderRadius = '10px';
      leftColumn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      leftColumn.style.overflow = 'auto';
  
      // Right column: Effect builder
      const rightColumn = document.createElement('div');
      rightColumn.style.gridColumn = '3';
      rightColumn.style.backgroundColor = '#1e293b';
      rightColumn.style.padding = '20px';
      rightColumn.style.borderRadius = '10px';
      rightColumn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      rightColumn.style.overflow = 'auto';
  
      // Center column: Card preview
      const centerColumn = document.createElement('div');
      centerColumn.style.gridColumn = '2';
      centerColumn.style.display = 'flex';
      centerColumn.style.flexDirection = 'column';
      centerColumn.style.alignItems = 'center';
      centerColumn.style.justifyContent = 'flex-start';
      centerColumn.style.gap = '20px';
  
      // Build attribute controls on left column
      this.buildAttributeControls(leftColumn);
  
      // Build card preview in center column
      this.buildCardPreview(centerColumn);
  
      // Build effect builder on right column
      this.buildEffectBuilder(rightColumn);
  
      // Add save button to center
      const saveButton = document.createElement('button');
      saveButton.textContent = this.isEditing ? 'Update Card' : 'Save Card';
      saveButton.style.backgroundColor = this.isEditing ? '#8b5cf6' : '#16a34a';
      saveButton.style.color = 'white';
      saveButton.style.padding = '10px 20px';
      saveButton.style.border = 'none';
      saveButton.style.borderRadius = '5px';
      saveButton.style.fontWeight = 'bold';
      saveButton.style.fontSize = '1rem';
      saveButton.style.cursor = 'pointer';
      saveButton.style.width = '100%';
      saveButton.style.marginTop = '15px';
      saveButton.style.transition = 'background-color 0.2s, transform 0.1s';
  
      saveButton.addEventListener('mouseenter', () => {
        saveButton.style.backgroundColor = this.isEditing ? '#7c3aed' : '#15803d';
        saveButton.style.transform = 'translateY(-2px)';
      });
  
      saveButton.addEventListener('mouseleave', () => {
        saveButton.style.backgroundColor = this.isEditing ? '#8b5cf6' : '#16a34a';
        saveButton.style.transform = 'translateY(0)';
      });
  
      saveButton.addEventListener('click', () => {
        this.saveCard();
      });
  
      centerColumn.appendChild(saveButton);
  
      // Add columns to content
      content.appendChild(leftColumn);
      content.appendChild(centerColumn);
      content.appendChild(rightColumn);
  
      wrapper.appendChild(content);
      this.container.appendChild(wrapper);
    }
  
    buildAttributeControls(container) {
      // Title and tutorial button container
      const titleContainer = document.createElement('div');
      titleContainer.style.display = 'flex';
      titleContainer.style.justifyContent = 'space-between';
      titleContainer.style.alignItems = 'center';
      titleContainer.style.marginBottom = '20px';

      const attributesTitle = document.createElement('h3');
      attributesTitle.textContent = 'Card Attributes';
      attributesTitle.style.fontSize = '1.2rem';
      attributesTitle.style.marginTop = '0';
      attributesTitle.style.marginBottom = '0';
      attributesTitle.style.color = '#94a3b8';
      attributesTitle.style.borderBottom = '1px solid #334155';
      attributesTitle.style.paddingBottom = '10px';

      // Tutorial/help button
      const helpButton = document.createElement('button');
      helpButton.textContent = '❓ Tutorial';
      helpButton.style.backgroundColor = '#f59e0b';
      helpButton.style.color = 'white';
      helpButton.style.border = 'none';
      helpButton.style.borderRadius = '4px';
      helpButton.style.padding = '5px 10px';
      helpButton.style.fontSize = '0.9rem';
      helpButton.style.cursor = 'pointer';
      helpButton.style.transition = 'all 0.2s';
      helpButton.addEventListener('mouseenter', () => {
        helpButton.style.backgroundColor = '#d97706';
        helpButton.style.transform = 'translateY(-2px)';
      });
      helpButton.addEventListener('mouseleave', () => {
        helpButton.style.backgroundColor = '#f59e0b';
        helpButton.style.transform = 'translateY(0)';
      });
      helpButton.addEventListener('click', () => {
        this.showTutorial();
      });

      titleContainer.appendChild(attributesTitle);
      titleContainer.appendChild(helpButton);
      container.appendChild(titleContainer);
  
      // Build form
      const form = document.createElement('div');
      form.style.display = 'grid';
      form.style.gridGap = '15px';
  
      // Create archetype selector
      const archetypeGroup = this.createFormGroup('Archetype', 'select', this.archetypes, 'value');
      archetypeGroup.input.value = this.card.archetype;
      archetypeGroup.input.addEventListener('change', (e) => {
        this.card.archetype = e.target.value;
        this.updateCardPreview();
      });
      form.appendChild(archetypeGroup.container);
  
      // Create name input
      const nameGroup = this.createFormGroup('Name', 'text');
      nameGroup.input.value = this.card.name;
      nameGroup.input.addEventListener('input', (e) => {
        this.card.name = e.target.value;
        this.updateCardPreview();
      });
      form.appendChild(nameGroup.container);
  
      // Create cost input
      const costGroup = this.createFormGroup('Cost', 'number');
      costGroup.input.value = this.card.cost;
      costGroup.input.min = '0';
      costGroup.input.max = '10';
      costGroup.input.addEventListener('input', (e) => {
        this.card.cost = parseInt(e.target.value, 10) || 0;
        this.updateCardPreview();
      });
      form.appendChild(costGroup.container);
  
      // Create attack input
      const attackGroup = this.createFormGroup('Attack', 'number');
      attackGroup.input.value = this.card.attack;
      attackGroup.input.min = '0';
      attackGroup.input.max = '10';
      attackGroup.input.addEventListener('input', (e) => {
        this.card.attack = parseInt(e.target.value, 10) || 0;
        this.updateCardPreview();
      });
      form.appendChild(attackGroup.container);
  
      // Create health input
      const healthGroup = this.createFormGroup('Health', 'number');
      healthGroup.input.value = this.card.health;
      healthGroup.input.min = '0';
      healthGroup.input.max = '10';
      healthGroup.input.addEventListener('input', (e) => {
        this.card.health = parseInt(e.target.value, 10) || 0;
        this.updateCardPreview();
      });
      form.appendChild(healthGroup.container);
  
      // Create rarity selector
      const rarityGroup = this.createFormGroup('Rarity', 'select', this.rarities, 'value');
      rarityGroup.input.value = this.card.rarity;
      rarityGroup.input.addEventListener('change', (e) => {
        this.card.rarity = e.target.value;
        this.updateCardPreview();
      });
      form.appendChild(rarityGroup.container);
  
      // Create unit type selector
      const typeGroup = this.createFormGroup('Unit Type', 'select', this.unitTypes, 'value');
      typeGroup.input.value = this.card.type;
      typeGroup.input.addEventListener('change', (e) => {
        this.card.type = e.target.value;
        // Also update the icon based on the unit type
        const typeData = this.unitTypes.find(t => t.value === e.target.value);
        if (typeData) {
          this.card.icon = typeData.icon;
        }
        this.updateCardPreview();
      });
      form.appendChild(typeGroup.container);
  
      // Create description input
      const descriptionGroup = this.createFormGroup('Description', 'textarea');
      descriptionGroup.input.value = this.card.description;
        descriptionGroup.input.rows = 4;
      descriptionGroup.input.addEventListener('input', (e) => {
        this.card.description = e.target.value;
            
            // Auto-parse the description to update effects
            const parsedEffects = parseFullDescription(e.target.value);
            if (parsedEffects && parsedEffects.length > 0) {
                // Only update if we found valid effects
                this.effects = parsedEffects;
                this.updateEffectsList();
            }
            
        this.updateCardPreview();
      });
      form.appendChild(descriptionGroup.container);
  
      // Add help text for description syntax
      const descriptionHelp = document.createElement('div');
        descriptionHelp.textContent = 'Examples: "Taunt. Warshout: deal 2 damage to an enemy unit", "Deathblow: draw 2 cards"';
      descriptionHelp.style.color = '#94a3b8';
      descriptionHelp.style.fontSize = '0.9rem';
      descriptionGroup.container.appendChild(descriptionHelp);
  
      container.appendChild(form);
    }
  
    buildEffectBuilder(container) {
        // Title section with improved styling
        const effectsHeaderContainer = document.createElement('div');
        effectsHeaderContainer.style.display = 'flex';
        effectsHeaderContainer.style.justifyContent = 'space-between';
        effectsHeaderContainer.style.alignItems = 'center';
        effectsHeaderContainer.style.marginBottom = '20px';
        
      const effectsTitle = document.createElement('h3');
      effectsTitle.textContent = 'Effect Builder';
      effectsTitle.style.fontSize = '1.2rem';
      effectsTitle.style.marginTop = '0';
        effectsTitle.style.marginBottom = '0';
      effectsTitle.style.color = '#94a3b8';
      effectsTitle.style.borderBottom = '1px solid #334155';
      effectsTitle.style.paddingBottom = '10px';
        
        effectsHeaderContainer.appendChild(effectsTitle);
        container.appendChild(effectsHeaderContainer);
        
        // Help text explaining multiple effects
        const helpText = document.createElement('div');
        helpText.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
        helpText.style.padding = '10px 15px';
        helpText.style.borderRadius = '8px';
        helpText.style.marginBottom = '20px';
        helpText.style.fontSize = '0.9rem';
        helpText.style.color = '#94a3b8';
        helpText.innerHTML = 'You can add up to 2 different effects to your card. Effects can also be generated automatically by typing in the description field with the correct syntax.';
        container.appendChild(helpText);
        
        // Create a container for individual effect builders
        const effectBuildersContainer = document.createElement('div');
        effectBuildersContainer.style.display = 'flex';
        effectBuildersContainer.style.flexDirection = 'column';
        effectBuildersContainer.style.gap = '25px';
        effectBuildersContainer.style.marginBottom = '25px';
        
        // First effect builder
        const firstEffectBuilder = document.createElement('div');
        firstEffectBuilder.style.backgroundColor = 'rgba(15, 23, 42, 0.3)';
        firstEffectBuilder.style.padding = '15px';
        firstEffectBuilder.style.borderRadius = '8px';
        firstEffectBuilder.style.borderLeft = '3px solid #3b82f6';
        
        const firstEffectTitle = document.createElement('h4');
        firstEffectTitle.textContent = 'Effect 1';
        firstEffectTitle.style.margin = '0 0 15px 0';
        firstEffectTitle.style.color = '#3b82f6';
        firstEffectTitle.style.fontSize = '1rem';
        firstEffectBuilder.appendChild(firstEffectTitle);
        
        // Effect type selector for first effect
        const effectType1Group = this.createFormGroup('Effect Type', 'select', this.effectTypes, 'value');
        effectType1Group.container.style.marginBottom = '15px';
        
        // Set value if an effect exists
        if (this.effects[0]) {
            effectType1Group.input.value = this.effects[0].type || '';
        }
        
        effectType1Group.input.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            
            // Initialize or update the first effect
            if (!this.effects[0]) {
                this.effects[0] = { type: selectedType };
            } else {
                this.effects[0].type = selectedType;
            }
            
            // Display appropriate effect options based on type
            this.renderEffectOptions(firstEffectBuilder, 0, selectedType);
            this.updateEffectsList();
            this.updateCardDescription();
        });
        
        firstEffectBuilder.appendChild(effectType1Group.container);
        
        // Render effect options if an effect already exists
        if (this.effects[0] && this.effects[0].type) {
            this.renderEffectOptions(firstEffectBuilder, 0, this.effects[0].type);
        }
        
        effectBuildersContainer.appendChild(firstEffectBuilder);
        
        // Second effect builder
        const secondEffectBuilder = document.createElement('div');
        secondEffectBuilder.style.backgroundColor = 'rgba(15, 23, 42, 0.3)';
        secondEffectBuilder.style.padding = '15px';
        secondEffectBuilder.style.borderRadius = '8px';
        secondEffectBuilder.style.borderLeft = '3px solid #8b5cf6';
        
        const secondEffectTitle = document.createElement('h4');
        secondEffectTitle.textContent = 'Effect 2';
        secondEffectTitle.style.margin = '0 0 15px 0';
        secondEffectTitle.style.color = '#8b5cf6';
        secondEffectTitle.style.fontSize = '1rem';
        secondEffectBuilder.appendChild(secondEffectTitle);
        
        // Effect type selector for second effect
        const effectType2Group = this.createFormGroup('Effect Type', 'select', this.effectTypes, 'value');
        effectType2Group.container.style.marginBottom = '15px';
        
        // Set value if a second effect exists
        if (this.effects[1]) {
            effectType2Group.input.value = this.effects[1].type || '';
        }
        
        effectType2Group.input.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            
            // Initialize or update the second effect
            if (!this.effects[1]) {
                this.effects[1] = { type: selectedType };
            } else {
                this.effects[1].type = selectedType;
            }
            
            // Display appropriate effect options based on type
            this.renderEffectOptions(secondEffectBuilder, 1, selectedType);
            this.updateEffectsList();
            this.updateCardDescription();
        });
        
        secondEffectBuilder.appendChild(effectType2Group.container);
        
        // Render effect options if a second effect already exists
        if (this.effects[1] && this.effects[1].type) {
            this.renderEffectOptions(secondEffectBuilder, 1, this.effects[1].type);
        }
        
        effectBuildersContainer.appendChild(secondEffectBuilder);
        container.appendChild(effectBuildersContainer);
        
        // Current effects list
      const effectsListTitle = document.createElement('h4');
      effectsListTitle.textContent = 'Current Effects';
      effectsListTitle.style.fontSize = '1rem';
      effectsListTitle.style.margin = '20px 0 10px 0';
      effectsListTitle.style.color = '#94a3b8';
      container.appendChild(effectsListTitle);
  
        // Create effects list container
      this.effectsList = document.createElement('div');
      this.updateEffectsList();
      container.appendChild(this.effectsList);
    }

    // Render specific options for an effect type
    renderEffectOptions(container, effectIndex, effectType) {
        // Clear existing options (except the type selector)
        const typeSelector = container.querySelector('select');
        while (container.children.length > 2) { // Keep title and type selector
            container.removeChild(container.lastChild);
        }
        
        // Initialize effect if it doesn't exist
        if (!this.effects[effectIndex]) {
            this.effects[effectIndex] = { type: effectType };
        }
        
        // Set the type
        this.effects[effectIndex].type = effectType;
        
        // Handle different effect types
        switch (effectType) {
            case 'taunt':
                // Taunt effect doesn't need additional parameters
                const tauntDesc = document.createElement('div');
                tauntDesc.style.padding = '10px';
                tauntDesc.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                tauntDesc.style.borderRadius = '5px';
                tauntDesc.style.marginBottom = '15px';
                tauntDesc.style.color = '#94a3b8';
                tauntDesc.textContent = 'Enemies must attack this unit first.';
                container.appendChild(tauntDesc);
                break;
                
            case 'warshout':
                // Add warshout-specific options
                this.renderWarshoutOptions(container, effectIndex);
                break;
                
            case 'deathblow':
                // Add deathblow-specific options
                this.renderDeathblowOptions(container, effectIndex);
                break;

            case 'deathstrike':
                // Add deathstrike-specific options
                this.renderDeathStrikeOptions(container, effectIndex);
                break;

            case 'strike':
                // Add strike-specific options
                this.renderStrikeOptions(container, effectIndex);
                break;
                
            default:
                // No effect selected
                const noEffectDesc = document.createElement('div');
                noEffectDesc.style.padding = '10px';
                noEffectDesc.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                noEffectDesc.style.borderRadius = '5px';
                noEffectDesc.style.marginBottom = '15px';
                noEffectDesc.style.color = '#94a3b8';
                noEffectDesc.textContent = 'Select an effect type above.';
                container.appendChild(noEffectDesc);
                break;
        }
    }

    // Render options for warshout effects
    renderWarshoutOptions(container, effectIndex) {
        // Clear existing options (except the type selector)
        const typeSelector = container.querySelector('select');
        while (container.children.length > 2) { // Keep title and type selector
            container.removeChild(container.lastChild);
        }
        // Initialize the effect if needed
        const effect = this.effects[effectIndex];
        if (!effect.action) {
            effect.action = 'damage';
            effect.requiresTargeting = true;
            effect.targetType = 'enemy';
            effect.value = 1;
        }

        // Create a container for all form elements
        const formContainer = document.createElement('div');
        formContainer.style.display = 'flex';
        formContainer.style.flexDirection = 'column';
        formContainer.style.gap = '15px';
        container.appendChild(formContainer);

        // 1. Action type selector
        const actionGroup = this.createFormGroup('Action', 'select', this.actionTypes);
        actionGroup.input.value = effect.action || 'damage';
        formContainer.appendChild(actionGroup.container);

        // 2. Target options container
        const targetOptionsContainer = document.createElement('div');
        targetOptionsContainer.style.display = 'flex';
        targetOptionsContainer.style.flexDirection = 'column';
        targetOptionsContainer.style.gap = '15px';

        // Requires Target checkbox
        const requiresTargetGroup = this.createFormGroup('Requires Target', 'checkbox');
        requiresTargetGroup.input.checked = effect.requiresTargeting !== false;
        targetOptionsContainer.appendChild(requiresTargetGroup.container);

        // Single target options container
        const singleTargetContainer = document.createElement('div');
        singleTargetContainer.style.display = effect.requiresTargeting ? 'flex' : 'none';
        singleTargetContainer.style.flexDirection = 'column';
        singleTargetContainer.style.gap = '15px';

        // Target type for single target
        const targetTypeGroup = this.createFormGroup('Target Type', 'select', this.targetTypes);
        targetTypeGroup.input.value = effect.targetType || 'enemy';
        singleTargetContainer.appendChild(targetTypeGroup.container);

        // Area target options container
        const areaTargetContainer = document.createElement('div');
        areaTargetContainer.style.display = !effect.requiresTargeting ? 'flex' : 'none';
        areaTargetContainer.style.flexDirection = 'column';
        areaTargetContainer.style.gap = '15px';

        // Area target selector
        const areaTargetGroup = this.createFormGroup('Area Target', 'select', [
            { name: 'None', value: '' },
            { name: 'All Units', value: 'all' }
        ]);
        areaTargetGroup.input.value = effect.area || '';
        areaTargetContainer.appendChild(areaTargetGroup.container);

        // Target type for area target
        const areaTargetTypeGroup = this.createFormGroup('Target Type', 'select', this.targetTypes);
        areaTargetTypeGroup.input.value = effect.targetType || 'enemy';
        areaTargetContainer.appendChild(areaTargetTypeGroup.container);

        // Add containers to target options
        targetOptionsContainer.appendChild(singleTargetContainer);
        targetOptionsContainer.appendChild(areaTargetContainer);
        formContainer.appendChild(targetOptionsContainer);

        // 3. Value field container
        const valueContainer = document.createElement('div');
        valueContainer.style.display = 'flex';
        valueContainer.style.flexDirection = 'column';
        valueContainer.style.gap = '15px';

        // Create value fields based on action type
        switch (effect.action) {
            case 'damage':
                const damageGroup = this.createFormGroup('Damage Amount', 'number');
                damageGroup.input.value = effect.value || 1;
                damageGroup.input.min = '1';
                damageGroup.input.max = '10';
                valueContainer.appendChild(damageGroup.container);
                break;

            case 'heal':
                const healGroup = this.createFormGroup('Heal Amount', 'number');
                healGroup.input.value = effect.value || 1;
                healGroup.input.min = '1';
                healGroup.input.max = '10';
                valueContainer.appendChild(healGroup.container);
                break;

            case 'buff':
                const buffAttackGroup = this.createFormGroup('Attack Bonus', 'number');
                if (!effect.value || typeof effect.value !== 'object') {
                    effect.value = { attack: 1, health: 1 };
                }
                buffAttackGroup.input.value = effect.value.attack || 0;
                buffAttackGroup.input.min = '0';
                buffAttackGroup.input.max = '5';
                valueContainer.appendChild(buffAttackGroup.container);

                const buffHealthGroup = this.createFormGroup('Health Bonus', 'number');
                buffHealthGroup.input.value = effect.value.health || 0;
                buffHealthGroup.input.min = '0';
                buffHealthGroup.input.max = '5';
                valueContainer.appendChild(buffHealthGroup.container);
                break;

            case 'draw':
                const drawGroup = this.createFormGroup('Cards to Draw', 'number');
                drawGroup.input.value = effect.value || 1;
                drawGroup.input.min = '1';
                drawGroup.input.max = '5';
                valueContainer.appendChild(drawGroup.container);
                break;

            case 'summon':
                const summonNameGroup = this.createFormGroup('Summoned Unit Name', 'text');
                if (!effect.value || typeof effect.value !== 'object') {
                    effect.value = { name: 'Token', attack: 1, health: 1, type: 'cultist' };
                }
                summonNameGroup.input.value = effect.value.name || 'Token';
                valueContainer.appendChild(summonNameGroup.container);

                const summonAttackGroup = this.createFormGroup('Summoned Attack', 'number');
                summonAttackGroup.input.value = effect.value.attack || 1;
                summonAttackGroup.input.min = '1';
                summonAttackGroup.input.max = '5';
                valueContainer.appendChild(summonAttackGroup.container);

                const summonHealthGroup = this.createFormGroup('Summoned Health', 'number');
                summonHealthGroup.input.value = effect.value.health || 1;
                summonHealthGroup.input.min = '1';
                summonHealthGroup.input.max = '5';
                valueContainer.appendChild(summonHealthGroup.container);

                const summonTypeGroup = this.createFormGroup('Summoned Type', 'select', this.unitTypes, 'value');
                summonTypeGroup.input.value = effect.value.type || 'cultist';
                valueContainer.appendChild(summonTypeGroup.container);
                break;
        }

        formContainer.appendChild(valueContainer);

        // 4. YAR checkbox
        const yarGroup = this.createFormGroup('YAR (Your Area Ruling)', 'checkbox');
        yarGroup.input.checked = effect.yar === true;
        formContainer.appendChild(yarGroup.container);

        // Add YAR description if checked
        if (effect.yar) {
            const yarDesc = document.createElement('div');
            yarDesc.style.padding = '10px';
            yarDesc.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            yarDesc.style.borderRadius = '5px';
            yarDesc.style.color = '#fbbf24';
            yarDesc.style.fontSize = '0.9rem';
            yarDesc.textContent = 'YAR: Effects only work within 2 rows of your spawn row';
            formContainer.appendChild(yarDesc);
        }

        // Add event listeners
        requiresTargetGroup.input.addEventListener('change', (e) => {
            effect.requiresTargeting = e.target.checked;
            singleTargetContainer.style.display = e.target.checked ? 'flex' : 'none';
            areaTargetContainer.style.display = !e.target.checked ? 'flex' : 'none';
            this.updateEffectsList();
            this.updateCardDescription();
        });

        actionGroup.input.addEventListener('change', (e) => {
            effect.action = e.target.value;
            // Re-render value fields for the new action type
            this.renderWarshoutOptions(container, effectIndex);
            this.updateEffectsList();
            this.updateCardDescription();
        });

        // Add event listeners for all value inputs
        const valueInputs = valueContainer.querySelectorAll('input, select');
        valueInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateEffectsList();
                this.updateCardDescription();
            });
        });

        // Add event listener for YAR checkbox
        yarGroup.input.addEventListener('change', (e) => {
            effect.yar = e.target.checked;
            if (e.target.checked) {
                const yarDesc = document.createElement('div');
                yarDesc.style.padding = '10px';
                yarDesc.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                yarDesc.style.borderRadius = '5px';
                yarDesc.style.color = '#fbbf24';
                yarDesc.style.fontSize = '0.9rem';
                yarDesc.textContent = 'YAR: Effects only work within 2 rows of your spawn row';
                formContainer.appendChild(yarDesc);
            } else {
                const yarDesc = formContainer.querySelector('div:last-child');
                if (yarDesc && yarDesc.textContent.includes('YAR:')) {
                    formContainer.removeChild(yarDesc);
                }
            }
            this.updateEffectsList();
            this.updateCardDescription();
        });
    }

    // Render options for deathblow effects
    renderDeathblowOptions(container, effectIndex) {
        // Clear existing options (except the type selector)
        const typeSelector = container.querySelector('select');
        while (container.children.length > 2) { // Keep title and type selector
            container.removeChild(container.lastChild);
        }
        // Initialize the effect if needed
        const effect = this.effects[effectIndex];
        if (!effect.action) {
            effect.action = 'draw';
            effect.value = 1;
        }
        
        // 1. Action type selector with limited options for Deathblow
        const actionGroup = this.createFormGroup('Action', 'select', [
            { name: 'Draw Cards', value: 'draw' },
            { name: 'Damage', value: 'damage' },
            { name: 'Summon', value: 'summon' }
        ]);
        actionGroup.input.value = effect.action || 'draw';
        actionGroup.container.style.marginBottom = '15px';
        actionGroup.input.addEventListener('change', (e) => {
            effect.action = e.target.value;
            
            // Re-render to update options for this action type
            this.renderDeathblowOptions(container, effectIndex);
            this.updateEffectsList();
            this.updateCardDescription();
        });
        container.appendChild(actionGroup.container);
        
        // 2. Value field depends on action type
        switch (effect.action) {
            case 'damage':
                // For damage, add target options and damage amount
                const targetTypeGroup = this.createFormGroup('Target Type', 'select', this.targetTypes);
                targetTypeGroup.input.value = effect.targetType || 'enemy';
                targetTypeGroup.container.style.marginBottom = '15px';
                targetTypeGroup.input.addEventListener('change', (e) => {
                    effect.targetType = e.target.value;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(targetTypeGroup.container);
                
                // Add area options
                const areaGroup = this.createFormGroup('Area', 'select', [
                    { name: 'Single Target', value: '' },
                    { name: 'All Units', value: 'all' }
                ]);
                areaGroup.input.value = effect.area || '';
                areaGroup.container.style.marginBottom = '15px';
                areaGroup.input.addEventListener('change', (e) => {
                    effect.area = e.target.value;
                    effect.requiresTargeting = !e.target.value; // If area is set, doesn't require targeting
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(areaGroup.container);
                
                const damageGroup = this.createFormGroup('Damage Amount', 'number');
                damageGroup.input.value = effect.value || 1;
                damageGroup.input.min = '1';
                damageGroup.input.max = '10';
                damageGroup.container.style.marginBottom = '15px';
                damageGroup.input.addEventListener('input', (e) => {
                    effect.value = parseInt(e.target.value, 10) || 1;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(damageGroup.container);
                break;
                
            case 'draw':
                const drawGroup = this.createFormGroup('Cards to Draw', 'number');
                drawGroup.input.value = effect.value || 1;
                drawGroup.input.min = '1';
                drawGroup.input.max = '5';
                drawGroup.container.style.marginBottom = '15px';
                drawGroup.input.addEventListener('input', (e) => {
                    effect.value = parseInt(e.target.value, 10) || 1;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(drawGroup.container);
                break;
                
            case 'summon':
                // For summon, we need a summoned unit name, attack, and health
                const summonNameGroup = this.createFormGroup('Summoned Unit Name', 'text');
                if (!effect.value || typeof effect.value !== 'object') {
                    effect.value = { name: 'Token', attack: 1, health: 1, type: 'cultist' };
                }
                summonNameGroup.input.value = effect.value.name || 'Token';
                summonNameGroup.container.style.marginBottom = '15px';
                summonNameGroup.input.addEventListener('input', (e) => {
                    if (!effect.value || typeof effect.value !== 'object') {
                        effect.value = {};
                    }
                    effect.value.name = e.target.value || 'Token';
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(summonNameGroup.container);
                
                const summonAttackGroup = this.createFormGroup('Summoned Attack', 'number');
                summonAttackGroup.input.value = effect.value.attack || 1;
                summonAttackGroup.input.min = '1';
                summonAttackGroup.input.max = '5';
                summonAttackGroup.container.style.marginBottom = '15px';
                summonAttackGroup.input.addEventListener('input', (e) => {
                    if (!effect.value || typeof effect.value !== 'object') {
                        effect.value = {};
                    }
                    effect.value.attack = parseInt(e.target.value, 10) || 1;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(summonAttackGroup.container);
                
                const summonHealthGroup = this.createFormGroup('Summoned Health', 'number');
                summonHealthGroup.input.value = effect.value.health || 1;
                summonHealthGroup.input.min = '1';
                summonHealthGroup.input.max = '5';
                summonHealthGroup.container.style.marginBottom = '15px';
                summonHealthGroup.input.addEventListener('input', (e) => {
                    if (!effect.value || typeof effect.value !== 'object') {
                        effect.value = {};
                    }
                    effect.value.health = parseInt(e.target.value, 10) || 1;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(summonHealthGroup.container);
                
                const summonTypeGroup = this.createFormGroup('Summoned Type', 'select', this.unitTypes, 'value');
                summonTypeGroup.input.value = effect.value.type || 'cultist';
                summonTypeGroup.container.style.marginBottom = '15px';
                summonTypeGroup.input.addEventListener('change', (e) => {
                    if (!effect.value || typeof effect.value !== 'object') {
                        effect.value = {};
                    }
                    effect.value.type = e.target.value;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                container.appendChild(summonTypeGroup.container);
                break;
        }
    }

    // Render options for deathstrike effects
    renderDeathStrikeOptions(container, effectIndex) {
        // Clear existing options (except the type selector)
        const typeSelector = container.querySelector('select');
        while (container.children.length > 2) { // Keep title and type selector
            container.removeChild(container.lastChild);
        }
        // Initialize the effect if needed
        const effect = this.effects[effectIndex];
        if (!effect.action) {
            effect.action = 'draw';
            effect.value = 1;
        }
        
        // Create a container for all form elements
        const formContainer = document.createElement('div');
        formContainer.style.display = 'flex';
        formContainer.style.flexDirection = 'column';
        formContainer.style.gap = '15px';
        container.appendChild(formContainer);

        // Add description
        const desc = document.createElement('div');
        desc.style.padding = '10px';
        desc.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
        desc.style.borderRadius = '5px';
        desc.style.marginBottom = '15px';
        desc.style.color = '#94a3b8';
        desc.textContent = 'Triggers when this unit kills an enemy unit in battle.';
        formContainer.appendChild(desc);

        // Action type selector
        const actionGroup = this.createFormGroup('Action', 'select', [
            { name: 'Draw Cards', value: 'draw' },
            { name: 'Damage', value: 'damage' },
            { name: 'Buff', value: 'buff' }
        ]);
        actionGroup.input.value = effect.action || 'draw';
        formContainer.appendChild(actionGroup.container);

        // Target type selector for damage and buff actions
        if (effect.action === 'damage' || effect.action === 'buff') {
            const targetTypeGroup = this.createFormGroup('Target Type', 'select', [
                { name: 'Self', value: 'self' },
                { name: 'Ally', value: 'ally' },
                { name: 'Enemy', value: 'enemy' },
                { name: 'Any', value: 'any' }
            ]);
            targetTypeGroup.input.value = effect.targetType || 'self';
            targetTypeGroup.input.addEventListener('change', (e) => {
                effect.targetType = e.target.value;
                this.updateEffectsList();
                this.updateCardDescription();
            });
            formContainer.appendChild(targetTypeGroup.container);
        }

        // Value field depends on action type
        switch (effect.action) {
            case 'damage':
                const damageGroup = this.createFormGroup('Damage Amount', 'number');
                damageGroup.input.value = effect.value || 1;
                damageGroup.input.min = '1';
                damageGroup.input.max = '10';
                damageGroup.input.addEventListener('input', (e) => {
                    effect.value = parseInt(e.target.value, 10) || 1;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                formContainer.appendChild(damageGroup.container);
                break;

            case 'draw':
                const drawGroup = this.createFormGroup('Cards to Draw', 'number');
                drawGroup.input.value = effect.value || 1;
                drawGroup.input.min = '1';
                drawGroup.input.max = '5';
                drawGroup.input.addEventListener('input', (e) => {
                    effect.value = parseInt(e.target.value, 10) || 1;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                formContainer.appendChild(drawGroup.container);
                break;

            case 'buff':
                const buffAttackGroup = this.createFormGroup('Attack Bonus', 'number');
                if (!effect.value || typeof effect.value !== 'object') {
                    effect.value = { attack: 1, health: 0 };
                }
                buffAttackGroup.input.value = effect.value.attack || 0;
                buffAttackGroup.input.min = '0';
                buffAttackGroup.input.max = '5';
                buffAttackGroup.input.addEventListener('input', (e) => {
                    if (!effect.value || typeof effect.value !== 'object') {
                        effect.value = {};
                    }
                    effect.value.attack = parseInt(e.target.value, 10) || 0;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                formContainer.appendChild(buffAttackGroup.container);

                const buffHealthGroup = this.createFormGroup('Health Bonus', 'number');
                buffHealthGroup.input.value = effect.value.health || 0;
                buffHealthGroup.input.min = '0';
                buffHealthGroup.input.max = '5';
                buffHealthGroup.input.addEventListener('input', (e) => {
                    if (!effect.value || typeof effect.value !== 'object') {
                        effect.value = {};
                    }
                    effect.value.health = parseInt(e.target.value, 10) || 0;
                    this.updateEffectsList();
                    this.updateCardDescription();
                });
                formContainer.appendChild(buffHealthGroup.container);
                break;
        }

        // Add event listeners
        actionGroup.input.addEventListener('change', (e) => {
            effect.action = e.target.value;
            // Reset value based on new action type
            if (e.target.value === 'draw') {
                effect.value = 1;
            } else if (e.target.value === 'damage') {
                effect.value = 1;
                effect.targetType = 'self';
            } else if (e.target.value === 'buff') {
                effect.value = { attack: 1, health: 0 };
                effect.targetType = 'self';
            }
            this.renderDeathStrikeOptions(container, effectIndex);
            this.updateEffectsList();
            this.updateCardDescription();
        });

        // Add event listeners for all value inputs
        const valueInputs = formContainer.querySelectorAll('input');
        valueInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateEffectsList();
                this.updateCardDescription();
            });
        });
    }

    // Render options for strike effects
    renderStrikeOptions(container, effectIndex) {
        // Clear existing options (except the type selector)
        const typeSelector = container.querySelector('select');
        while (container.children.length > 2) { // Keep title and type selector
            container.removeChild(container.lastChild);
        }
        // Initialize the effect if needed
        const effect = this.effects[effectIndex];
        if (!effect.action) {
            effect.action = 'damage';
            effect.value = 1;
            effect.followup = { action: 'buff', value: { attack: 2, health: 0 }, duration: 1 };
        }
        
        // Create a container for all form elements
        const formContainer = document.createElement('div');
        formContainer.style.display = 'flex';
        formContainer.style.flexDirection = 'column';
        formContainer.style.gap = '15px';
        container.appendChild(formContainer);

        // Add description
        const desc = document.createElement('div');
        desc.style.padding = '10px';
        desc.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
        desc.style.borderRadius = '5px';
        desc.style.marginBottom = '15px';
        desc.style.color = '#94a3b8';
        desc.textContent = 'Triggers when this unit is selected to attack, before landing the attack.';
        formContainer.appendChild(desc);

        // Initial effect
        const initialEffectGroup = this.createFormGroup('Initial Effect', 'select', [
            { name: 'Damage Self', value: 'damage' },
            { name: 'Heal Self', value: 'heal' },
            { name: 'None', value: 'none' }
        ]);
        initialEffectGroup.input.value = effect.action || 'damage';
        formContainer.appendChild(initialEffectGroup.container);

        // Value for initial effect
        if (effect.action !== 'none') {
            const valueGroup = this.createFormGroup('Effect Value', 'number');
            valueGroup.input.value = effect.value || 1;
            valueGroup.input.min = '1';
            valueGroup.input.max = '5';
            valueGroup.input.addEventListener('input', (e) => {
                effect.value = parseInt(e.target.value, 10) || 1;
                this.updateEffectsList();
                this.updateCardDescription();
            });
            formContainer.appendChild(valueGroup.container);
        }

        // Followup effect
        const followupGroup = this.createFormGroup('Followup Effect', 'select', [
            { name: 'None', value: 'none' },
            { name: 'Buff Attack', value: 'buff' }
        ]);
        followupGroup.input.value = effect.followup?.action || 'none';
        followupGroup.input.addEventListener('change', (e) => {
            if (!effect.followup) {
                effect.followup = {};
            }
            effect.followup.action = e.target.value;
            if (e.target.value === 'buff') {
                if (!effect.followup.value) effect.followup.value = { attack: 2, health: 0 };
                effect.followup.duration = 1; // Default to temporary
            } else {
                delete effect.followup.value;
                delete effect.followup.duration;
            }
            this.renderStrikeOptions(container, effectIndex);
            this.updateEffectsList();
            this.updateCardDescription();
        });
        formContainer.appendChild(followupGroup.container);

        // Followup value if buff
        if (effect.followup?.action === 'buff') {
            const buffGroup = this.createFormGroup('Attack Bonus', 'number');
            buffGroup.input.value = effect.followup.value?.attack || 2;
            buffGroup.input.min = '1';
            buffGroup.input.max = '5';
            buffGroup.input.addEventListener('input', (e) => {
                if (!effect.followup.value) effect.followup.value = {};
                effect.followup.value.attack = parseInt(e.target.value, 10) || 2;
                this.updateEffectsList();
                this.updateCardDescription();
            });
            formContainer.appendChild(buffGroup.container);

            // Add duration options for followup buff
            const durationGroup = this.createFormGroup('Buff Duration', 'select', [
                { name: 'Until End of Turn', value: '1' },
                { name: 'Until Unit Dies', value: 'permanent' }
            ]);
            durationGroup.input.value = effect.followup.duration === 'permanent' ? 'permanent' : '1';
            durationGroup.input.addEventListener('change', (e) => {
                effect.followup.duration = e.target.value;
                this.updateEffectsList();
                this.updateCardDescription();
            });
            formContainer.appendChild(durationGroup.container);
        }

        // Add event listeners
        initialEffectGroup.input.addEventListener('change', (e) => {
            effect.action = e.target.value;
            this.renderStrikeOptions(container, effectIndex);
            this.updateEffectsList();
            this.updateCardDescription();
        });

        followupGroup.input.addEventListener('change', (e) => {
            if (!effect.followup) {
                effect.followup = {};
            }
            effect.followup.action = e.target.value;
            this.renderStrikeOptions(container, effectIndex);
            this.updateEffectsList();
            this.updateCardDescription();
        });

        // Add event listeners for all value inputs
        const valueInputs = formContainer.querySelectorAll('input');
        valueInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateEffectsList();
                this.updateCardDescription();
            });
        });
    }
  
    buildCardPreview(container) {
      // Card container
      const cardPreview = document.createElement('div');
        cardPreview.style.width = '300px';
        cardPreview.style.height = '420px';
      cardPreview.style.borderRadius = '15px';
      cardPreview.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.25)';
      cardPreview.style.display = 'flex';
      cardPreview.style.flexDirection = 'column';
      cardPreview.style.overflow = 'hidden';
      cardPreview.style.background = 'linear-gradient(to bottom, #1e293b, #0f172a)';
      cardPreview.style.color = 'white';
      cardPreview.style.marginTop = '20px';
      cardPreview.style.marginBottom = '20px';
      cardPreview.style.position = 'relative';
      cardPreview.style.border = '1px solid #334155';
  
      // Card cost badge
      const costBadge = document.createElement('div');
        costBadge.style.width = '40px';
        costBadge.style.height = '40px';
      costBadge.style.borderRadius = '50%';
      costBadge.style.backgroundColor = '#3b82f6';
      costBadge.style.position = 'absolute';
      costBadge.style.top = '15px';
      costBadge.style.left = '15px';
      costBadge.style.display = 'flex';
      costBadge.style.justifyContent = 'center';
      costBadge.style.alignItems = 'center';
      costBadge.style.color = 'white';
      costBadge.style.fontWeight = 'bold';
      costBadge.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.5)';
        costBadge.style.fontSize = '1.5rem';
      costBadge.textContent = this.card.cost;
      cardPreview.appendChild(costBadge);
      this.costBadge = costBadge;
  
      // Card name
      const cardName = document.createElement('div');
      cardName.style.width = '100%';
        cardName.style.padding = '15px 15px 5px 70px';
      cardName.style.fontWeight = 'bold';
        cardName.style.fontSize = '1.3rem';
      cardName.style.textAlign = 'center';
      cardName.textContent = this.card.name;
      cardPreview.appendChild(cardName);
      this.cardName = cardName;
  
      // Card icon
      const iconContainer = document.createElement('div');
      iconContainer.style.display = 'flex';
      iconContainer.style.justifyContent = 'center';
      iconContainer.style.alignItems = 'center';
        iconContainer.style.padding = '20px';
      iconContainer.style.fontSize = '5rem';
      iconContainer.style.flex = '1';
  
      const icon = document.createElement('div');
      icon.textContent = this.getCardIcon();
      iconContainer.appendChild(icon);
      cardPreview.appendChild(iconContainer);
      this.cardIcon = icon;
  
      // Type and rarity
      const cardType = document.createElement('div');
      cardType.style.width = '100%';
      cardType.style.padding = '5px 15px';
        cardType.style.fontSize = '0.9rem';
      cardType.style.textAlign = 'center';
      cardType.style.color = '#94a3b8';
      cardType.textContent = this.capitalizeFirstLetter(this.card.type);
        if (this.card.rarity === 'legendary') {
            cardType.textContent += ' • Legendary';
        }
      cardPreview.appendChild(cardType);
      this.cardType = cardType;
  
      // Description
      const cardDesc = document.createElement('div');
      cardDesc.style.width = '100%';
        cardDesc.style.padding = '10px 20px 15px 20px';
        cardDesc.style.fontSize = '0.95rem';
      cardDesc.style.textAlign = 'center';
      cardDesc.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
      cardDesc.style.borderTop = '1px solid rgba(51, 65, 85, 0.5)';
        cardDesc.style.lineHeight = '1.4';
        cardDesc.style.minHeight = '100px';
        cardDesc.style.maxHeight = '120px';
        cardDesc.style.overflow = 'auto';
        cardDesc.innerHTML = this.formatCardDescription(this.card.description);
      cardPreview.appendChild(cardDesc);
      this.cardDesc = cardDesc;
  
      // Card stats (attack and health)
      const cardStats = document.createElement('div');
      cardStats.style.display = 'flex';
      cardStats.style.justifyContent = 'space-between';
        cardStats.style.padding = '15px 20px';
      cardStats.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
      cardStats.style.borderTop = '1px solid rgba(51, 65, 85, 0.5)';
  
      // Attack value
      const attackContainer = document.createElement('div');
      attackContainer.style.display = 'flex';
      attackContainer.style.alignItems = 'center';
  
      const attackIcon = document.createElement('span');
        attackIcon.style.marginRight = '8px';
      attackIcon.style.color = '#ef4444';
      attackIcon.textContent = '⚔️';
  
      const attackValue = document.createElement('span');
      attackValue.style.fontWeight = 'bold';
        attackValue.style.fontSize = '1.3rem';
      attackValue.style.color = '#ef4444';
      attackValue.textContent = this.card.attack;
  
      attackContainer.appendChild(attackIcon);
      attackContainer.appendChild(attackValue);
  
      // Health value
      const healthContainer = document.createElement('div');
      healthContainer.style.display = 'flex';
      healthContainer.style.alignItems = 'center';
  
      const healthIcon = document.createElement('span');
        healthIcon.style.marginRight = '8px';
      healthIcon.style.color = '#22c55e';
      healthIcon.textContent = '❤️';
  
      const healthValue = document.createElement('span');
      healthValue.style.fontWeight = 'bold';
        healthValue.style.fontSize = '1.3rem';
      healthValue.style.color = '#22c55e';
      healthValue.textContent = this.card.health;
  
      healthContainer.appendChild(healthIcon);
      healthContainer.appendChild(healthValue);
  
      cardStats.appendChild(attackContainer);
      cardStats.appendChild(healthContainer);
  
      this.attackValue = attackValue;
      this.healthValue = healthValue;
  
      cardPreview.appendChild(cardStats);
        
        // Show YAR indicator if card has YAR effect
        if (this.card.yar || (this.effects && this.effects.some(e => e?.yar))) {
            const yarIndicator = document.createElement('div');
            yarIndicator.style.position = 'absolute';
            yarIndicator.style.top = '15px';
            yarIndicator.style.right = '15px';
            yarIndicator.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
            yarIndicator.style.color = '#fbbf24';
            yarIndicator.style.padding = '3px 8px';
            yarIndicator.style.borderRadius = '4px';
            yarIndicator.style.fontSize = '0.8rem';
            yarIndicator.style.fontWeight = 'bold';
            yarIndicator.textContent = 'YAR';
            cardPreview.appendChild(yarIndicator);
        }
  
      container.appendChild(cardPreview);
    }
  
    updateCardPreview() {
      // Update card values in the preview
      this.costBadge.textContent = this.card.cost;
      this.cardName.textContent = this.card.name;
      this.cardIcon.textContent = this.getCardIcon();
        
        // Update type and rarity
      this.cardType.textContent = this.capitalizeFirstLetter(this.card.type);
        if (this.card.rarity === 'legendary') {
            this.cardType.textContent += ' • Legendary';
        }
        
        this.cardDesc.innerHTML = this.formatCardDescription(this.card.description);
      this.attackValue.textContent = this.card.attack;
      this.healthValue.textContent = this.card.health;
  
      // Update archetype-specific styling
      const archetype = this.archetypes.find(a => a.value === this.card.archetype);
      if (archetype) {
        this.cardIcon.style.color = archetype.color;
      }
    }
  
    // Format card description with colored highlights for effect types
    formatCardDescription(description) {
        if (!description) return '';
        
        let formatted = description;
        
        // Effect colors - each effect gets its own distinct color
        const effectColors = {
            'taunt': '#fbbf24',      // Amber - defensive effect
            'warshout': '#3b82f6',   // Blue - immediate effect
            'deathblow': '#ef4444',  // Red - death-triggered effect
            'deathstrike': '#8b5cf6', // Purple - kill-triggered effect
            'strike': '#22c55e',     // Green - attack-triggered effect
            'sacrifice': '#f97316',  // Orange - sacrifice effect
            'yar': '#f59e0b'         // Gold - area restriction
        };
        
        // Highlight all effect types with their specific colors
        Object.entries(effectColors).forEach(([effectName, color]) => {
            // Create regex to match the effect name (case insensitive)
            const regex = new RegExp(`\\b(${effectName})\\b`, 'gi');
            formatted = formatted.replace(regex, `<span style="color: ${color}; font-weight: bold; text-shadow: 0 0 2px ${color}66;">${effectName.charAt(0).toUpperCase() + effectName.slice(1)}</span>`);
        });
        
        return formatted;
    }

    updateEffectsList() {
        // Clear existing effects list
        this.effectsList.innerHTML = '';
        
        // Filter out empty effects
        const validEffects = this.effects.filter(effect => effect && effect.type);
        
        if (validEffects.length === 0) {
            const noEffects = document.createElement('div');
            noEffects.style.padding = '10px 15px';
            noEffects.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
            noEffects.style.borderRadius = '5px';
            noEffects.style.color = '#94a3b8';
            noEffects.style.fontStyle = 'italic';
            noEffects.textContent = 'No effects added yet. Use the effect builders above or type a description with correct syntax.';
            this.effectsList.appendChild(noEffects);
        return;
      }
  
        // Add each effect to the list
        validEffects.forEach((effect, index) => {
            const effectItem = document.createElement('div');
            effectItem.style.display = 'flex';
            effectItem.style.justifyContent = 'space-between';
            effectItem.style.alignItems = 'center';
            effectItem.style.padding = '10px 15px';
            effectItem.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
            effectItem.style.borderBottom = '1px solid rgba(51, 65, 85, 0.5)';
            effectItem.style.borderRadius = '5px';
            effectItem.style.marginBottom = '5px';
            
            // Effect icon and type
            const effectTypeContainer = document.createElement('div');
            effectTypeContainer.style.display = 'flex';
            effectTypeContainer.style.alignItems = 'center';
            effectTypeContainer.style.gap = '8px';
            
            // Icon based on effect type
            const effectIcon = document.createElement('span');
            switch (effect.type) {
        case 'taunt':
                    effectIcon.textContent = '🛡️';
          break;
        case 'warshout':
                    effectIcon.textContent = '📣';
                    break;
                case 'deathblow':
                    effectIcon.textContent = '💀';
                    break;
                default:
                    effectIcon.textContent = '🔮';
            }
            
            const effectType = document.createElement('span');
            effectType.style.fontWeight = 'bold';
            effectType.textContent = this.capitalizeFirstLetter(effect.type);
            
            effectTypeContainer.appendChild(effectIcon);
            effectTypeContainer.appendChild(effectType);
            
            // Effect description
            const effectDesc = document.createElement('span');
            effectDesc.style.flex = '1';
            effectDesc.style.marginLeft = '10px';
            effectDesc.style.color = '#94a3b8';
            effectDesc.textContent = this.formatEffectDescription(effect);
            
            // Remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.style.backgroundColor = 'transparent';
            removeButton.style.border = 'none';
            removeButton.style.color = '#94a3b8';
            removeButton.style.cursor = 'pointer';
            removeButton.style.fontWeight = 'bold';
            removeButton.style.transition = 'color 0.2s';
            removeButton.addEventListener('mouseenter', () => {
                removeButton.style.color = '#ef4444';
            });
            removeButton.addEventListener('mouseleave', () => {
                removeButton.style.color = '#94a3b8';
            });
            removeButton.addEventListener('click', () => {
                this.removeEffect(index);
            });
            
            effectItem.appendChild(effectTypeContainer);
            effectItem.appendChild(effectDesc);
            effectItem.appendChild(removeButton);
            
            this.effectsList.appendChild(effectItem);
        });
    }

    // Format effect description for display with proper colors
    formatEffectDescription(effect) {
        if (!effect || !effect.type) return 'Unknown effect';
        
        // Effect colors
        const effectColors = {
            'taunt': '#fbbf24',
            'warshout': '#3b82f6',
            'deathblow': '#ef4444',
            'deathstrike': '#8b5cf6',
            'strike': '#22c55e',
            'sacrifice': '#f97316'
        };
        
        const color = effectColors[effect.type] || '#94a3b8';
        
        switch (effect.type) {
            case 'taunt':
                return `<span style="color: ${color}; font-weight: bold;">Taunt:</span> Enemies must attack this unit first`;
                
            case 'warshout':
                let warshoutDesc = `<span style="color: ${color}; font-weight: bold;">Warshout:</span> `;
                
                if (effect.requiresTargeting) {
                    warshoutDesc += `Target ${effect.targetType || 'any'} unit to `;
                } else if (effect.area === 'all') {
                    warshoutDesc += `All ${effect.targetType || 'any'} units `;
                }
                
                switch (effect.action) {
                    case 'damage':
                        warshoutDesc += `take ${effect.value || 1} damage`;
                        break;
                    case 'heal':
                        warshoutDesc += `heal ${effect.value || 1} health`;
                        break;
                    case 'buff':
                        const attackBuff = effect.value?.attack || 0;
                        const healthBuff = effect.value?.health || 0;
                        warshoutDesc += `get +${attackBuff}/+${healthBuff}`;
                        break;
                    case 'draw':
                        warshoutDesc += `draw ${effect.value || 1} card(s)`;
                        break;
                    case 'summon':
                        const name = effect.value?.name || 'Token';
                        const attack = effect.value?.attack || 1;
                        const health = effect.value?.health || 1;
                        warshoutDesc += `summon a ${attack}/${health} ${name}`;
                        break;
                    default:
                        warshoutDesc += effect.action || 'unknown action';
                }
                
                if (effect.yar) {
                    warshoutDesc += ' <span style="color: #f59e0b; font-weight: bold;">(YAR)</span>';
                }
                
                return warshoutDesc;
                
            case 'deathblow':
                let deathblowDesc = `<span style="color: ${color}; font-weight: bold;">Deathblow:</span> `;
                
                switch (effect.action) {
                    case 'damage':
                        if (effect.area === 'all') {
                            deathblowDesc += `Deal ${effect.value || 1} damage to all ${effect.targetType || 'any'} units`;
                        } else {
                            deathblowDesc += `Deal ${effect.value || 1} damage to target ${effect.targetType || 'any'} unit`;
                        }
                        break;
                    case 'draw':
                        deathblowDesc += `Draw ${effect.value || 1} card(s)`;
                        break;
                    case 'summon':
                        const name = effect.value?.name || 'Token';
                        const attack = effect.value?.attack || 1;
                        const health = effect.value?.health || 1;
                        deathblowDesc += `Summon a ${attack}/${health} ${name}`;
                        break;
                    default:
                        deathblowDesc += effect.action || 'unknown action';
                }
                
                if (effect.yar) {
                    deathblowDesc += ' <span style="color: #f59e0b; font-weight: bold;">(YAR)</span>';
                }
                
                return deathblowDesc;
                
            case 'deathstrike':
                let deathstrikeDesc = `<span style="color: ${color}; font-weight: bold;">DeathStrike:</span> `;
                
                if (effect.targetType === 'self') {
                    deathstrikeDesc += 'Self ';
                } else if (effect.targetType) {
                    deathstrikeDesc += `${effect.targetType} `;
                }
                
                switch (effect.action) {
                    case 'damage':
                        deathstrikeDesc += `take ${effect.value || 1} damage`;
                        break;
                    case 'heal':
                        deathstrikeDesc += `heal ${effect.value || 1} health`;
                        break;
                    case 'buff':
                        const attackBuff = effect.value?.attack || 0;
                        const healthBuff = effect.value?.health || 0;
                        if (attackBuff > 0 && healthBuff > 0) {
                            deathstrikeDesc += `gain +${attackBuff}/+${healthBuff}`;
                        } else if (attackBuff > 0) {
                            deathstrikeDesc += `gain +${attackBuff} attack`;
                        } else if (healthBuff > 0) {
                            deathstrikeDesc += `gain +${healthBuff} health`;
                        }
                        break;
                    case 'draw':
                        deathstrikeDesc += `draw ${effect.value || 1} card(s)`;
                        break;
                    case 'summon':
                        const name = effect.value?.name || 'Token';
                        const attack = effect.value?.attack || 1;
                        const health = effect.value?.health || 1;
                        deathstrikeDesc += `summon a ${attack}/${health} ${name}`;
                        break;
                    default:
                        deathstrikeDesc += effect.action || 'unknown action';
                }
                
                if (effect.yar) {
                    deathstrikeDesc += ' <span style="color: #f59e0b; font-weight: bold;">(YAR)</span>';
                }
                
                return deathstrikeDesc;
                
            case 'strike':
                let strikeDesc = `<span style="color: ${color}; font-weight: bold;">Strike:</span> `;
                
                switch (effect.action) {
                    case 'damage':
                        strikeDesc += `Take ${effect.value || 1} damage`;
                        break;
                    case 'heal':
                        strikeDesc += `Heal ${effect.value || 1} health`;
                        break;
                    case 'buff':
                        const attackBuff = effect.value?.attack || 0;
                        const healthBuff = effect.value?.health || 0;
                        if (attackBuff > 0 && healthBuff > 0) {
                            strikeDesc += `gain +${attackBuff}/+${healthBuff}`;
                        } else if (attackBuff > 0) {
                            strikeDesc += `gain +${attackBuff} attack`;
                        } else if (healthBuff > 0) {
                            strikeDesc += `gain +${healthBuff} health`;
                        } else if (attackBuff < 0 || healthBuff < 0) {
                            strikeDesc += `get ${attackBuff}/${healthBuff}`;
                        }
                        
                        if (effect.temporary) {
                            strikeDesc += ' until end of turn';
                        }
                        break;
                    default:
                        strikeDesc += effect.action || 'unknown action';
                }
                
                return strikeDesc;
                
            default:
                return `<span style="color: #94a3b8;">Custom effect</span>`;
        }
    }

    // Remove an effect
    removeEffect(index) {
        // Filter out the effect at the specified index
        this.effects = this.effects.filter((_, i) => i !== index);
        
        // Update the effects list and card description
        this.updateEffectsList();
        this.updateCardDescription();
    }

    // Generate card description from effects
    updateCardDescription() {
        // Only auto-update description if there are valid effects
        const validEffects = this.effects.filter(effect => effect && effect.type);
        if (validEffects.length === 0) return;
        let description = '';
        // Add taunt first if it exists
        const tauntEffect = validEffects.find(effect => effect.type === 'taunt');
        if (tauntEffect) {
            description += 'Taunt';
            if (validEffects.length > 1) {
                description += '. ';
            }
        }
        // Add strike effects
        const strikeEffect = validEffects.find(effect => effect.type === 'strike');
        if (strikeEffect) {
            if (description && !description.endsWith('. ')) {
                description += '. ';
            }
            description += 'Strike: ';
            // Initial effect
            switch (strikeEffect.action) {
                case 'damage':
                    description += `Take ${strikeEffect.value || 1} damage`;
                    break;
                case 'heal':
                    description += `Heal ${strikeEffect.value || 1} health`;
                    break;
            }
            // Followup effect
            if (strikeEffect.followup && strikeEffect.followup.action === 'buff') {
                const atk = strikeEffect.followup.value?.attack || 0;
                const hp = strikeEffect.followup.value?.health || 0;
                if (atk > 0 || hp > 0) {
                    description += ` and gain +${atk}/+${hp}`;
                    if (strikeEffect.followup.duration === 'permanent') {
                        description += ' until this unit dies';
                    } else {
                        description += ' until end of turn';
                    }
                }
            }
        }
        // Add warshout effects
        const warshoutEffect = validEffects.find(effect => effect.type === 'warshout');
        if (warshoutEffect) {
            // If we already have text, make sure we have proper spacing
            if (description && !description.endsWith('. ')) {
                description += '. ';
            }
            
            description += 'Warshout: ';
            
            switch (warshoutEffect.action) {
                case 'damage':
                    if (warshoutEffect.requiresTargeting) {
                        description += `Deal ${warshoutEffect.value || 1} damage to an ${warshoutEffect.targetType || 'any'} unit`;
                    } else if (warshoutEffect.area === 'all') {
                        description += `Deal ${warshoutEffect.value || 1} damage to all ${warshoutEffect.targetType || 'any'} units`;
                    }
                    break;
                
                case 'heal':
                    if (warshoutEffect.requiresTargeting) {
                        description += `Heal ${warshoutEffect.value || 1} health to an ${warshoutEffect.targetType || 'any'} unit`;
                    } else if (warshoutEffect.area === 'all') {
                        description += `Heal ${warshoutEffect.value || 1} health to all ${warshoutEffect.targetType || 'any'} units`;
                    }
                    break;
                
                case 'buff':
                    const attackBuff = warshoutEffect.value?.attack || 0;
                    const healthBuff = warshoutEffect.value?.health || 0;
                    
                    if (attackBuff > 0 && healthBuff > 0) {
                        if (warshoutEffect.requiresTargeting) {
                            description += `Give an ${warshoutEffect.targetType || 'any'} unit +${attackBuff}/+${healthBuff}`;
                        } else if (warshoutEffect.area === 'all') {
                            description += `Give all ${warshoutEffect.targetType || 'any'} units +${attackBuff}/+${healthBuff}`;
                        }
                    } else if (attackBuff > 0) {
                        if (warshoutEffect.requiresTargeting) {
                            description += `Give an ${warshoutEffect.targetType || 'any'} unit +${attackBuff} attack`;
                        } else if (warshoutEffect.area === 'all') {
                            description += `Give all ${warshoutEffect.targetType || 'any'} units +${attackBuff} attack`;
                        }
                    } else if (healthBuff > 0) {
                        if (warshoutEffect.requiresTargeting) {
                            description += `Give an ${warshoutEffect.targetType || 'any'} unit +${healthBuff} health`;
                        } else if (warshoutEffect.area === 'all') {
                            description += `Give all ${warshoutEffect.targetType || 'any'} units +${healthBuff} health`;
                        }
                    }
                    break;
                
                case 'draw':
                    description += `Draw ${warshoutEffect.value || 1} card${warshoutEffect.value !== 1 ? 's' : ''}`;
                    break;
                
                case 'summon':
                    const name = warshoutEffect.value?.name || 'Token';
                    const attack = warshoutEffect.value?.attack || 1;
                    const health = warshoutEffect.value?.health || 1;
                    description += `Summon a ${attack}/${health} ${name}`;
                    break;
            }
            
            if (warshoutEffect.yar) {
                description += '. YAR';
            }
        }
        
        // Add deathstrike effects
        const deathstrikeEffect = validEffects.find(effect => effect.type === 'deathstrike');
        if (deathstrikeEffect) {
            // If we already have text, make sure we have proper spacing
            if (description && !description.endsWith('. ')) {
                description += '. ';
            }
            
            description += 'DeathStrike: ';
            
            switch (deathstrikeEffect.action) {
                case 'damage':
                    if (deathstrikeEffect.targetType === 'self') {
                        description += `Take ${deathstrikeEffect.value || 1} damage`;
                    } else if (deathstrikeEffect.area === 'all') {
                        description += `Deal ${deathstrikeEffect.value || 1} damage to all ${deathstrikeEffect.targetType || 'any'} units`;
                    } else {
                        description += `Deal ${deathstrikeEffect.value || 1} damage to an ${deathstrikeEffect.targetType || 'any'} unit`;
                    }
                    break;
                
                case 'heal':
                    if (deathstrikeEffect.targetType === 'self') {
                        description += `Heal ${deathstrikeEffect.value || 1} health`;
                    } else {
                        description += `Heal ${deathstrikeEffect.value || 1} health to an ${deathstrikeEffect.targetType || 'any'} unit`;
                    }
                    break;
                
                case 'buff':
                    const attackBuff = deathstrikeEffect.value?.attack || 0;
                    const healthBuff = deathstrikeEffect.value?.health || 0;
                    
                    if (attackBuff > 0 && healthBuff > 0) {
                        if (deathstrikeEffect.targetType === 'self') {
                            description += `Gain +${attackBuff}/+${healthBuff}`;
                        } else {
                            description += `Give an ${deathstrikeEffect.targetType || 'any'} unit +${attackBuff}/+${healthBuff}`;
                        }
                    } else if (attackBuff > 0) {
                        if (deathstrikeEffect.targetType === 'self') {
                            description += `Gain +${attackBuff} attack`;
                        } else {
                            description += `Give an ${deathstrikeEffect.targetType || 'any'} unit +${attackBuff} attack`;
                        }
                    } else if (healthBuff > 0) {
                        if (deathstrikeEffect.targetType === 'self') {
                            description += `Gain +${healthBuff} health`;
                        } else {
                            description += `Give an ${deathstrikeEffect.targetType || 'any'} unit +${healthBuff} health`;
                        }
                    }
                    break;
                
                case 'draw':
                    description += `Draw ${deathstrikeEffect.value || 1} card${deathstrikeEffect.value !== 1 ? 's' : ''}`;
                    break;
                
                case 'summon':
                    const name = deathstrikeEffect.value?.name || 'Token';
                    const attack = deathstrikeEffect.value?.attack || 1;
                    const health = deathstrikeEffect.value?.health || 1;
                    description += `Summon a ${attack}/${health} ${name}`;
                    break;
            }
            
            // Handle followup actions
            if (deathstrikeEffect.followup) {
                const followup = deathstrikeEffect.followup;
                switch (followup.action) {
                    case 'buff':
                        const fAttackBuff = followup.value?.attack || 0;
                        const fHealthBuff = followup.value?.health || 0;
                        
                        if (fAttackBuff > 0 || fHealthBuff > 0) {
                            description += ` and gain +${fAttackBuff}/+${fHealthBuff}`;
                        }
                        break;
                    case 'draw':
                        description += ` and draw ${followup.value || 1} card${followup.value !== 1 ? 's' : ''}`;
                        break;
                }
            }
            
            if (deathstrikeEffect.yar) {
                description += '. YAR';
            }
        }
        
        // Add deathblow effects
        const deathblowEffect = validEffects.find(effect => effect.type === 'deathblow');
        if (deathblowEffect) {
            // If we already have text, make sure we have proper spacing
            if (description && !description.endsWith('. ')) {
                description += '. ';
            }
            
            description += 'Deathblow: ';
            
            switch (deathblowEffect.action) {
                case 'damage':
                    if (deathblowEffect.area === 'all') {
                        description += `Deal ${deathblowEffect.value || 1} damage to all ${deathblowEffect.targetType || 'any'} units`;
                    } else {
                        description += `Deal ${deathblowEffect.value || 1} damage to an ${deathblowEffect.targetType || 'any'} unit`;
                    }
                    break;
                
                case 'draw':
                    description += `Draw ${deathblowEffect.value || 1} card${deathblowEffect.value !== 1 ? 's' : ''}`;
                    break;
                
                case 'summon':
                    const name = deathblowEffect.value?.name || 'Token';
                    const attack = deathblowEffect.value?.attack || 1;
                    const health = deathblowEffect.value?.health || 1;
                    description += `Summon a ${attack}/${health} ${name}`;
                    break;
            }
            
            if (deathblowEffect.yar) {
                description += '. YAR';
            }
        }
        
        // Update the card description
        this.card.description = description;
        this.cardDesc.innerHTML = this.formatCardDescription(description);
    }
  
    createFormGroup(label, type, options = [], valueKey = 'value') {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
  
      const labelElement = document.createElement('label');
      labelElement.textContent = label;
      labelElement.style.fontWeight = 'bold';
      labelElement.style.marginBottom = '5px';
      container.appendChild(labelElement);
  
      let input;
      
      if (type === 'select') {
        input = document.createElement('select');
        input.style.padding = '10px';
        input.style.border = '1px solid #334155';
        input.style.borderRadius = '5px';
        input.style.backgroundColor = 'transparent';
        input.style.color = 'white';
  
        // Add options
        options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option[valueKey];
          optionElement.textContent = option.name;
          input.appendChild(optionElement);
        });
      } else if (type === 'textarea') {
        input = document.createElement('textarea');
        input.style.padding = '10px';
        input.style.border = '1px solid #334155';
        input.style.borderRadius = '5px';
        input.style.backgroundColor = 'transparent';
        input.style.color = 'white';
        input.style.resize = 'vertical';
        input.style.minHeight = '80px';
      } else if (type === 'checkbox') {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.display = 'flex';
            checkboxContainer.style.alignItems = 'center';
            
        input = document.createElement('input');
        input.type = 'checkbox';
        input.style.width = '20px';
        input.style.height = '20px';
            input.style.marginRight = '8px';
            
            checkboxContainer.appendChild(input);
            checkboxContainer.appendChild(document.createTextNode(label));
            
            // Replace the label with an empty span since we moved it to the right of the checkbox
            labelElement.textContent = '';
            
            container.appendChild(checkboxContainer);
      } else {
        input = document.createElement('input');
        input.type = type;
        input.style.padding = '10px';
        input.style.border = '1px solid #334155';
        input.style.borderRadius = '5px';
        input.style.backgroundColor = 'transparent';
        input.style.color = 'white';
      }
  
        if (type !== 'checkbox') {
      container.appendChild(input);
        }
  
      return { container, input };
    }
  
    capitalizeFirstLetter(string) {
        if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    getCardIcon() {
        // If the card already has an icon, use it
        if (this.card.icon) {
            return this.card.icon;
        }
        
        // Otherwise get icon based on type or archetype
      const unitType = this.unitTypes.find(u => u.value === this.card.type);
      if (unitType) {
        return unitType.icon;
      }
        
        const archetype = this.archetypes.find(a => a.value === this.card.archetype);
        if (archetype) {
            return archetype.icon;
      }
  
      return '⚔️';
    }
  
    saveCard() {
        // Always update the card description before saving
        this.updateCardDescription();
        // Make sure we have a valid card with all required fields
        if (!this.card.name) {
            alert('Please enter a card name');
            return;
        }
        
        if (this.card.cost < 0) {
            alert('Cost cannot be negative');
        return;
      }

        if (this.card.attack < 0) {
            alert('Attack cannot be negative');
            return;
        }
        
        if (this.card.health <= 0) {
            alert('Health must be positive');
            return;
        }
        
        // Ensure the card has an ID
      if (!this.card.id) {
        this.card.id = Date.now().toString();
      }

        // Set the icon based on type
        const typeData = this.unitTypes.find(t => t.value === this.card.type);
        if (typeData) {
            this.card.icon = typeData.icon;
        }
        
        // Check if we have valid effects
        const validEffects = this.effects.filter(effect => effect && effect.type);
        if (validEffects.length === 0) {
            // Try to parse the description for effects
            const parsedEffects = parseFullDescription(this.card.description);
            if (parsedEffects && parsedEffects.length > 0) {
                this.card.effects = parsedEffects;
            } else {
                // Use a blank effect if nothing is found
                this.card.effects = [];
            }
        } else {
            // Use the valid effects
            this.card.effects = validEffects;
        }
        
        // Set card YAR property based on effects
        this.card.yar = this.card.effects.some(e => e?.yar) || false;
        
        // Debug log
      console.log('Saving card:', this.card);

      // Call the callback to save the card
      if (this.callbacks.onCardSaved) {
        const cardToSave = JSON.parse(JSON.stringify(this.card));
        this.callbacks.onCardSaved(cardToSave);
      }
    }

    showTutorial() {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      overlay.style.zIndex = '1000';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';

      // Create tutorial modal
      const modal = document.createElement('div');
      modal.style.backgroundColor = '#1e293b';
      modal.style.borderRadius = '8px';
      modal.style.width = '90%';
      modal.style.maxWidth = '800px';
      modal.style.maxHeight = '90vh';
      modal.style.overflow = 'auto';
      modal.style.padding = '20px';
      modal.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.3)';
      modal.style.position = 'relative';

      // Close button
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '10px';
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });

      // Add tutorial content
      const content = document.createElement('div');
      content.innerHTML = this.getTutorialContent();

      modal.appendChild(closeButton);
      modal.appendChild(content);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    }

    getTutorialContent() {
      return `
        <h2 style="color: #f59e0b; margin-bottom: 20px; text-align: center;">Custom Card Builder Tutorial</h2>
        <h3 style="color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 5px;">Card Creation Basics</h3>
        <p>Fill in the basic attributes to create your card: name, cost, attack, health, etc.</p>
        <h3 style="color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 20px;">Multiple Effects Per Card</h3>
        <p><strong>You can add up to <span style='color:#22c55e;'>2 different effects</span> to each card.</strong> Use the Effect Builder on the right to add, edit, or remove effects. The order of effects matters: the first effect is used for filtering in the deck builder and is shown most prominently.</p>
        <p>You can also type effects directly in the description field using the correct syntax. If you do, the builder will try to parse and add them automatically.</p>
        <h3 style="color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 20px;">Effect Description Syntax</h3>
        <p>Your card's description defines its special abilities. Use these formats:</p>
        <div style="background-color: #0f172a; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <h4 style="color: #3b82f6; margin-top: 0;">Damage Effects</h4>
          <p style="margin-bottom: 5px;"><code>deal [X] damage to [target]</code></p>
          <ul style="color: #cbd5e1; padding-left: 20px;">
            <li>"Deal 1 damage to an enemy unit"</li>
            <li>"Deal 3 damage to a unit"</li>
            <li>"Deal 2 damage to all enemy units"</li>
          </ul>
          <h4 style="color: #3b82f6; margin-top: 15px;">Healing Effects</h4>
          <p style="margin-bottom: 5px;"><code>heal [X] health to [target]</code></p>
          <ul style="color: #cbd5e1; padding-left: 20px;">
            <li>"Heal 2 health to an ally unit"</li>
            <li>"Heal 1 health to all ally units"</li>
          </ul>
          <h4 style="color: #3b82f6; margin-top: 15px;">Stat Buff Effects</h4>
          <p style="margin-bottom: 5px;"><code>gain [X] [stat] to [target]</code></p>
          <ul style="color: #cbd5e1; padding-left: 20px;">
            <li>"Gain 1 attack to an ally unit"</li>
            <li>"Gain 2 health to all units"</li>
          </ul>
          <h4 style="color: #3b82f6; margin-top: 15px;">Card Draw Effects</h4>
          <p style="margin-bottom: 5px;"><code>draw [X] cards</code></p>
          <ul style="color: #cbd5e1; padding-left: 20px;">
            <li>"Draw 1 card"</li>
            <li>"Draw 2 cards"</li>
          </ul>
          <h4 style="color: #3b82f6; margin-top: 15px;">Destroy Effects</h4>
          <p style="margin-bottom: 5px;"><code>destroy [target]</code></p>
          <ul style="color: #cbd5e1; padding-left: 20px;">
            <li>"Destroy an enemy unit"</li>
            <li>"Destroy a unit"</li>
          </ul>
        </div>
        <h3 style="color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 20px;">Valid Target Types</h3>
        <ul style="color: #cbd5e1; padding-left: 20px; columns: 2;">
          <li><code>a unit</code> - Any unit</li>
          <li><code>an enemy unit</code> - Opponent's unit</li>
          <li><code>an ally unit</code> - Your unit</li>
          <li><code>all units</code> - Every unit</li>
          <li><code>all enemy units</code> - All opponent's units</li>
          <li><code>all ally units</code> - All your units</li>
          <li><code>self</code> - The card itself</li>
          <li><code>player</code> - Your player</li>
          <li><code>opponent</code> - The opponent</li>
        </ul>
        <h3 style="color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 20px;">Special Abilities & Stacking</h3>
        <div style="background-color: #0f172a; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <h4 style="color: #3b82f6; margin-top: 0;">Warshout</h4>
          <p>Triggers when the unit is played.</p>
          <p><code>"Warshout: Deal 1 damage to an enemy unit"</code></p>
          <h4 style="color: #3b82f6; margin-top: 15px;">Deathblow</h4>
          <p>Triggers when the unit dies.</p>
          <p><code>"Deathblow: Draw 1 card"</code></p>
          <h4 style="color: #3b82f6; margin-top: 15px;">Taunt</h4>
          <p>Forces enemies to attack this unit first.</p>
          <p><code>"Taunt"</code> or <code>"Taunt. Warshout: Deal 1 damage to an enemy unit"</code></p>
          <h4 style="color: #3b82f6; margin-top: 15px;">YAR (Your Area Ruling)</h4>
          <p>Effects only work within 2 rows of your spawn row.</p>
          <p><code>"Warshout: Deal 1 damage to an enemy unit. YAR"</code></p>
        </div>
        <h3 style="color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 20px;">Example Cards (with Multiple Effects)</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background-color: #0f172a; padding: 15px; border-radius: 5px;">
            <h4 style="color: #f59e0b; margin-top: 0;">Flame Striker</h4>
            <p><strong>Stats:</strong> Cost 2, Atk 2, HP 1</p>
            <p><strong>Description:</strong> "Warshout: Deal 1 damage to an enemy unit"</p>
          </div>
          <div style="background-color: #0f172a; padding: 15px; border-radius: 5px;">
            <h4 style="color: #22d3ee; margin-top: 0;">Healing Acolyte</h4>
            <p><strong>Stats:</strong> Cost 3, Atk 1, HP 3</p>
            <p><strong>Description:</strong> "Warshout: Heal 2 health to an ally unit"</p>
          </div>
          <div style="background-color: #0f172a; padding: 15px; border-radius: 5px;">
            <h4 style="color: #a21caf; margin-top: 0;">Vengeance Spirit</h4>
            <p><strong>Stats:</strong> Cost 3, Atk 2, HP 2</p>
            <p><strong>Description:</strong> "Deathblow: Deal 1 damage to all enemy units"</p>
          </div>
          <div style="background-color: #0f172a; padding: 15px; border-radius: 5px;">
            <h4 style="color: #16a34a; margin-top: 0;">Territorial Defender</h4>
            <p><strong>Stats:</strong> Cost 4, Atk 3, HP 4</p>
            <p><strong>Description:</strong> "Taunt. Warshout: Heal 2 health to an ally unit. YAR"</p>
          </div>
          <div style="background-color: #0f172a; padding: 15px; border-radius: 5px;">
            <h4 style="color: #f59e0b; margin-top: 0;">Dual Threat</h4>
            <p><strong>Stats:</strong> Cost 5, Atk 4, HP 4</p>
            <p><strong>Description:</strong> "Warshout: Deal 2 damage to an enemy unit. Deathblow: Draw 1 card"</p>
          </div>
        </div>
        <div style="background-color: #ef4444; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h4 style="color: white; margin-top: 0;">Common Mistakes to Avoid</h4>
          <ul style="color: white; padding-left: 20px;">
            <li>Use lowercase in effect descriptions</li>
            <li>Don't add extra punctuation</li>
            <li>Use exact wording: "Deal damage to" not "Damage to"</li>
            <li>Always specify target type properly</li>
            <li>Avoid extra spaces</li>
            <li>Remember: Only the <b>first effect</b> is used for filtering in the deck builder</li>
          </ul>
        </div>
      `;
    }
  }
  
  export default CustomCardBuilder;