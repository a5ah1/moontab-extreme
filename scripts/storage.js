/**
 * Storage management for Moontab Extreme
 * Handles versioned data schema and Chrome storage operations
 */

const STORAGE_VERSION = 2;
const STORAGE_KEY = 'moontabExtremeData';
const STORAGE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB
const MAX_GROUPS_PER_COLUMN = 50;
const MAX_LINKS_PER_GROUP = 200;

/**
 * Generate theme-specific storage fields dynamically
 * Returns CSS and enabled fields for all themes in PRESET_THEMES + browser theme
 * @returns {Object} Theme storage fields
 */
function getThemeStorageFields() {
  const fields = {};

  if (typeof window !== 'undefined' && window.PRESET_THEMES) {
    // Generate fields for all preset themes + browser theme
    const allThemes = [...Object.keys(window.PRESET_THEMES), 'browser'];

    allThemes.forEach(themeKey => {
      fields[`${themeKey}Css`] = '';
      fields[`${themeKey}CssEnabled`] = false;
    });
  } else {
    // Fallback for initialization before PRESET_THEMES is loaded
    // Include all known themes as of this version
    const fallbackThemes = [
      'light', 'dark', 'glassLight', 'glassDark',
      'acrylicLight', 'acrylicDark', 'materialLight', 'materialDark',
      'gruvboxLight', 'gruvboxDark', 'monokai', 'nordLight', 'nordDark',
      'tailwindSlateLight', 'tailwindSlateDark', 'tailwindGrayLight', 'tailwindGrayDark',
      'tailwindZincLight', 'tailwindZincDark', 'tailwindStoneLight', 'tailwindStoneDark',
      'browser'
    ];
    fallbackThemes.forEach(theme => {
      fields[`${theme}Css`] = '';
      fields[`${theme}CssEnabled`] = false;
    });
  }

  return fields;
}

/**
 * Default data structure
 */
const DEFAULT_DATA = {
  version: STORAGE_VERSION,
  columns: [
    {
      id: generateUUID(),
      name: 'Example Column 1',
      groups: [
        {
          id: generateUUID(),
          title: '',
          customClasses: '',
          links: [
            {
              id: generateUUID(),
              url: 'https://www.google.com',
              title: 'Google',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            },
            {
              id: generateUUID(),
              url: 'https://mail.google.com',
              title: 'Gmail',
              iconDataUri: null,
              iconUrlOverride: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
              customClasses: ''
            },
            {
              id: generateUUID(),
              url: 'https://bbc.com/news',
              title: 'BBC News',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            },
            {
              id: generateUUID(),
              url: 'https://x.com',
              title: 'X.com',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            }
          ]
        }
      ]
    },
    {
      id: generateUUID(),
      name: 'Example Column 2',
      groups: [
        {
          id: generateUUID(),
          title: 'Developer Resources',
          customClasses: '',
          links: [
            {
              id: generateUUID(),
              url: 'https://github.com',
              title: 'GitHub',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            },
            {
              id: generateUUID(),
              url: 'https://news.ycombinator.com',
              title: 'Hacker News',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            }
          ]
        },
        {
          id: generateUUID(),
          title: 'Archives',
          customClasses: '',
          links: [
            {
              id: generateUUID(),
              url: 'https://archive.org',
              title: 'The Internet Archive',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            },
            {
              id: generateUUID(),
              url: 'https://gutenberg.org',
              title: 'Project Gutenberg',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            }
          ]
        },
        {
          id: generateUUID(),
          title: 'Just for fun',
          customClasses: '',
          links: [
            {
              id: generateUUID(),
              url: 'https://www.cameronsworld.net/',
              title: 'Cameron\'s World',
              iconDataUri: null,
              iconUrlOverride: null,
              customClasses: ''
            }
          ]
        }
      ]
    }
  ],
  // Theme system
  themeMode: 'browser', // 'browser' | 'preset' | 'custom' - default follows system
  selectedPresetTheme: 'light', // Used when themeMode === 'preset'
  customCss: '', // Used when themeMode === 'custom'
  // Per-theme CSS enhancements (dynamically generated for all themes)
  ...getThemeStorageFields(),
  // Display settings (apply to all themes)
  shineEffectEnabled: true,
  baseFontSize: 16,
  uiScale: 1.0,
  columnWidthBase: 320,
  // Background settings
  backgroundDataUri: null,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundWidth: null,
  backgroundHeight: null,
  pageBackgroundColor: null,
  showIcons: true,
  showUrls: true,
  showColumnHeaders: true,
  showGroupHeaders: true,
  showAdvancedOptions: false,
  // Column animations settings
  columnAnimationEnabled: false,
  columnAnimationStyle: 'fadeIn',
  columnAnimationMode: 'sequential',
  columnAnimationDuration: 0.2,
  columnAnimationDelay: 0,
  columnAnimationStagger: 0.2,
  columnAnimationStylesheetOnly: false
};

