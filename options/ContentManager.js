/**
 * Content Manager - Link Stacker Options
 * Handles all column and item operations: CRUD, drag/drop, temporary item handling
 * Supports both links and dividers
 */

class ContentManager {
  constructor(data, templates, uiManager, linkProcessor, markDirty) {
    this.data = data;
    this.templates = templates;
    this.uiManager = uiManager;
    this.linkProcessor = linkProcessor;
    this.markDirty = markDirty;
  }

  /**
   * Setup content panel (columns and links management)
   */
  setupContentPanel() {
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    const expandAllBtn = document.getElementById('expand-all-btn');

    collapseAllBtn.addEventListener('click', () => {
      this.uiManager.collapseAllColumns();
    });

    expandAllBtn.addEventListener('click', () => {
      this.uiManager.expandAllColumns();
    });

    this.renderContentPanel();
    this.setupAddColumnButtons();
    this.setupAdvancedOptionsToggle();
  }

  /**
   * Setup add column button event listeners
   */
  setupAddColumnButtons() {
    const addColumnBtn = document.getElementById('add-column-options-btn');
    const addFirstColumnBtn = document.getElementById('add-first-column-btn');

    if (addColumnBtn) {
      addColumnBtn.addEventListener('click', () => {
        this.addColumn();
      });
    }

    if (addFirstColumnBtn) {
      addFirstColumnBtn.addEventListener('click', () => {
        this.addColumn();
      });
    }
  }

  /**
   * Render content panel with columns and links
   */
  renderContentPanel() {
    const columnsList = document.getElementById('columns-list');
    
    // Clear only the column elements, preserving empty state and add button
    const existingColumns = columnsList.querySelectorAll('.column-item');
    existingColumns.forEach(column => column.remove());

    // Render columns
    this.data.columns.forEach((column, index) => {
      const columnElement = this.createColumnOptionsElement(column, index);
      // Insert before the add column section
      const addColumnSection = document.getElementById('add-column-section');
      columnsList.insertBefore(columnElement, addColumnSection);
    });

    // Manage empty state and add column section visibility
    this.updateColumnListVisibility();

    // Setup drag and drop for columns
    this.setupColumnDragDrop();
  }

  /**
   * Update visibility of empty state and add column section
   */
  updateColumnListVisibility() {
    const emptyPlaceholder = document.getElementById('empty-columns-placeholder');
    const addColumnSection = document.getElementById('add-column-section');
    
    if (this.data.columns.length === 0) {
      emptyPlaceholder.style.display = 'block';
      addColumnSection.style.display = 'none';
    } else {
      emptyPlaceholder.style.display = 'none';
      addColumnSection.style.display = 'block';
    }
  }

  /**
   * Create column options element
   * @param {Object} column - Column data
   * @param {number} index - Column index
   * @returns {Element} Column element
   */
  createColumnOptionsElement(column, index) {
    const template = this.templates.columnOptions.content.cloneNode(true);
    const columnEl = template.querySelector('.column-item');

    columnEl.dataset.columnId = column.id;
    columnEl.dataset.index = index;
    
    // Start collapsed by default
    columnEl.classList.add('collapsed');

    // Set column header info
    const columnNameInline = columnEl.querySelector('.column-name-inline');
    const columnLinkCount = columnEl.querySelector('.column-link-count');
    
    columnNameInline.value = column.name;
    const itemCount = column.items ? column.items.length : 0;
    const linkCount = column.items ? column.items.filter(item => item.type === 'link').length : 0;
    const dividerCount = column.items ? column.items.filter(item => item.type === 'divider').length : 0;
    
    if (dividerCount > 0) {
      columnLinkCount.textContent = `(${linkCount} links, ${dividerCount} dividers)`;
    } else {
      columnLinkCount.textContent = `(${linkCount} links)`;
    }

    // Setup column name editing
    columnNameInline.addEventListener('input', () => {
      this.updateColumnName(column.id, columnNameInline.value.trim());
    });

    // Prevent accordion toggle when clicking on name input
    columnNameInline.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Setup accordion toggle
    const headerBar = columnEl.querySelector('.column-header-bar');
    headerBar.addEventListener('click', (e) => {
      // Don't toggle when clicking on action buttons
      if (e.target.closest('.column-quick-actions')) return;
      this.uiManager.toggleColumn(columnEl);
    });

    // Setup column actions
    const addLinkBtn = columnEl.querySelector('.add-link-options-btn');
    const addFirstLinkBtn = columnEl.querySelector('.add-first-link-btn');
    const addDividerBtn = columnEl.querySelector('.add-divider-options-btn');
    const addFirstDividerBtn = columnEl.querySelector('.add-first-divider-btn');
    const deleteBtn = columnEl.querySelector('.delete-column-options-btn');

    addLinkBtn.addEventListener('click', () => {
      this.addLinkToColumn(column.id);
    });

    addFirstLinkBtn.addEventListener('click', () => {
      this.addLinkToColumn(column.id);
    });

    addDividerBtn.addEventListener('click', () => {
      this.addDividerToColumn(column.id);
    });

    addFirstDividerBtn.addEventListener('click', () => {
      this.addDividerToColumn(column.id);
    });

    deleteBtn.addEventListener('click', () => {
      this.confirmDeleteColumn(column.id, column.name);
    });

    // Render items (links and dividers) and manage empty state
    const linksList = columnEl.querySelector('.links-list');
    const emptyPlaceholder = columnEl.querySelector('.empty-links-placeholder');
    const addLinkSection = columnEl.querySelector('.add-link-section');

    if (!column.items || column.items.length === 0) {
      emptyPlaceholder.style.display = 'block';
      addLinkSection.style.display = 'none';
    } else {
      emptyPlaceholder.style.display = 'none';
      addLinkSection.style.display = 'block';
      
      column.items.forEach((item, itemIndex) => {
        const itemElement = this.createItemOptionsElement(item, itemIndex);
        linksList.appendChild(itemElement);
      });
    }

    // Setup drag and drop for items
    this.setupItemDragDrop(linksList);

    // Setup custom CSS classes input handling with debounced save
    const customClassesInput = columnEl.querySelector('.column-custom-classes-input');
    if (customClassesInput) {
      // Set initial value
      customClassesInput.value = column.customClasses || '';

      let saveTimeout = null;
      
      // Helper function for debounced saving
      const debouncedSave = (property, value) => {
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        
        saveTimeout = setTimeout(() => {
          this.forceColumnPropertyUpdate(column.id, property, value);
        }, 500);
      };
      
      customClassesInput.addEventListener('input', () => {
        const classes = customClassesInput.value.trim();
        
        // Validate CSS classes
        const isValid = this.validateCssClasses(classes);
        
        // Update visual feedback
        if (isValid || classes === '') {
          customClassesInput.classList.remove('invalid');
        } else {
          customClassesInput.classList.add('invalid');
        }
        
        // Update column data
        column.customClasses = classes;
        
        // Debounced save
        debouncedSave('customClasses', classes);
      });
    }

    // Show/hide advanced options
    this.updateAdvancedOptionsVisibility();

    return columnEl;
  }

