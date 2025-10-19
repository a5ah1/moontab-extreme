/**
 * Appearance Manager - Moontab Extreme Options
 * Coordinates all appearance-related managers (themes, CSS, backgrounds, animations)
 */

class AppearanceManager {
  constructor(data, uiManager, markDirty) {
    this.data = data;
    this.uiManager = uiManager;
    this.markDirty = markDirty;

    // Initialize sub-managers
    this.themeSelector = new ThemeSelector(data, markDirty);
    this.cssEditorManager = new CSSEditorManager(data, uiManager, markDirty);
    this.backgroundManager = new BackgroundManager(data, uiManager, markDirty);
    this.animationManager = new AnimationManager(data, markDirty);
  }

  /**
   * Setup appearance panel (themes, CSS, background, animations)
   */
  setupAppearancePanel() {
    // Setup all sub-managers
    this.themeSelector.setup();
    this.cssEditorManager.setup();
    this.backgroundManager.setup();
    this.animationManager.setup();
  }

  /**
   * Initialize CSS editor when switching to appearance panel
   * @param {string} panelId - Panel ID
   */
  onPanelSwitch(panelId) {
    // Initialize custom CSS editor if switching to appearance panel
    if (panelId === 'appearance') {
      const currentTheme = this.themeSelector.getCurrentTheme();

      // Initialize custom CSS editor if custom theme is selected
      if (currentTheme === 'custom' && !this.cssEditorManager.getEditor('custom')) {
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
