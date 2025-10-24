/**
   * Apply custom theme with user CSS
   * @param {string} customCss - Custom CSS string
   * @returns {Promise<void>}
   *//**
* Theme management for Moontab Extreme
* Handles theme switching, CSS injection, and custom CSS
*/

/**
 * Consolidated shine effect CSS
 * Used globally for all themes that support shine effect
 * Includes both surface elements (columns/groups) and link cards
 */
const SHINE_CSS = `
  /* Shine effect on surface elements (columns or groups) */
  body.shine-effect-enabled .shine-surface::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--shine-surface-radius);
    background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(var(--shine-color), calc(var(--shine-opacity) * 0.5)),
        transparent 40%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  body.shine-effect-enabled .shine-surface:hover::before {
    opacity: 1;
  }

  /* Ensure surface content appears above shine */
  body.shine-effect-enabled .shine-surface > * {
    position: relative;
    z-index: 1;
  }

  /* Shine effect on link cards - border glow */
  body.shine-effect-enabled .link-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--link-item-radius);
    padding: 1px;
    background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(var(--shine-color), var(--shine-opacity)),
        transparent 40%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  body.shine-effect-enabled .link-card:hover::before {
    opacity: 1;
  }

  /* Shine effect on link cards - internal glow */
  body.shine-effect-enabled .link-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--link-item-radius);
    background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(var(--shine-internal), var(--shine-internal-opacity)),
        transparent 40%);
    mix-blend-mode: var(--shine-blend-mode);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  body.shine-effect-enabled .link-card:hover::after {
    opacity: 1;
  }
`;

/**
 * Preset theme registry with metadata and styling
 */