/**
 * Storage operations wrapper
 */
class StorageManager {

  /**
   * Load data from Chrome storage
   * @returns {Promise<Object>} Complete data object
   */
  static async load() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const data = result[STORAGE_KEY];

      if (!data) {
        // First time setup - save defaults
        await this.save(DEFAULT_DATA);
        return { ...DEFAULT_DATA };
      }

      // Handle version migrations
      return this.migrate(data);
    } catch (error) {
      console.error('Failed to load data:', error);
      return { ...DEFAULT_DATA };
    }
  }

  /**
   * Save data to Chrome storage (debounced)
   * @param {Object} data - Data to save
   * @returns {Promise<void>}
   */
  static save = debounce(async function (data) {
    try {
      // Ensure version is set
      data.version = STORAGE_VERSION;

      await chrome.storage.local.set({ [STORAGE_KEY]: data });

      // Check storage usage
      await StorageManager.checkStorageUsage();
    } catch (error) {
      console.error('Failed to save data:', error);
      throw error;
    }
  }, 500);

  /**
   * Save data to Chrome storage immediately (no debouncing)
   * Used for critical operations like imports where we need guaranteed save
   * @param {Object} data - Data to save
   * @returns {Promise<void>}
   */
  static async saveImmediate(data) {
    try {
      console.log('🔍 StorageManager: Immediate save starting...');

      // Ensure version is set
      data.version = STORAGE_VERSION;

      await chrome.storage.local.set({ [STORAGE_KEY]: data });
      console.log('✅ StorageManager: Immediate save completed');

      // Check storage usage
      await StorageManager.checkStorageUsage();
    } catch (error) {
      console.error('❌ StorageManager: Immediate save failed:', error);
      throw error;
    }
  }

  /**
   * Migrate data from older versions (for future use)
   * @param {Object} data - Data to migrate
   * @returns {Object} Migrated data
   */
  static migrate(data) {
    // Ensure version is set
    if (!data.version) {
      data.version = STORAGE_VERSION;
    }

    // Ensure all required fields exist
    const requiredFields = {
      showColumnHeaders: true,
      showGroupHeaders: true,
      showAdvancedOptions: false,
      showIcons: true,
      showUrls: true,
      // Theme system
      themeMode: 'browser',
      selectedPresetTheme: 'light',
      customCss: '',
      // Per-theme CSS enhancements (dynamically generated for all themes)
      ...getThemeStorageFields(),
      // Display settings
      shineEffectEnabled: true,
      baseFontSize: 16,
      uiScale: 1.0,
      columnWidthBase: 320,
      // Background settings
      backgroundDataUri: null,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundWidth: null,
      backgroundHeight: null,
      pageBackgroundColor: null
    };

    Object.keys(requiredFields).forEach(field => {
      if (data[field] === undefined) {
        data[field] = requiredFields[field];
      }
    });

    // Future version migrations would go here
    // if (data.version === 2) {
    //   data = this.migrateV2ToV3(data);
    // }

    return data;
  }

  /**
   * Check storage usage and warn if approaching limits
   * @returns {Promise<Object>} Usage info
   */
  static async checkStorageUsage() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse(STORAGE_KEY);
      const isWarning = bytesInUse > STORAGE_WARNING_THRESHOLD;

      if (isWarning) {
        console.warn(`Storage usage high: ${formatBytes(bytesInUse)}`);
      }

      return {
        bytes: bytesInUse,
        formatted: formatBytes(bytesInUse),
        isWarning
      };
    } catch (error) {
      console.error('Failed to check storage usage:', error);
      return { bytes: 0, formatted: '0 Bytes', isWarning: false };
    }
  }

  /**
   * Clear all data and reset to defaults
   * @returns {Promise<void>}
   */
  static async reset() {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
      await this.save({ ...DEFAULT_DATA });
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  }

  /**
   * Export data as JSON string
   * @returns {Promise<string>} JSON string
   */
  static async exportData() {
    try {
      const data = await this.load();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON string
   * @param {string} jsonString - JSON string to import
   * @returns {Promise<void>}
   */
  static async importData(jsonString) {
    try {
      console.log('🔍 Import Debug: Starting import process');

      // Check storage quota before parsing
      const jsonSize = new TextEncoder().encode(jsonString).length;
      console.log('🔍 Import Debug: JSON size:', jsonSize, 'bytes');

      const usage = await StorageManager.checkStorageUsage();
      console.log('🔍 Import Debug: Current storage usage:', usage.bytes, 'bytes');

      if (usage.bytes + jsonSize > chrome.storage.local.QUOTA_BYTES) {
        throw new Error('Import would exceed storage limit');
      }

      const data = JSON.parse(jsonString);
      console.log('🔍 Import Debug: Parsed data structure:', {
        hasColumns: !!data.columns,
        columnsCount: data.columns?.length || 0,
        hasTheme: !!data.theme,
        theme: data.theme,
        hasCustomCss: !!data.customCss,
        dataKeys: Object.keys(data)
      });

      console.log('🔍 Import Debug: Starting validation...');
      if (!validateImportData(data)) {
        console.error('🔍 Import Debug: Validation failed');
        throw new Error('Invalid data format');
      }
      console.log('🔍 Import Debug: Validation passed');

      // Validate theme mode
      if (data.themeMode && !['browser', 'preset', 'custom'].includes(data.themeMode)) {
        throw new Error('Invalid theme mode specified');
      }

      // Validate preset theme selection
      if (data.selectedPresetTheme) {
        // Get valid theme keys from PRESET_THEMES (dynamically)
        const validThemes = typeof window !== 'undefined' && window.PRESET_THEMES
          ? Object.keys(window.PRESET_THEMES)
          : ['light', 'dark']; // Fallback if PRESET_THEMES not loaded yet

        if (!validThemes.includes(data.selectedPresetTheme)) {
          console.warn(`Unknown preset theme "${data.selectedPresetTheme}", falling back to 'light'`);
          data.selectedPresetTheme = 'light'; // Graceful degradation instead of throwing error
        }
      }

      // Validate background settings
      if (!isValidBackgroundSettings({
        backgroundSize: data.backgroundSize,
        backgroundRepeat: data.backgroundRepeat,
        backgroundPosition: data.backgroundPosition
      })) {
        throw new Error('Invalid background settings');
      }

      // Complete field preservation - start with defaults and override with imported data
      const importedData = {
        ...DEFAULT_DATA,  // Start with defaults
        ...data,  // Override with imported values (if present)
        version: STORAGE_VERSION  // Always set current version
      };

      // Apply migration to imported data
      console.log('🔍 Import Debug: Applying migration to imported data');
      const migratedData = StorageManager.migrate(importedData);
      console.log('🔍 Import Debug: Migration completed, saving data');

      await StorageManager.save(migratedData);
      console.log('🔍 Import Debug: Data saved successfully! Import completed.');
    } catch (error) {
      console.error('🔍 Import Debug: Import failed with error:', error);
      console.error('🔍 Import Debug: Error stack:', error.stack);
      throw error;
    }
  }
}

/**
 * Column operations
 */
class ColumnManager {

  /**
   * Add a new column
   * @param {string} name - Column name
   * @returns {Promise<Object>} New column object
   */
  static async addColumn(name) {
    const data = await StorageManager.load();
    const newColumn = {
      id: generateUUID(),
      name: name || 'New Column',
      groups: [
        {
          id: generateUUID(),
          title: '',
          customClasses: '',
          links: []
        }
      ],
      customClasses: ''
    };

    data.columns.push(newColumn);
    await StorageManager.save(data);

    return newColumn;
  }

  /**
   * Update column properties
   * @param {string} columnId - Column ID
   * @param {string|Object} updates - New name (string) or object with properties to update
   * @returns {Promise<void>}
   */
  static async updateColumn(columnId, updates) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      // For backward compatibility, if updates is a string, treat it as name
      if (typeof updates === 'string') {
        column.name = updates;
      } else {
        Object.assign(column, updates);
      }
      await StorageManager.save(data);
    }
  }

  /**
   * Delete a column
   * @param {string} columnId - Column ID
   * @returns {Promise<void>}
   */
  static async deleteColumn(columnId) {
    const data = await StorageManager.load();
    data.columns = data.columns.filter(c => c.id !== columnId);
    await StorageManager.save(data);
  }

  /**
   * Reorder columns
   * @param {Array<string>} columnIds - Array of column IDs in new order
   * @returns {Promise<void>}
   */
  static async reorderColumns(columnIds) {
    const data = await StorageManager.load();
    const newColumns = [];

    // Reorder based on provided IDs
    columnIds.forEach(id => {
      const column = data.columns.find(c => c.id === id);
      if (column) newColumns.push(column);
    });

    data.columns = newColumns;
    await StorageManager.save(data);
  }
}

