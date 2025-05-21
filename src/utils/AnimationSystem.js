class AnimationSystem {
  constructor(game) {
    this.game = game;
    this.animationQueue = [];
    this.isPlaying = false;
  }
  
  queueAnimation(type, params) {
    this.animationQueue.push({ type, params });
    
    if (!this.isPlaying) {
      this.playNextAnimation();
    }
  }
  
  playNextAnimation() {
    if (this.animationQueue.length === 0) {
      this.isPlaying = false;
      return;
    }
    
    this.isPlaying = true;
    const animation = this.animationQueue.shift();
    
    switch (animation.type) {
      case 'attack':
        this.playAttackAnimation(animation.params);
        break;
      case 'deathstrike':
        this.playDeathstrikeAnimation(animation.params);
        break;
      case 'card-play':
        this.playCardPlayAnimation(animation.params);
        break;
      case 'warshout':
        this.playWarshoutAnimation(animation.params);
        break;
      case 'deathblow':
        this.playDeathblowAnimation(animation.params);
        break;
      case 'taunt':
        this.playTauntAnimation(animation.params);
        break;
      default:
        console.warn('Unknown animation type:', animation.type);
        this.playNextAnimation();
    }
  }
  
  playAttackAnimation({ sourceUnit, targetUnit }) {
    const sourceElement = document.querySelector(`[data-unit-id="${sourceUnit.id}"]`);
    const targetElement = document.querySelector(`[data-unit-id="${targetUnit.id}"]`);
    
    if (!sourceElement || !targetElement) {
      this.playNextAnimation();
      return;
    }
    
    // Create attack effect
    const effect = document.createElement('div');
    effect.className = 'attack-effect';
    document.body.appendChild(effect);
    
    // Position at source
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    effect.style.left = `${sourceRect.left + sourceRect.width/2}px`;
    effect.style.top = `${sourceRect.top + sourceRect.height/2}px`;
    
    // Animate to target
    requestAnimationFrame(() => {
      effect.style.transition = 'all 0.3s ease-out';
      effect.style.left = `${targetRect.left + targetRect.width/2}px`;
      effect.style.top = `${targetRect.top + targetRect.height/2}px`;
      effect.style.transform = 'scale(1.5)';
      effect.style.opacity = '0.8';
      
      // Play impact animation
      setTimeout(() => {
        const impact = document.createElement('div');
        impact.className = 'attack-impact';
        impact.style.left = effect.style.left;
        impact.style.top = effect.style.top;
        document.body.appendChild(impact);
        
        // Remove elements after animation
        setTimeout(() => {
          effect.remove();
          impact.remove();
          this.playNextAnimation();
        }, 500);
      }, 300);
    });
  }
  
  playDeathstrikeAnimation({ sourceUnit, targetUnit }) {
    const sourceElement = document.querySelector(`[data-unit-id="${sourceUnit.id}"]`);
    const targetElement = document.querySelector(`[data-unit-id="${targetUnit.id}"]`);
    
    if (!sourceElement || !targetElement) {
      this.playNextAnimation();
      return;
    }
    
    // Create skull animation
    const skull = document.createElement('div');
    skull.className = 'deathstrike-skull';
    skull.textContent = '☠️';
    document.body.appendChild(skull);
    
    // Position at source
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    skull.style.left = `${sourceRect.left + sourceRect.width/2}px`;
    skull.style.top = `${sourceRect.top + sourceRect.height/2}px`;
    
    // Animate to target
    requestAnimationFrame(() => {
      skull.style.transition = 'all 0.5s ease-out';
      skull.style.left = `${targetRect.left + targetRect.width/2}px`;
      skull.style.top = `${targetRect.top + targetRect.height/2}px`;
      skull.style.transform = 'scale(1.5)';
      skull.style.opacity = '0.8';
      
      // Play impact animation
      setTimeout(() => {
        const impact = document.createElement('div');
        impact.className = 'deathstrike-impact';
        impact.style.left = skull.style.left;
        impact.style.top = skull.style.top;
        document.body.appendChild(impact);
        
        // Remove elements after animation
        setTimeout(() => {
          skull.remove();
          impact.remove();
          this.playNextAnimation();
        }, 500);
      }, 500);
    });
  }
  
  playCardPlayAnimation({ card, targetTile }) {
    const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
    const tileElement = document.querySelector(`[data-row="${targetTile.row}"][data-col="${targetTile.col}"]`);
    
    if (!cardElement || !tileElement) {
      this.playNextAnimation();
      return;
    }
    
    // Create card play effect
    const effect = document.createElement('div');
    effect.className = 'card-play-effect';
    document.body.appendChild(effect);
    
    // Position at card
    const cardRect = cardElement.getBoundingClientRect();
    const tileRect = tileElement.getBoundingClientRect();
    
    effect.style.left = `${cardRect.left}px`;
    effect.style.top = `${cardRect.top}px`;
    effect.style.width = `${cardRect.width}px`;
    effect.style.height = `${cardRect.height}px`;
    
    // Animate to tile
    requestAnimationFrame(() => {
      effect.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      effect.style.left = `${tileRect.left}px`;
      effect.style.top = `${tileRect.top}px`;
      effect.style.width = `${tileRect.width}px`;
      effect.style.height = `${tileRect.height}px`;
      effect.style.transform = 'scale(1.1)';
      effect.style.opacity = '0.8';
      
      // Play impact animation
      setTimeout(() => {
        const impact = document.createElement('div');
        impact.className = 'card-play-impact';
        impact.style.left = effect.style.left;
        impact.style.top = effect.style.top;
        document.body.appendChild(impact);
        
        // Remove elements after animation
        setTimeout(() => {
          effect.remove();
          impact.remove();
          this.playNextAnimation();
        }, 500);
      }, 500);
    });
  }
  
  playWarshoutAnimation({ unit }) {
    const unitElement = document.querySelector(`[data-unit-id="${unit.id}"]`);
    
    if (!unitElement) {
      this.playNextAnimation();
      return;
    }
    
    // Create warshout effect
    const effect = document.createElement('div');
    effect.className = 'warshout-effect';
    document.body.appendChild(effect);
    
    // Position at unit
    const unitRect = unitElement.getBoundingClientRect();
    
    effect.style.left = `${unitRect.left + unitRect.width/2}px`;
    effect.style.top = `${unitRect.top + unitRect.height/2}px`;
    
    // Animate expanding rings
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'warshout-ring';
      ring.style.animationDelay = `${i * 0.2}s`;
      effect.appendChild(ring);
    }
    
    // Remove after animation
    setTimeout(() => {
      effect.remove();
      this.playNextAnimation();
    }, 1000);
  }
  
  playDeathblowAnimation({ unit }) {
    const unitElement = document.querySelector(`[data-unit-id="${unit.id}"]`);
    
    if (!unitElement) {
      this.playNextAnimation();
      return;
    }
    
    // Create deathblow effect
    const effect = document.createElement('div');
    effect.className = 'deathblow-effect';
    document.body.appendChild(effect);
    
    // Position at unit
    const unitRect = unitElement.getBoundingClientRect();
    
    effect.style.left = `${unitRect.left + unitRect.width/2}px`;
    effect.style.top = `${unitRect.top + unitRect.height/2}px`;
    
    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'deathblow-particle';
      particle.style.setProperty('--angle', `${(i * 30)}deg`);
      effect.appendChild(particle);
    }
    
    // Remove after animation
    setTimeout(() => {
      effect.remove();
      this.playNextAnimation();
    }, 1000);
  }
  
  playTauntAnimation({ unit }) {
    const unitElement = document.querySelector(`[data-unit-id="${unit.id}"]`);
    
    if (!unitElement) {
      this.playNextAnimation();
      return;
    }
    
    // Create taunt effect
    const effect = document.createElement('div');
    effect.className = 'taunt-effect';
    document.body.appendChild(effect);
    
    // Position at unit
    const unitRect = unitElement.getBoundingClientRect();
    
    effect.style.left = `${unitRect.left + unitRect.width/2}px`;
    effect.style.top = `${unitRect.top + unitRect.height/2}px`;
    
    // Create shield effect
    const shield = document.createElement('div');
    shield.className = 'taunt-shield';
    shield.textContent = '🛡️';
    effect.appendChild(shield);
    
    // Remove after animation
    setTimeout(() => {
      effect.remove();
      this.playNextAnimation();
    }, 1000);
  }
}

export default AnimationSystem; 