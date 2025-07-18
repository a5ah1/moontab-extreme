/**
 * Options Page - Link Stacker
 * Main controller that coordinates all manager components
 */

class OptionsApp {
  constructor() {
    this.data = null;
    this.themeManager = null;
    this.currentPanel = 'content';
    this.templates = {};
    this.isDirty = false;
    this.autoSaveTimeout = null;

    // Initialize managers
    this.uiManager = null;
    this.linkProcessor = null;
    this.dataManager = null;
    this.appearanceManager = null;
    this.contentManager = null;
    this.helpManager = null;

    this.init();
  }

  /**
   * Initialize the options app
   */
  async init() {
    try {
      // Load templates
      this.loadTemplates();

      // Load data from storage
      this.data = await StorageManager.load();

      // Initialize theme manager only for preview functionality
      this.themeManager = getThemeManager();

      // Initialize managers
      this.initializeManagers();

      // Setup navigation
      this.setupNavigation();

      // Setup panels through managers
      this.contentManager.setupContentPanel();
      this.appearanceManager.setupAppearancePanel();
      this.setupGeneralPanel();
      this.helpManager.setupHelpPanel();

      // Setup header actions
      this.setupHeaderActions();

      // Update storage info
      this.dataManager.updateStorageInfo();

      // Mark as clean
      this.markClean();

    } catch (error) {
      console.error('Failed to initialize options page:', error);
      this.uiManager.showError('Failed to load settings. Please refresh the page.');
    }
  }

  /**
   * Load HTML templates
   */
  loadTemplates() {
    this.templates.columnOptions = document.getElementById('column-options-template');
    this.templates.linkOptions = document.getElementById('link-options-template');
    this.templates.dividerOptions = document.getElementById('divider-options-template');
    this.templates.previewModal = document.getElementById('preview-modal-template');
    this.templates.confirmModal = document.getElementById('confirm-modal-template');
    this.templates.importBackupModal = document.getElementById('import-backup-modal-template');
    this.templates.importResultModal = document.getElementById('import-result-modal-template');
  }

  /**
   * Initialize all manager components
   */
  initializeManagers() {
    // Initialize UIManager first (no dependencies)
    this.uiManager = new UIManager(this.templates);

    // Initialize LinkProcessor (depends on UIManager)
    this.linkProcessor = new LinkProcessor(this.uiManager);

    // Initialize DataManager (depends on UIManager)
    this.dataManager = new DataManager(this.data, this.uiManager);

    // Initialize AppearanceManager (depends on UIManager, needs markDirty callback)
    this.appearanceManager = new AppearanceManager(this.data, this.uiManager, this.markDirty.bind(this));

    // Initialize ContentManager (depends on all previous managers)
    this.contentManager = new ContentManager(
      this.data, 
      this.templates, 
      this.uiManager, 
      this.linkProcessor, 
      this.markDirty.bind(this)
    );

    // Initialize HelpManager (depends on UIManager only)
    this.helpManager = new HelpManager(this.uiManager);
  }

