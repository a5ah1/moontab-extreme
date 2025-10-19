/**
 * General Manager - Moontab Extreme Options
 * Handles display settings and general configuration options
 */

class GeneralManager {
  constructor(data, dataManager, markDirtyCallback) {
    this.data = data;
    this.dataManager = dataManager;
    this.markDirty = markDirtyCallback;
  }

  /**
   * Setup the general panel with all settings
   */
  setupGeneralPanel() {
    this.setupDisplaySettings();
    this.dataManager.setupDataManagement();
    this.dataManager.updateStorageInfo();
  }

  /**
   * Setup display settings (icons, URLs, column headers)
   */
  setupDisplaySettings() {
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

    // Group headers visibility setting
    const showGroupHeadersToggle = document.getElementById('show-group-headers-setting');
    showGroupHeadersToggle.checked = this.data.showGroupHeaders !== undefined ? this.data.showGroupHeaders : true;

    showGroupHeadersToggle.addEventListener('change', () => {
      this.updateGroupHeaderVisibility(showGroupHeadersToggle.checked);
    });
  }

  /**
   * Update icon visibility setting
   * @param {boolean} showIcons - Whether to show icons
   */
  updateIconVisibility(showIcons) {
    this.data.showIcons = showIcons;
    this.markDirty();
  }

  /**
   * Update URL visibility setting
   * @param {boolean} showUrls - Whether to show URLs
   */
  updateUrlVisibility(showUrls) {
    this.data.showUrls = showUrls;
    this.markDirty();
  }

  /**
   * Update column header visibility setting
   * @param {boolean} showColumnHeaders - Whether to show column headers
   */
  updateColumnHeaderVisibility(showColumnHeaders) {
    this.data.showColumnHeaders = showColumnHeaders;
    this.markDirty();
  }

  /**
   * Update group header visibility setting
   * @param {boolean} showGroupHeaders - Whether to show group headers
   */
  updateGroupHeaderVisibility(showGroupHeaders) {
    this.data.showGroupHeaders = showGroupHeaders;
    this.markDirty();
  }

  /**
   * Called when panel is switched
   * @param {string} panelId - The panel being switched to
   */
  onPanelSwitch(panelId) {
    if (panelId === 'general') {
      // Update storage info when switching to general panel
      this.dataManager.updateStorageInfo();
    }
  }
}
