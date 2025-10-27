/**
 * ZIP Export Manager - Moontab Extreme
 * Handles ZIP-based import/export operations with image separation
 */

class ZipExportManager {
  constructor() {
    this.version = '1.0.0';
  }

  /**
   * Get all theme keys that support per-theme CSS customization
   * Includes all preset themes + browser theme
   * @returns {Array<string>} Array of theme keys
   */
  getCustomizableThemeKeys() {
    if (typeof window !== 'undefined' && window.PRESET_THEMES) {
      // Include all preset themes + browser theme
      return [...Object.keys(window.PRESET_THEMES), 'browser'];
    }
    // Fallback for older exports or if PRESET_THEMES not loaded
    return [
      'light', 'dark', 'glassLight', 'glassDark',
      'acrylicLight', 'acrylicDark', 'materialLight', 'materialDark',
      'gruvboxLight', 'gruvboxDark', 'monokai', 'nordLight', 'nordDark',
      'tailwindSlateLight', 'tailwindSlateDark', 'tailwindGrayLight', 'tailwindGrayDark',
      'tailwindZincLight', 'tailwindZincDark', 'tailwindStoneLight', 'tailwindStoneDark',
      'browser'
    ];
  }

  /**
   * Check if JSZip is available
   * @throws {Error} If JSZip is not loaded
   */
  checkJSZip() {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip library is not loaded. Please ensure jszip.min.js is loaded before using ZipExportManager.');
    }
  }

  /**
   * Export content data (columns, links, custom favicons) as ZIP
   * @param {Object} data - The application data
   * @returns {Promise<Blob>} ZIP file blob
   */
  async exportContent(data) {
    this.checkJSZip();
    const zip = new JSZip();
    const images = {};

    // Process custom favicons from links
    const processedColumns = this.processCustomFavicons(data.columns, images);

    // Create export data structure
    const exportData = {
      metadata: {
        exportType: 'content',
        version: this.version,
        timestamp: new Date().toISOString(),
        generator: 'Moontab Extreme'
      },
      content: {
        columns: processedColumns
      }
    };

    // Add JSON data
    zip.file('data.json', JSON.stringify(exportData, null, 2));

    // Add images
    await this.addImagesToZip(zip, images);

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Export appearance data (theme, CSS, backgrounds) as ZIP
   * @param {Object} data - The application data
   * @returns {Promise<Blob>} ZIP file blob
   */
  async exportAppearance(data) {
    this.checkJSZip();
    const zip = new JSZip();
    const images = {};


    // Process background image
    const appearanceData = {
      themeMode: data.themeMode || 'browser',
      selectedPresetTheme: data.selectedPresetTheme || 'light',
      pageBackgroundColor: data.pageBackgroundColor
    };

    // Add custom CSS as a separate file if it exists
    if (data.customCss && data.customCss.trim()) {
      zip.file('custom.css', data.customCss);
      appearanceData.customCss = 'custom.css'; // Reference to the file
    } else {
    }

    // Add theme-specific CSS files if they exist (for ALL themes dynamically)
    const themes = this.getCustomizableThemeKeys();
    themes.forEach(theme => {
      const cssField = `${theme}Css`;
      const enabledField = `${theme}CssEnabled`;

      // Include enabled state
      appearanceData[enabledField] = data[enabledField] || false;

      // Add CSS file (save whether enabled or not, even if empty)
      if (data[cssField] !== undefined) {
        zip.file(`${theme}-theme.css`, data[cssField] || '');
        appearanceData[cssField] = `${theme}-theme.css`; // Reference to the file
      }
    });

    // Handle background image
    if (data.backgroundDataUri && data.backgroundDataUri.startsWith('data:')) {
      const imageInfo = this.extractImageInfo(data.backgroundDataUri);
      const imagePath = `images/background.${imageInfo.extension}`;
      images[imagePath] = imageInfo.binary;
      appearanceData.backgroundImage = imagePath;
      appearanceData.backgroundDataUri = imagePath; // Store reference for compatibility
    } else if (data.backgroundDataUri) {
      appearanceData.backgroundDataUri = data.backgroundDataUri;
    }

    // Add background settings
    if (data.backgroundSize) appearanceData.backgroundSize = data.backgroundSize;
    if (data.backgroundRepeat) appearanceData.backgroundRepeat = data.backgroundRepeat;
    if (data.backgroundPosition) appearanceData.backgroundPosition = data.backgroundPosition;
    if (data.backgroundWidth) appearanceData.backgroundWidth = data.backgroundWidth;
    if (data.backgroundHeight) appearanceData.backgroundHeight = data.backgroundHeight;

    // Create export data structure
    const exportData = {
      metadata: {
        exportType: 'appearance',
        version: this.version,
        timestamp: new Date().toISOString(),
        generator: 'Moontab Extreme'
      },
      appearance: appearanceData,
      settings: {
        showIcons: data.showIcons,
        showUrls: data.showUrls,
        showColumnHeaders: data.showColumnHeaders,
        showGroupHeaders: data.showGroupHeaders,
        // Display scale and layout settings
        baseFontSize: data.baseFontSize,
        uiScale: data.uiScale,
        columnWidthBase: data.columnWidthBase,
        // Column animation settings (global settings, not theme-specific)
        columnAnimationEnabled: data.columnAnimationEnabled,
        columnAnimationStyle: data.columnAnimationStyle,
        columnAnimationMode: data.columnAnimationMode,
        columnAnimationDuration: data.columnAnimationDuration,
        columnAnimationDelay: data.columnAnimationDelay,
        columnAnimationStagger: data.columnAnimationStagger,
        columnAnimationStylesheetOnly: data.columnAnimationStylesheetOnly
      }
    };

    // Add JSON data
    zip.file('data.json', JSON.stringify(exportData, null, 2));

    // Add images
    await this.addImagesToZip(zip, images);

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Export complete data (everything) as ZIP
   * @param {Object} data - The application data
   * @returns {Promise<Blob>} ZIP file blob
   */
  async exportComplete(data) {
    this.checkJSZip();
    const zip = new JSZip();
    const images = {};

    // Process custom favicons from links
    const processedColumns = this.processCustomFavicons(data.columns, images);

    // Process appearance data
    const appearanceData = {
      themeMode: data.themeMode || 'browser',
      selectedPresetTheme: data.selectedPresetTheme || 'light',
      pageBackgroundColor: data.pageBackgroundColor
    };

    // Add custom CSS as a separate file if it exists
    if (data.customCss && data.customCss.trim()) {
      zip.file('custom.css', data.customCss);
      appearanceData.customCss = 'custom.css'; // Reference to the file
    }

    // Add theme-specific CSS files if they exist (for ALL themes dynamically)
    const themes = this.getCustomizableThemeKeys();
    themes.forEach(theme => {
      const cssField = `${theme}Css`;
      const enabledField = `${theme}CssEnabled`;

      // Include enabled state
      appearanceData[enabledField] = data[enabledField] || false;

      // Add CSS file (save whether enabled or not, even if empty)
      if (data[cssField] !== undefined) {
        zip.file(`${theme}-theme.css`, data[cssField] || '');
        appearanceData[cssField] = `${theme}-theme.css`; // Reference to the file
      }
    });

    // Handle background image
    if (data.backgroundDataUri && data.backgroundDataUri.startsWith('data:')) {
      const imageInfo = this.extractImageInfo(data.backgroundDataUri);
      const imagePath = `images/background.${imageInfo.extension}`;
      images[imagePath] = imageInfo.binary;
      appearanceData.backgroundImage = imagePath;
      appearanceData.backgroundDataUri = imagePath; // Store reference for compatibility
    } else if (data.backgroundDataUri) {
      appearanceData.backgroundDataUri = data.backgroundDataUri;
    }

    // Add background settings
    if (data.backgroundSize) appearanceData.backgroundSize = data.backgroundSize;
    if (data.backgroundRepeat) appearanceData.backgroundRepeat = data.backgroundRepeat;
    if (data.backgroundPosition) appearanceData.backgroundPosition = data.backgroundPosition;
    if (data.backgroundWidth) appearanceData.backgroundWidth = data.backgroundWidth;
    if (data.backgroundHeight) appearanceData.backgroundHeight = data.backgroundHeight;

    // Create export data structure
    const exportData = {
      metadata: {
        exportType: 'complete',
        version: this.version,
        timestamp: new Date().toISOString(),
        generator: 'Moontab Extreme'
      },
      content: {
        columns: processedColumns
      },
      appearance: appearanceData,
      settings: {
        showIcons: data.showIcons,
        showUrls: data.showUrls,
        showColumnHeaders: data.showColumnHeaders,
        showGroupHeaders: data.showGroupHeaders,
        // Display scale and layout settings
        baseFontSize: data.baseFontSize,
        uiScale: data.uiScale,
        columnWidthBase: data.columnWidthBase,
        // Column animation settings (global settings, not theme-specific)
        columnAnimationEnabled: data.columnAnimationEnabled,
        columnAnimationStyle: data.columnAnimationStyle,
        columnAnimationMode: data.columnAnimationMode,
        columnAnimationDuration: data.columnAnimationDuration,
        columnAnimationDelay: data.columnAnimationDelay,
        columnAnimationStagger: data.columnAnimationStagger,
        columnAnimationStylesheetOnly: data.columnAnimationStylesheetOnly
      }
    };

    // Add JSON data
    zip.file('data.json', JSON.stringify(exportData, null, 2));

    // Add images
    await this.addImagesToZip(zip, images);

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Import data from ZIP file
   * @param {File} file - The ZIP file to import
   * @returns {Promise<Object>} Imported data structure
   */
  async importFromZip(file) {
    try {
      this.checkJSZip();
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);

      // Read data.json
      const dataFile = zipContent.file('data.json');
      if (!dataFile) {
        throw new Error('Invalid ZIP file: missing data.json');
      }

      const jsonContent = await dataFile.async('string');
      const importData = JSON.parse(jsonContent);

      // Validate structure
      if (!importData.metadata || !importData.metadata.exportType) {
        throw new Error('Invalid export file: missing metadata');
      }

      // Convert image references back to base64
      await this.processImageReferences(importData, zipContent);

      // Process custom CSS file if referenced
      await this.processCSSReference(importData, zipContent);

      return {
        type: importData.metadata.exportType,
        data: importData
      };

    } catch (error) {
      if (error.message.includes('Invalid ZIP file')) {
        throw error;
      }
      throw new Error(`Failed to read ZIP file: ${error.message}`);
    }
  }

  /**
   * Import data from legacy JSON file
   * @param {File} file - The JSON file to import
   * @returns {Promise<Object>} Imported data structure
   */
  async importFromJson(file) {
    const text = await file.text();
    const data = JSON.parse(text);

    // Detect legacy format and determine type
    if (data.columns && data.theme) {
      return { type: 'complete', data: this.convertLegacyToNewFormat(data, 'complete') };
    } else if (data.columns) {
      return { type: 'content', data: this.convertLegacyToNewFormat(data, 'content') };
    } else {
      throw new Error('Unrecognized JSON format');
    }
  }

  /**
   * Process custom favicons and extract images
   * @param {Array} columns - Columns data
   * @param {Object} images - Images object to populate
   * @returns {Array} Processed columns with image references
   */
  processCustomFavicons(columns, images) {
    if (!columns) return [];

    return columns.map(column => {
      const processedColumn = { ...column };

      // Process groups in column (v2 format)
      if (column.groups) {
        processedColumn.groups = column.groups.map(group => {
          const processedGroup = { ...group };

          // Process links within group
          if (group.links) {
            processedGroup.links = group.links.map(link => {
              const processedLink = { ...link };

              // Process custom favicon
              if (link.iconDataUri && link.iconDataUri.startsWith('data:')) {
                const imageInfo = this.extractImageInfo(link.iconDataUri);
                const imagePath = `images/favicon_${link.id}.${imageInfo.extension}`;
                images[imagePath] = imageInfo.binary;
                processedLink.iconDataUri = imagePath;
                // Skip iconUrlOverride per new policy - no longer supported
              }

              return processedLink;
            });
          }

          return processedGroup;
        });
      }

      return processedColumn;
    });
  }

  /**
   * Extract image information from base64 data URL
   * @param {string} dataUrl - Base64 data URL
   * @returns {Object} Image info with binary data and extension
   */
  extractImageInfo(dataUrl) {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/data:([^;]+)/)[1];
    const extension = this.getExtensionFromMimeType(mimeType);

    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return {
      binary: bytes,
      extension: extension,
      mimeType: mimeType
    };
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} File extension
   */
  getExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/ico': 'ico',
      'image/x-icon': 'ico'
    };
    return mimeToExt[mimeType] || 'png';
  }

  /**
   * Add images to ZIP file
   * @param {JSZip} zip - ZIP instance
   * @param {Object} images - Images object with path -> binary data
   */
  async addImagesToZip(zip, images) {
    if (Object.keys(images).length === 0) {
      return;
    }

    for (const [path, binary] of Object.entries(images)) {
      zip.file(path, binary);
    }
  }

  /**
   * Process image references and convert back to base64
   * @param {Object} importData - Import data structure
   * @param {JSZip} zipContent - ZIP content
   */
  async processImageReferences(importData, zipContent) {
    // Process content images (custom favicons)
    if (importData.content && importData.content.columns) {
      for (const column of importData.content.columns) {
        // Process groups array (v2 format)
        if (column.groups) {
          for (const group of column.groups) {
            if (group.links) {
              for (const link of group.links) {
                // Process custom favicon data URIs
                if (link.iconDataUri && link.iconDataUri.startsWith('images/')) {
                  const imageFile = zipContent.file(link.iconDataUri);
                  if (imageFile) {
                    const binary = await imageFile.async('uint8array');
                    link.iconDataUri = await this.binaryToDataUrl(binary, link.iconDataUri);
                  }
                }
                // Handle iconUrlOverride per new policy
                if (link.iconUrlOverride) {
                  const shouldKeep = this.shouldKeepFaviconUrl(link.iconUrlOverride);
                  if (shouldKeep) {
                    console.log(`✅ Keeping Google favicon URL during import for: ${link.title || link.url}`);
                  } else {
                    console.log(`🚫 Removing custom favicon URL during import for: ${link.title || link.url}`);
                    delete link.iconUrlOverride;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Process appearance images (background)
    if (importData.appearance) {
      // Handle both field names for compatibility
      if (importData.appearance.backgroundImage &&
        importData.appearance.backgroundImage.startsWith('images/')) {
        const imageFile = zipContent.file(importData.appearance.backgroundImage);
        if (imageFile) {
          const binary = await imageFile.async('uint8array');
          const dataUrl = await this.binaryToDataUrl(binary, importData.appearance.backgroundImage);
          importData.appearance.backgroundDataUri = dataUrl;
          delete importData.appearance.backgroundImage; // Remove the old field
        }
      }
      if (importData.appearance.backgroundDataUri &&
        importData.appearance.backgroundDataUri.startsWith('images/')) {
        const imageFile = zipContent.file(importData.appearance.backgroundDataUri);
        if (imageFile) {
          const binary = await imageFile.async('uint8array');
          importData.appearance.backgroundDataUri = await this.binaryToDataUrl(binary, importData.appearance.backgroundDataUri);
        }
      }
    }
  }

  /**
   * Process CSS file reference and load content
   * @param {Object} importData - Import data structure
   * @param {JSZip} zipContent - ZIP content
   */
  async processCSSReference(importData, zipContent) {
    if (!importData.appearance) return;

    // Check if appearance data contains a CSS file reference
    if (importData.appearance.customCss === 'custom.css') {
      const cssFile = zipContent.file('custom.css');
      if (cssFile) {
        const cssContent = await cssFile.async('string');
        importData.appearance.customCss = cssContent;
      } else {
        console.warn('Custom CSS file referenced but not found in ZIP');
        delete importData.appearance.customCss;
      }
    }

    // Process theme-specific CSS files (for ALL themes dynamically)
    const themes = this.getCustomizableThemeKeys();
    for (const theme of themes) {
      const cssField = `${theme}Css`;
      const fileName = `${theme}-theme.css`;

      if (importData.appearance[cssField] === fileName) {
        const cssFile = zipContent.file(fileName);
        if (cssFile) {
          const cssContent = await cssFile.async('string');
          importData.appearance[cssField] = cssContent;
        } else {
          console.warn(`${theme} theme CSS file referenced but not found in ZIP`);
          delete importData.appearance[cssField];
        }
      }
    }
  }

  /**
   * Convert binary data back to data URL
   * @param {Uint8Array} binary - Binary image data
   * @param {string} filename - Original filename for MIME type detection
   * @returns {string} Data URL
   */
  async binaryToDataUrl(binary, filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeType = this.getMimeTypeFromExtension(extension);

    // Convert binary to base64
    let binaryString = '';
    for (let i = 0; i < binary.length; i++) {
      binaryString += String.fromCharCode(binary[i]);
    }
    const base64 = btoa(binaryString);

    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Get MIME type from file extension
   * @param {string} extension - File extension
   * @returns {string} MIME type
   */
  getMimeTypeFromExtension(extension) {
    const extToMime = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'ico': 'image/x-icon'
    };
    return extToMime[extension] || 'image/png';
  }

  /**
   * Convert legacy JSON format to new format
   * @param {Object} legacyData - Legacy data structure
   * @param {string} exportType - Export type (content, appearance, complete)
   * @returns {Object} New format data structure
   */
  convertLegacyToNewFormat(legacyData, exportType) {
    const newData = {
      metadata: {
        exportType: exportType,
        version: this.version,
        timestamp: new Date().toISOString(),
        generator: 'Moontab Extreme (Legacy Import)'
      }
    };

    if (exportType === 'content' || exportType === 'complete') {
      newData.content = {
        columns: legacyData.columns || []
      };
    }

    if (exportType === 'appearance' || exportType === 'complete') {
      newData.appearance = {};

      // Handle theme field - convert legacy "theme" to new themeMode/selectedPresetTheme
      if (legacyData.themeMode) {
        newData.appearance.themeMode = legacyData.themeMode;
      } else if (legacyData.theme) {
        // Legacy support: map old "theme" field to new structure
        newData.appearance.themeMode = 'preset';
        newData.appearance.selectedPresetTheme = legacyData.theme;
      }

      if (legacyData.selectedPresetTheme) {
        newData.appearance.selectedPresetTheme = legacyData.selectedPresetTheme;
      }

      if (legacyData.customCss) newData.appearance.customCss = legacyData.customCss;

      // Map theme-specific CSS fields (for ALL themes dynamically)
      const themes = this.getCustomizableThemeKeys();
      themes.forEach(theme => {
        const cssField = `${theme}Css`;
        const enabledField = `${theme}CssEnabled`;
        if (legacyData[cssField]) newData.appearance[cssField] = legacyData[cssField];
        if (legacyData[enabledField] !== undefined) newData.appearance[enabledField] = legacyData[enabledField];
      });

      if (legacyData.pageBackgroundColor) newData.appearance.pageBackgroundColor = legacyData.pageBackgroundColor;
      if (legacyData.backgroundDataUri) newData.appearance.backgroundDataUri = legacyData.backgroundDataUri;
      if (legacyData.backgroundImage) newData.appearance.backgroundDataUri = legacyData.backgroundImage; // Map old field name
      if (legacyData.backgroundSize) newData.appearance.backgroundSize = legacyData.backgroundSize;
      if (legacyData.backgroundRepeat) newData.appearance.backgroundRepeat = legacyData.backgroundRepeat;
      if (legacyData.backgroundPosition) newData.appearance.backgroundPosition = legacyData.backgroundPosition;
      if (legacyData.backgroundWidth) newData.appearance.backgroundWidth = legacyData.backgroundWidth;
      if (legacyData.backgroundHeight) newData.appearance.backgroundHeight = legacyData.backgroundHeight;
    }

    if (exportType === 'appearance' || exportType === 'complete') {
      newData.settings = {};
      if (legacyData.showIcons !== undefined) newData.settings.showIcons = legacyData.showIcons;
      if (legacyData.showUrls !== undefined) newData.settings.showUrls = legacyData.showUrls;
      if (legacyData.showColumnHeaders !== undefined) newData.settings.showColumnHeaders = legacyData.showColumnHeaders;
      if (legacyData.showGroupHeaders !== undefined) newData.settings.showGroupHeaders = legacyData.showGroupHeaders;

      // Include column animation settings (global settings, not theme-specific)
      if (legacyData.columnAnimationEnabled !== undefined) newData.settings.columnAnimationEnabled = legacyData.columnAnimationEnabled;
      if (legacyData.columnAnimationStyle !== undefined) newData.settings.columnAnimationStyle = legacyData.columnAnimationStyle;
      if (legacyData.columnAnimationMode !== undefined) newData.settings.columnAnimationMode = legacyData.columnAnimationMode;
      if (legacyData.columnAnimationDuration !== undefined) newData.settings.columnAnimationDuration = legacyData.columnAnimationDuration;
      if (legacyData.columnAnimationDelay !== undefined) newData.settings.columnAnimationDelay = legacyData.columnAnimationDelay;
      if (legacyData.columnAnimationStagger !== undefined) newData.settings.columnAnimationStagger = legacyData.columnAnimationStagger;
      if (legacyData.columnAnimationStylesheetOnly !== undefined) newData.settings.columnAnimationStylesheetOnly = legacyData.columnAnimationStylesheetOnly;
    }

    return newData;
  }

  /**
   * Check if a favicon URL should be kept (Google favicon service URLs only)
   * @param {string} url - Favicon URL to check
   * @returns {boolean} Whether to keep this URL
   */
  shouldKeepFaviconUrl(url) {
    if (!url || typeof url !== 'string') return false;

    // Keep Google favicon service URLs
    return url.includes('google.com/s2/favicons') ||
      url.includes('gstatic.com/faviconV2') ||
      url.includes('googleapis.com/favicon');
  }

  /**
   * Generate filename for export
   * @param {string} exportType - Export type (content, appearance, complete)
   * @returns {string} Filename
   */
  generateFilename(exportType) {
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\.\d{3}Z$/, '')
      .replace('T', '_');

    return `moontab-extreme-${exportType}-${timestamp}.zip`;
  }
}