/**
 * Group operations
 */
class GroupManager {

  /**
   * Add a new group to a column
   * @param {string} columnId - Column ID
   * @param {Object} groupData - Group data (optional)
   * @returns {Promise<Object>} New group object
   */
  static async addGroup(columnId, groupData = {}) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (!column) throw new Error('Column not found');

    // Check group limit
    if (column.groups && column.groups.length >= MAX_GROUPS_PER_COLUMN) {
      throw new Error(`Maximum ${MAX_GROUPS_PER_COLUMN} groups per column`);
    }

    const newGroup = {
      id: generateUUID(),
      title: groupData.title || '',
      customClasses: groupData.customClasses || '',
      links: []
    };

    column.groups.push(newGroup);
    await StorageManager.save(data);

    return newGroup;
  }

  /**
   * Update a group
   * @param {string} columnId - Column ID
   * @param {string} groupId - Group ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  static async updateGroup(columnId, groupId, updates) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      const group = column.groups.find(g => g.id === groupId);
      if (group) {
        Object.assign(group, updates);
        await StorageManager.save(data);
      }
    }
  }

  /**
   * Delete a group
   * @param {string} columnId - Column ID
   * @param {string} groupId - Group ID
   * @returns {Promise<void>}
   */
  static async deleteGroup(columnId, groupId) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      column.groups = column.groups.filter(g => g.id !== groupId);

      // Ensure at least one group exists
      if (column.groups.length === 0) {
        column.groups.push({
          id: generateUUID(),
          title: '',
          customClasses: '',
          links: []
        });
      }

      await StorageManager.save(data);
    }
  }

  /**
   * Reorder groups within a column
   * @param {string} columnId - Column ID
   * @param {Array<string>} groupIds - Array of group IDs in new order
   * @returns {Promise<void>}
   */
  static async reorderGroups(columnId, groupIds) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      const newGroups = [];
      groupIds.forEach(id => {
        const group = column.groups.find(g => g.id === id);
        if (group) newGroups.push(group);
      });

      column.groups = newGroups;
      await StorageManager.save(data);
    }
  }
}

