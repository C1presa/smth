// Icon configuration with symbols, colors and tooltips
export const EFFECT_ICON_CONFIG = {
  strike: {
    symbol: '⚡', 
    color: '#FF9500', 
    tooltip: 'Strike: Activates when this unit attacks',
    border: '#B36D00',
    animation: 'lightning-pulse',
    glow: '#FFB800'
  },
  deathstrike: {
    symbol: '☠️', 
    color: '#8C5AF8', 
    tooltip: 'DeathStrike: Activates when this unit defeats another unit',
    border: '#6E32E4',
    animation: 'skull-float',
    glow: '#A78BFA'
  },
  deathblow: {
    symbol: '💥', 
    color: '#E83B3B', 
    tooltip: 'Deathblow: Activates when this unit is defeated',
    border: '#BC2A2A',
    animation: 'explosion-pulse',
    glow: '#F87171'
  },
  taunt: {
    symbol: '🛡️', 
    color: '#FFD700', 
    tooltip: 'Taunt: Enemy units must attack this unit first',
    border: '#E5A800',
    animation: 'shield-pulse',
    glow: '#FCD34D'
  },
  warshout: {
    symbol: '📣', 
    color: '#3ABEFF', 
    tooltip: 'Warshout: Activates when this unit enters the battlefield',
    border: '#0092D9',
    animation: 'sound-wave',
    glow: '#60A5FA'
  },
  default: {
    symbol: '❓', 
    color: '#64748B', 
    tooltip: 'Effect',
    border: '#475569',
    animation: 'fade-pulse',
    glow: '#94A3B8'
  }
};

// Generate HTML for a single effect icon
export function getEffectIconHTML(effectType) {
  const config = EFFECT_ICON_CONFIG[effectType] || EFFECT_ICON_CONFIG.default;
  
  return `
    <div class="effect-icon ${config.animation}" 
         style="background-color:${config.color}; 
                border: 1px solid ${config.border};
                box-shadow: 0 0 8px ${config.glow};" 
         data-tooltip="${config.tooltip}">
      ${config.symbol}
    </div>
  `;
}

// Generate HTML for a container of multiple effects 
export function getEffectContainerHTML(effects) {
  if (!effects || effects.length === 0) {
    return '<div class="no-effects">No effects</div>';
  }
  
  const effectTypes = new Set();
  
  // Extract all unique effect types
  effects.forEach(effect => {
    if (effect && effect.type) {
      effectTypes.add(effect.type.toLowerCase());
    }
  });
  
  if (effectTypes.size === 0) {
    return '<div class="no-effects">No effects</div>';
  }
  
  // Build the HTML for all effect icons
  return `
    <div class="effect-container">
      ${Array.from(effectTypes).map(type => getEffectIconHTML(type)).join('')}
    </div>
  `;
} 