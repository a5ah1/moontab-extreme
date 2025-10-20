/**
 * Content Manager - Moontab Extreme Options
 * Handles all column and group operations: CRUD, drag/drop, temporary item handling
 * Manages the hierarchical structure of columns, groups, and links
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
   * Render content panel with columns and groups
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

    // Count groups and total links across all groups
    const groupCount = column.groups ? column.groups.length : 0;
    let totalLinks = 0;
    if (column.groups) {
      column.groups.forEach(group => {
        totalLinks += (group.links ? group.links.length : 0);
      });
    }

    columnLinkCount.textContent = `(${groupCount} groups, ${totalLinks} links)`;

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
    const addGroupBtn = columnEl.querySelector('.add-group-options-btn');
    const addFirstGroupBtn = columnEl.querySelector('.add-first-group-btn');
    const deleteBtn = columnEl.querySelector('.delete-column-options-btn');

    addGroupBtn.addEventListener('click', () => {
      this.addGroupToColumn(column.id);
    });

    addFirstGroupBtn.addEventListener('click', () => {
      this.addGroupToColumn(column.id);
    });

    deleteBtn.addEventListener('click', () => {
      this.confirmDeleteColumn(column.id, column.name);
    });

    // Render groups and manage empty state
    const groupsList = columnEl.querySelector('.groups-list');
    const emptyPlaceholder = columnEl.querySelector('.empty-groups-placeholder');
    const addGroupSection = columnEl.querySelector('.add-group-section');

    if (!column.groups || column.groups.length === 0) {
      emptyPlaceholder.style.display = 'block';
      addGroupSection.style.display = 'none';
    } else {
      emptyPlaceholder.style.display = 'none';
      addGroupSection.style.display = 'block';

      column.groups.forEach((group, groupIndex) => {
        const groupElement = this.createGroupOptionsElement(group, index, groupIndex);
        groupsList.appendChild(groupElement);
      });
    }

    // Setup drag and drop for groups
    this.setupGroupDragDrop(groupsList);

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
   * Create group options element
   * @param {Object} group - Group data
   * @param {number} columnIndex - Column index
   * @param {number} groupIndex - Group index
   * @returns {Element} Group element
   */
  createGroupOptionsElement(group, columnIndex, groupIndex) {
    const template = this.templates.groupOptions.content.cloneNode(true);
    const groupEl = template.querySelector('.group-item');

    groupEl.dataset.groupId = group.id;
    groupEl.dataset.index = groupIndex;

    // Start collapsed by default
    groupEl.classList.add('collapsed');

    // Set group preview
    const titlePreview = groupEl.querySelector('.group-title-preview');
    const linkCount = groupEl.querySelector('.group-link-count');

    titlePreview.textContent = group.title || 'Group';
    const linkNum = group.links ? group.links.length : 0;
    linkCount.textContent = `(${linkNum} links)`;

    // Setup accordion toggle
    const headerBar = groupEl.querySelector('.group-header-bar');
    headerBar.addEventListener('click', (e) => {
      // Don't toggle when clicking on action buttons
      if (e.target.closest('.group-quick-actions')) return;
      this.uiManager.toggleLink(groupEl); // Reuse link toggle for groups
    });

    // Set form values
    const titleInput = groupEl.querySelector('.group-title-options-input');
    const customClassesInput = groupEl.querySelector('.group-custom-classes-input');

    titleInput.value = group.title || '';
    if (customClassesInput) {
      customClassesInput.value = group.customClasses || '';
    }

    // Setup form handlers with debounced saving
    this.setupGroupFormHandlers(group, groupEl, titlePreview, linkCount);

    // Setup group action buttons
    this.setupGroupActions(groupEl, group);

    // Render links within group
    const linksList = groupEl.querySelector('.group-links-list');
    if (group.links && group.links.length > 0) {
      group.links.forEach((link, linkIndex) => {
        const linkElement = this.createLinkOptionsElement(link, linkIndex, group.id);
        linksList.appendChild(linkElement);
      });
    }

    // Setup drag and drop for links within group
    this.setupLinkDragDrop(linksList, group.id);

    return groupEl;
  }

  /**
   * Create link options element
   * @param {Object} link - Link data
   * @param {number} index - Link index
   * @param {string} groupId - Group ID containing this link
   * @returns {Element} Link element
   */
  createLinkOptionsElement(link, index, groupId) {
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

    // Setup link action buttons
    this.setupLinkActions(linkEl, link, titleInput, titlePreview, iconPreview);

    return linkEl;
  }

  /**
   * Setup URL input handler for link form
   * @private
   */
  setupUrlInputHandler(link, linkEl, urlInput, titleInput, titlePreview, iconPreview, timeouts, debouncedSave) {
    urlInput.addEventListener('input', async () => {
      const url = urlInput.value.trim();

      // Clear previous timeouts
      if (timeouts.domainFetch) {
        clearTimeout(timeouts.domainFetch);
      }
      if (timeouts.save) {
        clearTimeout(timeouts.save);
      }

      // Get status indicator elements
      const statusIndicator = linkEl.querySelector('.link-status-indicator');
      const statusText = linkEl.querySelector('.status-text');

      // Always update validation status immediately to prevent stale states
      this.linkProcessor.updateLinkStatusIndicator(url, urlInput, statusIndicator, statusText);

      // Update local link object immediately
      link.url = url;

      // Update preview text immediately
      titlePreview.textContent = titleInput.value || this.linkProcessor.extractDomainFromUrl(url) || 'New Link';

      // Validate URL and handle domain extraction
      if (url && this.linkProcessor.isValidUrl(url)) {
        // Debounce the domain extraction and icon preview (wait 500ms after user stops typing)
        timeouts.domainFetch = setTimeout(async () => {
          await this.linkProcessor.fetchPageTitleAndIcon(link, titleInput, titlePreview, iconPreview, linkEl);
        }, 500);
      }

      // Debounced save for both temporary and saved links
      debouncedSave('url', url);
    });
  }

  /**
   * Setup title input handler for link form
   * @private
   */
  setupTitleInputHandler(link, titleInput, titlePreview, debouncedSave) {
    titleInput.addEventListener('input', () => {
      const title = titleInput.value.trim();

      // Update local link object immediately
      link.title = title;

      // Update preview immediately
      titlePreview.textContent = title || this.linkProcessor.extractDomainFromUrl(link.url) || 'New Link';

      // Debounced save for both temporary and saved links
      debouncedSave('title', title);
    });
  }

  /**
   * Setup icon URL input handler for link form
   * @private
   */
  setupIconUrlInputHandler(link, linkEl, iconUrlInput, iconPreview, debouncedSave) {
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

      // Update local link object immediately
      link.iconUrlOverride = newOverride;

      // Update icon preview immediately
      this.linkProcessor.setLinkIcon(iconPreview, link);

      // Update UI
      this.linkProcessor.updateFaviconModeUI(linkEl, link);

      // Debounced save for both temporary and saved links
      debouncedSave('iconUrlOverride', newOverride);
    });
  }

  /**
   * Setup custom CSS classes input handler for link form
   * @private
   */
  setupCustomClassesInputHandler(link, customClassesInput, debouncedSave) {
    if (!customClassesInput) return;

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

      // Update local link object immediately
      link.customClasses = classes;

      // Debounced save for both temporary and saved links
      debouncedSave('customClasses', classes);
    });
  }

  /**
   * Setup link form handlers with unified event system for both temporary and saved links
   * This orchestrator method sets up all link input handlers
   */
  setupLinkFormHandlers(link, linkEl) {
    const urlInput = linkEl.querySelector('.link-url-options-input');
    const titleInput = linkEl.querySelector('.link-title-options-input');
    const iconUrlInput = linkEl.querySelector('.icon-url-input');
    const customClassesInput = linkEl.querySelector('.link-custom-classes-input');
    const titlePreview = linkEl.querySelector('.link-title-preview');
    const iconPreview = linkEl.querySelector('.link-icon-preview');

    // Shared timeout references for cleanup
    const timeouts = {
      domainFetch: null,
      save: null
    };

    // Helper function for debounced saving
    // Works for both temporary (triggers conversion) and saved links (triggers storage update)
    const debouncedSave = (property, value) => {
      if (timeouts.save) {
        clearTimeout(timeouts.save);
      }

      timeouts.save = setTimeout(() => {
        // Update the link property
        link[property] = value;

        if (link.isTemporary) {
          // For temporary links, trigger conversion to permanent
          this.handleTemporaryLinkSave(link);
        } else {
          // For saved links, force update the property and trigger save
          this.forceLinkPropertyUpdate(link.id, property, value);
        }
      }, 500);
    };

    // Setup individual input handlers
    this.setupUrlInputHandler(link, linkEl, urlInput, titleInput, titlePreview, iconPreview, timeouts, debouncedSave);
    this.setupTitleInputHandler(link, titleInput, titlePreview, debouncedSave);
    this.setupIconUrlInputHandler(link, linkEl, iconUrlInput, iconPreview, debouncedSave);
    this.setupCustomClassesInputHandler(link, customClassesInput, debouncedSave);
  }

  // ===================================================================
  // VALIDATION METHODS
  // ===================================================================

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
   * Validate if a column can accept more groups
   * @param {Object} column - Column data object
   * @returns {boolean} True if can add more groups (limit: 50 groups per column)
   */
  validateGroupCount(column) {
    const currentCount = column.groups ? column.groups.length : 0;
    return currentCount < 50;
  }

  /**
   * Validate if a group can accept more links
   * @param {Object} group - Group data object
   * @returns {boolean} True if can add more links (limit: 200 links per group)
   */
  validateLinkCount(group) {
    const currentCount = group.links ? group.links.length : 0;
    return currentCount < 200;
  }

  // ===================================================================
  // END VALIDATION METHODS
  // ===================================================================

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
   * Setup action buttons for a link (refresh, delete)
   * @param {Element} linkEl - Link DOM element
   * @param {Object} link - Link data object
   * @param {Element} titleInput - Title input element
   * @param {Element} titlePreview - Title preview element
   * @param {Element} iconPreview - Icon preview element
   */
  setupLinkActions(linkEl, link, titleInput, titlePreview, iconPreview) {
    const refreshBtn = linkEl.querySelector('.refresh-link-btn');
    const deleteBtn = linkEl.querySelector('.delete-link-options-btn');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        if (link.url && this.linkProcessor.isValidUrl(link.url)) {
          await this.linkProcessor.fetchPageTitleAndIcon(link, titleInput, titlePreview, iconPreview, linkEl);
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.confirmDeleteLink(link.id, link.title || this.linkProcessor.extractDomainFromUrl(link.url));
      });
    }
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
   * Add new group to column
   * @param {string} columnId - Column ID
   */
  async addGroupToColumn(columnId) {
    try {
      // Find the column
      const column = this.data.columns.find(c => c.id === columnId);
      if (!column) {
        this.uiManager.showError('Column not found');
        return;
      }

      // Ensure column has groups array
      if (!column.groups) {
        column.groups = [];
      }

      // Validate group count limit (max 50 groups per column)
      if (!this.validateGroupCount(column)) {
        this.uiManager.showError('Cannot add more groups. Maximum 50 groups per column.');
        return;
      }

      // Create temporary group with unique ID
      const tempGroup = {
        id: `temp_${Date.now()}`,
        title: '',
        customClasses: '',
        links: [],
        isTemporary: true
      };

      // Add to local data temporarily
      column.groups.push(tempGroup);

      // Update the column DOM to include the new group
      this.updateColumnDOM(column);

      // Expand the column if it's collapsed
      const columnEl = document.querySelector(`[data-column-id="${columnId}"]`);
      if (columnEl && columnEl.classList.contains('collapsed')) {
        this.uiManager.toggleColumn(columnEl);
      }

      // Find the new group element and expand it for editing
      const newGroupEl = document.querySelector(`[data-group-id="${tempGroup.id}"]`);
      if (newGroupEl) {
        // Expand the group for editing
        newGroupEl.classList.remove('collapsed');
        newGroupEl.classList.add('expanded');

        // Focus on the title input
        const titleInput = newGroupEl.querySelector('.group-title-options-input');
        if (titleInput) {
          setTimeout(() => {
            titleInput.focus();
            titleInput.select();
          }, 100);
        }
      }

    } catch (error) {
      console.error('Failed to add group:', error);
      this.uiManager.showError('Failed to add group. Please try again.');
    }
  }

  /**
   * Setup group form handlers with debounced saving
   */
  setupGroupFormHandlers(group, groupEl, titlePreview, linkCount) {
    const titleInput = groupEl.querySelector('.group-title-options-input');
    const customClassesInput = groupEl.querySelector('.group-custom-classes-input');

    let saveTimeout = null;

    // Helper function for debounced saving
    const debouncedSave = (property, value) => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      saveTimeout = setTimeout(() => {
        if (group.isTemporary) {
          // Convert temporary group to permanent on first save
          this.handleTemporaryGroupSave(group);
        } else {
          // Force update the property and trigger save
          this.forceGroupPropertyUpdate(group.id, property, value);
        }
      }, 500);
    };

    titleInput.addEventListener('input', () => {
      const title = titleInput.value.trim();

      // Update preview immediately
      titlePreview.textContent = title || 'Group';

      // Update local data immediately
      group.title = title;

      // Debounced save
      debouncedSave('title', title);
    });

    if (customClassesInput) {
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
        group.customClasses = classes;

        // Debounced save
        debouncedSave('customClasses', classes);
      });
    }

    // Show/hide advanced options
    this.updateAdvancedOptionsVisibility();
  }

  /**
   * Setup action buttons for a group (add link, delete)
   * @param {Element} groupEl - Group DOM element
   * @param {Object} group - Group data object
   */
  setupGroupActions(groupEl, group) {
    const addLinkBtn = groupEl.querySelector('.add-link-to-group-btn');
    const addLinkBottomBtn = groupEl.querySelector('.add-link-bottom-btn');
    const deleteBtn = groupEl.querySelector('.delete-group-options-btn');

    if (addLinkBtn) {
      addLinkBtn.addEventListener('click', () => {
        this.addLinkToGroup(group.id);
      });
    }

    if (addLinkBottomBtn) {
      addLinkBottomBtn.addEventListener('click', () => {
        this.addLinkToGroup(group.id);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.confirmDeleteGroup(group.id, group.title || 'Untitled Group');
      });
    }
  }

  /**
   * Handle saving of temporary group - converts to permanent
   * @param {Object} tempGroup - Temporary group to convert
   */
  async handleTemporaryGroupSave(tempGroup) {
    try {
      // Store the old temporary ID
      const oldTempId = tempGroup.id;

      // Find the column containing this temporary group
      let column = null;
      for (const col of this.data.columns) {
        if (col.groups && col.groups.find(g => g.id === oldTempId)) {
          column = col;
          break;
        }
      }

      if (!column) {
        console.error('Column not found for temporary group:', oldTempId);
        return;
      }

      // Generate a permanent ID and update the group
      const permanentId = generateUUID();
      tempGroup.id = permanentId;
      delete tempGroup.isTemporary;

      // Update the DOM element's data attribute
      const groupEl = document.querySelector(`[data-group-id="${oldTempId}"]`);
      if (groupEl) {
        groupEl.dataset.groupId = permanentId;
        this.updateGroupEventListeners(groupEl, tempGroup);
      }

      this.markDirty();

    } catch (error) {
      console.error('Failed to save temporary group:', error);
      this.uiManager.showError('Failed to save group. Please try again.');
    }
  }

  /**
   * Update event listeners for a saved group (after temp group conversion)
   * @param {Element} groupEl - Group DOM element
   * @param {Object} savedGroup - Saved group data
   */
  updateGroupEventListeners(groupEl, savedGroup) {
    // Remove old event listeners by cloning and replacing buttons
    const buttonsToRefresh = [
      '.delete-group-options-btn',
      '.add-link-to-group-btn',
      '.add-link-bottom-btn'
    ];

    buttonsToRefresh.forEach(selector => {
      const btn = groupEl.querySelector(selector);
      if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
      }
    });

    // Re-attach event listeners using the centralized helper
    this.setupGroupActions(groupEl, savedGroup);
  }

  /**
   * Force update group property and save
   */
  forceGroupPropertyUpdate(groupId, property, value) {
    // Find which column contains this group
    let foundColumn = null;
    let foundGroup = null;

    for (const column of this.data.columns) {
      if (column.groups) {
        const group = column.groups.find(g => g.id === groupId);
        if (group) {
          foundColumn = column;
          foundGroup = group;
          break;
        }
      }
    }

    if (foundGroup) {
      foundGroup[property] = value;
      this.markDirty();
    }
  }

  /**
   * Confirm delete group
   */
  confirmDeleteGroup(groupId, groupTitle) {
    const modal = this.uiManager.createModal('confirm', {
      title: 'Delete Group',
      message: `Are you sure you want to delete "${groupTitle}"? This will also delete all links in this group. This action cannot be undone.`
    });

    const confirmBtn = modal.querySelector('.modal-confirm-btn');
    confirmBtn.addEventListener('click', async () => {
      await this.deleteGroup(groupId);
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId) {
    // Check if this is a temporary group
    const isTemporary = groupId.startsWith('temp_');

    if (isTemporary) {
      // For temporary groups, just remove from local data
      this.removeTemporaryGroup(groupId);
      return;
    }

    // For saved groups, remove from local data and let auto-save handle storage
    try {
      // Find which column contains this group
      let foundColumn = null;
      for (const column of this.data.columns) {
        if (column.groups && column.groups.find(g => g.id === groupId)) {
          foundColumn = column;
          break;
        }
      }

      if (foundColumn) {
        // Remove from local data
        foundColumn.groups = foundColumn.groups.filter(g => g.id !== groupId);

        // Update the DOM
        this.updateColumnDOM(foundColumn);
        this.markDirty();
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      this.uiManager.showError('Failed to delete group. Please try again.');
    }
  }

  /**
   * Remove temporary group from DOM and data
   */
  removeTemporaryGroup(groupId) {
    // Remove from DOM
    const groupEl = document.querySelector(`[data-group-id="${groupId}"]`);
    if (groupEl) {
      groupEl.remove();
    }

    // Remove from local data
    for (const column of this.data.columns) {
      if (column.groups) {
        column.groups = column.groups.filter(g => g.id !== groupId);
      }
    }

    // Update visibility states
    this.data.columns.forEach(column => {
      this.updateColumnDOM(column);
    });
  }

  /**
   * Add link to group
   * @param {string} groupId - Group ID
   */
  async addLinkToGroup(groupId) {
    try {
      // Find the group
      let group = null;
      let column = null;
      for (const col of this.data.columns) {
        if (col.groups) {
          const foundGroup = col.groups.find(g => g.id === groupId);
          if (foundGroup) {
            group = foundGroup;
            column = col;
            break;
          }
        }
      }

      if (!group) {
        this.uiManager.showError('Group not found');
        return;
      }

      // Ensure group has links array
      if (!group.links) {
        group.links = [];
      }

      // Validate link count limit (max 200 links per group)
      if (!this.validateLinkCount(group)) {
        this.uiManager.showError('Cannot add more links. Maximum 200 links per group.');
        return;
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
      group.links.push(tempLink);

      // Update the column DOM to include the new link
      this.updateColumnDOM(column);

      // Expand the group if it's collapsed
      const groupEl = document.querySelector(`[data-group-id="${groupId}"]`);
      if (groupEl && groupEl.classList.contains('collapsed')) {
        this.uiManager.toggleLink(groupEl);
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
        this.handleTemporaryColumnSave(column);
      } else {
        this.markDirty();
      }
    }
  }

  /**
   * Handle saving of temporary column - converts to permanent
   * @param {Object} column - Temporary column to convert
   */
  async handleTemporaryColumnSave(column) {
    try {
      // Store the old temporary ID
      const oldTempId = column.id;

      // Generate a permanent ID and update the column
      const permanentId = generateUUID();
      column.id = permanentId;
      delete column.isTemporary;

      // Find the DOM element and update its data attribute
      const columnEl = document.querySelector(`[data-column-id="${oldTempId}"]`);
      if (columnEl) {
        columnEl.dataset.columnId = permanentId;

        // Update event listeners to use new permanent ID
        this.updateColumnEventListeners(columnEl, column);
      }

      // Update visibility state after conversion
      this.updateColumnListVisibility();
      this.markDirty();
    } catch (error) {
      console.error('Failed to save temporary column:', error);
      this.uiManager.showError('Failed to save column. Please try again.');
      // Remove the temporary column on failure
      this.removeTemporaryColumn(column.id);
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
      if (column.groups) {
        for (const group of column.groups) {
          const link = group.links ? group.links.find(l => l.id === linkId) : null;
          if (link && link[property] !== value) {
            link[property] = value;
            this.markDirty();
            return;
          }
        }
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
      if (column.groups) {
        for (const group of column.groups) {
          const link = group.links ? group.links.find(l => l.id === linkId) : null;
          if (link) {
            link[property] = value;
            this.markDirty();
            return;
          }
        }
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
   * Setup drag and drop for groups using SortableJS
   * Supports both within-column reordering and cross-column moves
   * @param {Element} groupsList - Groups list container
   */
  setupGroupDragDrop(groupsList) {
    const self = this;

    new Sortable(groupsList, {
      group: 'column-groups', // Enable cross-column dragging
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      draggable: '.group-item',
      onStart: (evt) => {
        // Add visual feedback to all potential drop zones
        document.querySelectorAll('.groups-list').forEach(list => {
          if (list !== evt.from) {
            list.classList.add('sortable-drop-zone');
          }
        });
      },
      onEnd: (evt) => {
        // Remove visual feedback from all drop zones
        document.querySelectorAll('.groups-list').forEach(list => {
          list.classList.remove('sortable-drop-zone');
        });

        const groupElement = evt.item;
        const groupId = groupElement.dataset.groupId;
        const sourceColumnEl = evt.from.closest('.column-item');
        const targetColumnEl = evt.to.closest('.column-item');
        const sourceColumnId = sourceColumnEl?.dataset.columnId;
        const targetColumnId = targetColumnEl?.dataset.columnId;

        // Handle cross-column moves
        if (sourceColumnId !== targetColumnId) {
          try {
            // Find source and target columns
            const sourceColumn = self.data.columns.find(c => c.id === sourceColumnId);
            const targetColumn = self.data.columns.find(c => c.id === targetColumnId);

            if (sourceColumn && targetColumn) {
              // Ensure both columns have groups arrays
              if (!sourceColumn.groups) sourceColumn.groups = [];
              if (!targetColumn.groups) targetColumn.groups = [];

              // Validate target column group count limit (before adding)
              if (targetColumn.groups.length >= 50) {
                self.uiManager.showError('Cannot move group. Target column has reached maximum of 50 groups.');
                // Revert DOM change by re-rendering
                self.renderContentPanel();
                return;
              }

              // Find and remove the group from source column
              const groupIndex = sourceColumn.groups.findIndex(g => g.id === groupId);
              if (groupIndex !== -1) {
                const [movedGroup] = sourceColumn.groups.splice(groupIndex, 1);

                // Insert at the new position in target column
                const insertIndex = Math.min(evt.newIndex, targetColumn.groups.length);
                targetColumn.groups.splice(insertIndex, 0, movedGroup);

                // Update both column DOMs to reflect changes
                self.updateColumnDOM(sourceColumn);
                self.updateColumnDOM(targetColumn);
                self.markDirty();
              }
            }
          } catch (error) {
            console.error('Failed to move group between columns:', error);
            self.uiManager.showError('Failed to move group. Please try again.');
            self.renderContentPanel();
          }
        } else if (evt.oldIndex !== evt.newIndex) {
          // Handle within-column reordering
          const columnEl = groupsList.closest('.column-item');
          const columnId = columnEl.dataset.columnId;
          const column = self.data.columns.find(c => c.id === columnId);

          if (column && column.groups) {
            // Move group in data array
            const [movedGroup] = column.groups.splice(evt.oldIndex, 1);
            column.groups.splice(evt.newIndex, 0, movedGroup);

            // Update indices and mark dirty
            self.updateGroupIndices(groupsList);
            self.markDirty();
          }
        }
      }
    });
  }

  /**
   * Setup drag and drop for links within a group using SortableJS
   * @param {Element} linksList - Links list container
   * @param {string} groupId - Group ID containing these links
   */
  setupLinkDragDrop(linksList, groupId) {
    const self = this;

    new Sortable(linksList, {
      group: 'group-links',
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onStart: (evt) => {
        // Add visual feedback to all potential drop zones
        document.querySelectorAll('.group-links-list').forEach(list => {
          if (list !== evt.from) {
            list.classList.add('sortable-drop-zone');
          }
        });
      },
      onEnd: async (evt) => {
        // Remove visual feedback from all drop zones
        document.querySelectorAll('.group-links-list').forEach(list => {
          list.classList.remove('sortable-drop-zone');
        });

        const linkElement = evt.item;
        const linkId = linkElement.dataset.linkId;
        const sourceGroupId = evt.from.closest('.group-item').dataset.groupId;
        const targetGroupId = evt.to.closest('.group-item').dataset.groupId;

        // Handle cross-group moves
        if (sourceGroupId !== targetGroupId) {
          try {
            // Find source and target groups
            let sourceGroup = null;
            let targetGroup = null;
            let sourceColumn = null;
            let targetColumn = null;

            for (const column of self.data.columns) {
              if (column.groups) {
                for (const group of column.groups) {
                  if (group.id === sourceGroupId) {
                    sourceGroup = group;
                    sourceColumn = column;
                  }
                  if (group.id === targetGroupId) {
                    targetGroup = group;
                    targetColumn = column;
                  }
                }
              }
            }

            if (sourceGroup && targetGroup) {
              // Ensure both groups have links arrays
              if (!sourceGroup.links) sourceGroup.links = [];
              if (!targetGroup.links) targetGroup.links = [];

              // Find and remove the link from source group
              const linkIndex = sourceGroup.links.findIndex(l => l.id === linkId);
              if (linkIndex !== -1) {
                const [movedLink] = sourceGroup.links.splice(linkIndex, 1);
                // Insert at the new position in target group
                const insertIndex = Math.min(evt.newIndex, targetGroup.links.length);
                targetGroup.links.splice(insertIndex, 0, movedLink);

                // Update the column DOMs
                if (sourceColumn) self.updateColumnDOM(sourceColumn);
                if (targetColumn && targetColumn !== sourceColumn) self.updateColumnDOM(targetColumn);
                self.markDirty();
              }
            }
          } catch (error) {
            console.error('Failed to move link between groups:', error);
            self.uiManager.showError('Failed to move link. Please try again.');
            self.renderContentPanel();
          }
        } else if (evt.oldIndex !== evt.newIndex) {
          // Handle within-group reordering
          const groupEl = linksList.closest('.group-item');
          const groupId = groupEl.dataset.groupId;

          // Find the group
          let group = null;
          for (const column of self.data.columns) {
            if (column.groups) {
              group = column.groups.find(g => g.id === groupId);
              if (group) break;
            }
          }

          if (group && group.links) {
            // Move link in data array
            const [movedLink] = group.links.splice(evt.oldIndex, 1);
            group.links.splice(evt.newIndex, 0, movedLink);

            // Update indices and mark dirty
            self.updateLinkIndices(linksList);
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
   * Update group indices after reordering
   * @param {Element} groupsList - Groups list container
   */
  updateGroupIndices(groupsList) {
    const groups = groupsList.querySelectorAll('.group-item');
    groups.forEach((group, index) => {
      group.dataset.index = index;
    });
  }

  /**
   * Update link indices after reordering
   * @param {Element} linksList - Links list container
   */
  updateLinkIndices(linksList) {
    const links = linksList.querySelectorAll('.link-item');
    links.forEach((link, index) => {
      link.dataset.index = index;
    });
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
    const isEmpty = !column.groups || column.groups.length === 0;
    const isTemporary = column.isTemporary;

    if (isTemporary || isEmpty) {
      // Delete temporary or empty columns immediately without confirmation
      this.deleteColumn(columnId);
      return;
    }

    // Count total groups and links
    const groupCount = column.groups ? column.groups.length : 0;
    let totalLinks = 0;
    if (column.groups) {
      column.groups.forEach(group => {
        totalLinks += (group.links ? group.links.length : 0);
      });
    }

    const modal = this.uiManager.createModal('confirm', {
      title: 'Delete Column',
      message: `Are you sure you want to delete "${columnName}" with ${groupCount} groups and ${totalLinks} links? This action cannot be undone.`
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
   * Remove temporary column from DOM and data
   * @param {string} columnId - Temporary column ID
   */
  removeTemporaryColumn(columnId) {
    // Remove from DOM
    const columnEl = document.querySelector(`[data-column-id="${columnId}"]`);
    if (columnEl) {
      columnEl.remove();
    }

    // Remove from local data
    this.data.columns = this.data.columns.filter(c => c.id !== columnId);

    // Update visibility state
    this.updateColumnListVisibility();
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
      // Find which column and group contain this link
      let foundColumn = null;
      let foundGroup = null;

      for (const column of this.data.columns) {
        if (column.groups) {
          for (const group of column.groups) {
            if (group.links && group.links.find(l => l.id === linkId)) {
              foundColumn = column;
              foundGroup = group;
              break;
            }
          }
          if (foundColumn) break;
        }
      }

      if (foundColumn && foundGroup) {
        // Remove from local data
        foundGroup.links = foundGroup.links.filter(l => l.id !== linkId);

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
   * Capture the current expanded/collapsed state of a column and its contents
   * @param {Element} columnEl - Column DOM element
   * @returns {Object} State object with column, group, and link states
   */
  captureColumnState(columnEl) {
    const state = {
      columnExpanded: columnEl.classList.contains('expanded'),
      groupStates: new Map(),
      linkStates: new Map()
    };

    const existingGroups = columnEl.querySelectorAll('.group-item');
    existingGroups.forEach(groupEl => {
      const groupId = groupEl.dataset.groupId;
      if (groupId) {
        state.groupStates.set(groupId, groupEl.classList.contains('expanded'));

        // Store link states within this group
        const existingLinks = groupEl.querySelectorAll('.link-item');
        existingLinks.forEach(linkEl => {
          const linkId = linkEl.dataset.linkId;
          if (linkId) {
            state.linkStates.set(linkId, linkEl.classList.contains('expanded'));
          }
        });
      }
    });

    return state;
  }

  /**
   * Restore the expanded/collapsed state of a column and its contents
   * @param {Element} columnEl - Column DOM element
   * @param {Object} state - State object from captureColumnState
   * @param {Object} column - Column data object
   */
  restoreColumnState(columnEl, state, column) {
    // Restore column accordion state
    if (state.columnExpanded) {
      columnEl.classList.add('expanded');
      columnEl.classList.remove('collapsed');
    }

    // Restore group and link states
    column.groups.forEach(group => {
      const groupEl = columnEl.querySelector(`[data-group-id="${group.id}"]`);
      if (groupEl) {
        // Restore group expanded state
        if (state.groupStates.has(group.id) && state.groupStates.get(group.id)) {
          groupEl.classList.remove('collapsed');
          groupEl.classList.add('expanded');
        }

        // Restore link states within this group
        const linkElements = groupEl.querySelectorAll('.link-item');
        linkElements.forEach(linkEl => {
          const linkId = linkEl.dataset.linkId;
          if (state.linkStates.has(linkId) && state.linkStates.get(linkId)) {
            linkEl.classList.remove('collapsed');
            linkEl.classList.add('expanded');
          }
        });
      }
    });
  }

  /**
   * Update column count display
   * @param {Object} column - Column data object
   * @param {Element} columnEl - Column DOM element
   */
  updateColumnCounts(column, columnEl) {
    const linkCount = columnEl.querySelector('.column-link-count');
    if (!linkCount) return;

    const groupCount = column.groups ? column.groups.length : 0;
    let totalLinks = 0;
    if (column.groups) {
      column.groups.forEach(group => {
        totalLinks += (group.links ? group.links.length : 0);
      });
    }

    linkCount.textContent = `(${groupCount} groups, ${totalLinks} links)`;
  }

  /**
   * Render groups within a column and manage empty state visibility
   * @param {Object} column - Column data object
   * @param {Element} columnEl - Column DOM element
   */
  renderColumnGroups(column, columnEl) {
    const groupsList = columnEl.querySelector('.groups-list');
    const emptyPlaceholder = columnEl.querySelector('.empty-groups-placeholder');
    const addGroupSection = columnEl.querySelector('.add-group-section');

    // Clear existing groups
    groupsList.innerHTML = '';

    // Ensure column has groups array
    if (!column.groups) column.groups = [];

    if (column.groups.length === 0) {
      emptyPlaceholder.style.display = 'block';
      addGroupSection.style.display = 'none';
    } else {
      emptyPlaceholder.style.display = 'none';
      addGroupSection.style.display = 'block';

      // Re-render groups
      column.groups.forEach((group, groupIndex) => {
        const groupElement = this.createGroupOptionsElement(group, column.id, groupIndex);
        groupsList.appendChild(groupElement);
      });
    }
  }

  /**
   * Setup column interactions (drag-drop)
   * @param {Element} columnEl - Column DOM element
   */
  setupColumnInteractions(columnEl) {
    const groupsList = columnEl.querySelector('.groups-list');
    this.setupGroupDragDrop(groupsList);
  }

  /**
   * Update a single column's DOM without affecting other accordion states
   * @param {Object} column - Column data object
   */
  updateColumnDOM(column) {
    const columnEl = document.querySelector(`[data-column-id="${column.id}"]`);
    if (!columnEl) return;

    // Capture current state before making changes
    const state = this.captureColumnState(columnEl);

    // Update count display
    this.updateColumnCounts(column, columnEl);

    // Render groups and manage empty state
    this.renderColumnGroups(column, columnEl);

    // Restore previous accordion states
    this.restoreColumnState(columnEl, state, column);

    // Setup interactions
    this.setupColumnInteractions(columnEl);
  }

  /**
   * Handle saving of temporary link - converts to permanent
   * @param {Object} tempLink - Temporary link to convert
   */
  async handleTemporaryLinkSave(tempLink) {
    const url = tempLink.url ? tempLink.url.trim() : '';

    // Check for dangerous URLs that should block saving
    // Allow empty or invalid URLs (will show warning in UI)
    if (url && this.linkProcessor.isDangerousUrl(url)) {
      this.uiManager.showError('URL contains potentially dangerous content and cannot be saved.');
      this.removeTemporaryLink(tempLink.id);
      return;
    }

    try {
      // Store the old temporary ID
      const oldTempId = tempLink.id;

      // Find the group containing this temporary link
      let foundGroup = null;
      for (const col of this.data.columns) {
        if (col.groups) {
          for (const group of col.groups) {
            if (group.links && group.links.find(l => l.id === oldTempId)) {
              foundGroup = group;
              break;
            }
          }
          if (foundGroup) break;
        }
      }

      if (!foundGroup) {
        console.error('Group not found for temporary link:', oldTempId);
        return;
      }

      // Generate a permanent ID and update the link
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

      // Update the DOM element's data attribute
      const linkEl = document.querySelector(`[data-link-id="${oldTempId}"]`);
      if (linkEl) {
        linkEl.dataset.linkId = permanentId;
        this.updateActionButtonListeners(linkEl, tempLink);
      }

      this.markDirty();

    } catch (error) {
      console.error('Failed to save temporary link:', error);
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
      if (column.groups) {
        for (const group of column.groups) {
          const linkIndex = group.links ? group.links.findIndex(l => l.id === tempLinkId) : -1;
          if (linkIndex !== -1) {
            group.links.splice(linkIndex, 1);
            this.updateColumnDOM(column);
            return;
          }
        }
      }
    }
  }

  /**
   * Update action button listeners for a saved link (after temp link conversion)
   * Only updates delete and refresh buttons - input handlers remain unchanged
   * since they work for both temporary and permanent links
   */
  updateActionButtonListeners(linkEl, savedLink) {
    // Remove old event listeners by cloning and replacing buttons
    const buttonsToRefresh = [
      '.delete-link-options-btn',
      '.refresh-link-btn'
    ];

    buttonsToRefresh.forEach(selector => {
      const btn = linkEl.querySelector(selector);
      if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
      }
    });

    // Re-attach event listeners using the centralized helper
    const titleInput = linkEl.querySelector('.link-title-options-input');
    const titlePreview = linkEl.querySelector('.link-title-preview');
    const iconPreview = linkEl.querySelector('.link-icon-preview');
    this.setupLinkActions(linkEl, savedLink, titleInput, titlePreview, iconPreview);
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