  /**
   * Create item options element (link or divider)
   * @param {Object} item - Item data
   * @param {number} index - Item index
   * @returns {Element} Item element
   */
  createItemOptionsElement(item, index) {
    if (item.type === 'divider') {
      return this.createDividerOptionsElement(item, index);
    } else {
      return this.createLinkOptionsElement(item, index);
    }
  }

  /**
   * Create link options element
   * @param {Object} link - Link data
   * @param {number} index - Link index
   * @returns {Element} Link element
   */
  createLinkOptionsElement(link, index) {
    const template = this.templates.linkOptions.content.cloneNode(true);
    const linkEl = template.querySelector('.link-item');

    linkEl.dataset.linkId = link.id;
    linkEl.dataset.index = index;
    
    // Start collapsed by default
    linkEl.classList.add('collapsed');

    // Set link preview
    const iconPreview = linkEl.querySelector('.link-icon-preview');
    const titlePreview = linkEl.querySelector('.link-title-preview');

    this.linkProcessor.setLinkIcon(iconPreview, link);
    titlePreview.textContent = link.title || this.linkProcessor.extractDomainFromUrl(link.url) || 'New Link';

    // Setup accordion toggle
    const headerBar = linkEl.querySelector('.link-header-bar');
    headerBar.addEventListener('click', (e) => {
      // Don't toggle when clicking on action buttons
      if (e.target.closest('.link-quick-actions')) return;
      this.uiManager.toggleLink(linkEl);
    });

    // Set form values
    const urlInput = linkEl.querySelector('.link-url-options-input');
    const titleInput = linkEl.querySelector('.link-title-options-input');
    const iconUrlInput = linkEl.querySelector('.icon-url-input');

    urlInput.value = link.url;
    titleInput.value = link.title || '';
    
    // For domain mode, extract domain from Google URL if present
    let domainValue = '';
    if (link.iconUrlOverride) {
      try {
        const url = new URL(link.iconUrlOverride);
        if (url.hostname === 'www.google.com' && url.pathname === '/s2/favicons') {
          domainValue = url.searchParams.get('domain') || '';
        }
      } catch (e) {
        // If not a valid Google URL, leave empty
      }
    }
    iconUrlInput.value = domainValue;

    // Initialize URL validation state and status indicator
    const url = (link.url || '').trim();
    const statusIndicator = linkEl.querySelector('.link-status-indicator');
    const statusText = linkEl.querySelector('.status-text');
    
    this.linkProcessor.updateLinkStatusIndicator(url, urlInput, statusIndicator, statusText);

    // Setup form handlers with debounced saving and title fetching
    this.setupLinkFormHandlers(link, linkEl);

    // Setup favicon controls
    this.setupFaviconControls(link, linkEl);
    
    // Set initial favicon mode UI state
    this.linkProcessor.updateFaviconModeUI(linkEl, link);

    // Setup refresh button
    const refreshBtn = linkEl.querySelector('.refresh-link-btn');
    refreshBtn.addEventListener('click', async () => {
      if (link.url && this.linkProcessor.isValidUrl(link.url)) {
        await this.linkProcessor.fetchPageTitleAndIcon(link, titleInput, titlePreview, iconPreview, linkEl);
      }
    });

    // Setup delete button
    const deleteBtn = linkEl.querySelector('.delete-link-options-btn');
    deleteBtn.addEventListener('click', () => {
      this.confirmDeleteLink(link.id, link.title || this.linkProcessor.extractDomainFromUrl(link.url));
    });

    // Initialize favicon mode UI
    this.linkProcessor.updateFaviconModeUI(linkEl, link);

    return linkEl;
  }

  /**
   * Setup link form handlers with debounced saving and title fetching
   */
  setupLinkFormHandlers(link, linkEl) {
    const urlInput = linkEl.querySelector('.link-url-options-input');
    const titleInput = linkEl.querySelector('.link-title-options-input');
    const iconUrlInput = linkEl.querySelector('.icon-url-input');
    const customClassesInput = linkEl.querySelector('.link-custom-classes-input');
    const titlePreview = linkEl.querySelector('.link-title-preview');
    const iconPreview = linkEl.querySelector('.link-icon-preview');

    let titleFetchTimeout = null;
    let saveTimeout = null;
    
    // Helper function for debounced saving with validation
    const debouncedSave = (property, value) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // Save if the link is not temporary (existing links have undefined isTemporary or false)
      const shouldSave = !link.isTemporary;
      
      if (shouldSave) {
        saveTimeout = setTimeout(() => {
          // Update the link property first
          link[property] = value;
          // Force update the property and trigger save
          this.forceLinkPropertyUpdate(link.id, property, value);
        }, 500);
      }
    };
    
    urlInput.addEventListener('input', async () => {
      const url = urlInput.value.trim();
      
      // Clear previous timeouts
      if (titleFetchTimeout) {
        clearTimeout(titleFetchTimeout);
      }
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // Get status indicator elements
      const statusIndicator = linkEl.querySelector('.link-status-indicator');
      const statusText = linkEl.querySelector('.status-text');
      
      // Always update validation status immediately to prevent stale states
      this.linkProcessor.updateLinkStatusIndicator(url, urlInput, statusIndicator, statusText);
      
      // Update preview text immediately (but not the link object yet)
      titlePreview.textContent = titleInput.value || this.linkProcessor.extractDomainFromUrl(url) || 'New Link';
      
      // Validate URL and handle fetching
      if (url && this.linkProcessor.isValidUrl(url)) {
        // Debounce the title and icon fetching (wait 500ms after user stops typing)
        titleFetchTimeout = setTimeout(async () => {
          // Create a temporary link object with the new URL for fetching
          const tempLink = { ...link, url: url };
          await this.linkProcessor.fetchPageTitleAndIcon(tempLink, titleInput, titlePreview, iconPreview, linkEl);
        }, 500);
      }
      
      // For temporary links, update immediately
      if (link.isTemporary) {
        link.url = url;
      } else {
        // For saved links, debounce the update
        debouncedSave('url', url);
      }
    });

