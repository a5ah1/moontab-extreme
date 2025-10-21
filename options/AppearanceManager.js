/**
 * Appearance Manager - Moontab Extreme Options
 * Coordinates all appearance-related managers (themes, CSS, backgrounds, animations)
 */

class AppearanceManager {
  constructor(data, uiManager, markDirty) {
    this.data = data;
    this.uiManager = uiManager;
    this.markDirty = markDirty;

    // Initialize CSS editor manager first (needed by theme selector callback)
    this.cssEditorManager = new CSSEditorManager(data, uiManager, markDirty);

    // Initialize theme selector with callback to handle custom theme editor
    this.themeSelector = new ThemeSelector(data, markDirty, (themeMode, selectedPreset) => {
      this.onThemeChanged(themeMode, selectedPreset);
    });

    this.backgroundManager = new BackgroundManager(data, uiManager, markDirty);
    this.animationManager = new AnimationManager(data, markDirty);
    this.displayScaleManager = new DisplayScaleManager(data, markDirty);
  }

  /**
   * Setup appearance panel (themes, CSS, background, animations, display scale)
   */
  setupAppearancePanel() {
    // Setup all sub-managers
    this.themeSelector.setup();
    this.cssEditorManager.setup();
    this.backgroundManager.setup();
    this.animationManager.setup();
    this.displayScaleManager.setup();
  }

  /**
   * Handle theme changes
   * @param {string} themeMode - New theme mode (browser/preset/custom)
   * @param {string} selectedPreset - Selected preset theme (if preset mode)
   */
  onThemeChanged(themeMode, selectedPreset) {
    // Initialize custom CSS editor when switching to custom theme mode
    if (themeMode === 'custom' && !this.cssEditorManager.getEditor('custom')) {
      setTimeout(() => this.cssEditorManager.initializeCustomEditor(), 100);
    }
  }

  /**
   * Initialize CSS editor when switching to appearance panel
   * @param {string} panelId - Panel ID
   */
  onPanelSwitch(panelId) {
    // Initialize custom CSS editor if switching to appearance panel
    if (panelId === 'appearance') {
      const currentThemeMode = this.themeSelector.getCurrentThemeMode();

      // Initialize custom CSS editor if custom theme mode is selected
      if (currentThemeMode === 'custom' && !this.cssEditorManager.getEditor('custom')) {
        setTimeout(() => this.cssEditorManager.initializeCustomEditor(), 100);
      }
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.cssEditorManager.cleanup();
  }
}