/**
 * Link operations (now within groups)
 */
class LinkManager {

  /**
   * Add a new link to a group
   * @param {string} columnId - Column ID
   * @param {string} groupId - Group ID
   * @param {Object} linkData - Link data
   * @returns {Promise<Object>} New link object
   */
  static async addLink(columnId, groupId, linkData) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (!column) throw new Error('Column not found');

    const group = column.groups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');

    // Check links per group limit
    if (group.links.length >= MAX_LINKS_PER_GROUP) {
      throw new Error(`Maximum ${MAX_LINKS_PER_GROUP} links per group`);
    }

    // Validate link data
    if (!isValidUrl(linkData.url)) throw new Error('Invalid URL');
    if (linkData.iconDataUri && !isValidImageDataUri(linkData.iconDataUri)) throw new Error('Invalid icon');

    const newLink = {
      id: generateUUID(),
      url: linkData.url,
      title: linkData.title || '',
      iconDataUri: linkData.iconDataUri || null,
      iconUrlOverride: linkData.iconUrlOverride || null,
      customClasses: linkData.customClasses || ''
    };

    group.links.push(newLink);
    await StorageManager.save(data);

    return newLink;
  }

  /**
   * Update a link
   * @param {string} columnId - Column ID
   * @param {string} groupId - Group ID
   * @param {string} linkId - Link ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  static async updateLink(columnId, groupId, linkId, updates) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      const group = column.groups.find(g => g.id === groupId);
      if (group) {
        const link = group.links.find(l => l.id === linkId);
        if (link) {
          Object.assign(link, updates);
          await StorageManager.save(data);
        }
      }
    }
  }

  /**
   * Delete a link
   * @param {string} columnId - Column ID
   * @param {string} groupId - Group ID
   * @param {string} linkId - Link ID
   * @returns {Promise<void>}
   */
  static async deleteLink(columnId, groupId, linkId) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      const group = column.groups.find(g => g.id === groupId);
      if (group) {
        group.links = group.links.filter(l => l.id !== linkId);
        await StorageManager.save(data);
      }
    }
  }

  /**
   * Reorder links within a group
   * @param {string} columnId - Column ID
   * @param {string} groupId - Group ID
   * @param {Array<string>} linkIds - Array of link IDs in new order
   * @returns {Promise<void>}
   */
  static async reorderLinks(columnId, groupId, linkIds) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      const group = column.groups.find(g => g.id === groupId);
      if (group) {
        const newLinks = [];
        linkIds.forEach(id => {
          const link = group.links.find(l => l.id === id);
          if (link) newLinks.push(link);
        });

        group.links = newLinks;
        await StorageManager.save(data);
      }
    }
  }

  /**
   * Move a link from one group to another
   * @param {string} fromColumnId - Source column ID
   * @param {string} fromGroupId - Source group ID
   * @param {string} linkId - Link ID to move
   * @param {string} toColumnId - Destination column ID
   * @param {string} toGroupId - Destination group ID
   * @returns {Promise<void>}
   */
  static async moveLink(fromColumnId, fromGroupId, linkId, toColumnId, toGroupId) {
    const data = await StorageManager.load();

    const fromColumn = data.columns.find(c => c.id === fromColumnId);
    const toColumn = data.columns.find(c => c.id === toColumnId);

    if (!fromColumn || !toColumn) throw new Error('Column not found');

    const fromGroup = fromColumn.groups.find(g => g.id === fromGroupId);
    const toGroup = toColumn.groups.find(g => g.id === toGroupId);

    if (!fromGroup || !toGroup) throw new Error('Group not found');

    const linkIndex = fromGroup.links.findIndex(l => l.id === linkId);
    if (linkIndex === -1) throw new Error('Link not found');

    // Check limit in destination group
    if (toGroup.links.length >= MAX_LINKS_PER_GROUP) {
      throw new Error(`Maximum ${MAX_LINKS_PER_GROUP} links per group`);
    }

    // Move the link
    const [link] = fromGroup.links.splice(linkIndex, 1);
    toGroup.links.push(link);

    await StorageManager.save(data);
  }
}

