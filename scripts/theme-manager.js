/**
   * Apply custom theme with user CSS
   * @param {string} customCss - Custom CSS string
   * @returns {Promise<void>}
   *//**
* Theme management for Link Stacker
* Handles theme switching, CSS injection, and custom CSS
*/

/**
 * Built-in theme definitions using CSS custom properties
 */
const THEMES = {
  light: {
    '--link-item-bg-color': '#ffffff',
    '--link-item-bg-hover-color': '#f8f9fa',
    '--column-bg-color': '#f8f9fa',
    '--text-primary': '#212529',
    '--text-secondary': '#6c757d',
    '--text-muted': '#adb5bd',
    '--link-item-border-color': '#dee2e6',
    '--column-border-color': '#dee2e6',
    '--divider-border-color': '#dee2e6',
    '--shadow': 'rgba(0, 0, 0, 0.1)',
    '--shadow-hover': 'rgba(0, 0, 0, 0.15)',
    '--accent-color': '#0d6efd',
    '--accent-hover-color': '#0b5ed7',
    '--scrollbar-thumb-color': '#ced4da',
    '--scrollbar-track-color': '#f8f9fa',
    '--link-item-radius': '6px',
    '--column-radius': '8px',
    '--divider-radius': '0px',
    '--base-font-size': '16px'
  },

  dark: {
    '--link-item-bg-color': '#1a1a1a',
    '--link-item-bg-hover-color': '#2d2d2d',
    '--column-bg-color': '#2d2d2d',
    '--text-primary': '#ffffff',
    '--text-secondary': '#b3b3b3',
    '--text-muted': '#666666',
    '--link-item-border-color': '#404040',
    '--column-border-color': '#404040',
    '--divider-border-color': '#404040',
    '--shadow': 'rgba(0, 0, 0, 0.3)',
    '--shadow-hover': 'rgba(0, 0, 0, 0.4)',
    '--accent-color': '#4dabf7',
    '--accent-hover-color': '#339af0',
    '--scrollbar-thumb-color': '#555555',
    '--scrollbar-track-color': '#2d2d2d',
    '--link-item-radius': '6px',
    '--column-radius': '8px',
    '--divider-radius': '0px',
    '--base-font-size': '16px'
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
   * @param {string} theme - Initial theme ('light', 'dark', 'browser', 'custom')
   * @param {string} customCss - Custom CSS (if theme is 'custom')
   * @param {Object} themeData - Theme-specific CSS data
   * @returns {Promise<void>}
   */
  async init(theme = 'browser', customCss = '', themeData = {}) {
    this.currentTheme = theme;
    this.themeData = themeData;

    // Create theme style element
    this.createThemeStyleElement();

    // Apply theme
    if (theme === 'custom') {
      await this.applyCustomTheme(customCss);
    } else if (theme === 'browser') {
      await this.applyBrowserTheme();
    } else {
      await this.applyBuiltinTheme(theme);
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
   * Apply a built-in theme
   * @param {string} themeName - Theme name ('light' or 'dark')
   * @returns {Promise<void>}
   */
  async applyBuiltinTheme(themeName) {
    // Prevent theme application in options page context
    if (this.isOptionsPageContext()) {
      console.warn('Theme manager: Prevented built-in theme application in options page context');
      return;
    }

    const theme = THEMES[themeName];
    if (!theme) {
      console.error(`Unknown theme: ${themeName}`);
      return;
    }

    this.currentTheme = themeName;

    // Ensure theme style element exists
    if (!this.themeStyleElement) {
      this.createThemeStyleElement();
    }

    // Generate CSS variables
    const cssVariables = Object.entries(theme)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    const css = `:root {\n${cssVariables}\n}`;

    // Apply to theme style element
    this.themeStyleElement.textContent = css;

    // Remove custom CSS if present
    this.removeCustomCSS();

    // Apply user theme CSS if enabled
    if (this.themeData) {
      const userCss = this.themeData[`${themeName}Css`];
      const enabled = this.themeData[`${themeName}CssEnabled`];
      
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
    document.body.classList.add(`theme-${themeName}`);
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

    // Apply the system theme variables
    const theme = THEMES[systemTheme];
    const cssVariables = Object.entries(theme)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    const css = `:root {\n${cssVariables}\n}`;
    this.themeStyleElement.textContent = css;

    // Remove custom CSS if present
    this.removeCustomCSS();

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
   * Get available theme names
   * @returns {Array<string>} Available theme names
   */
  getAvailableThemes() {
    return Object.keys(THEMES);
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
    const baseTheme = THEMES[this.currentTheme] || THEMES.light;
    const baseVariables = Object.entries(baseTheme)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

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
 * @param {Object} settings - Theme settings
 * @returns {Promise<ThemeManager>} Theme manager instance
 */
async function initializeTheming(settings = {}) {
  const manager = getThemeManager();
  
  // Extract theme-specific CSS data
  const themeData = {
    lightCss: settings.lightCss || '',
    lightCssEnabled: settings.lightCssEnabled || false,
    darkCss: settings.darkCss || '',
    darkCssEnabled: settings.darkCssEnabled || false,
    browserCss: settings.browserCss || '',
    browserCssEnabled: settings.browserCssEnabled || false
  };
  
  await manager.init(settings.theme, settings.customCss, themeData);

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
    THEMES,
    getThemeManager,
    initializeTheming
  };
}