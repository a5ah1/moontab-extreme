/**
 * Theme Configuration - Moontab Extreme
 * Single source of truth for all theme metadata
 *
 * This centralized configuration is used by:
 * - CSSEditorManager: To generate theme-specific CSS editor sections
 * - ThemeSelector: To manage theme selection and visibility
 * - AppearanceManager: To coordinate theme-related functionality
 */

const THEME_CONFIG = {
  /**
   * Preset themes available in the extension
   *
   * Each theme requires:
   * - id: HTML element ID prefix (kebab-case)
   * - key: Data storage key (camelCase)
   * - name: Display name
   * - description: User-facing description
   * - mode: Theme mode this belongs to ('preset' or 'browser')
   */
  presetThemes: [
    {
      id: 'light',
      key: 'light',
      name: 'Light',
      description: 'Clean, minimal light theme',
      mode: 'preset'
    },
    {
      id: 'dark',
      key: 'dark',
      name: 'Dark',
      description: 'Elegant dark theme',
      mode: 'preset'
    },
    {
      id: 'glass-light',
      key: 'glassLight',
      name: 'Glass Light',
      description: 'Glassmorphism with light colors and backdrop blur',
      mode: 'preset'
    },
    {
      id: 'glass-dark',
      key: 'glassDark',
      name: 'Glass Dark',
      description: 'Glassmorphism with dark colors and backdrop blur',
      mode: 'preset'
    },
    {
      id: 'acrylic-light',
      key: 'acrylicLight',
      name: 'Acrylic Light',
      description: 'Glassmorphism with subtle noise texture',
      mode: 'preset'
    },
    {
      id: 'acrylic-dark',
      key: 'acrylicDark',
      name: 'Acrylic Dark',
      description: 'Dark glassmorphism with subtle noise texture',
      mode: 'preset'
    },
    {
      id: 'material-light',
      key: 'materialLight',
      name: 'Material Light',
      description: 'Google Material Design 3 light theme with elevation-based shadows',
      mode: 'preset'
    },
    {
      id: 'material-dark',
      key: 'materialDark',
      name: 'Material Dark',
      description: 'Google Material Design 3 dark theme with elevation-based surfaces',
      mode: 'preset'
    },
    {
      id: 'gruvbox-dark',
      key: 'gruvboxDark',
      name: 'Gruvbox Dark',
      description: 'Warm, retro groove color scheme inspired by the iconic Gruvbox theme',
      mode: 'preset'
    },
    {
      id: 'gruvbox-light',
      key: 'gruvboxLight',
      name: 'Gruvbox Light',
      description: 'Warm, retro groove color scheme in light mode',
      mode: 'preset'
    },
    {
      id: 'monokai',
      key: 'monokai',
      name: 'Monokai',
      description: 'Iconic dark theme with vibrant syntax colors',
      mode: 'preset'
    },
    {
      id: 'nord-dark',
      key: 'nordDark',
      name: 'Nord Dark',
      description: 'Arctic, north-bluish clean and elegant dark theme',
      mode: 'preset'
    },
    {
      id: 'nord-light',
      key: 'nordLight',
      name: 'Nord Light',
      description: 'Arctic, north-bluish clean and elegant light theme',
      mode: 'preset'
    },
    {
      id: 'tailwind-slate-light',
      key: 'tailwindSlateLight',
      name: 'Tailwind Slate Light',
      description: 'Tailwind slate colors with glassmorphism effects',
      mode: 'preset'
    },
    {
      id: 'tailwind-slate-dark',
      key: 'tailwindSlateDark',
      name: 'Tailwind Slate Dark',
      description: 'Tailwind slate colors inspired by the demo with glassmorphism',
      mode: 'preset'
    },
    {
      id: 'tailwind-gray-light',
      key: 'tailwindGrayLight',
      name: 'Tailwind Gray Light',
      description: 'Tailwind gray colors with glassmorphism effects',
      mode: 'preset'
    },
    {
      id: 'tailwind-gray-dark',
      key: 'tailwindGrayDark',
      name: 'Tailwind Gray Dark',
      description: 'Tailwind gray colors with glassmorphism',
      mode: 'preset'
    },
    {
      id: 'tailwind-zinc-light',
      key: 'tailwindZincLight',
      name: 'Tailwind Zinc Light',
      description: 'Tailwind zinc colors with glassmorphism effects',
      mode: 'preset'
    },
    {
      id: 'tailwind-zinc-dark',
      key: 'tailwindZincDark',
      name: 'Tailwind Zinc Dark',
      description: 'Tailwind zinc colors with glassmorphism',
      mode: 'preset'
    },
    {
      id: 'tailwind-stone-light',
      key: 'tailwindStoneLight',
      name: 'Tailwind Stone Light',
      description: 'Tailwind stone colors with glassmorphism effects',
      mode: 'preset'
    },
    {
      id: 'tailwind-stone-dark',
      key: 'tailwindStoneDark',
      name: 'Tailwind Stone Dark',
      description: 'Tailwind stone colors with glassmorphism',
      mode: 'preset'
    }
  ],

  /**
   * Browser theme (follows system preference)
   */
  browserTheme: {
    id: 'browser',
    key: 'browser',
    name: 'Browser',
    description: 'Follows system preference (light or dark)',
    mode: 'browser'
  },

  /**
   * Get all themes that support CSS customization
   * Includes all preset themes + browser theme
   * @returns {Array} Array of theme configurations
   */
  getCustomizableThemes() {
    return [...this.presetThemes, this.browserTheme];
  },

  /**
   * Get theme configuration by key
   * @param {string} key - Theme key (camelCase)
   * @returns {Object|null} Theme configuration or null if not found
   */
  getThemeByKey(key) {
    return this.getCustomizableThemes().find(theme => theme.key === key) || null;
  },

  /**
   * Get theme configuration by ID
   * @param {string} id - Theme ID (kebab-case)
   * @returns {Object|null} Theme configuration or null if not found
   */
  getThemeById(id) {
    return this.getCustomizableThemes().find(theme => theme.id === id) || null;
  },

  /**
   * Get all preset themes for dropdown population
   * @returns {Array} Array of preset theme configurations
   */
  getPresetThemes() {
    return this.presetThemes;
  },

  /**
   * Get data storage keys for all themes
   * Used for determining which data fields to save/load
   * @returns {Object} Object with cssEnabled and css keys for each theme
   */
  getDataKeys() {
    const keys = {};
    this.getCustomizableThemes().forEach(theme => {
      keys[`${theme.key}CssEnabled`] = false;
      keys[`${theme.key}Css`] = '';
    });
    return keys;
  }
};

// Make config available globally for options page modules
if (typeof window !== 'undefined') {
  window.THEME_CONFIG = THEME_CONFIG;
}
