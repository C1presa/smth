import { ARCHETYPES, ARCHETYPE_DESCRIPTIONS } from '../utils/constants.js';

// Modified GameMenu.js - Text updated from "Custom Deck" to "Custom Build"

console.log('GameMenu.js loaded');
// GameMenu component for the main menu screen

class GameMenu {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
    this.container.style.minHeight = '100vh';
    this.container.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';

    // Title
    const titleBox = document.createElement('div');
    titleBox.style.background = 'rgba(30, 41, 59, 0.7)';
    titleBox.style.borderRadius = '16px';
    titleBox.style.padding = '32px 64px 16px 64px';
    titleBox.style.marginBottom = '32px';
    titleBox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    titleBox.style.textAlign = 'center';

    const title = document.createElement('div');
    title.textContent = 'CURVE GAME';
    title.style.fontSize = '2.8rem';
    title.style.fontWeight = 'bold';
    title.style.background = 'linear-gradient(90deg, #fbbf24, #f97316, #ef4444)';
    title.style.webkitBackgroundClip = 'text';
    title.style.webkitTextFillColor = 'transparent';
    title.style.backgroundClip = 'text';
    title.style.color = 'transparent';
    titleBox.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'by Kustr';
    subtitle.style.fontSize = '1.1rem';
    subtitle.style.color = '#cbd5e1';
    subtitle.style.marginTop = '4px';
    titleBox.appendChild(subtitle);

    this.container.appendChild(titleBox);

    // Buttons
    const buttonBox = document.createElement('div');
    buttonBox.style.display = 'flex';
    buttonBox.style.flexDirection = 'column';
    buttonBox.style.gap = '18px';
    buttonBox.style.marginBottom = '32px';
    buttonBox.style.width = '320px';

    const btn1v1 = this.createMenuButton('1v1', 'linear-gradient(to right, #2563eb, #3b82f6)', () => this.callbacks.onPlay1v1 && this.callbacks.onPlay1v1());
    const btnAI = this.createMenuButton('vs AI', 'linear-gradient(to right, #16a34a, #22c55e)', () => this.callbacks.onPlayAI && this.callbacks.onPlayAI());
    
    // Updated text from "Custom Deck" to "Custom Build"
    const btnCustom = this.createMenuButton('Custom Build', 'linear-gradient(to right, #9333ea, #a855f7)', () => this.callbacks.onDeckBuilder && this.callbacks.onDeckBuilder());

    buttonBox.appendChild(btn1v1);
    buttonBox.appendChild(btnAI);
    buttonBox.appendChild(btnCustom);
    this.container.appendChild(buttonBox);

    // Description and archetypes
    const descBox = document.createElement('div');
    descBox.style.background = '#23283a';
    descBox.style.borderRadius = '14px';
    descBox.style.padding = '24px 32px';
    descBox.style.marginTop = '8px';
    descBox.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    descBox.style.color = '#e0e6f0';
    descBox.style.maxWidth = '600px';
    descBox.style.textAlign = 'center';

    const desc = document.createElement('div');
    desc.textContent = "A strategic card battle game where you lead your chosen archetype's forces across the battlefield to victory!";
    desc.style.marginBottom = '18px';
    descBox.appendChild(desc);

    // Archetype cards
    const archetypeGrid = document.createElement('div');
    archetypeGrid.style.display = 'grid';
    archetypeGrid.style.gridTemplateColumns = '1fr 1fr';
    archetypeGrid.style.gap = '14px';

    archetypeGrid.appendChild(this.createArchetypeCard('Nether', 'Dark cultists and demonic beings from the Nether.', '#a21caf', '❄️'));
    archetypeGrid.appendChild(this.createArchetypeCard('Swamp', 'Creatures and spirits of the murky swamps.', '#16a34a', '🐸'));
    archetypeGrid.appendChild(this.createArchetypeCard('Racetrack', 'Speedsters and mechanical racers.', '#f59e0b', '🏁'));
    archetypeGrid.appendChild(this.createArchetypeCard('Elderwood', 'Ancient beasts and wise spirits of the forest.', '#22d3ee', '🌲'));