/**
 * Settings operations
 */
class SettingsManager {

  /**
   * Update theme mode
   * @param {string} themeMode - Theme mode ('browser', 'preset', 'custom')
   * @returns {Promise<void>}
   */
  static async updateThemeMode(themeMode) {
    const data = await StorageManager.load();
    data.themeMode = themeMode;
    await StorageManager.save(data);
  }

  /**
   * Update selected preset theme
   * @param {string} presetTheme - Preset theme name
   * @returns {Promise<void>}
   */
  static async updateSelectedPresetTheme(presetTheme) {
    const data = await StorageManager.load();
    data.selectedPresetTheme = presetTheme;
    await StorageManager.save(data);
  }

  /**
   * Update custom CSS
   * @param {string} css - Custom CSS string
   * @returns {Promise<void>}
   */
  static async updateCustomCSS(css) {
    const data = await StorageManager.load();
    data.customCss = sanitizeCSS(css);
    await StorageManager.save(data);
  }

  /**
   * Update theme-specific CSS
   * @param {string} theme - Theme name ('light', 'dark', 'browser')
   * @param {string} css - Custom CSS string
   * @returns {Promise<void>}
   */
  static async updateThemeCss(theme, css) {
    const data = await StorageManager.load();
    data[`${theme}Css`] = sanitizeCSS(css);
    await StorageManager.save(data);
  }

