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