const PRESET_THEMES = {
  // Default themes
  light: {
    name: 'Light',
    category: 'default',
    description: 'Clean, minimal light theme',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#ffffff',
      '--link-item-bg-color': '#ffffff',
      '--link-item-bg-hover-color': '#f8f9fa',
      '--column-bg-color': '#f8f9fa',
      '--text-primary': '#212529',
      '--text-secondary': '#6c757d',
      '--text-muted': '#adb5bd',
      '--link-item-border-color': '#dee2e6',
      '--column-border-color': '#dee2e6',
      '--column-bg-hover-color': '#e9ecef',
      '--group-border-color': '#dee2e6',
      '--group-bg-hover-color': '#e9ecef',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
      '--accent-color': '#0d6efd',
      '--accent-hover-color': '#0b5ed7',
      '--scrollbar-thumb-color': '#ced4da',
      '--scrollbar-track-color': '#f8f9fa',
      '--link-item-radius': '6px',
      '--column-radius': '8px',
      // Shine effect variables (for user customization)
      '--shine-color': '172, 172, 172',
      '--shine-opacity': '0.3',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '0, 0, 0',
      '--shine-internal-opacity': '0.06'
    },
    css: SHINE_CSS
  },

  dark: {
    name: 'Dark',
    category: 'default',
    description: 'Elegant dark theme',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#0d0d0d',
      '--link-item-bg-color': '#1a1a1a',
      '--link-item-bg-hover-color': '#3b3b3b',
      '--column-bg-color': '#232323',
      '--text-primary': '#ffffff',
      '--text-secondary': '#b3b3b3',
      '--text-muted': '#666666',
      '--link-item-border-color': '#404040',
      '--column-border-color': '#404040',
      '--column-bg-hover-color': '#2a2a2a',
      '--group-border-color': '#404040',
      '--group-bg-hover-color': '#2a2a2a',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--accent-color': '#4dabf7',
      '--accent-hover-color': '#339af0',
      '--scrollbar-thumb-color': '#555555',
      '--scrollbar-track-color': '#2d2d2d',
      '--link-item-radius': '6px',
      '--column-radius': '8px',
      // Shine effect variables (for user customization)
      '--shine-color': '152, 152, 152',
      '--shine-opacity': '0.4',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.08'
    },
    css: SHINE_CSS
  },

  // Modern themes with glass effects
  glassLight: {
    name: 'Glass Light',
    category: 'modern',
    description: 'Glassmorphism with light colors and backdrop blur',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#e8e8e8',
      '--link-item-bg-color': 'rgba(255, 255, 255, 0.7)',
      '--link-item-bg-hover-color': 'rgba(248, 249, 250, 0.8)',
      '--column-bg-color': 'rgba(248, 249, 250, 0.7)',
      '--text-primary': '#1e293b',
      '--text-secondary': '#64748b',
      '--text-muted': '#94a3b8',
      '--link-item-border-color': 'rgba(226, 232, 240, 0.3)',
      '--column-border-color': 'rgba(226, 232, 240, 0.3)',
      '--column-bg-hover-color': 'rgba(241, 245, 249, 0.8)',
      '--group-border-color': 'rgba(226, 232, 240, 0.3)',
      '--group-bg-hover-color': 'rgba(241, 245, 249, 0.8)',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
      '--accent-color': '#3b82f6',
      '--accent-hover-color': '#2563eb',
      '--scrollbar-thumb-color': '#cbd5e1',
      '--scrollbar-track-color': '#f1f5f9',
      '--link-item-radius': '8px',
      '--column-radius': '12px',
      // Shine effect variables (for user customization)
      '--shine-color': '214, 214, 214',
      '--shine-opacity': '0.3',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '0, 0, 0',
      '--shine-internal-opacity': '0.05'
    },
    css: `
      /* Backdrop blur for glass effect */
      .column {
        backdrop-filter: blur(12px) saturate(140%);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .link-card {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      /* Fallback for browsers without backdrop-filter support */
      @supports not (backdrop-filter: blur(12px)) {
        .column {
          background-color: rgba(248, 249, 250, 0.95);
        }
        .link-card {
          background-color: rgba(255, 255, 255, 0.95);
        }
      }

      ${SHINE_CSS}
    `
  },

  glassDark: {
    name: 'Glass Dark',
    category: 'modern',
    description: 'Glassmorphism with dark colors and backdrop blur',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#0d0d0d',
      '--link-item-bg-color': 'rgba(26, 26, 26, 0.7)',
      '--link-item-bg-hover-color': 'rgba(59, 59, 59, 0.8)',
      '--column-bg-color': 'rgba(35, 35, 35, 0.7)',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--link-item-border-color': 'rgba(71, 85, 105, 0.3)',
      '--column-border-color': 'rgba(71, 85, 105, 0.3)',
      '--column-bg-hover-color': 'rgba(42, 42, 42, 0.8)',
      '--group-border-color': 'rgba(71, 85, 105, 0.3)',
      '--group-bg-hover-color': 'rgba(42, 42, 42, 0.8)',
      '--shadow': 'rgba(0, 0, 0, 0.4)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.5)',
      '--accent-color': '#60a5fa',
      '--accent-hover-color': '#3b82f6',
      '--scrollbar-thumb-color': '#555555',
      '--scrollbar-track-color': '#2d2d2d',
      '--link-item-radius': '8px',
      '--column-radius': '12px',
      // Shine effect variables (for user customization)
      '--shine-color': '165, 165, 165',
      '--shine-opacity': '0.4',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.08'
    },
    css: `
      /* Backdrop blur for glass effect */
      .column {
        backdrop-filter: blur(12px) saturate(140%);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }

      .link-card {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      /* Fallback for browsers without backdrop-filter support */
      @supports not (backdrop-filter: blur(12px)) {
        .column {
          background-color: rgba(35, 35, 35, 0.95);
        }
        .link-card {
          background-color: rgba(26, 26, 26, 0.95);
        }
      }

      ${SHINE_CSS}
    `
  },

  acrylicLight: {
    name: 'Acrylic Light',
    category: 'modern',
    description: 'Glassmorphism with subtle noise texture',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#e5e5e5',
      '--link-item-bg-color': 'rgba(255, 255, 255, 0.7)',
      '--link-item-bg-hover-color': 'rgba(248, 249, 250, 0.8)',
      '--column-bg-color': 'rgba(248, 249, 250, 0.7)',
      '--text-primary': '#1e293b',
      '--text-secondary': '#64748b',
      '--text-muted': '#94a3b8',
      '--link-item-border-color': 'rgba(226, 232, 240, 0.3)',
      '--column-border-color': 'rgba(226, 232, 240, 0.3)',
      '--column-bg-hover-color': 'rgba(241, 245, 249, 0.8)',
      '--group-border-color': 'rgba(226, 232, 240, 0.3)',
      '--group-bg-hover-color': 'rgba(241, 245, 249, 0.8)',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
      '--accent-color': '#3b82f6',
      '--accent-hover-color': '#2563eb',
      '--scrollbar-thumb-color': '#cbd5e1',
      '--scrollbar-track-color': '#f1f5f9',
      '--link-item-radius': '8px',
      '--column-radius': '12px',
      // Shine effect variables (for user customization)
      '--shine-color': '214, 214, 214',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '0, 0, 0',
      '--shine-internal-opacity': '0.05'
    },
    css: `
      /* Glass effect */
      .column {
        backdrop-filter: blur(12px) saturate(140%);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      /* Position context for acrylic texture pseudo-element */
      .shine-surface {
        position: relative;
      }

      /* Acrylic noise texture overlay - applies to columns or groups based on header visibility */
      .shine-surface::after {
        content: '';
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.12'/%3E%3C/svg%3E") repeat;
        background-size: 100px 100px;
        border-radius: var(--shine-surface-radius);
        pointer-events: none;
        z-index: 0;
      }

      /* Fallback for browsers without backdrop-filter support */
      @supports not (backdrop-filter: blur(12px)) {
        .column {
          background-color: rgba(248, 249, 250, 0.95);
        }
      }

      ${SHINE_CSS}
    `
  },

  acrylicDark: {
    name: 'Acrylic Dark',
    category: 'modern',
    description: 'Dark glassmorphism with subtle noise texture',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#0d0d0d',
      '--link-item-bg-color': 'rgba(26, 26, 26, 0.7)',
      '--link-item-bg-hover-color': 'rgba(59, 59, 59, 0.8)',
      '--column-bg-color': 'rgba(35, 35, 35, 0.7)',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#cbd5e1',
      '--text-muted': '#94a3b8',
      '--link-item-border-color': 'rgba(71, 85, 105, 0.3)',
      '--column-border-color': 'rgba(71, 85, 105, 0.3)',
      '--column-bg-hover-color': 'rgba(42, 42, 42, 0.8)',
      '--group-border-color': 'rgba(71, 85, 105, 0.3)',
      '--group-bg-hover-color': 'rgba(42, 42, 42, 0.8)',
      '--shadow': 'rgba(0, 0, 0, 0.4)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.5)',
      '--accent-color': '#60a5fa',
      '--accent-hover-color': '#3b82f6',
      '--scrollbar-thumb-color': '#555555',
      '--scrollbar-track-color': '#2d2d2d',
      '--link-item-radius': '8px',
      '--column-radius': '12px',
      // Shine effect variables (for user customization)
      '--shine-color': '165, 165, 165',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.08'
    },
    css: `
      /* Glass effect */
      .column {
        backdrop-filter: blur(12px) saturate(140%);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }

      /* Position context for acrylic texture pseudo-element */
      .shine-surface {
        position: relative;
      }

      /* Acrylic noise texture overlay - applies to columns or groups based on header visibility */
      .shine-surface::after {
        content: '';
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E") repeat;
        background-size: 100px 100px;
        border-radius: var(--shine-surface-radius);
        pointer-events: none;
        z-index: 0;
      }

      /* Fallback for browsers without backdrop-filter support */
      @supports not (backdrop-filter: blur(12px)) {
        .column {
          background-color: rgba(35, 35, 35, 0.95);
        }
      }

      ${SHINE_CSS}
    `
  },

  materialLight: {
    name: 'Material Light',
    category: 'modern',
    description: 'Google Material Design 3 light theme with elevation-based shadows',
    supportsShineEffect: false,
    variables: {
      '--page-bg-color': '#f5f5f5',
      '--link-item-bg-color': '#ffffff',
      '--link-item-bg-hover-color': '#fafafa',
      '--column-bg-color': '#fafafa',
      '--text-primary': '#1c1b1d',
      '--text-secondary': '#49454f',
      '--text-muted': '#79747e',
      '--link-item-border-color': 'transparent',
      '--column-border-color': 'transparent',
      '--column-bg-hover-color': '#fafafa',
      '--group-border-color': '#e7e0ec',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.2)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.3)',
      '--accent-color': '#6750a4',
      '--accent-hover-color': '#7965af',
      '--scrollbar-thumb-color': '#79747e',
      '--scrollbar-track-color': '#f5f5f5',
      '--link-item-radius': '12px',
      '--column-radius': '12px',
      // No shine effect for Material Design
      '--shine-color': '0, 0, 0',
      '--shine-opacity': '0',
      '--shine-size': '0px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '0, 0, 0',
      '--shine-internal-opacity': '0'
    },
    css: `
      /* Material Design elevation shadows */
      .column {
        border: none;
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
        overflow: visible;
      }

      /* Prevent shadow clipping in groups */
      .group {
        overflow: visible;
        padding: 4px;
        margin: -4px;
      }

      .link-card {
        border: none;
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 1px 2px 0px rgba(0, 0, 0, 0.15);
        transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .link-card:hover {
        box-shadow: 0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
        transform: translateY(-1px);
      }

      /* Subtle dividers for groups */
      .group-header {
        border-bottom: 1px solid #e7e0ec;
      }
    `
  },

  materialDark: {
    name: 'Material Dark',
    category: 'modern',
    description: 'Google Material Design 3 dark theme with elevation-based surfaces',
    supportsShineEffect: false,
    variables: {
      '--page-bg-color': '#121212',
      '--link-item-bg-color': '#2a2a2a',
      '--link-item-bg-hover-color': '#303030',
      '--column-bg-color': '#1d1d1d',
      '--text-primary': '#e6e1e5',
      '--text-secondary': '#cac4d0',
      '--text-muted': '#938f99',
      '--link-item-border-color': 'transparent',
      '--column-border-color': 'transparent',
      '--column-bg-hover-color': '#1d1d1d',
      '--group-border-color': '#3b3b3b',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.4)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.5)',
      '--accent-color': '#d0bcff',
      '--accent-hover-color': '#e0d5ff',
      '--scrollbar-thumb-color': '#938f99',
      '--scrollbar-track-color': '#121212',
      '--link-item-radius': '12px',
      '--column-radius': '12px',
      // No shine effect for Material Design
      '--shine-color': '0, 0, 0',
      '--shine-opacity': '0',
      '--shine-size': '0px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '0, 0, 0',
      '--shine-internal-opacity': '0'
    },
    css: `
      /* Material Design elevation shadows for dark theme */
      .column {
        border: none;
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.4), 0px 1px 2px 0px rgba(0, 0, 0, 0.25);
        overflow: visible;
      }

      /* Prevent shadow clipping in groups */
      .group {
        overflow: visible;
        padding: 4px;
        margin: -4px;
      }

      .link-card {
        border: none;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
        transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .link-card:hover {
        box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.6), 0px 2px 4px 0px rgba(0, 0, 0, 0.4);
        transform: translateY(-1px);
      }

      /* Subtle dividers for groups */
      .group-header {
        border-bottom: 1px solid #3b3b3b;
      }
    `
  },

  // Classic color schemes
  gruvboxDark: {
    name: 'Gruvbox Dark',
    category: 'classic',
    description: 'Warm, retro groove color scheme inspired by the iconic Gruvbox theme',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#282828',
      '--link-item-bg-color': '#3c3836',
      '--link-item-bg-hover-color': '#504945',
      '--column-bg-color': '#32302f',
      '--text-primary': '#ebdbb2',
      '--text-secondary': '#bdae93',
      '--text-muted': '#928374',
      '--link-item-border-color': '#504945',
      '--column-border-color': '#504945',
      '--column-bg-hover-color': '#32302f',
      '--group-border-color': '#504945',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.5)',
      '--accent-color': '#8ec07c',
      '--accent-hover-color': '#b8bb26',
      '--scrollbar-thumb-color': '#665c54',
      '--scrollbar-track-color': '#32302f',
      '--link-item-radius': '6px',
      '--column-radius': '8px',
      // Shine effect variables (warm tones for gruvbox aesthetic)
      '--shine-color': '194, 154, 135',
      '--shine-opacity': '0.4',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '143, 120, 110',
      '--shine-internal-opacity': '0.12'
    },
    css: SHINE_CSS
  },

  gruvboxLight: {
    name: 'Gruvbox Light',
    category: 'classic',
    description: 'Warm, retro groove color scheme in light mode',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#fbf1c7',
      '--link-item-bg-color': '#f2e5bc',
      '--link-item-bg-hover-color': '#ebdbb2',
      '--column-bg-color': '#f9f5d7',
      '--text-primary': '#3c3836',
      '--text-secondary': '#665c54',
      '--text-muted': '#928374',
      '--link-item-border-color': '#d5c4a1',
      '--column-border-color': '#d5c4a1',
      '--column-bg-hover-color': '#f9f5d7',
      '--group-border-color': '#d5c4a1',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.1)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
      '--accent-color': '#427b58',
      '--accent-hover-color': '#79740e',
      '--scrollbar-thumb-color': '#bdae93',
      '--scrollbar-track-color': '#f9f5d7',
      '--link-item-radius': '6px',
      '--column-radius': '8px',
      // Shine effect variables (warm tones for gruvbox aesthetic)
      '--shine-color': '181, 118, 20',
      '--shine-opacity': '0.3',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '121, 116, 14',
      '--shine-internal-opacity': '0.08'
    },
    css: SHINE_CSS
  },

  monokai: {
    name: 'Monokai',
    category: 'classic',
    description: 'Iconic dark theme with vibrant syntax colors',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#21252b',
      '--link-item-bg-color': '#2F333D',
      '--link-item-bg-hover-color': '#383E4A',
      '--column-bg-color': '#282c34',
      '--text-primary': '#abb2bf',
      '--text-secondary': '#9da5b4',
      '--text-muted': '#676f7d',
      '--link-item-border-color': '#383E4A',
      '--column-border-color': '#383E4A',
      '--column-bg-hover-color': '#2F333D',
      '--group-border-color': '#383E4A',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--accent-color': '#528bff',
      '--accent-hover-color': '#61afef',
      '--scrollbar-thumb-color': '#4E5666',
      '--scrollbar-track-color': '#21252b',
      '--link-item-radius': '6px',
      '--column-radius': '8px',
      // Shine effect variables (blue accent tones for Monokai aesthetic)
      '--shine-color': '82, 139, 255',
      '--shine-opacity': '0.4',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '97, 175, 239',
      '--shine-internal-opacity': '0.1'
    },
    css: SHINE_CSS
  },

  nordDark: {
    name: 'Nord Dark',
    category: 'classic',
    description: 'Arctic, north-bluish clean and elegant dark theme',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#2e3440',
      '--link-item-bg-color': '#434c5e',
      '--link-item-bg-hover-color': '#4c566a',
      '--column-bg-color': '#3b4252',
      '--text-primary': '#eceff4',
      '--text-secondary': '#e5e9f0',
      '--text-muted': '#d8dee9',
      '--link-item-border-color': '#4c566a',
      '--column-border-color': '#4c566a',
      '--column-bg-hover-color': '#434c5e',
      '--group-border-color': '#4c566a',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--accent-color': '#88c0d0',
      '--accent-hover-color': '#81a1c1',
      '--scrollbar-thumb-color': '#4c566a',
      '--scrollbar-track-color': '#2e3440',
      '--link-item-radius': '6px',
      '--column-radius': '8px',
      // Shine effect variables (frost blue tones for Nord aesthetic)
      '--shine-color': '143, 192, 208',
      '--shine-opacity': '0.4',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '136, 192, 208',
      '--shine-internal-opacity': '0.1'
    },
    css: SHINE_CSS
  },

  nordLight: {
    name: 'Nord Light',
    category: 'classic',
    description: 'Arctic, north-bluish clean and elegant light theme',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#eceff4',
      '--link-item-bg-color': '#d8dee9',
      '--link-item-bg-hover-color': '#c2c9d6',
      '--column-bg-color': '#e5e9f0',
      '--text-primary': '#2e3440',
      '--text-secondary': '#434c5e',
      '--text-muted': '#4c566a',
      '--link-item-border-color': '#c2c9d6',
      '--column-border-color': '#c2c9d6',
      '--column-bg-hover-color': '#d8dee9',
      '--group-border-color': '#c2c9d6',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(46, 52, 64, 0.1)',
      '--shadow-hover': 'rgba(46, 52, 64, 0.15)',
      '--accent-color': '#5e81ac',
      '--accent-hover-color': '#81a1c1',
      '--scrollbar-thumb-color': '#4c566a',
      '--scrollbar-track-color': '#eceff4',
      '--link-item-radius': '6px',
      '--column-radius': '8px',
      // Shine effect variables (frost blue tones for Nord aesthetic)
      '--shine-color': '94, 129, 172',
      '--shine-opacity': '0.35',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '94, 129, 172',
      '--shine-internal-opacity': '0.08'
    },
    css: SHINE_CSS
  },

  // Tailwind color schemes
  tailwindSlateLight: {
    name: 'Tailwind Slate Light',
    category: 'tailwind',
    description: 'Tailwind slate colors with glassmorphism effects',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#f1f5f9',
      '--link-item-bg-color': '#ffffff',
      '--link-item-bg-hover-color': '#e2e8f0',
      '--column-bg-color': '#f8fafc',
      '--text-primary': '#0f172a',
      '--text-secondary': '#334155',
      '--text-muted': '#64748b',
      '--link-item-border-color': '#cbd5e1',
      '--column-border-color': '#e2e8f0',
      '--column-bg-hover-color': '#f8fafc',
      '--group-border-color': '#cbd5e1',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(15, 23, 42, 0.1)',
      '--shadow-hover': 'rgba(15, 23, 42, 0.15)',
      '--accent-color': '#3b82f6',
      '--accent-hover-color': '#2563eb',
      '--scrollbar-thumb-color': '#94a3b8',
      '--scrollbar-track-color': '#f1f5f9',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (slate-400 tones)
      '--shine-color': '148, 163, 184',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '148, 163, 184',
      '--shine-internal-opacity': '0.1'
    },
    css: SHINE_CSS
  },

  tailwindSlateDark: {
    name: 'Tailwind Slate Dark',
    category: 'tailwind',
    description: 'Tailwind slate colors inspired by the demo with glassmorphism',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#020617',
      '--link-item-bg-color': '#1e293b',
      '--link-item-bg-hover-color': '#334155',
      '--column-bg-color': '#0f172a',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#e2e8f0',
      '--text-muted': '#cbd5e1',
      '--link-item-border-color': '#334155',
      '--column-border-color': '#1e293b',
      '--column-bg-hover-color': '#0f172a',
      '--group-border-color': '#334155',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--accent-color': '#60a5fa',
      '--accent-hover-color': '#3b82f6',
      '--scrollbar-thumb-color': '#475569',
      '--scrollbar-track-color': '#020617',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (slate-400 for border, white for internal glow)
      '--shine-color': '148, 163, 184',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.05'
    },
    css: SHINE_CSS
  },

  tailwindGrayLight: {
    name: 'Tailwind Gray Light',
    category: 'tailwind',
    description: 'Tailwind gray colors with glassmorphism effects',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#f3f4f6',
      '--link-item-bg-color': '#ffffff',
      '--link-item-bg-hover-color': '#e5e7eb',
      '--column-bg-color': '#f9fafb',
      '--text-primary': '#111827',
      '--text-secondary': '#374151',
      '--text-muted': '#6b7280',
      '--link-item-border-color': '#d1d5db',
      '--column-border-color': '#e5e7eb',
      '--column-bg-hover-color': '#f9fafb',
      '--group-border-color': '#d1d5db',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(17, 24, 39, 0.1)',
      '--shadow-hover': 'rgba(17, 24, 39, 0.15)',
      '--accent-color': '#3b82f6',
      '--accent-hover-color': '#2563eb',
      '--scrollbar-thumb-color': '#9ca3af',
      '--scrollbar-track-color': '#f3f4f6',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (gray-400 tones)
      '--shine-color': '156, 163, 175',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '156, 163, 175',
      '--shine-internal-opacity': '0.1'
    },
    css: SHINE_CSS
  },

  tailwindGrayDark: {
    name: 'Tailwind Gray Dark',
    category: 'tailwind',
    description: 'Tailwind gray colors with glassmorphism',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#030712',
      '--link-item-bg-color': '#1f2937',
      '--link-item-bg-hover-color': '#374151',
      '--column-bg-color': '#111827',
      '--text-primary': '#f3f4f6',
      '--text-secondary': '#e5e7eb',
      '--text-muted': '#d1d5db',
      '--link-item-border-color': '#374151',
      '--column-border-color': '#1f2937',
      '--column-bg-hover-color': '#111827',
      '--group-border-color': '#374151',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--accent-color': '#60a5fa',
      '--accent-hover-color': '#3b82f6',
      '--scrollbar-thumb-color': '#4b5563',
      '--scrollbar-track-color': '#030712',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (gray-400 for border, white for internal glow)
      '--shine-color': '156, 163, 175',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.05'
    },
    css: SHINE_CSS
  },

  tailwindZincLight: {
    name: 'Tailwind Zinc Light',
    category: 'tailwind',
    description: 'Tailwind zinc colors with glassmorphism effects',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#f4f4f5',
      '--link-item-bg-color': '#ffffff',
      '--link-item-bg-hover-color': '#e4e4e7',
      '--column-bg-color': '#fafafa',
      '--text-primary': '#18181b',
      '--text-secondary': '#3f3f46',
      '--text-muted': '#71717a',
      '--link-item-border-color': '#d4d4d8',
      '--column-border-color': '#e4e4e7',
      '--column-bg-hover-color': '#fafafa',
      '--group-border-color': '#d4d4d8',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(24, 24, 27, 0.1)',
      '--shadow-hover': 'rgba(24, 24, 27, 0.15)',
      '--accent-color': '#3b82f6',
      '--accent-hover-color': '#2563eb',
      '--scrollbar-thumb-color': '#a1a1aa',
      '--scrollbar-track-color': '#f4f4f5',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (zinc-400 tones)
      '--shine-color': '161, 161, 170',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '161, 161, 170',
      '--shine-internal-opacity': '0.1'
    },
    css: SHINE_CSS
  },

  tailwindZincDark: {
    name: 'Tailwind Zinc Dark',
    category: 'tailwind',
    description: 'Tailwind zinc colors with glassmorphism',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#09090b',
      '--link-item-bg-color': '#27272a',
      '--link-item-bg-hover-color': '#3f3f46',
      '--column-bg-color': '#18181b',
      '--text-primary': '#f4f4f5',
      '--text-secondary': '#e4e4e7',
      '--text-muted': '#d4d4d8',
      '--link-item-border-color': '#3f3f46',
      '--column-border-color': '#27272a',
      '--column-bg-hover-color': '#18181b',
      '--group-border-color': '#3f3f46',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--accent-color': '#60a5fa',
      '--accent-hover-color': '#3b82f6',
      '--scrollbar-thumb-color': '#52525b',
      '--scrollbar-track-color': '#09090b',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (zinc-400 for border, white for internal glow)
      '--shine-color': '161, 161, 170',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.05'
    },
    css: SHINE_CSS
  },

  tailwindStoneLight: {
    name: 'Tailwind Stone Light',
    category: 'tailwind',
    description: 'Tailwind stone colors with glassmorphism effects',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#f5f5f4',
      '--link-item-bg-color': '#ffffff',
      '--link-item-bg-hover-color': '#e7e5e4',
      '--column-bg-color': '#fafaf9',
      '--text-primary': '#1c1917',
      '--text-secondary': '#44403c',
      '--text-muted': '#78716c',
      '--link-item-border-color': '#d6d3d1',
      '--column-border-color': '#e7e5e4',
      '--column-bg-hover-color': '#fafaf9',
      '--group-border-color': '#d6d3d1',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(28, 25, 23, 0.1)',
      '--shadow-hover': 'rgba(28, 25, 23, 0.15)',
      '--accent-color': '#3b82f6',
      '--accent-hover-color': '#2563eb',
      '--scrollbar-thumb-color': '#a8a29e',
      '--scrollbar-track-color': '#f5f5f4',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (stone-400 tones)
      '--shine-color': '168, 162, 158',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '168, 162, 158',
      '--shine-internal-opacity': '0.1'
    },
    css: SHINE_CSS
  },

  tailwindStoneDark: {
    name: 'Tailwind Stone Dark',
    category: 'tailwind',
    description: 'Tailwind stone colors with glassmorphism',
    supportsShineEffect: true,
    variables: {
      '--page-bg-color': '#0c0a09',
      '--link-item-bg-color': '#292524',
      '--link-item-bg-hover-color': '#44403c',
      '--column-bg-color': '#1c1917',
      '--text-primary': '#f5f5f4',
      '--text-secondary': '#e7e5e4',
      '--text-muted': '#d6d3d1',
      '--link-item-border-color': '#44403c',
      '--column-border-color': '#292524',
      '--column-bg-hover-color': '#1c1917',
      '--group-border-color': '#44403c',
      '--group-bg-hover-color': 'transparent',
      '--shadow': 'rgba(0, 0, 0, 0.3)',
      '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
      '--accent-color': '#60a5fa',
      '--accent-hover-color': '#3b82f6',
      '--scrollbar-thumb-color': '#57534e',
      '--scrollbar-track-color': '#0c0a09',
      '--link-item-radius': '3px',
      '--column-radius': '7px',
      // Shine effect variables (stone-400 for border, white for internal glow)
      '--shine-color': '168, 162, 158',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.05'
    },
    css: SHINE_CSS
  }
};

