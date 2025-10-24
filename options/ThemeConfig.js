/**
 * Theme Configuration - Moontab Extreme
 * Single source of truth for all theme metadata
 *
 * This configuration derives from PRESET_THEMES in theme-manager.js
 * to eliminate duplication and ensure consistency.
 *
 * This centralized configuration is used by:
 * - CSSEditorManager: To generate theme-specific CSS editor sections
 * - ThemeSelector: To manage theme selection and visibility
 * - AppearanceManager: To coordinate theme-related functionality
 */

/**
 * Convert camelCase to kebab-case
 * @param {string} str - String in camelCase
 * @returns {string} String in kebab-case
 */
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const THEME_CONFIG = {
  /**
   * Preset themes available in the extension
   * Auto-generated from PRESET_THEMES in theme-manager.js
   *
   * Each theme includes:
   * - id: HTML element ID prefix (kebab-case)
   * - key: Data storage key (camelCase)
   * - name: Display name
   * - description: User-facing description
   * - mode: Theme mode this belongs to ('preset' or 'browser')
   * - category: Theme category for organization
   */
  get presetThemes() {
    // Derive from PRESET_THEMES if available, otherwise return empty array
    if (typeof window === 'undefined' || !window.PRESET_THEMES) {
      console.warn('PRESET_THEMES not yet loaded');
      return [];
    }

    return Object.entries(window.PRESET_THEMES).map(([key, theme]) => ({
      id: camelToKebab(key),
      key: key,
      name: theme.name,
      description: theme.description,
      mode: 'preset',
      category: theme.category
    }));
  },

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