  /**
   * Update theme-specific CSS enabled state
   * @param {string} theme - Theme name ('light', 'dark', 'browser')
   * @param {boolean} enabled - Whether theme CSS is enabled
   * @returns {Promise<void>}
   */
  static async updateThemeCssEnabled(theme, enabled) {
    const data = await StorageManager.load();
    data[`${theme}CssEnabled`] = enabled;
    await StorageManager.save(data);
  }

  /**
   * Update background image
   * @param {string|null} dataUri - Background image data URI
   * @returns {Promise<void>}
   */
  static async updateBackground(dataUri) {
    const data = await StorageManager.load();
    data.backgroundDataUri = dataUri;
    await StorageManager.save(data);
  }

  /**
   * Update background settings
   * @param {Object} settings - Background settings
   * @returns {Promise<void>}
   */
  static async updateBackgroundSettings(settings) {
    const data = await StorageManager.load();
    if (settings.backgroundSize !== undefined) data.backgroundSize = settings.backgroundSize;
    if (settings.backgroundRepeat !== undefined) data.backgroundRepeat = settings.backgroundRepeat;
    if (settings.backgroundPosition !== undefined) data.backgroundPosition = settings.backgroundPosition;
    if (settings.backgroundAttachment !== undefined) data.backgroundAttachment = settings.backgroundAttachment;
    if (settings.backgroundColor !== undefined) data.backgroundColor = settings.backgroundColor;
    await StorageManager.save(data);
  }

  /**
   * Toggle icon visibility
   * @param {boolean} showIcons - Whether to show icons
   * @returns {Promise<void>}
   */
  static async updateIconVisibility(showIcons) {
    const data = await StorageManager.load();
    data.showIcons = showIcons;
    await StorageManager.save(data);
  }

  /**
   * Toggle URL visibility
   * @param {boolean} showUrls - Whether to show URLs
   * @returns {Promise<void>}
   */
  static async updateUrlVisibility(showUrls) {
    const data = await StorageManager.load();
    data.showUrls = showUrls;
    await StorageManager.save(data);
  }

