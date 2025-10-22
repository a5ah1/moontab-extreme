/**
 * Theme Selector - Moontab Extreme Options
 * Handles theme mode selection, preset theme dropdown, and theme-specific CSS section visibility
 *
 * Uses THEME_CONFIG for centralized theme configuration
 */

class ThemeSelector {
  constructor(data, markDirty, onThemeChange = null) {
    this.data = data;
    this.markDirty = markDirty;
    this.onThemeChange = onThemeChange;
  }

  /**
   * Setup theme selector controls
   */
  setup() {
    // Setup theme mode radio buttons
    const themeModeInputs = document.querySelectorAll('input[name="themeMode"]');

    // Set current theme mode
    themeModeInputs.forEach(input => {
      input.checked = input.value === this.data.themeMode;
    });

    // Handle theme mode changes
    themeModeInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          this.updateThemeMode(input.value);
        }
      });
    });

    // Setup preset theme dropdown
    const presetThemeSelect = document.getElementById('preset-theme-select');
    if (presetThemeSelect) {
      presetThemeSelect.value = this.data.selectedPresetTheme || 'light';

      presetThemeSelect.addEventListener('change', () => {
        this.updatePresetTheme(presetThemeSelect.value);
      });
    }

    // Update browser theme current indicator
    this.updateBrowserThemeCurrent();

    // Update theme description
    this.updateThemeDescription();

    // Show/hide appropriate sections
    this.updateSectionVisibility();
  }

  /**
   * Update theme mode (browser/preset/custom)
   * @param {string} themeMode - Theme mode
   */
  updateThemeMode(themeMode) {
    try {
      this.data.themeMode = themeMode;
      this.updateSectionVisibility();
      this.updateBrowserThemeCurrent();
      this.updateThemeDescription();
      this.markDirty();

      // Notify callback of theme change
      if (this.onThemeChange) {
        this.onThemeChange(themeMode, this.data.selectedPresetTheme);
      }

    } catch (error) {
      console.error('Failed to update theme mode:', error);
    }
  }

  /**
   * Update selected preset theme
   * @param {string} presetTheme - Preset theme name
   */
  updatePresetTheme(presetTheme) {
    try {
      this.data.selectedPresetTheme = presetTheme;
      this.updateSectionVisibility();
      this.updateThemeDescription();
      this.markDirty();

      // Notify callback of theme change
      if (this.onThemeChange) {
        this.onThemeChange(this.data.themeMode, presetTheme);
      }

    } catch (error) {
      console.error('Failed to update preset theme:', error);
    }
  }

  /**
   * Update section visibility based on theme mode and selected preset theme
   */
  updateSectionVisibility() {
    const themeMode = this.data.themeMode;
    const selectedPreset = this.data.selectedPresetTheme || 'light';

    // Show/hide preset theme section
    const presetSection = document.getElementById('preset-theme-section');
    if (presetSection) {
      presetSection.classList.toggle('hidden', themeMode !== 'preset');
    }

    // Show/hide custom CSS section
    const customSection = document.getElementById('custom-css-section');
    if (customSection) {
      customSection.classList.toggle('hidden', themeMode !== 'custom');
    }

    // Show/hide theme-specific CSS sections (dynamically generated)
    if (!window.THEME_CONFIG) return;

    THEME_CONFIG.getCustomizableThemes().forEach(theme => {
      const section = document.getElementById(`${theme.id}-theme-css-section`);
      if (!section) return;

      // Determine visibility based on theme mode
      let isVisible = false;
      if (theme.mode === 'browser') {
        // Browser theme is visible when themeMode is 'browser'
        isVisible = themeMode === 'browser';
      } else if (theme.mode === 'preset') {
        // Preset themes are visible when themeMode is 'preset' AND it's the selected theme
        isVisible = themeMode === 'preset' && selectedPreset === theme.key;
      }

      section.classList.toggle('hidden', !isVisible);
    });
  }

  /**
   * Update browser theme current indicator
   */
  updateBrowserThemeCurrent() {
    const browserCurrentEl = document.getElementById('browser-theme-current');
    if (browserCurrentEl) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const currentTheme = prefersDark ? 'Dark' : 'Light';
      browserCurrentEl.textContent = `Currently using: ${currentTheme}`;
    }
  }

  /**
   * Update theme description
   */
  updateThemeDescription() {
    const descriptionEl = document.getElementById('theme-description');
    if (!descriptionEl) return;

    const themeMode = this.data.themeMode;

    if (themeMode === 'preset' && window.THEME_CONFIG) {
      const selectedPreset = this.data.selectedPresetTheme || 'light';
      const theme = THEME_CONFIG.getThemeByKey(selectedPreset);
      if (theme) {
        descriptionEl.textContent = theme.description;
      }
    } else {
      descriptionEl.textContent = '';
    }
  }

  /**
   * Get current theme mode
   * @returns {string} Current theme mode
   */
  getCurrentThemeMode() {
    return this.data.themeMode;
  }

  /**
   * Get current preset theme (for compatibility)
   * @returns {string} Current theme identifier
   */
  getCurrentTheme() {
    // For backward compatibility with callbacks
    if (this.data.themeMode === 'custom') {
      return 'custom';
    } else if (this.data.themeMode === 'browser') {
      return 'browser';
    } else {
      return this.data.selectedPresetTheme || 'light';
    }
  }
}
