// CustomBuildMenu.js
// A component for showing custom building options

class CustomBuildMenu {
    constructor(container, callbacks = {}) {
      this.container = container;
      this.callbacks = callbacks;
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
      header.style.marginBottom = '50px';
      
      const title = document.createElement('h2');
      title.textContent = 'Custom Builder';
      title.style.fontSize = '2rem';
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
      
      // Main content with options
      const content = document.createElement('div');
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.alignItems = 'center';
      content.style.justifyContent = 'center';
      content.style.gap = '30px';
      content.style.flex = '1';
      
      // Option tiles container
      const tilesContainer = document.createElement('div');
      tilesContainer.style.display = 'flex';
      tilesContainer.style.gap = '40px';
      tilesContainer.style.justifyContent = 'center';
      tilesContainer.style.alignItems = 'stretch';
      
      // Custom Deck option
      const deckTile = this.createOptionTile(
        'Custom Deck',
        '🃏',
        'Create your own deck with existing cards',
        '#3b82f6',
        () => {
          if (this.callbacks.onDeckBuilder) {
            this.callbacks.onDeckBuilder();
          }
        }
      );
      
      // Custom Card option
      const cardTile = this.createOptionTile(
        'Custom Card',
        '✨',
        'Create your own unique cards',
        '#8b5cf6',
        () => {
          if (this.callbacks.onCardBuilder) {
            this.callbacks.onCardBuilder();
          }
        }
      );
      
      tilesContainer.appendChild(deckTile);
      tilesContainer.appendChild(cardTile);
      content.appendChild(tilesContainer);
      
      wrapper.appendChild(content);
      this.container.appendChild(wrapper);
    }
    
    createOptionTile(title, icon, description, color, onClick) {
      const tile = document.createElement('div');
      tile.style.backgroundColor = '#1e293b';
      tile.style.borderRadius = '12px';
      tile.style.padding = '30px';
      tile.style.width = '250px';
      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.alignItems = 'center';
      tile.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      tile.style.cursor = 'pointer';
      tile.style.transition = 'transform 0.2s, box-shadow 0.2s';
      tile.style.position = 'relative';
      tile.style.overflow = 'hidden';
      
      // Hover effect
      tile.addEventListener('mouseenter', () => {
        tile.style.transform = 'translateY(-5px)';
        tile.style.boxShadow = `0 10px 25px rgba(0, 0, 0, 0.2), 0 0 30px ${color}33`;
      });
      
      tile.addEventListener('mouseleave', () => {
        tile.style.transform = 'translateY(0)';
        tile.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      });
      
      // Click event
      tile.addEventListener('click', onClick);
      
      // Background gradient
      tile.style.backgroundImage = `radial-gradient(circle at bottom right, ${color}22, transparent 70%)`;
      
      // Icon
      const iconElement = document.createElement('div');
      iconElement.textContent = icon;
      iconElement.style.fontSize = '4rem';
      iconElement.style.marginBottom = '15px';
      
      // Title
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      titleElement.style.fontSize = '1.5rem';
      titleElement.style.fontWeight = 'bold';
      titleElement.style.margin = '0 0 10px 0';
      titleElement.style.color = color;
      
      // Description
      const descElement = document.createElement('p');
      descElement.textContent = description;
      descElement.style.fontSize = '0.9rem';
      descElement.style.margin = '0';
      descElement.style.textAlign = 'center';
      descElement.style.color = '#94a3b8';
      
      tile.appendChild(iconElement);
      tile.appendChild(titleElement);
      tile.appendChild(descElement);
      
      return tile;
    }
  }
  
  export default CustomBuildMenu;