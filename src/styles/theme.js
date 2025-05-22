// Theme configuration for consistent visual styling
export const CURVE_THEME = {
  colors: {
    nether: {
      primary: '#a21caf',
      secondary: '#2d133b',
      highlight: 'rgba(162, 28, 175, 0.4)',
      gradient: 'linear-gradient(135deg, #a21caf 0%, #4a044e 100%)',
      light: '#d946ef',
      dark: '#4a044e',
      muted: '#86198f',
      accent: '#f0abfc'
    },
    swamp: {
      primary: '#16a34a',
      secondary: '#163a16',
      highlight: 'rgba(22, 163, 74, 0.4)',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #052e16 100%)',
      light: '#22c55e',
      dark: '#052e16',
      muted: '#15803d',
      accent: '#86efac'
    },
    elderwood: {
      primary: '#22d3ee',
      secondary: '#164e63',
      highlight: 'rgba(34, 211, 238, 0.4)',
      gradient: 'linear-gradient(135deg, #22d3ee 0%, #164e63 100%)',
      light: '#67e8f9',
      dark: '#083344',
      muted: '#0891b2',
      accent: '#a5f3fc'
    },
    racetrack: {
      primary: '#f59e0b',
      secondary: '#78350f',
      highlight: 'rgba(245, 158, 11, 0.4)',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
      light: '#fbbf24',
      dark: '#451a03',
      muted: '#b45309',
      accent: '#fcd34d'
    },
    neutral: {
      primary: '#64748b',
      secondary: '#1e293b',
      highlight: 'rgba(100, 116, 139, 0.4)',
      gradient: 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)',
      light: '#94a3b8',
      dark: '#0f172a',
      muted: '#475569',
      accent: '#cbd5e1'
    }
  },
  
  effects: {
    strike: {
      color: '#FF9500',
      border: '#B36D00',
      icon: '⚡',
      animation: 'strikeEffect 0.5s ease-out',
      particleCount: 5,
      scale: 1.2,
      glow: '0 0 15px #FF9500',
      sound: 'strike.mp3'
    },
    deathstrike: {
      color: '#8C5AF8',
      border: '#6B46C1',
      icon: '☠️',
      animation: 'deathstrikeEffect 0.8s ease-out',
      particleCount: 8,
      scale: 1.5,
      glow: '0 0 20px #8C5AF8',
      sound: 'deathstrike.mp3'
    },
    deathblow: {
      color: '#E83B3B',
      border: '#B91C1C',
      icon: '💥',
      animation: 'deathblowEffect 0.6s ease-out',
      particleCount: 12,
      scale: 1.8,
      glow: '0 0 25px #E83B3B',
      sound: 'deathblow.mp3'
    },
    taunt: {
      color: '#FFD700',
      border: '#B8860B',
      icon: '🛡️',
      animation: 'tauntEffect 0.4s ease-out',
      particleCount: 6,
      scale: 1.3,
      glow: '0 0 15px #FFD700',
      sound: 'taunt.mp3'
    },
    warshout: {
      color: '#3ABEFF',
      border: '#2563EB',
      icon: '📣',
      animation: 'warshoutEffect 0.7s ease-out',
      particleCount: 10,
      scale: 1.4,
      glow: '0 0 18px #3ABEFF',
      sound: 'warshout.mp3'
    }
  },
  
  ui: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      panel: '#232840',
      overlay: 'rgba(15, 23, 42, 0.8)',
      modal: '#1e293b'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      accent: '#e2e8f0',
      muted: '#64748b',
      error: '#ef4444',
      success: '#22c55e'
    },
    border: {
      color: '#334155',
      radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px'
      }
    },
    shadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
      md: '0 4px 8px rgba(0, 0, 0, 0.4)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
      xl: '0 12px 24px rgba(0, 0, 0, 0.6)',
      inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
    }
  },
  
  animation: {
    timing: {
      fastest: '0.1s',
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
      slowest: '0.8s'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },
  
  spacing: {
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    '2xl': '64px',
    '3xl': '96px'
  },
  
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      accent: 'Cinzel, serif',
      mono: 'JetBrains Mono, monospace'
    },
    fontSize: {
      xxs: '0.625rem',
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      thin: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900'
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      normal: '1.5',
      loose: '2'
    }
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500
  },
  
  transitions: {
    default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
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

// Helper function to get border radius
export function getBorderRadius(size = 'md') {
  return CURVE_THEME.ui.border.radius[size];
}

// Helper function to get shadow
export function getShadow(size = 'md') {
  return CURVE_THEME.ui.shadow[size];
}

// Helper function to get z-index
export function getZIndex(layer) {
  return CURVE_THEME.zIndex[layer];
}

// Helper function to get transition preset
export function getTransition(type = 'default') {
  return CURVE_THEME.transitions[type];
}

// Helper function to get responsive value based on breakpoint
export function getResponsiveValue(values, currentWidth) {
  const breakpoints = Object.entries(CURVE_THEME.breakpoints)
    .map(([key, value]) => ({ key, value: parseInt(value) }))
    .sort((a, b) => b.value - a.value);

  for (const { key } of breakpoints) {
    if (currentWidth >= parseInt(CURVE_THEME.breakpoints[key]) && values[key]) {
      return values[key];
    }
  }
  
  return values.default || values.sm || values;
}

// Helper function to get font styles
export function getFontStyle(size = 'md', weight = 'normal', family = 'primary') {
  return {
    fontSize: CURVE_THEME.typography.fontSize[size],
    fontWeight: CURVE_THEME.typography.fontWeight[weight],
    fontFamily: CURVE_THEME.typography.fontFamily[family]
  };
} 