  /**
   * Setup navigation between panels
   */
  setupNavigation() {
    const tabLinks = document.querySelectorAll('.tab-link');

    tabLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const panelId = link.dataset.panel;
        this.switchPanel(panelId);
      });
    });

    // Setup hash navigation
    this.setupHashNavigation();
  }

  /**
   * Setup hash navigation
   */
  setupHashNavigation() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    // Handle initial hash on page load
    this.handleHashChange();
  }

  /**
   * Handle hash change for navigation
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1); // Remove #
    const validPanels = ['content', 'appearance', 'general', 'help'];
    
    // Default to 'content' if no hash or invalid hash
    const panelId = validPanels.includes(hash) ? hash : 'content';
    
    // Update URL if needed (for default case)
    if (!hash || !validPanels.includes(hash)) {
      window.history.replaceState(null, '', '#content');
    }
    
    this.switchPanel(panelId, false);
  }

  /**
   * Switch to a different panel
   * @param {string} panelId - Panel ID to switch to
   * @param {boolean} updateHash - Whether to update the URL hash (default: true)
   */
  switchPanel(panelId, updateHash = true) {
    // Update navigation
    document.querySelectorAll('.tab-link').forEach(link => {
      link.classList.toggle('active', link.dataset.panel === panelId);
    });

    // Update panels
    document.querySelectorAll('.panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${panelId}-panel`);
    });

    this.currentPanel = panelId;

    // Update URL hash if requested
    if (updateHash) {
      window.history.pushState(null, '', `#${panelId}`);
    }

    // Notify managers about panel switch
    this.appearanceManager.onPanelSwitch(panelId);
    this.helpManager.onPanelSwitch(panelId);
  }

  /**
   * Setup general panel (settings, data management)
   */
  setupGeneralPanel() {
    // Icon visibility setting
    const showIconsToggle = document.getElementById('show-icons-setting');
    showIconsToggle.checked = this.data.showIcons !== undefined ? this.data.showIcons : true;

    showIconsToggle.addEventListener('change', () => {
      this.updateIconVisibility(showIconsToggle.checked);
    });

    // URL visibility setting
    const showUrlsToggle = document.getElementById('show-urls-setting');
    showUrlsToggle.checked = this.data.showUrls !== undefined ? this.data.showUrls : true;

    showUrlsToggle.addEventListener('change', () => {
      this.updateUrlVisibility(showUrlsToggle.checked);
    });

    // Column headers visibility setting
    const showColumnHeadersToggle = document.getElementById('show-column-headers-setting');
    showColumnHeadersToggle.checked = this.data.showColumnHeaders !== undefined ? this.data.showColumnHeaders : true;

    showColumnHeadersToggle.addEventListener('change', () => {
      this.updateColumnHeaderVisibility(showColumnHeadersToggle.checked);
    });

    // Data management
    this.dataManager.setupDataManagement();
  }

  /**
   * Setup header actions
   */
  setupHeaderActions() {
    const openNewTabBtn = document.getElementById('open-new-tab-btn');

    openNewTabBtn.addEventListener('click', () => {
      this.openNewTab();
    });

    // Setup auto-save
    this.setupAutoSave();
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    // No need to override markDirty - it will naturally call the auto-save through markDirty()
    // Auto-save is triggered by the markDirty method below
  }

  /**
   * Update icon visibility
   * @param {boolean} showIcons - Whether to show icons
   */
  updateIconVisibility(showIcons) {
    this.data.showIcons = showIcons;
    this.markDirty();
  }

  /**
   * Update URL visibility
   * @param {boolean} showUrls - Whether to show URLs
   */
  updateUrlVisibility(showUrls) {
    this.data.showUrls = showUrls;
    this.markDirty();
  }

  /**
   * Update column header visibility
   * @param {boolean} showColumnHeaders - Whether to show column headers
   */
  updateColumnHeaderVisibility(showColumnHeaders) {
    this.data.showColumnHeaders = showColumnHeaders;
    this.markDirty();
  }

  /**
   * Open new tab with current (saved) settings
   */
  openNewTab() {
    chrome.tabs.create({ url: 'newtab.html' });
  }

  /**
   * Save all changes
   */
  async saveAll() {
    try {
      await StorageManager.save(this.data);
      this.markClean();
      this.dataManager.updateStorageInfo();

      // Save success is now handled by the auto-save system
      // showSavedStatus() will be called by the auto-save mechanism

    } catch (error) {
      console.error('Failed to save data:', error);
      this.uiManager.showError('Failed to save changes. Please try again.');
    }
  }

  /**
   * Save content (columns and links) only
   */
  async saveContent() {
    try {
      // Only save columns and links data
      const contentData = {
        columns: this.data.columns,
        version: this.data.version
      };
      
      // Update storage with current content while preserving other settings
      const currentData = await StorageManager.load();
      const updatedData = { ...currentData, ...contentData };
      
      await StorageManager.save(updatedData);
      this.markClean();
      this.dataManager.updateStorageInfo();

    } catch (error) {
      console.error('Failed to save content:', error);
      this.uiManager.showError('Failed to save content. Please try again.');
    }
  }

  /**
   * Save appearance settings only
   */
  async saveAppearance() {
    try {
      // Only save appearance-related data
      const appearanceData = {
        theme: this.data.theme,
        customCss: this.data.customCss,
        pageBackgroundColor: this.data.pageBackgroundColor,
        backgroundDataUri: this.data.backgroundDataUri,
        // Theme-specific CSS fields
        lightCss: this.data.lightCss,
        lightCssEnabled: this.data.lightCssEnabled,
        darkCss: this.data.darkCss,
        darkCssEnabled: this.data.darkCssEnabled,
        browserCss: this.data.browserCss,
        browserCssEnabled: this.data.browserCssEnabled,
        version: this.data.version
      };
      
      // Update storage with current appearance while preserving other settings
      const currentData = await StorageManager.load();
      const updatedData = { ...currentData, ...appearanceData };
      
      await StorageManager.save(updatedData);
      this.markClean();
      this.dataManager.updateStorageInfo();

    } catch (error) {
      console.error('Failed to save appearance:', error);
      this.uiManager.showError('Failed to save appearance settings. Please try again.');
    }
  }

  /**
   * Save general settings only
   */
  async saveGeneral() {
    try {
      // Only save general settings
      const generalData = {
        showIcons: this.data.showIcons,
        showUrls: this.data.showUrls,
        version: this.data.version
      };
      
      // Update storage with current general settings while preserving other settings
      const currentData = await StorageManager.load();
      const updatedData = { ...currentData, ...generalData };
      
      await StorageManager.save(updatedData);
      this.markClean();
      this.dataManager.updateStorageInfo();

    } catch (error) {
      console.error('Failed to save general settings:', error);
      this.uiManager.showError('Failed to save general settings. Please try again.');
    }
  }

  /**
   * Mark data as dirty (needs saving)
   */
  markDirty() {
    this.isDirty = true;
    
    // Clear previous timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    // Show saving status
    this.uiManager.showSavingStatus();
    
    // Schedule save after 1 second of no changes
    this.autoSaveTimeout = setTimeout(async () => {
      try {
        await this.saveAll();
        this.uiManager.showSavedStatus();
      } catch (error) {
        this.uiManager.showErrorStatus(error);
      }
    }, 1000);
  }

  /**
   * Mark data as clean (saved)
   */
  markClean() {
    this.isDirty = false;
    // Auto-save status display is handled by showSavedStatus()
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsApp();
});