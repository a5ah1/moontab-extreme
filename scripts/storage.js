/**
 * Storage management for Link Stacker
 * Handles versioned data schema and Chrome storage operations
 */

const STORAGE_VERSION = 1;
const STORAGE_KEY = 'linkStackerData';
const STORAGE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB

/**
 * Default data structure
 */
const DEFAULT_DATA = {
  version: STORAGE_VERSION,
  columns: [
    {
      id: generateUUID(),
      name: 'Example Column 1',
      items: [
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://www.google.com',
          title: 'Google',
          iconDataUri: null,
          customClasses: ''
        },
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://mail.google.com',
          title: 'Gmail',
          iconDataUri: null,
          iconUrlOverride: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
          customClasses: ''
        },
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://bbc.com/news',
          title: 'BBC News',
          iconDataUri: null,
          customClasses: ''
        },
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://x.com',
          title: 'X.com',
          iconDataUri: null,
          customClasses: ''
        }
      ]
    },
    {
      id: generateUUID(),
      name: 'Example Column 2',
      items: [
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://github.com',
          title: 'GitHub',
          iconDataUri: null,
          customClasses: ''
        },
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://news.ycombinator.com',
          title: 'Hacker News',
          iconDataUri: null,
          customClasses: ''
        },
        {
          type: 'divider',
          id: generateUUID(),
          title: 'Example Divider',
          customClasses: ''
        },
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://archive.org',
          title: 'The Internet Archive',
          iconDataUri: null,
          customClasses: ''
        },
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://gutenberg.org',
          title: 'Project Gutenberg',
          iconDataUri: null,
          customClasses: ''
        },
        {
          type: 'divider',
          id: generateUUID(),
          title: 'Just for fun',
          customClasses: ''
        },
        {
          type: 'link',
          id: generateUUID(),
          url: 'https://www.cameronsworld.net/',
          title: 'Cameron\'s World',
          iconDataUri: null,
          customClasses: ''
        }
      ]
    }
  ],
  theme: 'browser',
  customCss: '',
  // Theme-specific CSS customization
  lightCss: '',
  lightCssEnabled: false,
  darkCss: '',
  darkCssEnabled: false,
  browserCss: '',
  browserCssEnabled: false,
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
  static save = debounce(async function(data) {
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
   * Migrate data from older versions
   * @param {Object} data - Data to migrate
   * @returns {Object} Migrated data
   */
  static migrate(data) {
    // If no version, assume version 1
    if (!data.version) {
      data.version = 1;
    }

    // Migrate backgroundColor to pageBackgroundColor
    if (data.backgroundColor && data.pageBackgroundColor === null) {
      console.log('Migrating backgroundColor to pageBackgroundColor:', data.backgroundColor);
      data.pageBackgroundColor = data.backgroundColor;
    }
    
    // Clean up old backgroundColor property
    if (data.hasOwnProperty('backgroundColor')) {
      delete data.backgroundColor;
    }

    // Migrate links to items structure
    if (data.columns && Array.isArray(data.columns)) {
      data.columns.forEach(column => {
        if (column && column.links && !column.items) {
          console.log('Migrating column links to items:', column.name);
          column.items = column.links.map(link => ({
            type: 'link',
            ...link
          }));
          delete column.links;
        } else if (column && !column.items) {
          // Ensure all columns have items array
          column.items = [];
        }
        
        // Ensure all columns have customClasses field
        if (column && column.customClasses === undefined) {
          column.customClasses = '';
        }
      });
    }

    // Ensure all required fields exist
    const requiredFields = {
      showColumnHeaders: true,
      showAdvancedOptions: false,
      showIcons: true,
      showUrls: true,
      theme: 'browser',
      customCss: '',
      // Theme-specific CSS customization
      lightCss: '',
      lightCssEnabled: false,
      darkCss: '',
      darkCssEnabled: false,
      browserCss: '',
      browserCssEnabled: false,
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

    // Future migrations would go here
    // if (data.version === 1) {
    //   // Migrate from v1 to v2
    //   data = this.migrateV1ToV2(data);
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

      // Validate theme
      if (data.theme && !['light', 'dark', 'custom', 'browser'].includes(data.theme)) {
        throw new Error('Invalid theme specified');
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
      items: [],
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
 * Item operations (links and dividers)
 */
class ItemManager {

  /**
   * Add a new link to a column
   * @param {string} columnId - Column ID
   * @param {Object} linkData - Link data
   * @returns {Promise<Object>} New link object
   */
  static async addLink(columnId, linkData) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (!column) throw new Error('Column not found');

    // Validate link data
    if (!isValidUrl(linkData.url)) throw new Error('Invalid URL');
    if (linkData.iconDataUri && !isValidImageDataUri(linkData.iconDataUri)) throw new Error('Invalid icon');

    const newLink = {
      type: 'link',
      id: generateUUID(),
      url: linkData.url,
      title: linkData.title || '',
      iconDataUri: linkData.iconDataUri || null,
      customClasses: linkData.customClasses || ''
    };

    column.items.push(newLink);
    await StorageManager.save(data);

    return newLink;
  }

  /**
   * Add a new divider to a column
   * @param {string} columnId - Column ID
   * @param {Object} dividerData - Divider data
   * @returns {Promise<Object>} New divider object
   */
  static async addDivider(columnId, dividerData) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (!column) throw new Error('Column not found');

    // Validate divider data
    if (dividerData.title && typeof dividerData.title !== 'string') throw new Error('Invalid divider title');
    if (dividerData.customClasses && !/^[a-zA-Z_][\w\- ]*$/.test(dividerData.customClasses)) throw new Error('Invalid custom classes');

    const newDivider = {
      type: 'divider',
      id: generateUUID(),
      title: dividerData.title || '',
      customClasses: dividerData.customClasses || ''
    };

    column.items.push(newDivider);
    await StorageManager.save(data);

    return newDivider;
  }

  /**
   * Update an item (link or divider)
   * @param {string} columnId - Column ID
   * @param {string} itemId - Item ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  static async updateItem(columnId, itemId, updates) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      const item = column.items.find(i => i.id === itemId);
      if (item) {
        Object.assign(item, updates);
        await StorageManager.save(data);
      }
    }
  }

  /**
   * Update a link (legacy method for backward compatibility)
   * @param {string} columnId - Column ID
   * @param {string} linkId - Link ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  static async updateLink(columnId, linkId, updates) {
    return this.updateItem(columnId, linkId, updates);
  }

  /**
   * Delete an item (link or divider)
   * @param {string} columnId - Column ID
   * @param {string} itemId - Item ID
   * @returns {Promise<void>}
   */
  static async deleteItem(columnId, itemId) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      column.items = column.items.filter(i => i.id !== itemId);
      await StorageManager.save(data);
    }
  }

  /**
   * Delete a link (legacy method for backward compatibility)
   * @param {string} columnId - Column ID
   * @param {string} linkId - Link ID
   * @returns {Promise<void>}
   */
  static async deleteLink(columnId, linkId) {
    return this.deleteItem(columnId, linkId);
  }

  /**
   * Reorder items within a column
   * @param {string} columnId - Column ID
   * @param {Array<string>} itemIds - Array of item IDs in new order
   * @returns {Promise<void>}
   */
  static async reorderItems(columnId, itemIds) {
    const data = await StorageManager.load();
    const column = data.columns.find(c => c.id === columnId);

    if (column) {
      const newItems = [];
      itemIds.forEach(id => {
        const item = column.items.find(i => i.id === id);
        if (item) newItems.push(item);
      });

      column.items = newItems;
      await StorageManager.save(data);
    }
  }

  /**
   * Reorder links within a column (legacy method for backward compatibility)
   * @param {string} columnId - Column ID
   * @param {Array<string>} linkIds - Array of link IDs in new order
   * @returns {Promise<void>}
   */
  static async reorderLinks(columnId, linkIds) {
    return this.reorderItems(columnId, linkIds);
  }

}

/**
 * Settings operations
 */
class SettingsManager {

  /**
   * Update theme
   * @param {string} theme - Theme name ('light', 'dark', 'custom')
   * @returns {Promise<void>}
   */
  static async updateTheme(theme) {
    const data = await StorageManager.load();
    data.theme = theme;
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
}

// Legacy alias for backward compatibility
const LinkManager = ItemManager;

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StorageManager,
    ColumnManager,
    ItemManager,
    LinkManager, // Legacy alias
    SettingsManager,
    DEFAULT_DATA
  };
}