    urlInput.addEventListener('blur', () => {
      if (link.isTemporary) {
        this.handleTemporaryLinkSave(link);
      }
    });

    titleInput.addEventListener('input', () => {
      const title = titleInput.value.trim();
      
      // Update preview immediately
      titlePreview.textContent = title || this.linkProcessor.extractDomainFromUrl(link.url) || 'New Link';
      
      // For temporary links, update immediately
      if (link.isTemporary) {
        link.title = title;
      } else {
        // For saved links, debounce the update
        debouncedSave('title', title);
      }
    });

    iconUrlInput.addEventListener('input', () => {
      const customDomain = iconUrlInput.value.trim();
      let newOverride = '';
      
      if (customDomain) {
        newOverride = this.linkProcessor.constructGoogleFaviconUrl(customDomain);
        if (!newOverride) {
          // Show invalid feedback (add 'invalid' class)
          iconUrlInput.classList.add('invalid');
          return;
        }
      }
      
      iconUrlInput.classList.remove('invalid');
      
      // Update icon preview immediately
      const tempLink = { ...link, iconUrlOverride: newOverride };
      this.linkProcessor.setLinkIcon(iconPreview, tempLink);
      
      // For temporary links, update immediately
      if (link.isTemporary) {
        link.iconUrlOverride = newOverride;
      } else {
        // For saved links, debounce the update
        debouncedSave('iconUrlOverride', newOverride);
      }
      
      // Update UI
      this.linkProcessor.updateFaviconModeUI(linkEl, tempLink);
    });

