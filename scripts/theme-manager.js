/**
   * Apply custom theme with user CSS
   * @param {string} customCss - Custom CSS string
   * @returns {Promise<void>}
   *//**
* Theme management for Moontab Extreme
* Handles theme switching, CSS injection, and custom CSS
*/

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
      '--shine-color': '160, 170, 185',
      '--shine-opacity': '0.3',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '0, 0, 0',
      '--shine-internal-opacity': '0.06'
    },
    css: `
      /* Shine effect on link cards */
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

      /* Shine effect on groups */
      body.shine-effect-enabled .group::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--group-radius, 6px);
        background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(var(--shine-color), calc(var(--shine-opacity) * 0.5)),
            transparent 40%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      body.shine-effect-enabled .group:hover::before {
        opacity: 1;
      }

      /* Ensure group content appears above shine */
      body.shine-effect-enabled .group > * {
        position: relative;
        z-index: 1;
      }
    `
  },

  dark: {
    name: 'Dark',
    category: 'default',
    description: 'Elegant dark theme',
    supportsShineEffect: true,
    variables: {
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
      '--shine-color': '140, 150, 165',
      '--shine-opacity': '0.4',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.08'
    },
    css: `
      /* Shine effect on link cards */
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

      /* Shine effect on groups */
      body.shine-effect-enabled .group::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--group-radius, 6px);
        background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(var(--shine-color), calc(var(--shine-opacity) * 0.5)),
            transparent 40%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      body.shine-effect-enabled .group:hover::before {
        opacity: 1;
      }

      /* Ensure group content appears above shine */
      body.shine-effect-enabled .group > * {
        position: relative;
        z-index: 1;
      }
    `
  },

  // Modern themes with glass effects
  glassLight: {
    name: 'Glass Light',
    category: 'modern',
    description: 'Glassmorphism with light colors and backdrop blur',
    supportsShineEffect: true,
    variables: {
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
      '--shine-color': '203, 213, 225',
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

      /* Shine effect on link cards */
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

      /* Shine effect on group headers */
      body.shine-effect-enabled .group::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 6px;
        background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(var(--shine-color), calc(var(--shine-opacity) * 0.5)),
            transparent 40%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      body.shine-effect-enabled .group:hover::before {
        opacity: 1;
      }

      /* Ensure group content appears above shine */
      body.shine-effect-enabled .group > * {
        position: relative;
        z-index: 1;
      }
    `
  },

  glassDark: {
    name: 'Glass Dark',
    category: 'modern',
    description: 'Glassmorphism with dark colors and backdrop blur',
    supportsShineEffect: true,
    variables: {
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
      '--shine-color': '148, 163, 184',
      '--shine-opacity': '0.4',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.08'
    },
    css: `
      .column {
        backdrop-filter: blur(12px) saturate(140%);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }

      .link-card {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      @supports not (backdrop-filter: blur(12px)) {
        .column {
          background-color: rgba(35, 35, 35, 0.95);
        }
        .link-card {
          background-color: rgba(26, 26, 26, 0.95);
        }
      }

      /* Shine effect on link cards */
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

      /* Shine effect on group headers */
      body.shine-effect-enabled .group::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 6px;
        background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(var(--shine-color), calc(var(--shine-opacity) * 0.5)),
            transparent 40%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      body.shine-effect-enabled .group:hover::before {
        opacity: 1;
      }

      /* Ensure group content appears above shine */
      body.shine-effect-enabled .group > * {
        position: relative;
        z-index: 1;
      }
    `
  },

  acrylicLight: {
    name: 'Acrylic Light',
    category: 'modern',
    description: 'Glassmorphism with subtle noise texture',
    supportsShineEffect: true,
    variables: {
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
      '--shine-color': '203, 213, 225',
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
        position: relative;
      }

      /* Acrylic noise texture overlay */
      .column::after {
        content: '';
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.12'/%3E%3C/svg%3E") repeat;
        background-size: 100px 100px;
        border-radius: var(--column-radius);
        pointer-events: none;
        z-index: 0;
      }

      /* Ensure content appears above noise */
      .column > * {
        position: relative;
        z-index: 1;
      }

      @supports not (backdrop-filter: blur(12px)) {
        .column {
          background-color: rgba(248, 249, 250, 0.95);
        }
      }

      /* Shine effect on link cards */
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
        z-index: 2;
      }

      body.shine-effect-enabled .link-card:hover::before {
        opacity: 1;
      }

      /* Shine effect on group headers */
      body.shine-effect-enabled .group::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 6px;
        background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(var(--shine-color), calc(var(--shine-opacity) * 0.5)),
            transparent 40%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      body.shine-effect-enabled .group:hover::before {
        opacity: 1;
      }

      /* Ensure group content appears above shine */
      body.shine-effect-enabled .group > * {
        position: relative;
        z-index: 1;
      }
    `
  },

  acrylicDark: {
    name: 'Acrylic Dark',
    category: 'modern',
    description: 'Dark glassmorphism with subtle noise texture',
    supportsShineEffect: true,
    variables: {
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
      '--shine-color': '148, 163, 184',
      '--shine-opacity': '0.5',
      '--shine-size': '400px',
      '--shine-blend-mode': 'normal',
      '--shine-internal': '255, 255, 255',
      '--shine-internal-opacity': '0.08'
    },
    css: `
      .column {
        backdrop-filter: blur(12px) saturate(140%);
        -webkit-backdrop-filter: blur(12px) saturate(140%);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        position: relative;
      }

      .column::after {
        content: '';
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E") repeat;
        background-size: 100px 100px;
        border-radius: var(--column-radius);
        pointer-events: none;
        z-index: 0;
      }

      .column > * {
        position: relative;
        z-index: 1;
      }

      @supports not (backdrop-filter: blur(12px)) {
        .column {
          background-color: rgba(35, 35, 35, 0.95);
        }
      }

      /* Shine effect on link cards */
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
        z-index: 2;
      }

      body.shine-effect-enabled .link-card:hover::before {
        opacity: 1;
      }

      /* Shine effect on group headers */
      body.shine-effect-enabled .group::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 6px;
        background: radial-gradient(var(--shine-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(var(--shine-color), calc(var(--shine-opacity) * 0.5)),
            transparent 40%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      body.shine-effect-enabled .group:hover::before {
        opacity: 1;
      }

      /* Ensure group content appears above shine */
      body.shine-effect-enabled .group > * {
        position: relative;
        z-index: 1;
      }
    `
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

    const css = `:root {\n${cssVariables}\n}`;
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