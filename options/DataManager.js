/**
 * Data Manager - Link Stacker Options
 * Handles all data operations: import/export, backup/restore, validation, storage management
 */

class DataManager {
  constructor(data, uiManager) {
    this.data = data;
    this.uiManager = uiManager;
    this.zipExportManager = new ZipExportManager();
  }

  /**
   * Setup data management (import/export/reset)
   */
  setupDataManagement() {
    // Content-only management
    const exportContentBtn = document.getElementById('export-content-btn');
    const importContentBtn = document.getElementById('import-content-btn');
    const importContentFile = document.getElementById('import-content-file');

    // Appearance-only management
    const exportAppearanceBtn = document.getElementById('export-appearance-btn');
    const importAppearanceBtn = document.getElementById('import-appearance-btn');
    const importAppearanceFile = document.getElementById('import-appearance-file');

    // Complete theme management
    const exportEverythingBtn = document.getElementById('export-everything-btn');
    const importEverythingBtn = document.getElementById('import-everything-btn');
    const importEverythingFile = document.getElementById('import-everything-file');
    
    // Reset functionality
    const resetBtn = document.getElementById('reset-all-btn');

    // Content export/import
    exportContentBtn.addEventListener('click', () => {
      this.exportContentOnly();
    });

    importContentBtn.addEventListener('click', () => {
      importContentFile.click();
    });

    importContentFile.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        await this.importContentOnly(e.target.files[0]);
        e.target.value = ''; // Reset file input
      }
    });

    // Appearance export/import
    exportAppearanceBtn.addEventListener('click', () => {
      this.exportAppearanceOnly();
    });

    importAppearanceBtn.addEventListener('click', () => {
      importAppearanceFile.click();
    });

    importAppearanceFile.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        await this.importAppearanceOnly(e.target.files[0]);
        e.target.value = ''; // Reset file input
      }
    });

    // Complete theme export/import
    exportEverythingBtn.addEventListener('click', () => {
      this.exportCompleteTheme();
    });

    importEverythingBtn.addEventListener('click', () => {
      importEverythingFile.click();
    });

    importEverythingFile.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        await this.importCompleteTheme(e.target.files[0]);
        e.target.value = ''; // Reset file input
      }
    });

    // Reset all data
    resetBtn.addEventListener('click', () => {
      this.confirmResetAll();
    });
  }

  /**
   * Generate filename with timestamp
   * @param {string} type - File type ('content' or 'theme')
   * @returns {string} Formatted filename
   */
  generateFilename(type) {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/:/g, '-')
      .replace(/\.\d{3}Z$/, '')
      .replace('T', '_');
    
    return `link-stacker-${type}-${timestamp}.json`;
  }

  /**
   * Export content only (links and columns)
   */
  async exportContentOnly() {
    try {
      // Use ZIP export manager for content export
      const zipBlob = await this.zipExportManager.exportContent(this.data);
      const url = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = this.zipExportManager.generateFilename('content');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to export content:', error);
      this.uiManager.showError('Failed to export content. Please try again.');
    }
  }

  /**
   * Export appearance only (themes, CSS, backgrounds)
   */
  async exportAppearanceOnly() {
    try {
      // Use ZIP export manager for appearance export
      const zipBlob = await this.zipExportManager.exportAppearance(this.data);
      const url = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = this.zipExportManager.generateFilename('appearance');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to export appearance:', error);
      this.uiManager.showError('Failed to export appearance. Please try again.');
    }
  }

  /**
   * Export complete theme (everything)
   */
  async exportCompleteTheme() {
    try {
      // Use ZIP export manager for complete export
      const zipBlob = await this.zipExportManager.exportComplete(this.data);
      const url = URL.createObjectURL(zipBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = this.zipExportManager.generateFilename('complete');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to export theme:', error);
      this.uiManager.showError('Failed to export complete theme. Please try again.');
    }
  }

  /**
   * Export data as JSON file (legacy function - keeping for compatibility)
   */
  async exportData() {
    try {
      const jsonString = await StorageManager.exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `link-stacker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to export data:', error);
      this.uiManager.showError('Failed to export data. Please try again.');
    }
  }

  /**
   * Validate and detect import file format
   * @param {File} file - Import file
   * @returns {Promise<Object>} Validation result with type and data
   */
  async validateImportFile(file) {
    try {
      // Determine file type by extension and content
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.zip')) {
        // Handle ZIP file
        const importResult = await this.zipExportManager.importFromZip(file);
        return { valid: true, ...importResult };
      } else if (fileName.endsWith('.json')) {
        // Handle JSON file (legacy)
        const importResult = await this.zipExportManager.importFromJson(file);
        return { valid: true, ...importResult };
      } else {
        throw new Error('Unsupported file type. Please use .zip or .json files.');
      }
      
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }


  /**
   * Import content only (links and columns)
   * @param {File} file - ZIP or JSON file
   */
  async importContentOnly(file) {
    if (!file) return;

    try {
      console.log('🚀 DataManager: Starting content import');
      console.log('📄 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      // Show backup prompt modal
      const userChoice = await this.uiManager.createImportBackupModal(
        'content', 
        file, 
        () => this.exportContentOnly()
      );
      
      if (userChoice === 'cancel') {
        console.log('📝 Content import cancelled by user');
        return;
      }
      
      // Safe UI feedback with fallback
      try {
        this.uiManager.showStatus('Importing content...', 'saving');
      } catch (uiError) {
        console.log('⚠️ Status update failed, continuing with import...');
      }
      
      console.log('🔍 Starting file validation...');
      const validation = await this.validateImportFile(file);
      console.log('✅ Validation result:', validation);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Only show warning for mismatched types, don't block
      if (validation.type !== 'content') {
        console.log(`⚠️ File type mismatch: expected 'content', got '${validation.type}'`);
        try {
          this.uiManager.showInfo(`Importing ${validation.type} file as content (columns and links only)`);
        } catch (uiError) {
          console.log('⚠️ Info message failed, continuing with import...');
        }
      }

      // Import only content data with favicon filtering
      let columnsImported = 0;
      let linksImported = 0;
      let faviconUrlsRemoved = 0;
      let faviconUrlsKept = 0;
      let customFaviconsImported = 0;
      
      console.log('🔄 Processing import data...');
      
      if (validation.data.content) {
        const processedColumns = this.processImportColumns(validation.data.content.columns);
        this.data.columns = processedColumns.columns;
        columnsImported = processedColumns.columns?.length || 0;
        linksImported = processedColumns.linksCount;
        faviconUrlsRemoved = processedColumns.faviconUrlsRemoved;
        faviconUrlsKept = processedColumns.faviconUrlsKept;
        customFaviconsImported = processedColumns.customFaviconsImported;
      } else if (validation.data.columns) {
        // Legacy format
        const processedColumns = this.processImportColumns(validation.data.columns);
        this.data.columns = processedColumns.columns;
        columnsImported = processedColumns.columns?.length || 0;
        linksImported = processedColumns.linksCount;
        faviconUrlsRemoved = processedColumns.faviconUrlsRemoved;
        faviconUrlsKept = processedColumns.faviconUrlsKept;
        customFaviconsImported = processedColumns.customFaviconsImported;
      }
      
      console.log(`📊 Import statistics:`);
      console.log(`   - Columns: ${columnsImported}`);
      console.log(`   - Links: ${linksImported}`);
      console.log(`   - Custom favicons imported: ${customFaviconsImported}`);
      console.log(`   - Favicon URLs kept: ${faviconUrlsKept}`);
      console.log(`   - Favicon URLs removed: ${faviconUrlsRemoved}`);
      
      // Use immediate save for imports
      console.log('💾 Saving imported data...');
      await StorageManager.saveImmediate(this.data);
      console.log('✅ Data saved successfully!');
      
      // Show import result modal
      const importStats = {
        columnsImported,
        linksImported,
        settingsImported: 0,
        customFaviconsImported,
        backgroundImageImported: false, // Content import doesn't include background images
        faviconUrlsKept,
        faviconUrlsRemoved
      };
      
      console.log('✅ Content import completed successfully! Showing result modal...');
      await this.uiManager.createImportResultModal(importStats);
      
      // Reload page after user clicks OK
      console.log('🔄 Reloading page...');
      location.reload();

    } catch (error) {
      console.error('❌ DataManager: Failed to import content:', error);
      console.error('❌ Error stack:', error.stack);
      
      // Safe error feedback with fallback
      try {
        this.uiManager.showError(`Failed to import content: ${error.message}`);
        this.uiManager.showStatus('Import failed', 'error');
      } catch (uiError) {
        console.error('❌ Error message display failed:', uiError);
        alert(`Import failed: ${error.message}`); // Fallback to basic alert
      }
    }
  }

  /**
   * Import appearance only (themes, CSS, backgrounds)
   * @param {File} file - ZIP or JSON file
   */
  async importAppearanceOnly(file) {
    if (!file) return;

    try {
      console.log('🚀 DataManager: Starting appearance import for file:', file.name);
      
      // Show backup prompt modal
      const userChoice = await this.uiManager.createImportBackupModal(
        'appearance', 
        file, 
        () => this.exportAppearanceOnly()
      );
      
      if (userChoice === 'cancel') {
        console.log('📝 Appearance import cancelled by user');
        return;
      }
      
      // Safe UI feedback with fallback
      try {
        this.uiManager.showStatus('Importing appearance...', 'saving');
      } catch (uiError) {
        console.log('Status update failed, continuing with import...');
      }
      
      const validation = await this.validateImportFile(file);
      console.log('🔍 DataManager: Validation result:', validation);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Only show warning for mismatched types, don't block
      if (validation.type !== 'appearance') {
        try {
          this.uiManager.showInfo(`Importing ${validation.type} file as appearance (themes, CSS, backgrounds only)`);
        } catch (uiError) {
          console.log('Info message failed, continuing with import...');
        }
      }

      // Import only appearance data
      let fieldsImported = 0;
      let backgroundImageImported = false;
      if (validation.data.appearance) {
        Object.assign(this.data, validation.data.appearance);
        fieldsImported += Object.keys(validation.data.appearance).length;
        // Check if background image was imported
        if (validation.data.appearance.backgroundDataUri) {
          backgroundImageImported = true;
        }
        // Ensure backgroundDataUri is used, not backgroundImage
        if (this.data.backgroundImage && !this.data.backgroundDataUri) {
          this.data.backgroundDataUri = this.data.backgroundImage;
          delete this.data.backgroundImage;
          backgroundImageImported = true;
        }
      }
      if (validation.data.settings) {
        Object.assign(this.data, validation.data.settings);
        fieldsImported += Object.keys(validation.data.settings).length;
      }
      
      // Handle legacy format - extract appearance-related fields
      if (validation.type.includes('legacy')) {
        const appearanceFields = [
          'theme', 'customCss', 'pageBackgroundColor', 'backgroundDataUri',
          'backgroundSize', 'backgroundRepeat', 'backgroundPosition', 'backgroundWidth', 'backgroundHeight',
          'showIcons', 'showUrls', 'showColumnHeaders',
          // Theme-specific CSS fields
          'lightCss', 'lightCssEnabled', 'darkCss', 'darkCssEnabled', 'browserCss', 'browserCssEnabled',
          // Column animation settings (global settings, not theme-specific)
          'columnAnimationEnabled', 'columnAnimationStyle', 'columnAnimationMode',
          'columnAnimationDuration', 'columnAnimationDelay', 'columnAnimationStagger', 'columnAnimationStylesheetOnly'
        ];
        appearanceFields.forEach(field => {
          if (validation.data[field] !== undefined) {
            this.data[field] = validation.data[field];
            fieldsImported++;
            // Check for background image
            if (field === 'backgroundDataUri' && validation.data[field]) {
              backgroundImageImported = true;
            }
          }
        });
        // Handle legacy backgroundImage field
        if (validation.data.backgroundImage !== undefined) {
          this.data.backgroundDataUri = validation.data.backgroundImage;
          fieldsImported++;
          backgroundImageImported = true;
        }
      }
      
      console.log(`🔍 DataManager: Importing ${fieldsImported} appearance fields`);
      
      // Use immediate save for imports
      console.log('💾 Saving imported appearance data...');
      await StorageManager.saveImmediate(this.data);
      console.log('✅ Appearance data saved successfully!');
      
      // Show import result modal
      const importStats = {
        columnsImported: 0,
        linksImported: 0,
        settingsImported: fieldsImported,
        customFaviconsImported: 0, // Appearance import doesn't include custom favicons
        backgroundImageImported,
        faviconUrlsKept: 0,
        faviconUrlsRemoved: 0
      };
      
      console.log('✅ Appearance import completed successfully! Showing result modal...');
      await this.uiManager.createImportResultModal(importStats);
      
      // Reload page after user clicks OK
      console.log('🔄 Reloading page...');
      location.reload();

    } catch (error) {
      console.error('❌ DataManager: Failed to import appearance:', error);
      console.error('❌ DataManager: Error stack:', error.stack);
      
      // Safe error feedback with fallback
      try {
        this.uiManager.showError(`Failed to import appearance: ${error.message}`);
        this.uiManager.showStatus('Import failed', 'error');
      } catch (uiError) {
        console.error('Error message display failed:', uiError);
        alert(`Import failed: ${error.message}`); // Fallback to basic alert
      }
    }
  }

  /**
   * Import complete theme (everything)
   * @param {File} file - ZIP or JSON file
   */
  async importCompleteTheme(file) {
    if (!file) return;

    try {
      console.log('🚀 DataManager: Starting complete theme import for file:', file.name);
      
      // Show backup prompt modal
      const userChoice = await this.uiManager.createImportBackupModal(
        'complete', 
        file, 
        () => this.exportCompleteTheme()
      );
      
      if (userChoice === 'cancel') {
        console.log('📝 Complete theme import cancelled by user');
        return;
      }
      
      // Safe UI feedback with fallback
      try {
        this.uiManager.showStatus('Validating import...', 'saving');
      } catch (uiError) {
        console.log('Status update failed, continuing with import...');
      }
      
      const validation = await this.validateImportFile(file);
      console.log('🔍 DataManager: Validation result:', validation);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Safe UI feedback with fallback
      try {
        this.uiManager.showStatus('Importing complete theme...', 'saving');
      } catch (uiError) {
        console.log('Status update failed, continuing with import...');
      }

      // Import all data based on new format
      let columnsImported = 0;
      let linksImported = 0;
      let faviconUrlsRemoved = 0;
      let faviconUrlsKept = 0;
      let customFaviconsImported = 0;
      let backgroundImageImported = false;
      let fieldsImported = 0;
      
      console.log('🔄 Processing complete theme import...');
      
      if (validation.data.content) {
        const processedColumns = this.processImportColumns(validation.data.content.columns);
        this.data.columns = processedColumns.columns;
        columnsImported = processedColumns.columns?.length || 0;
        linksImported = processedColumns.linksCount;
        faviconUrlsRemoved = processedColumns.faviconUrlsRemoved;
        faviconUrlsKept = processedColumns.faviconUrlsKept;
        customFaviconsImported = processedColumns.customFaviconsImported;
      }
      if (validation.data.appearance) {
        Object.assign(this.data, validation.data.appearance);
        fieldsImported += Object.keys(validation.data.appearance).length;
        // Check if background image was imported
        if (validation.data.appearance.backgroundDataUri) {
          backgroundImageImported = true;
        }
        // Ensure backgroundDataUri is used, not backgroundImage
        if (this.data.backgroundImage && !this.data.backgroundDataUri) {
          this.data.backgroundDataUri = this.data.backgroundImage;
          delete this.data.backgroundImage;
          backgroundImageImported = true;
        }
      }
      if (validation.data.settings) {
        Object.assign(this.data, validation.data.settings);
        fieldsImported += Object.keys(validation.data.settings).length;
      }
      
      // Handle legacy format
      if (validation.type.includes('legacy') && validation.data.columns) {
        const processedColumns = this.processImportColumns(validation.data.columns);
        this.data.columns = processedColumns.columns;
        columnsImported = processedColumns.columns?.length || 0;
        linksImported = processedColumns.linksCount;
        faviconUrlsRemoved = processedColumns.faviconUrlsRemoved;
        faviconUrlsKept = processedColumns.faviconUrlsKept;
        customFaviconsImported = processedColumns.customFaviconsImported;
        
        // Copy other legacy fields
        const dataWithoutColumns = { ...validation.data };
        delete dataWithoutColumns.columns;
        Object.assign(this.data, dataWithoutColumns);
        fieldsImported += Object.keys(dataWithoutColumns).length;
        
        // Check for background image in legacy data
        if (validation.data.backgroundDataUri || validation.data.backgroundImage) {
          backgroundImageImported = true;
        }
      }
      
      console.log(`📊 Import statistics:`);
      console.log(`   - Columns: ${columnsImported}`);
      console.log(`   - Links: ${linksImported}`);
      console.log(`   - Settings: ${fieldsImported}`);
      console.log(`   - Custom favicons imported: ${customFaviconsImported}`);
      console.log(`   - Background image imported: ${backgroundImageImported}`);
      console.log(`   - Favicon URLs kept: ${faviconUrlsKept}`);
      console.log(`   - Favicon URLs removed: ${faviconUrlsRemoved}`);
      
      // Use immediate save for imports
      console.log('💾 Saving complete theme data...');
      await StorageManager.saveImmediate(this.data);
      console.log('✅ Complete theme data saved successfully!');
      
      // Show import result modal
      const importStats = {
        columnsImported,
        linksImported,
        settingsImported: fieldsImported,
        customFaviconsImported,
        backgroundImageImported,
        faviconUrlsKept,
        faviconUrlsRemoved
      };
      
      console.log('✅ Complete theme import completed successfully! Showing result modal...');
      await this.uiManager.createImportResultModal(importStats);
      
      // Reload page after user clicks OK
      console.log('🔄 Reloading page...');
      location.reload();

    } catch (error) {
      console.error('❌ DataManager: Failed to import complete theme:', error);
      console.error('❌ DataManager: Error stack:', error.stack);
      
      // Safe error feedback with fallback
      try {
        this.uiManager.showError(`Failed to import complete theme: ${error.message}`);
        this.uiManager.showStatus('Import failed', 'error');
      } catch (uiError) {
        console.error('Error message display failed:', uiError);
        alert(`Import failed: ${error.message}`); // Fallback to basic alert
      }
    }
  }

  /**
   * Import data from JSON file (legacy function - keeping for compatibility)
   * @param {File} file - JSON file
   */
  async importData(file) {
    if (!file) return;

    try {
      console.log('🚀 DataManager: Starting legacy JSON import for file:', file.name);
      
      // Safe UI feedback with fallback
      try {
        this.uiManager.showStatus('Importing JSON data...', 'saving');
      } catch (uiError) {
        console.log('Status update failed, continuing with import...');
      }
      
      const text = await file.text();
      await StorageManager.importData(text);

      console.log('✅ DataManager: Legacy JSON import completed successfully!');
      
      // Safe UI feedback with fallback
      try {
        this.uiManager.showSuccess('Legacy JSON import successful!');
        this.uiManager.showStatus('Import complete', 'saved');
      } catch (uiError) {
        console.log('Success message failed, but import completed successfully');
      }
      
      // Immediate reload for smooth experience
      location.reload();

    } catch (error) {
      console.error('❌ DataManager: Failed to import legacy JSON data:', error);
      console.error('❌ DataManager: Error stack:', error.stack);
      
      // Safe error feedback with fallback
      try {
        this.uiManager.showError(`Failed to import data: ${error.message}. Please check the file format and try again.`);
        this.uiManager.showStatus('Import failed', 'error');
      } catch (uiError) {
        console.error('Error message display failed:', uiError);
        alert(`Import failed: ${error.message}`); // Fallback to basic alert
      }
    }
  }

  /**
   * Process imported columns to filter out iconUrlOverride
   * @param {Array} columns - Columns to process
   * @returns {Object} Processed columns with statistics
   */
  processImportColumns(columns) {
    let linksCount = 0;
    let faviconUrlsRemoved = 0;
    let faviconUrlsKept = 0;
    let customFaviconsImported = 0;
    
    const processedColumns = columns.map(column => {
      const processedColumn = { ...column };
      
      // Process items array (current format)
      if (column.items && Array.isArray(column.items)) {
        processedColumn.items = column.items.map(item => {
          if (item.type === 'link') {
            linksCount++;
            const processedItem = { ...item };
            
            // Handle iconUrlOverride per new policy
            if (processedItem.iconUrlOverride) {
              const shouldKeep = this.shouldKeepFaviconUrl(processedItem.iconUrlOverride);
              if (shouldKeep) {
                // Extract domain and reconstruct with preferred size (32px)
                try {
                  const url = new URL(processedItem.iconUrlOverride);
                  const domain = url.searchParams.get('domain');
                  if (domain) {
                    processedItem.iconUrlOverride = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
                  }
                } catch (e) {
                  // If extraction fails, keep original
                }
                console.log(`✅ Keeping Google favicon URL for: ${processedItem.title || processedItem.url}`);
                faviconUrlsKept++;
              } else {
                console.log(`🚫 Removing custom favicon URL for: ${processedItem.title || processedItem.url}`);
                delete processedItem.iconUrlOverride;
                faviconUrlsRemoved++;
              }
            }
            
            // Count custom favicons
            if (processedItem.iconDataUri) {
              customFaviconsImported++;
            }
            
            // Ensure required fields exist
            processedItem.iconDataUri = processedItem.iconDataUri || null;
            processedItem.customClasses = processedItem.customClasses || '';
            
            return processedItem;
          }
          return item; // Return non-link items unchanged (like dividers)
        });
      }
      
      // Process legacy links array if exists
      if (column.links && Array.isArray(column.links)) {
        processedColumn.links = column.links.map(link => {
          linksCount++;
          const processedLink = { ...link };
          
          // Handle iconUrlOverride per new policy
          if (processedLink.iconUrlOverride) {
            const shouldKeep = this.shouldKeepFaviconUrl(processedLink.iconUrlOverride);
            if (shouldKeep) {
              // Extract domain and reconstruct with preferred size (32px)
              try {
                const url = new URL(processedLink.iconUrlOverride);
                const domain = url.searchParams.get('domain');
                if (domain) {
                  processedLink.iconUrlOverride = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
                }
              } catch (e) {
                // If extraction fails, keep original
              }
              console.log(`✅ Keeping Google favicon URL for: ${processedLink.title || processedLink.url}`);
              faviconUrlsKept++;
            } else {
              console.log(`🚫 Removing custom favicon URL for: ${processedLink.title || processedLink.url}`);
              delete processedLink.iconUrlOverride;
              faviconUrlsRemoved++;
            }
          }
          
          // Count custom favicons
          if (processedLink.iconDataUri) {
            customFaviconsImported++;
          }
          
          // Ensure required fields exist
          processedLink.iconDataUri = processedLink.iconDataUri || null;
          processedLink.customClasses = processedLink.customClasses || '';
          
          return processedLink;
        });
      }
      
      return processedColumn;
    });
    
    return {
      columns: processedColumns,
      linksCount,
      faviconUrlsRemoved,
      faviconUrlsKept,
      customFaviconsImported
    };
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
   * Confirm reset all data
   */
  confirmResetAll() {
    const modal = this.uiManager.createModal('confirm', {
      title: 'Reset All Data',
      message: 'Are you sure you want to reset all data to defaults? This will delete all your columns, links, and settings. This action cannot be undone.'
    });

    const confirmBtn = modal.querySelector('.modal-confirm-btn');
    confirmBtn.addEventListener('click', () => {
      this.resetAll();
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Reset all data to defaults
   */
  async resetAll() {
    try {
      await StorageManager.reset();
      location.reload();

    } catch (error) {
      console.error('Failed to reset data:', error);
      this.uiManager.showError('Failed to reset data. Please try again.');
    }
  }

  /**
   * Update storage information display
   */
  async updateStorageInfo() {
    try {
      const usage = await StorageManager.checkStorageUsage();
      const metrics = this.calculateStorageMetrics(this.data);
      
      this.updateStorageDisplay(usage, metrics);

    } catch (error) {
      console.error('Failed to update storage info:', error);
    }
  }

  /**
   * Calculate detailed storage metrics
   * @param {Object} data - Extension data
   * @returns {Object} Storage metrics breakdown
   */
  calculateStorageMetrics(data) {
    const metrics = {
      totalLinks: 0,
      totalColumns: data.columns ? data.columns.length : 0,
      totalDividers: 0,
      customFavicons: 0,
      customFaviconsSize: 0,
      backgroundImageSize: 0,
      customCssSize: 0,
      textDataSize: 0
    };

    // Analyze columns and items
    if (data.columns) {
      data.columns.forEach(column => {
        // Count column name and custom classes size
        metrics.textDataSize += new Blob([column.name || '']).size;
        metrics.textDataSize += new Blob([column.customClasses || '']).size;
        
        if (column.items) {
          column.items.forEach(item => {
            if (item.type === 'link') {
              metrics.totalLinks++;
              
              // Count text data (URL, title, custom classes)
              metrics.textDataSize += new Blob([item.url || '']).size;
              metrics.textDataSize += new Blob([item.title || '']).size;
              metrics.textDataSize += new Blob([item.customClasses || '']).size;
              
              // Count custom favicon data
              if (item.iconDataUri) {
                metrics.customFavicons++;
                metrics.customFaviconsSize += new Blob([item.iconDataUri]).size;
              }
              if (item.iconUrlOverride) {
                metrics.textDataSize += new Blob([item.iconUrlOverride]).size;
              }
              
            } else if (item.type === 'divider') {
              metrics.totalDividers++;
              metrics.textDataSize += new Blob([item.title || '']).size;
              metrics.textDataSize += new Blob([item.customClasses || '']).size;
            }
          });
        }
      });
    }

    // Calculate background image size
    if (data.backgroundDataUri) {
      metrics.backgroundImageSize = new Blob([data.backgroundDataUri]).size;
    }

    // Calculate custom CSS size (including theme-specific CSS)
    let totalCssSize = 0;
    if (data.customCss) {
      totalCssSize += new Blob([data.customCss]).size;
    }
    
    // Add theme-specific CSS sizes
    const themes = ['light', 'dark', 'browser'];
    themes.forEach(theme => {
      const cssField = `${theme}Css`;
      if (data[cssField]) {
        totalCssSize += new Blob([data[cssField]]).size;
      }
    });
    
    metrics.customCssSize = totalCssSize;

    // Add settings and other text data
    const settingsText = JSON.stringify({
      theme: data.theme,
      pageBackgroundColor: data.pageBackgroundColor,
      backgroundSize: data.backgroundSize,
      backgroundRepeat: data.backgroundRepeat,
      backgroundPosition: data.backgroundPosition,
      backgroundAttachment: data.backgroundAttachment,
      showIcons: data.showIcons,
      showUrls: data.showUrls,
      showColumnHeaders: data.showColumnHeaders,
      showAdvancedOptions: data.showAdvancedOptions,
      // Column animation settings
      columnAnimationEnabled: data.columnAnimationEnabled,
      columnAnimationStyle: data.columnAnimationStyle,
      columnAnimationMode: data.columnAnimationMode,
      columnAnimationDuration: data.columnAnimationDuration,
      columnAnimationDelay: data.columnAnimationDelay,
      columnAnimationStagger: data.columnAnimationStagger,
      columnAnimationStylesheetOnly: data.columnAnimationStylesheetOnly
    });
    metrics.textDataSize += new Blob([settingsText]).size;

    return metrics;
  }

  /**
   * Update storage display with detailed metrics
   * @param {Object} usage - Storage usage info
   * @param {Object} metrics - Storage metrics breakdown
   */
  updateStorageDisplay(usage, metrics) {
    const storageInfo = document.querySelector('.storage-info');
    
    // Build new storage info HTML
    const storageHtml = `
      <div class="storage-overview">
        <h4>Total Storage Used: ${usage.formatted}</h4>
        ${usage.isWarning ? '<div class="storage-warning">⚠️ High usage - consider optimizing large images</div>' : ''}
      </div>
      
      <div class="storage-breakdown">
        <div class="storage-section">
          <h5>Content</h5>
          <div class="storage-metrics">
            <div class="metric-item">
              <span class="metric-label">Links:</span>
              <span class="metric-value">${metrics.totalLinks}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Columns:</span>
              <span class="metric-value">${metrics.totalColumns}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Dividers:</span>
              <span class="metric-value">${metrics.totalDividers}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Text data:</span>
              <span class="metric-value">${this.formatBytes(metrics.textDataSize)}</span>
            </div>
          </div>
        </div>

        <div class="storage-section">
          <h5>Media & Customization</h5>
          <div class="storage-metrics">
            <div class="metric-item">
              <span class="metric-label">Custom favicons:</span>
              <span class="metric-value">${metrics.customFavicons} (${this.formatBytes(metrics.customFaviconsSize)})</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Background image:</span>
              <span class="metric-value">${metrics.backgroundImageSize > 0 ? this.formatBytes(metrics.backgroundImageSize) : 'None'}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Custom CSS:</span>
              <span class="metric-value">${metrics.customCssSize > 0 ? this.formatBytes(metrics.customCssSize) : 'None'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="storage-tips">
        <h5>Storage Tips</h5>
        <ul>
          ${metrics.backgroundImageSize > 500 * 1024 ? '<li>Consider compressing your background image to reduce storage usage</li>' : ''}
          ${metrics.customFaviconsSize > 100 * 1024 ? '<li>Custom favicons are using significant space - consider removing unused ones</li>' : ''}
          ${metrics.customCssSize > 50 * 1024 ? '<li>Custom CSS is quite large - consider optimizing for better performance</li>' : ''}
          ${metrics.totalLinks > 500 ? '<li>Large number of links may slow down the extension</li>' : ''}
          ${!metrics.backgroundImageSize && !metrics.customFavicons && !metrics.customCssSize ? '<li>Your storage usage is primarily text data, which is very efficient</li>' : ''}
        </ul>
      </div>
    `;
    
    storageInfo.innerHTML = storageHtml;
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}