    // Custom CSS classes input handling with validation
    if (customClassesInput) {
      // Set initial value
      customClassesInput.value = link.customClasses || '';

      customClassesInput.addEventListener('input', () => {
        const classes = customClassesInput.value.trim();
        
        // Validate CSS classes
        const isValid = this.validateCssClasses(classes);
        
        // Update visual feedback
        if (isValid || classes === '') {
          customClassesInput.classList.remove('invalid');
        } else {
          customClassesInput.classList.add('invalid');
        }
        
        // For temporary links, update immediately
        if (link.isTemporary) {
          link.customClasses = classes;
        } else {
          // For saved links, debounce the update
          debouncedSave('customClasses', classes);
        }
      });
    }
  }

  /**
   * Validate CSS class names
   * @param {string} classes - Space-separated CSS class names
   * @returns {boolean} True if valid
   */
  validateCssClasses(classes) {
    if (!classes || classes.trim() === '') return true;
    
    const classArray = classes.trim().split(/\s+/);
    const validClassRegex = /^[a-zA-Z_][\w\-]*$/;
    
    return classArray.every(className => validClassRegex.test(className));
  }

  /**
   * Setup favicon controls
   */
  setupFaviconControls(link, linkEl) {
    const faviconModeButtons = linkEl.querySelectorAll('.favicon-mode-btn');
    const faviconRemoveBtn = linkEl.querySelector('.favicon-remove-btn');
    const iconFileInput = linkEl.querySelector('.icon-file-input');
    const iconUrlInput = linkEl.querySelector('.icon-url-input');
    const iconPreview = linkEl.querySelector('.link-icon-preview');
    const dropZone = linkEl.querySelector('.favicon-drop-zone');
    const uploadStatus = linkEl.querySelector('.favicon-upload-status');

    // Setup favicon mode toggle
    faviconModeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        
        // If upload button clicked and file already uploaded, do nothing
        const currentLink = this.data.columns.flatMap(col => col.items || [])
          .filter(item => item && item.type === 'link')
          .find(l => l && l.id === link.id);
        if (mode === 'upload' && currentLink && currentLink.iconDataUri) {
          return;
        }
        
        // Reset active states
        faviconModeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (mode === 'upload') {
          // Show drop zone, hide URL input
          iconUrlInput.style.display = 'none';
          dropZone.style.display = 'block';
          uploadStatus.style.display = 'none';
        } else if (mode === 'url') {
          // Show domain input, hide drop zone
          dropZone.style.display = 'none';
          iconUrlInput.style.display = 'block';
          iconUrlInput.focus();
          uploadStatus.style.display = 'none';
          
          // Update placeholder text for domain input
          iconUrlInput.placeholder = 'e.g., fastmail.com';
        }
      });
    });

    // Setup drop zone click
    dropZone.addEventListener('click', () => {
      iconFileInput.click();
    });

    // Setup drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        await this.linkProcessor.handleIconUpload(link.id, files[0], iconPreview, this.updateLinkProperty.bind(this));
        // Get updated link data to include iconSize
        const updatedLink = this.data.columns.flatMap(col => col.items || [])
          .filter(item => item && item.type === 'link')
          .find(l => l && l.id === link.id) || link;
        this.linkProcessor.updateFaviconModeUI(linkEl, updatedLink);
      }
    });

    // Setup favicon remove
    faviconRemoveBtn.addEventListener('click', () => {
      if (confirm('Remove custom favicon? This will revert to the default favicon for this link.')) {
        this.linkProcessor.removeFavicon(link.id, linkEl, this.updateLinkProperty.bind(this), this.data.columns);
      }
    });

    iconFileInput.addEventListener('change', async (e) => {
      await this.linkProcessor.handleIconUpload(link.id, e.target.files[0], iconPreview, this.updateLinkProperty.bind(this));
      // Get updated link data to include iconSize
      const updatedLink = this.data.columns.flatMap(col => col.items || [])
        .filter(item => item && item.type === 'link')
        .find(l => l && l.id === link.id) || link;
      this.linkProcessor.updateFaviconModeUI(linkEl, updatedLink);
    });
  }

  /**
   * Add new column - creates inline editing interface
   */
  async addColumn() {
    try {
      // Create temporary column with unique ID
      const tempColumn = {
        id: `temp_${Date.now()}`,
        name: 'New Column',
        items: [],
        isTemporary: true
      };

      // Add to local data temporarily
      this.data.columns.push(tempColumn);

      // Create and insert the new column element directly
      const columnElement = this.createColumnOptionsElement(tempColumn, this.data.columns.length - 1);
      const addColumnSection = document.getElementById('add-column-section');
      const columnsList = document.getElementById('columns-list');
      
      // Insert before the add column section
      columnsList.insertBefore(columnElement, addColumnSection);
      
      // Update visibility state
      this.updateColumnListVisibility();
      
      // Setup drag and drop for the new column
      this.setupColumnDragDrop();

      // Expand the column for editing
      columnElement.classList.remove('collapsed');
      columnElement.classList.add('expanded');
      
      // Focus on the column name input
      const nameInput = columnElement.querySelector('.column-name-inline');
      if (nameInput) {
        setTimeout(() => {
          nameInput.focus();
          nameInput.select();
        }, 100);
      }

    } catch (error) {
      console.error('Failed to add column:', error);
      this.uiManager.showError('Failed to add column. Please try again.');
    }
  }

  /**
   * Create divider options element
   * @param {Object} divider - Divider data
   * @param {number} index - Divider index
   * @returns {Element} Divider element
   */
  createDividerOptionsElement(divider, index) {
    const template = this.templates.dividerOptions.content.cloneNode(true);
    const dividerEl = template.querySelector('.divider-item');

    dividerEl.dataset.dividerId = divider.id;
    dividerEl.dataset.index = index;
    
    // Start collapsed by default
    dividerEl.classList.add('collapsed');

    // Set divider preview
    const titlePreview = dividerEl.querySelector('.divider-title-preview');
    titlePreview.textContent = divider.title || 'Divider';

    // Setup accordion toggle
    const headerBar = dividerEl.querySelector('.divider-header-bar');
    headerBar.addEventListener('click', (e) => {
      // Don't toggle when clicking on action buttons
      if (e.target.closest('.divider-quick-actions')) return;
      this.uiManager.toggleLink(dividerEl); // Reuse link toggle functionality
    });

    // Set form values
    const titleInput = dividerEl.querySelector('.divider-title-options-input');
    const customClassesInput = dividerEl.querySelector('.divider-custom-classes-input');

    titleInput.value = divider.title || '';
    customClassesInput.value = divider.customClasses || '';

    // Setup form handlers with debounced saving
    this.setupDividerFormHandlers(divider, dividerEl);

    // Setup delete button
    const deleteBtn = dividerEl.querySelector('.delete-divider-options-btn');
    deleteBtn.addEventListener('click', () => {
      this.confirmDeleteDivider(divider.id, divider.title || 'Untitled Divider');
    });

    return dividerEl;
  }

  /**
   * Add link to column - creates inline editing interface
   * @param {string} columnId - Column ID
   */
  async addLinkToColumn(columnId) {
    try {
      // Find the column
      const column = this.data.columns.find(c => c.id === columnId);
      if (!column) {
        this.uiManager.showError('Column not found');
        return;
      }

      // Ensure column has items array
      if (!column.items) {
        column.items = [];
      }

      // Create temporary link with unique ID
      const tempLink = {
        type: 'link',
        id: `temp_${Date.now()}`,
        url: '',
        title: '',
        iconDataUri: null,
        iconUrlOverride: null,
        customClasses: '',
        isTemporary: true
      };

      // Add to local data temporarily
      column.items.push(tempLink);

      // Update the column DOM to include the new link
      this.updateColumnDOM(column);

      // Expand the column if it's collapsed
      const columnEl = document.querySelector(`[data-column-id="${columnId}"]`);
      if (columnEl && columnEl.classList.contains('collapsed')) {
        this.uiManager.toggleColumn(columnEl);
      }

      // Find the new link element and expand it for editing
      const newLinkEl = document.querySelector(`[data-link-id="${tempLink.id}"]`);
      if (newLinkEl) {
        // Expand the link for editing
        newLinkEl.classList.remove('collapsed');
        newLinkEl.classList.add('expanded');
        
        // Focus on the URL input
        const urlInput = newLinkEl.querySelector('.link-url-options-input');
        if (urlInput) {
          setTimeout(() => {
            urlInput.focus();
            urlInput.select();
          }, 100);
        }
      }

    } catch (error) {
      console.error('Failed to add link:', error);
      this.uiManager.showError('Failed to add link. Please try again.');
    }
  }

  /**
   * Add divider to column - creates inline editing interface
   * @param {string} columnId - Column ID
   */
  async addDividerToColumn(columnId) {
    try {
      // Find the column
      const column = this.data.columns.find(c => c.id === columnId);
      if (!column) {
        this.uiManager.showError('Column not found');
        return;
      }

      // Ensure column has items array
      if (!column.items) {
        column.items = [];
      }

      // Create temporary divider with unique ID
      const tempDivider = {
        type: 'divider',
        id: `temp_${Date.now()}`,
        title: '',
        customClasses: '',
        isTemporary: true
      };

      // Add to local data temporarily
      column.items.push(tempDivider);

      // Update the column DOM to include the new divider
      this.updateColumnDOM(column);

      // Expand the column if it's collapsed
      const columnEl = document.querySelector(`[data-column-id="${columnId}"]`);
      if (columnEl && columnEl.classList.contains('collapsed')) {
        this.uiManager.toggleColumn(columnEl);
      }

      // Find the new divider element and expand it for editing
      const newDividerEl = document.querySelector(`[data-divider-id="${tempDivider.id}"]`);
      if (newDividerEl) {
        // Expand the divider for editing
        newDividerEl.classList.remove('collapsed');
        newDividerEl.classList.add('expanded');
        
        // Focus on the title input
        const titleInput = newDividerEl.querySelector('.divider-title-options-input');
        if (titleInput) {
          setTimeout(() => {
            titleInput.focus();
            titleInput.select();
          }, 100);
        }
      }

    } catch (error) {
      console.error('Failed to add divider:', error);
      this.uiManager.showError('Failed to add divider. Please try again.');
    }
  }

  /**
   * Update column name
   * @param {string} columnId - Column ID
   * @param {string} name - New name
   */
  updateColumnName(columnId, name) {
    const column = this.data.columns.find(c => c.id === columnId);
    if (!column) return;

    // Handle empty names by using default
    const finalName = name.trim() || 'New Column';
    
    if (column.name !== finalName) {
      column.name = finalName;
      
      // If this is a temporary column, convert it to permanent
      if (column.isTemporary) {
        this.convertTemporaryColumnToPermanent(column);
      } else {
        this.markDirty();
      }
    }
  }

  /**
   * Convert temporary column to permanent column
   * @param {Object} column - Temporary column to convert
   */
  async convertTemporaryColumnToPermanent(column) {
    try {
      // Generate a permanent ID and update the column
      const permanentId = generateUUID();
      column.id = permanentId;
      delete column.isTemporary;
      
      // Find the DOM element and update its data attribute
      const columnEl = document.querySelector(`[data-column-id^="temp_"]`);
      if (columnEl && columnEl.dataset.columnId.startsWith('temp_')) {
        columnEl.dataset.columnId = permanentId;
        
        // Update event listeners to use new permanent ID
        this.updateColumnEventListeners(columnEl, column);
      }
      
      // Update visibility state after conversion
      this.updateColumnListVisibility();
      this.markDirty();
    } catch (error) {
      console.error('Failed to convert temporary column:', error);
      this.uiManager.showError('Failed to save column. Please try again.');
      // Remove the temporary column on failure
      this.deleteColumn(column.id);
    }
  }

  /**
   * Update event listeners for a column element with new permanent ID
   * @param {Element} columnEl - Column DOM element
   * @param {Object} column - Column data with permanent ID
   */
  updateColumnEventListeners(columnEl, column) {
    // Update add link button event listeners
    const addLinkBtn = columnEl.querySelector('.add-link-options-btn');
    const addFirstLinkBtn = columnEl.querySelector('.add-first-link-btn');
    const deleteBtn = columnEl.querySelector('.delete-column-options-btn');

    if (addLinkBtn) {
      // Clone and replace to remove old event listener
      const newAddLinkBtn = addLinkBtn.cloneNode(true);
      addLinkBtn.parentNode.replaceChild(newAddLinkBtn, addLinkBtn);
      newAddLinkBtn.addEventListener('click', () => {
        this.addLinkToColumn(column.id);
      });
    }

    if (addFirstLinkBtn) {
      // Clone and replace to remove old event listener
      const newAddFirstLinkBtn = addFirstLinkBtn.cloneNode(true);
      addFirstLinkBtn.parentNode.replaceChild(newAddFirstLinkBtn, addFirstLinkBtn);
      newAddFirstLinkBtn.addEventListener('click', () => {
        this.addLinkToColumn(column.id);
      });
    }

    if (deleteBtn) {
      // Clone and replace to remove old event listener
      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
      newDeleteBtn.addEventListener('click', () => {
        this.confirmDeleteColumn(column.id, column.name);
      });
    }
  }

  /**
   * Update link property
   * @param {string} linkId - Link ID
   * @param {string} property - Property name
   * @param {any} value - Property value
   */
  updateLinkProperty(linkId, property, value) {
    for (const column of this.data.columns) {
      const link = column.items ? column.items.find(i => i.id === linkId && i.type === 'link') : null;
      if (link && link[property] !== value) {
        link[property] = value;
        this.markDirty();
        break;
      }
    }
  }

  /**
   * Force update link property (used for debounced saves)
   * @param {string} linkId - Link ID
   * @param {string} property - Property name
   * @param {any} value - Property value
   */
  forceLinkPropertyUpdate(linkId, property, value) {
    for (const column of this.data.columns) {
      const link = column.items ? column.items.find(i => i.id === linkId && i.type === 'link') : null;
      if (link) {
        link[property] = value;
        this.markDirty();
        break;
      }
    }
  }

  /**
   * Force update column property and save
   */
  forceColumnPropertyUpdate(columnId, property, value) {
    const column = this.data.columns.find(c => c.id === columnId);
    if (column) {
      column[property] = value;
      this.markDirty();
    }
  }

  /**
   * Setup drag and drop for columns using SortableJS
   */
  setupColumnDragDrop() {
    const columnsList = document.getElementById('columns-list');

    new Sortable(columnsList, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      draggable: '.column-item', // Only .column-item elements are draggable
      onEnd: (evt) => {
        if (evt.oldIndex !== evt.newIndex) {
          // Get the moved element and its column ID
          const movedElement = evt.item;
          const movedColumnId = movedElement.dataset.columnId;
          
          // Get all column elements in their new DOM order
          const columnElements = Array.from(columnsList.querySelectorAll('.column-item'));
          const newOrder = columnElements.map(el => el.dataset.columnId);
          
          
          // Reorder the data array to match the new DOM order
          const newColumns = [];
          newOrder.forEach(columnId => {
            const column = this.data.columns.find(c => c.id === columnId);
            if (column) {
              newColumns.push(column);
            }
          });
          
          // Update the data with the new order
          this.data.columns = newColumns;

          // Update indices and mark dirty
          this.updateColumnIndices();
          this.markDirty();
          
        }
      }
    });
  }

  /**
   * Setup drag and drop for links using SortableJS
   * @param {Element} linksList - Links list container
   */
  setupItemDragDrop(linksList) {
    // Store reference to this for use in callbacks
    const self = this;
    
    new Sortable(linksList, {
      group: 'link-items',
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onStart: (evt) => {
        // Add visual feedback to all potential drop zones
        document.querySelectorAll('.links-list').forEach(list => {
          if (list !== evt.from) {
            list.classList.add('sortable-drop-zone');
          }
        });
      },
      onEnd: async (evt) => {
        // Remove visual feedback from all drop zones
        document.querySelectorAll('.links-list').forEach(list => {
          list.classList.remove('sortable-drop-zone');
        });
        
        const itemElement = evt.item;
        const itemId = itemElement.dataset.linkId || itemElement.dataset.dividerId;
        const sourceColumnId = evt.from.closest('.column-item').dataset.columnId;
        const targetColumnId = evt.to.closest('.column-item').dataset.columnId;

        // Handle cross-column moves
        if (sourceColumnId !== targetColumnId) {
          try {
            // Update local data directly
            const sourceColumn = self.data.columns.find(c => c.id === sourceColumnId);
            const targetColumn = self.data.columns.find(c => c.id === targetColumnId);
            
            if (sourceColumn && targetColumn) {
              // Ensure both columns have items arrays
              if (!sourceColumn.items) sourceColumn.items = [];
              if (!targetColumn.items) targetColumn.items = [];
              
              // Find and remove the item from source column
              const itemIndex = sourceColumn.items.findIndex(i => i.id === itemId);
              if (itemIndex !== -1) {
                const [movedItem] = sourceColumn.items.splice(itemIndex, 1);
                // Insert at the new position in target column
                const insertIndex = Math.min(evt.newIndex, targetColumn.items.length);
                targetColumn.items.splice(insertIndex, 0, movedItem);
                
                // Update indices and mark dirty to trigger auto-save
                self.updateItemIndices(evt.from);
                self.updateItemIndices(evt.to);
                self.markDirty();
              }
            }
          } catch (error) {
            console.error('Failed to move item between columns:', error);
            self.uiManager.showError('Failed to move item. Please try again.');
            // Refresh the UI to show current state
            self.renderContentPanel();
          }
        } else if (evt.oldIndex !== evt.newIndex) {
          // Handle within-column reordering
          const columnEl = linksList.closest('.column-item');
          const columnId = columnEl.dataset.columnId;
          const column = self.data.columns.find(c => c.id === columnId);

          if (column) {
            // Ensure column has items array
            if (!column.items) column.items = [];
            
            // Move item in data array
            const [movedItem] = column.items.splice(evt.oldIndex, 1);
            column.items.splice(evt.newIndex, 0, movedItem);

            // Update indices and mark dirty
            self.updateItemIndices(linksList);
            self.markDirty();
          }
        }
      }
    });
  }

  /**
   * Update column indices after reordering
   */
  updateColumnIndices() {
    const columnItems = document.querySelectorAll('.column-item');
    columnItems.forEach((item, index) => {
      item.dataset.index = index;
    });
  }

  /**
   * Update item indices after reordering
   * @param {Element} linksList - Items list container
   */
  updateItemIndices(linksList) {
    const items = linksList.querySelectorAll('.link-item, .divider-item');
    items.forEach((item, index) => {
      item.dataset.index = index;
    });
  }

  /**
   * Update link indices after reordering (legacy method for backward compatibility)
   * @param {Element} linksList - Links list container
   */
  updateLinkIndices(linksList) {
    return this.updateItemIndices(linksList);
  }

  /**
   * Confirm delete column
   * @param {string} columnId - Column ID
   * @param {string} columnName - Column name
   */
  confirmDeleteColumn(columnId, columnName) {
    const column = this.data.columns.find(c => c.id === columnId);
    if (!column) return;
    
    // Check if this is a temporary column OR empty column
    const isEmpty = !column.items || column.items.length === 0;
    const isTemporary = column.isTemporary;
    
    if (isTemporary || isEmpty) {
      // Delete temporary or empty columns immediately without confirmation
      this.deleteColumn(columnId);
      return;
    }

    const modal = this.uiManager.createModal('confirm', {
      title: 'Delete Column',
      message: `Are you sure you want to delete "${columnName}" and all its ${column.items ? column.items.length : 0} items? This action cannot be undone.`
    });

    const confirmBtn = modal.querySelector('.modal-confirm-btn');
    confirmBtn.addEventListener('click', () => {
      this.deleteColumn(columnId);
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Delete column
   * @param {string} columnId - Column ID
   */
  deleteColumn(columnId) {
    const column = this.data.columns.find(c => c.id === columnId);
    const wasTemporary = column && column.isTemporary;
    
    // Remove from data array
    this.data.columns = this.data.columns.filter(c => c.id !== columnId);
    
    // Update UI visibility state
    this.updateColumnListVisibility();
    
    // Remove the DOM element directly instead of full re-render
    const columnEl = document.querySelector(`[data-column-id="${columnId}"]`);
    if (columnEl) {
      columnEl.remove();
    }
    
    // Only mark dirty if it wasn't a temporary column
    if (!wasTemporary) {
      this.markDirty();
    }
  }

  /**
   * Confirm delete link
   * @param {string} linkId - Link ID
   * @param {string} linkTitle - Link title
   */
  confirmDeleteLink(linkId, linkTitle) {
    const modal = this.uiManager.createModal('confirm', {
      title: 'Delete Link',
      message: `Are you sure you want to delete "${linkTitle}"? This action cannot be undone.`
    });

    const confirmBtn = modal.querySelector('.modal-confirm-btn');
    confirmBtn.addEventListener('click', async () => {
      await this.deleteLink(linkId);
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Delete link
   * @param {string} linkId - Link ID
   */
  async deleteLink(linkId) {
    // Check if this is a temporary link
    const isTemporary = linkId.startsWith('temp_');
    
    if (isTemporary) {
      // For temporary links, just remove from local data
      this.removeTemporaryLink(linkId);
      return;
    }

    // For saved links, remove from local data and let auto-save handle storage
    try {
      // Find which column contains this link
      let foundColumn = null;
      for (const column of this.data.columns) {
        if (column.items && column.items.find(i => i.id === linkId)) {
          foundColumn = column;
          break;
        }
      }

      if (foundColumn) {
        // Remove from local data
        foundColumn.items = foundColumn.items.filter(i => i.id !== linkId);
        
        // Update the DOM
        this.updateColumnDOM(foundColumn);
        this.markDirty();
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      this.uiManager.showError('Failed to delete link. Please try again.');
    }
  }

  /**
   * Setup divider form handlers with debounced saving
   */
  setupDividerFormHandlers(divider, dividerEl) {
    const titleInput = dividerEl.querySelector('.divider-title-options-input');
    const customClassesInput = dividerEl.querySelector('.divider-custom-classes-input');
    const titlePreview = dividerEl.querySelector('.divider-title-preview');

    let saveTimeout = null;
    
    // Helper function for debounced saving with validation
    const debouncedSave = (property, value) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      saveTimeout = setTimeout(() => {
        if (divider.isTemporary) {
          // Convert temporary divider to permanent on first save
          this.handleTemporaryDividerSave(divider);
        } else {
          // Force update the property and trigger save
          this.forceDividerPropertyUpdate(divider.id, property, value);
        }
      }, 500);
    };
    
    titleInput.addEventListener('input', () => {
      const title = titleInput.value.trim();
      
      // Update preview immediately
      titlePreview.textContent = title || 'Divider';
      
      // Update local data immediately
      divider.title = title;
      
      // Debounced save
      debouncedSave('title', title);
    });

    customClassesInput.addEventListener('input', () => {
      const classes = customClassesInput.value.trim();
      
      // Validate CSS classes
      if (classes && !this.validateCssClasses(classes)) {
        customClassesInput.classList.add('invalid');
        return;
      } else {
        customClassesInput.classList.remove('invalid');
      }
      
      // Update local data immediately
      divider.customClasses = classes;
      
      // Debounced save
      debouncedSave('customClasses', classes);
    });

    // Show/hide advanced options
    this.updateAdvancedOptionsVisibility();
  }

  /**
   * Force update divider property and save
   */
  forceDividerPropertyUpdate(dividerId, property, value) {
    // Find which column contains this divider
    let foundColumn = null;
    let foundDivider = null;
    
    for (const column of this.data.columns) {
      if (column.items) {
        const divider = column.items.find(i => i.id === dividerId && i.type === 'divider');
        if (divider) {
          foundColumn = column;
          foundDivider = divider;
          break;
        }
      }
    }

    if (foundDivider) {
      foundDivider[property] = value;
      this.markDirty();
    }
  }

  /**
   * Confirm delete divider
   */
  confirmDeleteDivider(dividerId, dividerTitle) {
    const modal = this.uiManager.createModal('confirm', {
      title: 'Delete Divider',
      message: `Are you sure you want to delete "${dividerTitle}"? This action cannot be undone.`
    });

    const confirmBtn = modal.querySelector('.modal-confirm-btn');
    confirmBtn.addEventListener('click', async () => {
      await this.deleteDivider(dividerId);
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Delete divider
   */
  async deleteDivider(dividerId) {
    // Check if this is a temporary divider
    const isTemporary = dividerId.startsWith('temp_');
    
    if (isTemporary) {
      // For temporary dividers, just remove from local data
      this.removeTemporaryDivider(dividerId);
      return;
    }

    // For saved dividers, remove from local data and let auto-save handle storage
    try {
      // Find which column contains this divider
      let foundColumn = null;
      for (const column of this.data.columns) {
        if (column.items && column.items.find(i => i.id === dividerId && i.type === 'divider')) {
          foundColumn = column;
          break;
        }
      }

      if (foundColumn) {
        // Remove from local data
        foundColumn.items = foundColumn.items.filter(i => i.id !== dividerId);
        
        // Update the DOM
        this.updateColumnDOM(foundColumn);
        this.markDirty();
      }
    } catch (error) {
      console.error('Failed to delete divider:', error);
      this.uiManager.showError('Failed to delete divider. Please try again.');
    }
  }

  /**
   * Remove temporary divider from DOM and data
   */
  removeTemporaryDivider(dividerId) {
    // Remove from DOM
    const dividerEl = document.querySelector(`[data-divider-id="${dividerId}"]`);
    if (dividerEl) {
      dividerEl.remove();
    }

    // Remove from local data
    for (const column of this.data.columns) {
      if (column.items) {
        column.items = column.items.filter(i => i.id !== dividerId);
      }
    }

    // Update visibility states
    this.data.columns.forEach(column => {
      this.updateColumnDOM(column);
    });
  }

  /**
   * Handle saving of temporary divider
   */
  async handleTemporaryDividerSave(tempDivider) {
    try {
      // Find the column containing this temporary divider
      let column = null;
      for (const col of this.data.columns) {
        if (col.items && col.items.find(i => i.id === tempDivider.id)) {
          column = col;
          break;
        }
      }

      if (!column) {
        console.error('Column not found for temporary divider:', tempDivider.id);
        return;
      }

      // Locate the temp divider element
      const dividerEl = document.querySelector(`[data-divider-id="${tempDivider.id}"]`);

      // Create new permanent divider with new ID
      const savedDivider = {
        type: 'divider',
        id: generateUUID(),
        title: tempDivider.title || '',
        customClasses: tempDivider.customClasses || ''
      };

      // Replace temporary divider with saved divider in data
      const tempIndex = column.items.findIndex(i => i.id === tempDivider.id);
      if (tempIndex !== -1) {
        column.items[tempIndex] = savedDivider;
      }

      // Update the DOM element in-place
      if (dividerEl) {
        dividerEl.dataset.dividerId = savedDivider.id;
        this.updateDividerEventListeners(dividerEl, savedDivider);
      }

      this.markDirty();

    } catch (error) {
      console.error('Failed to save temporary divider:', error);
      this.uiManager.showError('Failed to save divider. Please try again.');
    }
  }

  /**
   * Update event listeners for a saved divider
   * @param {Element} dividerEl - Divider DOM element
   * @param {Object} savedDivider - Saved divider data
   */
  updateDividerEventListeners(dividerEl, savedDivider) {
    const deleteBtn = dividerEl.querySelector('.delete-divider-options-btn');
    if (deleteBtn) {
      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
      newDeleteBtn.addEventListener('click', () => {
        this.confirmDeleteDivider(savedDivider.id, savedDivider.title || 'Untitled Divider');
      });
    }
  }

  /**
   * Update a single column's DOM without affecting other accordion states
   */
  updateColumnDOM(column) {
    const columnEl = document.querySelector(`[data-column-id="${column.id}"]`);
    if (!columnEl) return;

    // Store current accordion state
    const wasExpanded = columnEl.classList.contains('expanded');

    // Store expanded states of all items before clearing
    const itemStates = new Map();
    const existingItems = columnEl.querySelectorAll('.link-item, .divider-item');
    existingItems.forEach(item => {
      const itemId = item.dataset.linkId || item.dataset.dividerId;
      if (itemId) {
        itemStates.set(itemId, item.classList.contains('expanded'));
      }
    });

    // Update column link count
    const linkCount = columnEl.querySelector('.column-link-count');
    if (linkCount) {
      const itemCount = column.items ? column.items.length : 0;
      const linkItemCount = column.items ? column.items.filter(item => item.type === 'link').length : 0;
      const dividerCount = column.items ? column.items.filter(item => item.type === 'divider').length : 0;
      
      if (dividerCount > 0) {
        linkCount.textContent = `(${linkItemCount} links, ${dividerCount} dividers)`;
      } else {
        linkCount.textContent = `(${linkItemCount} links)`;
      }
    }

    // Update links section
    const linksList = columnEl.querySelector('.links-list');
    const emptyPlaceholder = columnEl.querySelector('.empty-links-placeholder');
    const addLinkSection = columnEl.querySelector('.add-link-section');

    // Clear existing links
    linksList.innerHTML = '';

    // Ensure column has items array
    if (!column.items) column.items = [];
    
    if (column.items.length === 0) {
      emptyPlaceholder.style.display = 'block';
      addLinkSection.style.display = 'none';
    } else {
      emptyPlaceholder.style.display = 'none';
      addLinkSection.style.display = 'block';
      
      // Re-render items (links and dividers)
      column.items.forEach((item, itemIndex) => {
        const itemElement = this.createItemOptionsElement(item, itemIndex);
        linksList.appendChild(itemElement);
        
        // Restore previous expanded state if it existed
        if (itemStates.has(item.id) && itemStates.get(item.id)) {
          itemElement.classList.remove('collapsed');
          itemElement.classList.add('expanded');
        }
      });
    }

    // Restore accordion state
    if (wasExpanded) {
      columnEl.classList.add('expanded');
      columnEl.classList.remove('collapsed');
    }

    // Setup drag and drop for links
    this.setupItemDragDrop(linksList);
  }

  /**
   * Handle saving of temporary link
   */
  async handleTemporaryLinkSave(tempLink) {
    // Allow saving with empty URL (will show warning in UI)
    // Allow saving with invalid URL (will show warning in UI)
    // Only block saving if URL contains dangerous content
    
    const url = tempLink.url ? tempLink.url.trim() : '';
    
    // Check for dangerous URLs that should block saving
    if (url && this.linkProcessor.isDangerousUrl(url)) {
      this.uiManager.showError('URL contains potentially dangerous content and cannot be saved.');
      this.removeTemporaryLink(tempLink.id);
      return;
    }

    try {
      // Find the column containing this temporary link
      let column = null;
      for (const col of this.data.columns) {
        if (col.items && col.items.find(i => i.id === tempLink.id)) {
          column = col;
          break;
        }
      }

      if (!column) return;

      // Generate a permanent ID and convert the temporary link
      const permanentId = generateUUID();
      tempLink.id = permanentId;
      delete tempLink.isTemporary;
      
      // Ensure the link has all required properties
      if (!tempLink.hasOwnProperty('iconDataUri')) {
        tempLink.iconDataUri = null;
      }
      if (!tempLink.hasOwnProperty('iconUrlOverride')) {
        tempLink.iconUrlOverride = null;
      }

      // Update the DOM element
      const linkEl = document.querySelector(`[data-link-id^="temp_"]`);
      if (linkEl && linkEl.dataset.linkId.startsWith('temp_')) {
        linkEl.dataset.linkId = permanentId;
        
        // Update the action buttons to use the new saved link ID
        this.updateLinkEventListeners(linkEl, tempLink);
      }

      this.markDirty();

    } catch (error) {
      console.error('Failed to save link:', error);
      this.uiManager.showError('Failed to save link. Please try again.');
      this.removeTemporaryLink(tempLink.id);
    }
  }

  /**
   * Remove temporary link
   */
  removeTemporaryLink(tempLinkId) {
    // Remove from data
    for (const column of this.data.columns) {
      const itemIndex = column.items ? column.items.findIndex(i => i.id === tempLinkId) : -1;
      if (itemIndex !== -1) {
        column.items.splice(itemIndex, 1);
        this.updateColumnDOM(column);
        break;
      }
    }
  }

  /**
   * Update event listeners for a saved link
   */
  updateLinkEventListeners(linkEl, savedLink) {
    const deleteBtn = linkEl.querySelector('.delete-link-options-btn');
    const refreshBtn = linkEl.querySelector('.refresh-link-btn');
    
    if (deleteBtn) {
      // Remove old event listener and add new one
      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
      
      newDeleteBtn.addEventListener('click', () => {
        this.confirmDeleteLink(savedLink.id, savedLink.title || this.linkProcessor.extractDomainFromUrl(savedLink.url));
      });
    }
    
    if (refreshBtn) {
      // Remove old event listener and add new one
      const newRefreshBtn = refreshBtn.cloneNode(true);
      refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
      
      newRefreshBtn.addEventListener('click', async () => {
        if (savedLink.url && this.linkProcessor.isValidUrl(savedLink.url)) {
          const titleInput = linkEl.querySelector('.link-title-options-input');
          const titlePreview = linkEl.querySelector('.link-title-preview');
          const iconPreview = linkEl.querySelector('.link-icon-preview');
          await this.linkProcessor.fetchPageTitleAndIcon(savedLink, titleInput, titlePreview, iconPreview, linkEl);
        }
      });
    }
    
    // Re-attach normal input handlers
    const urlInput = linkEl.querySelector('.link-url-options-input');
    const titleInput = linkEl.querySelector('.link-title-options-input');
    const iconUrlInput = linkEl.querySelector('.icon-url-input');
    const titlePreview = linkEl.querySelector('.link-title-preview');
    const iconPreview = linkEl.querySelector('.link-icon-preview');

    // Remove the temporary link event listeners and add normal ones
    urlInput.replaceWith(urlInput.cloneNode(true));
    titleInput.replaceWith(titleInput.cloneNode(true));
    iconUrlInput.replaceWith(iconUrlInput.cloneNode(true));

    // Get the new elements after replacement
    const newUrlInput = linkEl.querySelector('.link-url-options-input');
    const newTitleInput = linkEl.querySelector('.link-title-options-input');
    const newIconUrlInput = linkEl.querySelector('.icon-url-input');

    // Add normal event listeners with proper auto-save integration
    newUrlInput.addEventListener('input', () => {
      savedLink.url = newUrlInput.value;
      titlePreview.textContent = newTitleInput.value || this.linkProcessor.extractDomainFromUrl(newUrlInput.value);
      this.markDirty();
    });

    newTitleInput.addEventListener('input', () => {
      savedLink.title = newTitleInput.value;
      titlePreview.textContent = newTitleInput.value || this.linkProcessor.extractDomainFromUrl(newUrlInput.value);
      this.markDirty();
    });

    newIconUrlInput.addEventListener('input', () => {
      savedLink.iconUrlOverride = newIconUrlInput.value;
      this.linkProcessor.setLinkIcon(iconPreview, savedLink);
      this.markDirty();
    });
  }

  /**
   * Setup advanced options toggle
   */
  setupAdvancedOptionsToggle() {
    const advancedToggle = document.getElementById('show-advanced-options-setting');
    if (!advancedToggle) return;

    // Set initial state
    advancedToggle.checked = this.data.showAdvancedOptions || false;

    // Handle toggle changes
    advancedToggle.addEventListener('change', async () => {
      this.data.showAdvancedOptions = advancedToggle.checked;
      this.updateAdvancedOptionsVisibility();
      
      // Save this setting directly without triggering auto-save/dirty tracking
      await SettingsManager.updateAdvancedOptionsVisibility(advancedToggle.checked);
    });

    // Apply initial visibility state
    this.updateAdvancedOptionsVisibility();
  }

  /**
   * Update visibility of advanced options based on setting
   */
  updateAdvancedOptionsVisibility() {
    const isVisible = this.data.showAdvancedOptions;
    const advancedFields = document.querySelectorAll('.advanced-field');
    
    advancedFields.forEach(field => {
      field.style.display = isVisible ? 'flex' : 'none';
    });
  }
}