/**
 * UI Manager - Link Stacker Options
 * Handles UI utilities, modals, status indicators, and user feedback
 */

class UIManager {
  constructor(templates) {
    this.templates = templates;
  }

  /**
   * Create modal
   * @param {string} type - Modal type ('preview' or 'confirm')
   * @param {Object} options - Modal options
   * @returns {Element} Modal element
   */
  createModal(type, options = {}) {
    const template = this.templates[type === 'preview' ? 'previewModal' : 'confirmModal'];
    const modal = template.content.cloneNode(true);
    const modalEl = modal.querySelector('.modal-overlay');

    if (type === 'confirm') {
      const titleEl = modal.querySelector('.modal-title');
      const messageEl = modal.querySelector('.modal-message');

      titleEl.textContent = options.title || 'Confirm';
      messageEl.textContent = options.message || 'Are you sure?';
    }

    // Setup close handlers
    const closeBtn = modal.querySelector('.modal-close-btn');
    const cancelBtn = modal.querySelector('.modal-cancel-btn');

    const closeModal = () => modalEl.remove();

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    // Escape key closes modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    return modalEl;
  }

  /**
   * Show modal with custom content
   * @param {string} title - Modal title
   * @param {string} message - Modal message
   * @param {Array} buttons - Button configuration
   * @returns {Element} Modal element
   */
  showModal(title, message, buttons = []) {
    const modal = this.createModal('confirm', { title, message });
    
    if (buttons.length > 0) {
      const buttonContainer = modal.querySelector('.modal-footer');
      if (!buttonContainer) {
        console.error('Modal footer not found');
        return modal;
      }
      buttonContainer.innerHTML = '';
      
      buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.className = btn.isPrimary ? 'btn btn-primary modal-confirm-btn' : 'btn btn-secondary modal-cancel-btn';
        button.addEventListener('click', () => {
          btn.action();
          modal.remove();
        });
        buttonContainer.appendChild(button);
      });
    }
    
    return modal;
  }

  /**
   * Create import backup prompt modal
   * @param {string} importType - Type of import (content, appearance, complete)
   * @param {File} file - The file being imported
   * @param {Function} onBackup - Callback to trigger backup
   * @returns {Promise} Promise that resolves with user choice
   */
  createImportBackupModal(importType, file, onBackup) {
    return new Promise((resolve) => {
      const template = this.templates.importBackupModal;
      const modal = template.content.cloneNode(true);
      const modalEl = modal.querySelector('.modal-overlay');

      // Set type-specific content
      const descriptionEl = modal.querySelector('.backup-description');
      const fileNameEl = modal.querySelector('.file-name');
      const fileSizeEl = modal.querySelector('.file-size');

      // Import type specific messages
      const messages = {
        content: 'This will replace your current columns and links.',
        appearance: 'This will replace your current themes, CSS, and appearance settings.',
        complete: 'This will replace ALL your current data including columns, links, themes, and settings.'
      };

      descriptionEl.textContent = messages[importType] || messages.complete;
      fileNameEl.textContent = file.name;
      fileSizeEl.textContent = this.formatFileSize(file.size);

      // Setup button handlers
      const closeModal = () => {
        modalEl.remove();
        resolve('cancel');
      };

      const closeBtn = modal.querySelector('.modal-close-btn');
      const cancelBtn = modal.querySelector('.modal-cancel-btn');
      const backupBtn = modal.querySelector('.modal-backup-btn');
      const proceedBtn = modal.querySelector('.modal-proceed-btn');

      closeBtn.addEventListener('click', closeModal);
      cancelBtn.addEventListener('click', closeModal);

      backupBtn.addEventListener('click', async () => {
        modalEl.remove();
        // Trigger backup before proceeding
        await onBackup();
        resolve('backup');
      });

      proceedBtn.addEventListener('click', () => {
        modalEl.remove();
        resolve('proceed');
      });

      // Escape key closes modal
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      // Click outside closes modal
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
      });

      document.body.appendChild(modalEl);
    });
  }

  /**
   * Create import result modal
   * @param {Object} importStats - Import statistics
   * @returns {Promise} Promise that resolves when user clicks OK
   */
  createImportResultModal(importStats) {
    return new Promise((resolve) => {
      const template = this.templates.importResultModal;
      const modal = template.content.cloneNode(true);
      const modalEl = modal.querySelector('.modal-overlay');

      // Populate statistics
      const summaryEl = modal.querySelector('.import-summary');
      const columnsEl = modal.querySelector('#imported-columns');
      const linksEl = modal.querySelector('#imported-links');
      const settingsEl = modal.querySelector('#imported-settings');
      const customFaviconsEl = modal.querySelector('#imported-custom-favicons');
      const backgroundImageEl = modal.querySelector('#imported-background-image');
      const customFaviconsStatEl = modal.querySelector('#custom-favicons-stat');
      const backgroundImageStatEl = modal.querySelector('#background-image-stat');
      const faviconChangesEl = modal.querySelector('.favicon-changes');
      const faviconsKeptEl = modal.querySelector('#favicons-kept');
      const faviconsRemovedEl = modal.querySelector('#favicons-removed');

      // Set summary
      summaryEl.textContent = this.generateImportSummary(importStats);

      // Set statistics
      columnsEl.textContent = importStats.columnsImported || 0;
      linksEl.textContent = importStats.linksImported || 0;
      settingsEl.textContent = importStats.settingsImported || 0;
      
      // Show custom favicons if any were imported
      if (importStats.customFaviconsImported > 0) {
        customFaviconsStatEl.style.display = 'block';
        customFaviconsEl.textContent = importStats.customFaviconsImported;
      }
      
      // Show background image if one was imported
      if (importStats.backgroundImageImported) {
        backgroundImageStatEl.style.display = 'block';
        backgroundImageEl.textContent = 'Yes';
      }

      // Show favicon changes if any
      if (importStats.faviconUrlsKept > 0 || importStats.faviconUrlsRemoved > 0) {
        faviconChangesEl.style.display = 'block';
        
        if (importStats.faviconUrlsKept > 0) {
          const keptItem = modal.querySelector('.favicon-item.kept');
          keptItem.style.display = 'block';
          faviconsKeptEl.textContent = importStats.faviconUrlsKept;
        }
        
        if (importStats.faviconUrlsRemoved > 0) {
          const removedItem = modal.querySelector('.favicon-item.removed');
          removedItem.style.display = 'block';
          faviconsRemovedEl.textContent = importStats.faviconUrlsRemoved;
        }
      }

      // Setup OK button
      const okBtn = modal.querySelector('.modal-ok-btn');
      okBtn.addEventListener('click', () => {
        modalEl.remove();
        resolve();
      });

      // Escape key closes modal
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          modalEl.remove();
          resolve();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      document.body.appendChild(modalEl);
    });
  }

  /**
   * Generate import summary text
   * @param {Object} importStats - Import statistics
   * @returns {string} Summary text
   */
  generateImportSummary(importStats) {
    const parts = [];
    
    if (importStats.columnsImported > 0) {
      parts.push(`${importStats.columnsImported} column${importStats.columnsImported !== 1 ? 's' : ''}`);
    }
    
    if (importStats.linksImported > 0) {
      parts.push(`${importStats.linksImported} link${importStats.linksImported !== 1 ? 's' : ''}`);
    }
    
    if (importStats.settingsImported > 0) {
      parts.push(`${importStats.settingsImported} setting${importStats.settingsImported !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return 'Import completed successfully.';
    }

    return `Successfully imported ${parts.join(', ')}.`;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Toggle column expanded/collapsed state
   */
  toggleColumn(columnEl) {
    const isExpanded = columnEl.classList.contains('expanded');
    
    if (isExpanded) {
      columnEl.classList.remove('expanded');
      columnEl.classList.add('collapsed');
    } else {
      columnEl.classList.remove('collapsed');
      columnEl.classList.add('expanded');
    }
  }

  /**
   * Toggle link expanded/collapsed state
   */
  toggleLink(linkEl) {
    const isExpanded = linkEl.classList.contains('expanded');
    
    if (isExpanded) {
      linkEl.classList.remove('expanded');
      linkEl.classList.add('collapsed');
    } else {
      linkEl.classList.remove('collapsed');
      linkEl.classList.add('expanded');
    }
  }

  /**
   * Collapse all columns (links remain in their current state)
   */
  collapseAllColumns() {
    const columns = document.querySelectorAll('.column-item');
    columns.forEach(column => {
      column.classList.remove('expanded');
      column.classList.add('collapsed');
    });
  }

  /**
   * Expand all columns (links remain in their current state)
   */
  expandAllColumns() {
    const columns = document.querySelectorAll('.column-item');
    columns.forEach(column => {
      column.classList.remove('collapsed');
      column.classList.add('expanded');
    });
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error('UIManager Error:', message);
    this.showToast(message, 'error');
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    console.log('UIManager Success:', message);
    this.showToast(message, 'success');
  }

  /**
   * Show info message
   */
  showInfo(message) {
    console.info('UIManager Info:', message);
    this.showToast(message, 'info');
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast ('success', 'error', 'info')
   * @param {number} duration - Duration in milliseconds (default: 4000)
   */
  showToast(message, type = 'info', duration = 4000) {
    try {
      // Defensive check for document.body
      if (!document.body) {
        console.error('Document body not ready for toast');
        return null;
      }

      // Create toast container if it doesn't exist
      let toastContainer = document.querySelector('.toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
      }

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      // Add icon based on type
      const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
      };
      
      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close">&times;</button>
      `;

      // Add close functionality
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.removeToast(toast);
        });
      }

      // Add to container
      toastContainer.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('toast-show');
      });

      // Auto-remove after duration
      setTimeout(() => {
        this.removeToast(toast);
      }, duration);

      return toast;
      
    } catch (error) {
      console.error('Toast creation failed:', error);
      // Fallback to console log
      console.log(`${type.toUpperCase()}: ${message}`);
      return null;
    }
  }

  /**
   * Remove toast notification
   * @param {Element} toast - Toast element to remove
   */
  removeToast(toast) {
    if (toast && toast.parentNode) {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  /**
   * Show status message in the save status area
   * @param {string} message - Status message
   * @param {string} type - Status type ('saving', 'saved', 'error')
   */
  showStatus(message, type = 'info') {
    try {
      const statusElements = [
        document.getElementById('save-status-content'),
        document.getElementById('save-status-appearance'),
        document.getElementById('save-status-general')
      ];

      statusElements.forEach(status => {
        if (status) {
          status.className = `save-status ${type}`;
          const text = status.querySelector('.save-text');
          if (text) {
            text.textContent = message;
          }
        }
      });
    } catch (error) {
      console.error('Status update failed:', error);
      // Fallback to console log
      console.log(`STATUS (${type}): ${message}`);
    }
  }

  /**
   * Show saving status across all panels
   */
  showSavingStatus() {
    const statusElements = [
      document.getElementById('save-status-content'),
      document.getElementById('save-status-appearance'), 
      document.getElementById('save-status-general')
    ];

    statusElements.forEach(status => {
      if (status) {
        status.className = 'save-status saving';
        const icon = status.querySelector('.save-icon');
        const text = status.querySelector('.save-text');
        
        if (icon) {
          icon.innerHTML = `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`;
        }
        if (text) {
          text.textContent = 'Saving...';
        }
      }
    });
  }

  /**
   * Show saved status across all panels
   */
  showSavedStatus() {
    const statusElements = [
      document.getElementById('save-status-content'),
      document.getElementById('save-status-appearance'),
      document.getElementById('save-status-general')
    ];

    statusElements.forEach(status => {
      if (status) {
        status.className = 'save-status';
        const icon = status.querySelector('.save-icon');
        const text = status.querySelector('.save-text');
        
        if (icon) {
          icon.innerHTML = `<polyline points="20,6 9,17 4,12"/>`;
        }
        if (text) {
          text.textContent = 'Saved';
        }
      }
    });
  }

  /**
   * Show error status across all panels
   */
  showErrorStatus(error) {
    console.error('Save failed:', error);
    
    const statusElements = [
      document.getElementById('save-status-content'),
      document.getElementById('save-status-appearance'),
      document.getElementById('save-status-general')
    ];

    statusElements.forEach(status => {
      if (status) {
        status.className = 'save-status error';
        const icon = status.querySelector('.save-icon');
        const text = status.querySelector('.save-text');
        
        if (icon) {
          icon.innerHTML = `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`;
        }
        if (text) {
          text.textContent = 'Error';
        }
      }
    });
  }

  /**
   * Hide the fetching spinner
   */
  hideFetchingSpinner(spinner) {
    if (spinner) {
      spinner.classList.add('hidden');
    }
  }
}