  /**
   * Toggle column header visibility
   * @param {boolean} showColumnHeaders - Whether to show column headers
   * @returns {Promise<void>}
   */
  static async updateColumnHeaderVisibility(showColumnHeaders) {
    const data = await StorageManager.load();
    data.showColumnHeaders = showColumnHeaders;
    await StorageManager.save(data);
  }

  /**
   * Toggle group header visibility
   * @param {boolean} showGroupHeaders - Whether to show group headers
   * @returns {Promise<void>}
   */
  static async updateGroupHeaderVisibility(showGroupHeaders) {
    const data = await StorageManager.load();
    data.showGroupHeaders = showGroupHeaders;
    await StorageManager.save(data);
  }

  /**
   * Toggle advanced options visibility
   * @param {boolean} showAdvancedOptions - Whether to show advanced options
   * @returns {Promise<void>}
   */
  static async updateAdvancedOptionsVisibility(showAdvancedOptions) {
    const data = await StorageManager.load();
    data.showAdvancedOptions = showAdvancedOptions;
    await StorageManager.save(data);
  }

  /**
   * Update column animation enabled state
   * @param {boolean} enabled - Whether column animations are enabled
   * @returns {Promise<void>}
   */
  static async updateColumnAnimationEnabled(enabled) {
    const data = await StorageManager.load();
    data.columnAnimationEnabled = enabled;
    await StorageManager.save(data);
  }

  /**
   * Update column animation style
   * @param {string} style - Animation style name
   * @returns {Promise<void>}
   */
  static async updateColumnAnimationStyle(style) {
    const data = await StorageManager.load();
    data.columnAnimationStyle = style;
    await StorageManager.save(data);
  }

  /**
   * Update column animation mode
   * @param {string} mode - Animation mode ('uniform' or 'sequential')
   * @returns {Promise<void>}
   */
  static async updateColumnAnimationMode(mode) {
    const data = await StorageManager.load();
    data.columnAnimationMode = mode;
    await StorageManager.save(data);
  }

  /**
   * Update column animation timing settings
   * @param {Object} settings - Timing settings object
   * @returns {Promise<void>}
   */
  static async updateColumnAnimationTiming(settings) {
    const data = await StorageManager.load();
    if (settings.duration !== undefined) data.columnAnimationDuration = settings.duration;
    if (settings.delay !== undefined) data.columnAnimationDelay = settings.delay;
    if (settings.stagger !== undefined) data.columnAnimationStagger = settings.stagger;
    await StorageManager.save(data);
  }

  /**
   * Update column animation stylesheet-only mode
   * @param {boolean} stylesheetOnly - Whether to use stylesheet-only mode
   * @returns {Promise<void>}
   */
  static async updateColumnAnimationStylesheetOnly(stylesheetOnly) {
    const data = await StorageManager.load();
    data.columnAnimationStylesheetOnly = stylesheetOnly;
    await StorageManager.save(data);
  }

  /**
   * Update shine effect enabled state
   * @param {boolean} enabled - Whether shine effect is enabled
   * @returns {Promise<void>}
   */
  static async updateShineEffectEnabled(enabled) {
    const data = await StorageManager.load();
    data.shineEffectEnabled = enabled;
    await StorageManager.save(data);
  }

  /**
   * Update base font size
   * @param {number} size - Base font size in pixels
   * @returns {Promise<void>}
   */
  static async updateBaseFontSize(size) {
    const data = await StorageManager.load();
    data.baseFontSize = size;
    await StorageManager.save(data);
  }

  /**
   * Update UI scale
   * @param {number} scale - UI scale factor
   * @returns {Promise<void>}
   */
  static async updateUiScale(scale) {
    const data = await StorageManager.load();
    data.uiScale = scale;
    await StorageManager.save(data);
  }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StorageManager,
    ColumnManager,
    GroupManager,
    LinkManager,
    SettingsManager,
    DEFAULT_DATA,
    MAX_GROUPS_PER_COLUMN,
    MAX_LINKS_PER_GROUP
  };
}