    descBox.appendChild(archetypeGrid);
    this.container.appendChild(descBox);
  }

  createMenuButton(text, gradientColor, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.background = gradientColor;
    btn.style.color = 'white';
    btn.style.fontWeight = 'bold';
    btn.style.fontSize = '1.2rem';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.padding = '16px 0';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    btn.style.transition = 'all 0.2s ease';
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    btn.addEventListener('click', onClick);
    return btn;
  }

  createArchetypeCard(name, desc, color, icon) {
    const card = document.createElement('div');
    card.style.background = `linear-gradient(135deg, ${color}, ${this.darkenColor(color, 30)})`;
    card.style.color = 'white';
    card.style.borderRadius = '10px';
    card.style.padding = '16px 18px';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'flex-start';
    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    card.style.fontWeight = 'bold';
    card.style.fontSize = '1rem';
    card.style.gap = '6px';
    card.style.transition = 'all 0.2s ease';
    card.innerHTML = `<span style="font-size:1.5rem;">${icon}</span> ${name}<div style="font-weight:normal;font-size:0.95rem;margin-top:2px;">${desc}</div>`;
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = `0 8px 20px rgba(0, 0, 0, 0.2), 0 0 15px ${color}33`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
    return card;
  }

  darkenColor(color, percent) {
    // Convert hex to RGB
    let r = parseInt(color.substring(1,3), 16);
    let g = parseInt(color.substring(3,5), 16);
    let b = parseInt(color.substring(5,7), 16);
    
    // Darken
    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);
    
    // Convert back to hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}

class DeckSelection {
  constructor(container, callbacks, playerLabel = 'Player') {
    this.container = container;
    this.callbacks = callbacks;
    this.playerLabel = playerLabel;
    this.activeTab = 'archetypes'; // 'archetypes' or 'custom'
    this.customDecks = this.loadCustomDecks();
    this.render();
  }

