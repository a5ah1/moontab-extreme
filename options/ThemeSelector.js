/**
 * Theme Selector - Moontab Extreme Options
 * Handles theme selection and theme-specific CSS section visibility
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
    const themeInputs = document.querySelectorAll('input[name="theme"]');

    // Set current theme
    themeInputs.forEach(input => {
      input.checked = input.value === this.data.theme;
    });

    // Handle theme changes
    themeInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          this.updateTheme(input.value);
        }
      });
    });

    // Show/hide appropriate CSS sections
    this.updateThemeSectionVisibility();
  }

  /**
   * Update theme
   * @param {string} theme - Theme name
   */
  updateTheme(theme) {
    try {
      this.data.theme = theme;
      this.updateThemeSectionVisibility();
      this.markDirty();

      // Notify callback of theme change
      if (this.onThemeChange) {
        this.onThemeChange(theme);
      }

    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  }

  /**
   * Update theme CSS sections visibility based on selected theme
   */
  updateThemeSectionVisibility() {
    const sections = {
      'light-theme-css-section': this.data.theme === 'light',
      'dark-theme-css-section': this.data.theme === 'dark',
      'browser-theme-css-section': this.data.theme === 'browser',
      'custom-css-section': this.data.theme === 'custom'
    };

    Object.entries(sections).forEach(([sectionId, isVisible]) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.toggle('hidden', !isVisible);
      }
    });
  }

  /**
   * Get current theme
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.data.theme;
  }
}
