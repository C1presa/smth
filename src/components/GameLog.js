// GameLog.js - Simple implementation that matches the updated UI
class GameLog {
  constructor(container) {
    this.container = container;
    this.entries = [];
    this.render();
  }
  
  render() {
    this.container.innerHTML = '';
    
    // Game log header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '10px 15px';
    header.style.borderBottom = '1px solid #334155';
    
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.fontSize = '1rem';
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.gap = '8px';
    
    const logIcon = document.createElement('span');
    logIcon.textContent = '📜';
    logIcon.style.fontSize = '1.1rem';
    
    const titleText = document.createElement('span');
    titleText.textContent = 'Game Log';
    
    title.appendChild(logIcon);
    title.appendChild(titleText);
    
    // Clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.fontSize = '0.8rem';
    clearButton.style.padding = '4px 8px';
    clearButton.style.backgroundColor = '#334155';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.transition = 'background-color 0.2s ease';
    
    clearButton.addEventListener('mouseenter', () => {
      clearButton.style.backgroundColor = '#475569';
    });
    
    clearButton.addEventListener('mouseleave', () => {
      clearButton.style.backgroundColor = '#334155';
    });
    
    clearButton.addEventListener('click', () => {
      this.clearEntries();
    });
    
    header.appendChild(title);
    header.appendChild(clearButton);
    
    // Log content container
    const content = document.createElement('div');
    content.style.padding = '10px';
    content.style.height = 'calc(100% - 50px)';
    content.style.overflowY = 'auto';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '5px';
    
    // Add entries
    this.entries.forEach(entry => {
      const entryElement = this.createEntryElement(entry);
      content.appendChild(entryElement);
    });
    
    // Add elements to container
    this.container.appendChild(header);
    this.container.appendChild(content);
    
    // Store reference to content for easier updates
    this.logContent = content;
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  createEntryElement(entry) {
    const { text, timestamp, type, player } = entry;
    
    const entryElement = document.createElement('div');
    entryElement.style.padding = '6px 8px';
    entryElement.style.borderRadius = '4px';
    entryElement.style.fontSize = '0.85rem';
    entryElement.style.lineHeight = '1.4';
    entryElement.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
    
    // Apply different styling based on entry type
    if (type === 'system') {
      entryElement.style.borderLeft = '3px solid #64748b';
    } else if (type === 'phase') {
      entryElement.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
      entryElement.style.fontWeight = 'bold';
      
      if (player === 1) {
        entryElement.style.borderLeft = '3px solid #ef4444';
      } else {
        entryElement.style.borderLeft = '3px solid #3b82f6';
      }
    } else if (player === 1) {
      entryElement.style.borderLeft = '3px solid #ef4444';
    } else if (player === 2) {
      entryElement.style.borderLeft = '3px solid #3b82f6';
    }
    
    // Time stamp (if provided)
    if (timestamp) {
      const timeText = document.createElement('span');
      timeText.style.color = '#94a3b8';
      timeText.style.fontSize = '0.75rem';
      timeText.style.marginRight = '6px';
      timeText.textContent = timestamp;
      entryElement.appendChild(timeText);
    }
    
    // Log message
    const messageText = document.createElement('span');
    messageText.textContent = text;
    entryElement.appendChild(messageText);
    
    return entryElement;
  }
  
  // Add new log entry
  addEntry(text, player = null, type = 'default') {
    // Create timestamp (HH:MM:SS format)
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    // Create entry object
    const entry = {
      text,
      timestamp,
      type,
      player
    };
    
    // Add entry to list
    this.entries.push(entry);
    
    // If log is already rendered, add the new entry to the content
    if (this.logContent) {
      const entryElement = this.createEntryElement(entry);
      this.logContent.appendChild(entryElement);
      this.scrollToBottom();
    }
    
    // Limit number of entries to prevent performance issues
    if (this.entries.length > 100) {
      this.entries.shift();
      if (this.logContent && this.logContent.firstChild) {
        this.logContent.removeChild(this.logContent.firstChild);
      }
    }
  }
  
  // Log a phase change
  logPhase(phase, playerId) {
    let phaseText = '';
    let isAutomated = false;
    
    switch (phase) {
      case 'draw':
        phaseText = 'Draw Phase';
        isAutomated = true;
        break;
      case 'advance':
        phaseText = 'Advance Phase';
        isAutomated = true;
        break;
      case 'play':
        phaseText = 'Play Phase';
        break;
      case 'battle':
        phaseText = 'Battle Phase';
        break;
      case 'end':
        phaseText = 'End Phase';
        break;
      default:
        phaseText = phase;
    }
    
    const playerName = playerId === 1 ? 'Player 1' : 'Player 2';
    const automatedText = isAutomated ? ' (Automated)' : '';
    this.addEntry(`${playerName}'s ${phaseText}${automatedText}`, playerId, 'phase');
  }
  
  // Clear all entries
  clearEntries() {
    this.entries = [];
    if (this.logContent) {
      this.logContent.innerHTML = '';
    }
  }
  
  // Scroll to the bottom of the log
  scrollToBottom() {
    if (this.logContent) {
      this.logContent.scrollTop = this.logContent.scrollHeight;
    }
  }
}

export default GameLog;