  loadCustomDecks() {
    try {
      return JSON.parse(localStorage.getItem('curve_decks')) || [];
    } catch {
      return [];
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="deck-selection" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; padding: 2rem;">
        <h2 style="color: #fbbf24; text-shadow: 0 2px 10px rgba(251, 191, 36, 0.3); font-size: 2rem; margin-bottom: 24px; text-align: center;">${this.playerLabel}'s Deck Selection</h2>
        <div class="deck-tabs" style="display: flex; justify-content: center; gap: 12px; margin-bottom: 24px;">
          <button class="deck-tab${this.activeTab === 'archetypes' ? ' active' : ''}" 
            style="background: ${this.activeTab === 'archetypes' ? '#fbbf24' : '#1e293b'}; 
            color: ${this.activeTab === 'archetypes' ? '#1e1b4b' : '#fbbf24'}; 
            font-weight: bold; border: none; border-radius: 8px 8px 0 0; 
            padding: 10px 32px; cursor: pointer; font-size: 1.1rem; 
            transition: all 0.2s ease; outline: none; 
            border-bottom: 2px solid ${this.activeTab === 'archetypes' ? '#fbbf24' : 'transparent'};
            box-shadow: ${this.activeTab === 'archetypes' ? '0 -4px 10px rgba(251, 191, 36, 0.2)' : 'none'};"
            data-tab="archetypes">Archetypes</button>
          <button class="deck-tab${this.activeTab === 'custom' ? ' active' : ''}" 
            style="background: ${this.activeTab === 'custom' ? '#fbbf24' : '#1e293b'}; 
            color: ${this.activeTab === 'custom' ? '#1e1b4b' : '#fbbf24'}; 
            font-weight: bold; border: none; border-radius: 8px 8px 0 0; 
            padding: 10px 32px; cursor: pointer; font-size: 1.1rem; 
            transition: all 0.2s ease; outline: none; 
            border-bottom: 2px solid ${this.activeTab === 'custom' ? '#fbbf24' : 'transparent'};
            box-shadow: ${this.activeTab === 'custom' ? '0 -4px 10px rgba(251, 191, 36, 0.2)' : 'none'};"
            data-tab="custom">Custom Decks</button>
        </div>
        <div class="deck-tab-content">
          ${this.activeTab === 'archetypes' ? this.renderArchetypesHTML() : this.renderCustomDecksHTML()}
        </div>
        <button class="back-button" style="background: #1e293b; color: white; font-weight: bold; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; transition: all 0.2s ease; margin-top: 24px; border: 2px solid rgba(251, 191, 36, 0.3);">Back</button>
      </div>
    `;

    // Tab switching
    this.container.querySelectorAll('.deck-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = tab.dataset.tab;
        this.render();
      });
    });

    // Archetype selection
    if (this.activeTab === 'archetypes') {
      this.container.querySelectorAll('.archetype-card').forEach(card => {
        card.addEventListener('click', () => {
          const archetype = card.dataset.archetype;
          this.callbacks.onDeckSelected(archetype);
        });
      });
    }

    // Custom deck selection
    if (this.activeTab === 'custom') {
      this.container.querySelectorAll('.custom-deck-card').forEach(card => {
        card.addEventListener('click', () => {
          const deckIndex = card.dataset.deckIndex;
          const deck = this.customDecks[deckIndex];
          this.callbacks.onDeckSelected(deck);
        });
      });
    }

    this.container.querySelector('.back-button').addEventListener('click', () => {
      this.callbacks.onBack();
    });
  }

  renderArchetypesHTML() {
    return `
      <div class="archetype-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 800px; width: 100%; margin: 0 auto;">
        ${Object.entries(ARCHETYPES).map(([key, value]) => {
          // Define gradient colors based on archetype
          let gradientColors;
          switch(value) {
            case 'Nether':
              gradientColors = 'linear-gradient(135deg, #a21caf 0%, #581c87 100%)';
              break;
            case 'Swamp':
              gradientColors = 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)';
              break;
            case 'Racetrack':
              gradientColors = 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)';
              break;
            case 'Elderwood':
              gradientColors = 'linear-gradient(135deg, #22d3ee 0%, #0e7490 100%)';
              break;
            default:
              gradientColors = 'linear-gradient(135deg, #64748b 0%, #334155 100%)';
          }
          
          return `
            <div class="archetype-card" data-archetype="${value}" 
              style="background: ${gradientColors}; 
              color: white; border-radius: 12px; padding: 24px; 
              cursor: pointer; transition: all 0.2s ease; 
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); 
              position: relative; overflow: hidden;">
              <div style="position: absolute; top: -30px; right: -30px; width: 100px; height: 100px; 
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); 
                border-radius: 50%;"></div>
              <h3 style="font-size: 1.5rem; margin-bottom: 12px; font-weight: bold; 
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${key}</h3>
              <p style="font-size: 1rem; line-height: 1.5; opacity: 0.9;">${ARCHETYPE_DESCRIPTIONS[value]}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderCustomDecksHTML() {
    if (!this.customDecks.length) {
      return `<div style="color:#94a3b8; text-align:center; margin:2rem 0; background:#1e293b; padding:24px; border-radius:12px; border:1px dashed #475569;">No custom decks found.<br>Create some in the Deck Builder!</div>`;
    }
    return `
      <div class="archetype-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 800px; width: 100%; margin: 0 auto;">
        ${this.customDecks.map((deck, i) => `
          <div class="custom-deck-card" data-deck-index="${i}" 
            style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
            color: white; border-radius: 12px; padding: 24px; 
            cursor: pointer; transition: all 0.2s ease; 
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            position: relative; overflow: hidden;">
            <div style="position: absolute; top: -30px; right: -30px; width: 100px; height: 100px; 
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); 
              border-radius: 50%;"></div>
            <h3 style="font-size: 1.5rem; margin-bottom: 12px; font-weight: bold;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${deck.name || 'Custom Deck'}</h3>
            <p style="font-size: 1rem; line-height: 1.5; opacity: 0.9;">${deck.archetype || 'Custom'}<br>Cards: ${deck.cards ? deck.cards.length : 0}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
}

export default GameMenu;
export { GameMenu, DeckSelection };