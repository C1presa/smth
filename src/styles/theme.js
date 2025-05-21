// Theme configuration for consistent visual styling
export const CURVE_THEME = {
  colors: {
    nether: {
      primary: '#a21caf',
      secondary: '#2d133b',
      highlight: 'rgba(162, 28, 175, 0.4)',
      gradient: 'linear-gradient(135deg, #a21caf 0%, #4a044e 100%)'
    },
    swamp: {
      primary: '#16a34a',
      secondary: '#163a16',
      highlight: 'rgba(22, 163, 74, 0.4)',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #052e16 100%)'
    },
    elderwood: {
      primary: '#22d3ee',
      secondary: '#164e63',
      highlight: 'rgba(34, 211, 238, 0.4)',
      gradient: 'linear-gradient(135deg, #22d3ee 0%, #164e63 100%)'
    },
    racetrack: {
      primary: '#f59e0b',
      secondary: '#78350f',
      highlight: 'rgba(245, 158, 11, 0.4)',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)'
    },
    neutral: {
      primary: '#64748b',
      secondary: '#1e293b',
      highlight: 'rgba(100, 116, 139, 0.4)',
      gradient: 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)'
    }
  },
  
  effects: {
    strike: {
      color: '#FF9500',
      border: '#B36D00',
      icon: '⚡',
      animation: 'strikeEffect 0.5s ease-out'
    },
    deathstrike: {
      color: '#8C5AF8',
      border: '#6B46C1',
      icon: '☠️',
      animation: 'deathstrikeEffect 0.8s ease-out'
    },
    deathblow: {
      color: '#E83B3B',
      border: '#B91C1C',
      icon: '💥',
      animation: 'deathblowEffect 0.6s ease-out'
    },
    taunt: {
      color: '#FFD700',
      border: '#B8860B',
      icon: '🛡️',
      animation: 'tauntEffect 0.4s ease-out'
    },
    warshout: {
      color: '#3ABEFF',
      border: '#2563EB',
      icon: '📣',
      animation: 'warshoutEffect 0.7s ease-out'
    }
  },
  
  ui: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      panel: '#232840'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      accent: '#e2e8f0'
    },
    border: {
      color: '#334155',
      radius: '8px'
    },
    shadow: {
      small: '0 2px 4px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.4)',
      large: '0 8px 16px rgba(0, 0, 0, 0.5)'
    }
  },
  
  animation: {
    timing: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      accent: 'Cinzel, serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '700'
    }
  }
};

// Helper function to get theme color
export function getThemeColor(archetype, type = 'primary') {
  return CURVE_THEME.colors[archetype.toLowerCase()]?.[type] || CURVE_THEME.colors.neutral[type];
}

// Helper function to get effect style
export function getEffectStyle(effectType) {
  return CURVE_THEME.effects[effectType.toLowerCase()] || CURVE_THEME.effects.strike;
}

// Helper function to get animation timing
export function getAnimationTiming(type = 'normal') {
  return CURVE_THEME.animation.timing[type];
}

// Helper function to get spacing
export function getSpacing(size = 'md') {
  return CURVE_THEME.spacing[size];
} 