/**
 * Theme Manager Class
 */
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.customCssElement = null;
    this.themeStyleElement = null;
    this.userThemeCssElement = null;
  }

  /**
   * Initialize theme system
   * @param {Object} settings - Complete settings object with theme config
   * @returns {Promise<void>}
   */
  async init(settings = {}) {
    this.themeData = {
      lightCss: settings.lightCss || '',
      lightCssEnabled: settings.lightCssEnabled || false,
      darkCss: settings.darkCss || '',
      darkCssEnabled: settings.darkCssEnabled || false,
      glassLightCss: settings.glassLightCss || '',
      glassLightCssEnabled: settings.glassLightCssEnabled || false,
      glassDarkCss: settings.glassDarkCss || '',
      glassDarkCssEnabled: settings.glassDarkCssEnabled || false,
      acrylicLightCss: settings.acrylicLightCss || '',
      acrylicLightCssEnabled: settings.acrylicLightCssEnabled || false,
      acrylicDarkCss: settings.acrylicDarkCss || '',
      acrylicDarkCssEnabled: settings.acrylicDarkCssEnabled || false,
      browserCss: settings.browserCss || '',
      browserCssEnabled: settings.browserCssEnabled || false
    };

    // Create theme style element
    this.createThemeStyleElement();

    // 1. Apply global scale settings FIRST (before any theme)
    this.applyGlobalScaleSettings(
      settings.baseFontSize || 16,
      settings.uiScale || 1.0
    );

    // 2. Apply theme based on mode
    const themeMode = settings.themeMode || 'preset';
    if (themeMode === 'custom') {
      await this.applyCustomTheme(settings.customCss || '');
    } else if (themeMode === 'browser') {
      await this.applyBrowserTheme();
    } else if (themeMode === 'preset') {
      await this.applyPresetTheme(settings.selectedPresetTheme || 'light');
    } else {
      // Default fallback
      await this.applyPresetTheme('light');
    }

    // Listen for system theme changes
    this.setupSystemThemeListener();
  }

  /**
   * Check if we're in the options page context (should not apply themes)
   * @returns {boolean} True if in options page context
   */
  isOptionsPageContext() {
    return document.body.classList.contains('options-page') ||
      document.title.includes('Settings') ||
      window.location.href.includes('options.html');
  }

  /**
   * Create the theme style element
   */
  createThemeStyleElement() {
    // Prevent theme application in options page context
    if (this.isOptionsPageContext()) {
      console.warn('Theme manager: Prevented theme application in options page context');
      return;
    }

    if (this.themeStyleElement) {
      this.themeStyleElement.remove();
    }

    this.themeStyleElement = document.createElement('style');
    this.themeStyleElement.id = 'theme-variables';
    document.head.appendChild(this.themeStyleElement);
  }

  /**
   * Apply global scale settings (before theme application)
   * @param {number} baseFontSize - Base font size in pixels
   * @param {number} uiScale - UI scale factor
   */
  applyGlobalScaleSettings(baseFontSize, uiScale) {
    const root = document.documentElement;
    root.style.setProperty('--base-font-size', `${baseFontSize}px`);
    root.style.setProperty('--ui-scale', uiScale);
  }

  /**
   * Apply a preset theme
   * @param {string} themeName - Preset theme name
   * @returns {Promise<void>}
   */
  async applyPresetTheme(themeName) {
    // Prevent theme application in options page context
    if (this.isOptionsPageContext()) {
      console.warn('Theme manager: Prevented preset theme application in options page context');
      return;
    }

    const theme = PRESET_THEMES[themeName];
    if (!theme) {
      console.error(`Unknown preset theme: ${themeName}`);
      return;
    }

    this.currentTheme = 'preset';
    this.currentPresetTheme = themeName;

    // Ensure theme style element exists
    if (!this.themeStyleElement) {
      this.createThemeStyleElement();
    }

    // 1. Apply CSS variables
    const cssVariables = Object.entries(theme.variables)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    const variablesCSS = `:root {\n${cssVariables}\n}`;
    this.themeStyleElement.textContent = variablesCSS;

    // 2. Remove custom CSS (from custom mode)
    this.removeCustomCSS();

    // 3. Apply theme-specific CSS (if present)
    this.removePresetThemeCSS();

    if (theme.css) {
      this.presetThemeCssElement = document.createElement('style');
      this.presetThemeCssElement.id = 'preset-theme-css';
      this.presetThemeCssElement.textContent = sanitizeCSS(theme.css);
      document.head.appendChild(this.presetThemeCssElement);
    }

    // 4. Apply user's per-theme custom CSS if enabled
    const userCss = this.themeData[`${themeName}Css`];
    const enabled = this.themeData[`${themeName}CssEnabled`];

    if (enabled && userCss) {
      await this.applyUserThemeCSS(userCss);
    } else {
      this.removeUserThemeCSS();
    }

    // 5. Update body class
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-preset-${themeName}`);
  }

  /**
   * Remove preset theme CSS
   */
  removePresetThemeCSS() {
    if (this.presetThemeCssElement) {
      this.presetThemeCssElement.remove();
      this.presetThemeCssElement = null;
    }
  }

  /**
   * Apply browser theme (follows system preference)
   * @returns {Promise<void>}
   */
  async applyBrowserTheme() {
    // Prevent theme application in options page context
    if (this.isOptionsPageContext()) {
      console.warn('Theme manager: Prevented browser theme application in options page context');
      return;
    }

    this.currentTheme = 'browser';

    // Ensure theme style element exists
    if (!this.themeStyleElement) {
      this.createThemeStyleElement();
    }

    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';

    // Apply the system theme variables from PRESET_THEMES
    const theme = PRESET_THEMES[systemTheme];
    const cssVariables = Object.entries(theme.variables)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    const css = `:root {\n${cssVariables}\n}\n\n${SHINE_CSS}`;
    this.themeStyleElement.textContent = css;

    // Remove custom CSS if present
    this.removeCustomCSS();

    // Remove preset theme CSS (browser uses only variables from default themes)
    this.removePresetThemeCSS();

    // Apply browser theme user CSS if enabled
    if (this.themeData) {
      const userCss = this.themeData.browserCss;
      const enabled = this.themeData.browserCssEnabled;

      if (enabled && userCss) {
        await this.applyUserThemeCSS(userCss);
      } else {
        this.removeUserThemeCSS();
      }
    }

    // Update body class
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add('theme-browser');
  }
  /**
   * Apply custom theme with user CSS
   * @param {string} customCss - Custom CSS string
   * @returns {Promise<void>}
   */
  async applyCustomTheme(customCss) {
    // Prevent theme application in options page context
    if (this.isOptionsPageContext()) {
      console.warn('Theme manager: Prevented custom theme application in options page context');
      return;
    }

    this.currentTheme = 'custom';

    // Ensure theme style element exists
    if (!this.themeStyleElement) {
      this.createThemeStyleElement();
    }

    // Clear any existing theme CSS - use only skeleton foundation
    this.themeStyleElement.textContent = '';

    // Remove preset theme CSS
    this.removePresetThemeCSS();

    // Remove user theme CSS
    this.removeUserThemeCSS();

    // Remove custom CSS if present
    this.removeCustomCSS();

    // Apply custom CSS
    await this.applyCustomCSS(customCss);

    // Update body class
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add('theme-custom');
  }


  /**
   * Apply custom CSS
   * @param {string} css - CSS string to apply
   * @returns {Promise<void>}
   */
  async applyCustomCSS(css) {
    // Remove existing custom CSS
    this.removeCustomCSS();

    if (!css || css.trim() === '') return;

    // Sanitize CSS
    const sanitizedCSS = sanitizeCSS(css);

    // Create and apply custom CSS element
    this.customCssElement = document.createElement('style');
    this.customCssElement.id = 'custom-theme-css';
    this.customCssElement.textContent = sanitizedCSS;
    document.head.appendChild(this.customCssElement);
  }

  /**
   * Remove custom CSS
   */
  removeCustomCSS() {
    if (this.customCssElement) {
      this.customCssElement.remove();
      this.customCssElement = null;
    }
  }

  /**
   * Apply user theme CSS
   * @param {string} css - CSS string to apply
   * @returns {Promise<void>}
   */
  async applyUserThemeCSS(css) {
    // Remove existing user theme CSS
    this.removeUserThemeCSS();

    if (!css || css.trim() === '') return;

    // Sanitize CSS
    const sanitizedCSS = sanitizeCSS(css);

    // Create and apply user theme CSS element
    this.userThemeCssElement = document.createElement('style');
    this.userThemeCssElement.id = 'user-theme-css';
    this.userThemeCssElement.textContent = sanitizedCSS;
    document.head.appendChild(this.userThemeCssElement);
  }

  /**
   * Remove user theme CSS
   */
  removeUserThemeCSS() {
    if (this.userThemeCssElement) {
      this.userThemeCssElement.remove();
      this.userThemeCssElement = null;
    }
  }

  /**
   * Update theme data and re-apply current theme
   * @param {Object} themeData - New theme data
   * @returns {Promise<void>}
   */
  async updateThemeData(themeData) {
    this.themeData = themeData;

    // Re-apply current theme to pick up new CSS
    if (this.currentTheme === 'custom') {
      // Don't re-apply custom theme here, it's handled separately
      return;
    } else if (this.currentTheme === 'browser') {
      await this.applyBrowserTheme();
    } else {
      await this.applyBuiltinTheme(this.currentTheme);
    }
  }

  /**
   * Get current theme name
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get available preset theme names
   * @returns {Array<string>} Available preset theme names
   */
  getAvailableThemes() {
    return Object.keys(PRESET_THEMES);
  }

  /**
   * Get preset theme metadata
   * @param {string} themeName - Theme name
   * @returns {Object|null} Theme metadata
   */
  getPresetThemeMetadata(themeName) {
    const theme = PRESET_THEMES[themeName];
    if (!theme) return null;

    return {
      name: theme.name,
      category: theme.category,
      description: theme.description,
      supportsRevealHighlight: theme.supportsRevealHighlight
    };
  }

  /**
   * Get all preset themes grouped by category
   * @returns {Object} Themes grouped by category
   */
  getPresetThemesByCategory() {
    const byCategory = {};

    Object.entries(PRESET_THEMES).forEach(([key, theme]) => {
      if (!byCategory[theme.category]) {
        byCategory[theme.category] = [];
      }
      byCategory[theme.category].push({
        key,
        ...theme
      });
    });

    return byCategory;
  }

  /**
   * Setup system theme preference listener
   */
  setupSystemThemeListener() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user has browser theme selected
      if (this.currentTheme === 'browser') {
        this.applyBrowserTheme();
      }
    };

    // Modern browsers
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      darkModeQuery.addListener(handleSystemThemeChange);
    }
  }

  /**
   * Apply background image and settings
   * @param {string|null} dataUri - Background image data URI
   * @param {Object} settings - Background settings
   */
  applyBackground(dataUri, settings = {}) {
    const root = document.documentElement;

    if (dataUri) {
      // Validate background image URI for security
      if (!isValidImageDataUri(dataUri)) {
        console.warn('Invalid background image URI');
        return;
      }

      // Apply background image and all related properties
      root.style.setProperty('--bg-image', `url(${dataUri})`);
      root.style.setProperty('--bg-size', settings.backgroundSize || 'cover');
      root.style.setProperty('--bg-repeat', settings.backgroundRepeat || 'no-repeat');
      root.style.setProperty('--bg-position', settings.backgroundPosition || 'center');
    } else {
      // No background image - remove all background-related properties
      root.style.removeProperty('--bg-image');
      root.style.removeProperty('--bg-size');
      root.style.removeProperty('--bg-repeat');
      root.style.removeProperty('--bg-position');
    }
  }

  /**
   * Apply page background color independently of theme
   * @param {string|null} color - Background color or null to remove
   */
  applyPageBackgroundColor(color) {
    const root = document.documentElement;

    if (color) {
      root.style.setProperty('--page-bg-color', color);
    } else {
      root.style.removeProperty('--page-bg-color');
    }
  }

  /**
   * Generate CSS for live preview
   * @param {string} css - CSS to preview
   * @returns {string} Complete CSS for preview
   */
  generatePreviewCSS(css) {
    // Get current theme variables as base
    let baseVariables = '';

    if (this.currentTheme === 'preset' && this.currentPresetTheme) {
      const theme = PRESET_THEMES[this.currentPresetTheme];
      if (theme) {
        baseVariables = Object.entries(theme.variables)
          .map(([property, value]) => `  ${property}: ${value};`)
          .join('\n');
      }
    } else if (this.currentTheme === 'browser') {
      // Use system preference for preview
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = PRESET_THEMES[prefersDark ? 'dark' : 'light'];
      baseVariables = Object.entries(systemTheme.variables)
        .map(([property, value]) => `  ${property}: ${value};`)
        .join('\n');
    } else {
      // Default to light theme
      const lightTheme = PRESET_THEMES.light;
      baseVariables = Object.entries(lightTheme.variables)
        .map(([property, value]) => `  ${property}: ${value};`)
        .join('\n');
    }

    const sanitizedCustomCSS = sanitizeCSS(css);

    return `
      :root {
      ${baseVariables}
      }

      ${sanitizedCustomCSS}
    `;
  }

  /**
   * Create a blob URL for CSS (alternative injection method)
   * @param {string} css - CSS string
   * @returns {string} Blob URL
   */
  createCSSBlob(css) {
    const blob = new Blob([css], { type: 'text/css' });
    return URL.createObjectURL(blob);
  }

  /**
   * Apply CSS via blob URL (alternative method)
   * @param {string} css - CSS string
   * @returns {HTMLLinkElement} Link element
   */
  applyCSSBlob(css) {
    const blobUrl = this.createCSSBlob(css);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = blobUrl;
    link.className = 'blob-css';
    document.head.appendChild(link);
    return link;
  }

  /**
   * Clean up blob URLs to prevent memory leaks
   */
  cleanupBlobCSS() {
    const blobLinks = document.querySelectorAll('link.blob-css');
    blobLinks.forEach(link => {
      URL.revokeObjectURL(link.href);
      link.remove();
    });
  }

  /**
   * Destroy theme manager and clean up
   */
  destroy() {
    this.removeCustomCSS();
    this.removeUserThemeCSS();
    this.removePresetThemeCSS();
    this.cleanupBlobCSS();

    if (this.themeStyleElement) {
      this.themeStyleElement.remove();
      this.themeStyleElement = null;
    }
  }
}

/**
 * Singleton instance
 */
let themeManagerInstance = null;

/**
 * Get or create theme manager instance
 * @returns {ThemeManager} Theme manager instance
 */
function getThemeManager() {
  if (!themeManagerInstance) {
    themeManagerInstance = new ThemeManager();
  }
  return themeManagerInstance;
}

/**
 * Initialize theming system
 * @param {Object} settings - Complete settings object
 * @returns {Promise<ThemeManager>} Theme manager instance
 */
async function initializeTheming(settings = {}) {
  const manager = getThemeManager();

  // Initialize with full settings object
  await manager.init(settings);

  // Apply background with settings if present
  if (settings.backgroundDataUri) {
    manager.applyBackground(settings.backgroundDataUri, {
      backgroundSize: settings.backgroundSize,
      backgroundRepeat: settings.backgroundRepeat,
      backgroundPosition: settings.backgroundPosition
    });
  }

  // Apply page background color independently (after background image)
  if (settings.pageBackgroundColor) {
    manager.applyPageBackgroundColor(settings.pageBackgroundColor);
  }

  return manager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeManager,
    PRESET_THEMES,
    getThemeManager,
    initializeTheming
  };
}