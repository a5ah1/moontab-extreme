/**
 * New Tab Page - Link Stacker
 * Simplified read-only view with settings access
 */

class NewTabApp {
  constructor() {
    this.data = null;
    this.themeManager = null;
    this.dragScrollInstance = null;
    this.templates = {};

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Show loading state
      this.showLoading();

      // Load templates
      this.loadTemplates();

      // Load data from storage
      this.data = await StorageManager.load();

      // Compute effective background size (handle custom sizes)
      let effectiveBackgroundSize = this.data.backgroundSize;
      if (this.data.backgroundSize === 'custom') {
        const width = (this.data.backgroundWidth && this.data.backgroundWidth.trim()) ? this.data.backgroundWidth.trim() : 'auto';
        const height = (this.data.backgroundHeight && this.data.backgroundHeight.trim()) ? this.data.backgroundHeight.trim() : 'auto';
        effectiveBackgroundSize = `${width} ${height}`;
      }
      
      // Check if we're in empty state (no columns)
      const isEmptyState = this.data.columns.length === 0;
      
      // Initialize theme manager
      if (isEmptyState) {
        // Empty state: force browser theme and bypass custom CSS
        this.themeManager = await initializeTheming({
          theme: 'browser',
          customCss: '',
          // Theme-specific CSS disabled
          lightCss: '',
          lightCssEnabled: false,
          darkCss: '',
          darkCssEnabled: false,
          browserCss: '',
          browserCssEnabled: false,
          backgroundDataUri: this.data.backgroundDataUri,
          backgroundSize: effectiveBackgroundSize,
          backgroundRepeat: this.data.backgroundRepeat,
          backgroundPosition: this.data.backgroundPosition,
          pageBackgroundColor: this.data.pageBackgroundColor
        });
      } else {
        // Normal state: use user's theme settings
        this.themeManager = await initializeTheming({
          theme: this.data.theme,
          customCss: this.data.customCss,
          // Theme-specific CSS
          lightCss: this.data.lightCss,
          lightCssEnabled: this.data.lightCssEnabled,
          darkCss: this.data.darkCss,
          darkCssEnabled: this.data.darkCssEnabled,
          browserCss: this.data.browserCss,
          browserCssEnabled: this.data.browserCssEnabled,
          backgroundDataUri: this.data.backgroundDataUri,
          backgroundSize: effectiveBackgroundSize,
          backgroundRepeat: this.data.backgroundRepeat,
          backgroundPosition: this.data.backgroundPosition,
          pageBackgroundColor: this.data.pageBackgroundColor
        });
      }

      // Initialize drag scrolling
      const boardContainer = document.getElementById('board-container');
      this.dragScrollInstance = initializeDragScroll(boardContainer);

      // Render the board
      this.render();

      // Setup event listeners
      this.setupEventListeners();

      // Hide loading state
      this.hideLoading();

      // Show empty state if no columns
      if (this.data.columns.length === 0) {
        this.showEmptyState();
      }

      // Apply column animations if enabled
      if (this.data.columnAnimationEnabled) {
        this.loadAndApplyAnimations();
      }

    } catch (error) {
      console.error('Failed to initialize new tab page:', error);
      this.showError('Failed to load your boards. Please try refreshing the page.');
    }
  }

  /**
   * Load HTML templates
   */
  loadTemplates() {
    this.templates.column = document.getElementById('column-template');
    this.templates.link = document.getElementById('link-template');
    this.templates.divider = document.getElementById('divider-template');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Open settings button (empty state)
    document.getElementById('open-settings-btn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Handle favicon load errors - scoped to columns container
    document.querySelector('#columns-container').addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG' && e.target.classList.contains('link-icon')) {
        this.handleFaviconError(e.target);
      }
    }, true);
  }

  /**
   * Render the entire board
   */
  render() {
    const container = document.getElementById('columns-container');
    container.innerHTML = '';

    const maxColumns = 50;
    if (this.data.columns.length > maxColumns) {
      this.showError(`Too many columns (${this.data.columns.length}). Displaying first ${maxColumns}.`);
      this.data.columns = this.data.columns.slice(0, maxColumns);
    }

    this.data.columns.forEach(column => {
      const columnElement = this.createColumnElement(column);
      container.appendChild(columnElement);
    });

    // Update visibility classes
    this.updateVisibilityClasses();
  }

  /**
   * Create a column element
   * @param {Object} column - Column data
   * @returns {Element} Column element
   */
  createColumnElement(column) {
    const template = this.templates.column.content.cloneNode(true);
    const columnEl = template.querySelector('.column');

    // Set column data
    columnEl.dataset.columnId = column.id;

    // Apply custom CSS classes if present and valid
    if (column.customClasses && typeof column.customClasses === 'string') {
      const customClasses = this.sanitizeCssClasses(column.customClasses);
      if (customClasses) {
        customClasses.split(/\s+/).forEach(className => {
          if (className) {
            columnEl.classList.add(className);
          }
        });
      }
    }

    // Handle column header visibility
    const headerEl = columnEl.querySelector('.column-header');
    if (this.data.showColumnHeaders === false) {
      // Remove the header entirely if showColumnHeaders is false
      headerEl.remove();
    } else {
      // Set title if header is shown
      const titleEl = columnEl.querySelector('.column-title');
      titleEl.textContent = column.name;
    }

    // Render items (links and dividers)
    const linksContainer = columnEl.querySelector('.links-container');
    if (column.items && column.items.length > 0) {
      column.items.forEach(item => {
        const itemElement = this.createItemElement(item);
        linksContainer.appendChild(itemElement);
      });
    }

    return columnEl;
  }

  /**
   * Create an item element (link or divider)
   * @param {Object} item - Item data
   * @returns {Element} Item element
   */
  createItemElement(item) {
    if (item.type === 'divider') {
      return this.createDividerElement(item);
    } else {
      return this.createLinkElement(item);
    }
  }

  /**
   * Create a link element
   * @param {Object} link - Link data
   * @returns {Element} Link element
   */
  createLinkElement(link) {
    const template = this.templates.link.content.cloneNode(true);
    const linkEl = template.querySelector('.link-card');

    // Set link data
    linkEl.dataset.linkId = link.id;

    // Apply custom CSS classes if present and valid
    if (link.customClasses && typeof link.customClasses === 'string') {
      const customClasses = this.sanitizeCssClasses(link.customClasses);
      if (customClasses) {
        customClasses.split(/\s+/).forEach(className => {
          if (className) {
            linkEl.classList.add(className);
          }
        });
      }
    }

    // Set content
    const linkContent = linkEl.querySelector('.link-content');
    const linkIcon = linkEl.querySelector('.link-icon');
    const linkTitle = linkEl.querySelector('.link-title');
    const linkUrl = linkEl.querySelector('.link-url');

    linkContent.href = link.url;
    linkTitle.innerHTML = sanitizeText(link.title || this.extractDomainFromUrl(link.url));
    linkUrl.textContent = this.formatUrlForDisplay(link.url);

    // Set icon
    this.setLinkIcon(linkIcon, link);

    return linkEl;
  }

  /**
   * Create a divider element
   * @param {Object} divider - Divider data
   * @returns {Element} Divider element
   */
  createDividerElement(divider) {
    const template = this.templates.divider.content.cloneNode(true);
    const dividerEl = template.querySelector('.divider-item');

    // Set divider data
    dividerEl.dataset.dividerId = divider.id;

    // Apply custom CSS classes if present and valid
    if (divider.customClasses && typeof divider.customClasses === 'string') {
      const customClasses = this.sanitizeCssClasses(divider.customClasses);
      if (customClasses) {
        customClasses.split(/\s+/).forEach(className => {
          if (className) {
            dividerEl.classList.add(className);
          }
        });
      }
    }

    // Set title (can be empty for horizontal rule effect)
    const titleEl = dividerEl.querySelector('.divider-title');
    if (divider.title) {
      titleEl.innerHTML = sanitizeText(divider.title);
    }
    // Note: Empty divider titles are styled by CSS to show as horizontal rules

    return dividerEl;
  }

  /**
   * Set link icon (favicon or custom)
   * @param {Element} iconEl - Icon image element
   * @param {Object} link - Link data
   */
  setLinkIcon(iconEl, link) {
    if (link.iconDataUri) {
      iconEl.src = link.iconDataUri;
    } else if (link.iconUrlOverride) {
      iconEl.src = link.iconUrlOverride;
    } else {
      iconEl.src = getFaviconUrl(link.url);
    }

    iconEl.alt = link.title || this.extractDomainFromUrl(link.url);
  }

  /**
   * Handle favicon load errors
   * @param {Element} iconEl - Icon element that failed to load
   */
  handleFaviconError(iconEl) {
    const linkCard = iconEl.closest('.link-card');
    if (!linkCard) return;

    const linkId = linkCard.dataset.linkId;
    const link = this.findLinkById(linkId);

    if (link && !link.iconDataUri && !link.iconUrlOverride) {
      // Use letter avatar as fallback
      iconEl.src = generateLetterAvatar(link.url);
    }
  }

  /**
   * Update visibility classes for icons and URLs
   */
  updateVisibilityClasses() {
    const body = document.body;

    // Update icon visibility
    if (this.data.showIcons) {
      body.classList.remove('hide-icons');
    } else {
      body.classList.add('hide-icons');
    }

    // Update URL visibility
    if (this.data.showUrls !== undefined && !this.data.showUrls) {
      body.classList.add('hide-urls');
    } else {
      body.classList.remove('hide-urls');
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    document.getElementById('loading').classList.remove('hidden');
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden');
  }

  /**
   * Hide empty state
   */
  hideEmptyState() {
    document.getElementById('empty-state').classList.add('hidden');
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error(message);
    // Could implement a toast notification system here
  }

  /**
   * Find item by ID
   * @param {string} itemId - Item ID
   * @returns {Object|null} Item object or null
   */
  findItemById(itemId) {
    for (const column of this.data.columns) {
      const item = column.items.find(i => i.id === itemId);
      if (item) return item;
    }
    return null;
  }

  /**
   * Find link by ID (legacy method for backward compatibility)
   * @param {string} linkId - Link ID
   * @returns {Object|null} Link object or null
   */
  findLinkById(linkId) {
    return this.findItemById(linkId);
  }

  /**
   * Sanitize CSS class names for security
   * @param {string} classes - Space-separated CSS class names
   * @returns {string} Sanitized CSS classes
   */
  sanitizeCssClasses(classes) {
    if (!classes || typeof classes !== 'string') return '';
    
    const classArray = classes.trim().split(/\s+/);
    const validClassRegex = /^[a-zA-Z_][\w\-]*$/;
    
    return classArray
      .filter(className => className && validClassRegex.test(className))
      .join(' ');
  }

  /**
   * Extract domain from URL
   * @param {string} url - URL
   * @returns {string} Domain name
   */
  extractDomainFromUrl(url) {
    try {
      let testUrl = url;
      if (!testUrl.match(/^[a-zA-Z]+:\/\//)) {
        testUrl = 'https://' + testUrl;
      }
      return new URL(testUrl).hostname;
    } catch {
      return url;
    }
  }

  /**
   * Format URL for display
   * @param {string} url - URL
   * @returns {string} Formatted URL
   */
  formatUrlForDisplay(url) {
    try {
      let testUrl = url;
      if (!testUrl.match(/^[a-zA-Z]+:\/\//)) {
        testUrl = 'https://' + testUrl;
      }
      const parsed = new URL(testUrl);
      let hostname = parsed.hostname;
      
      // Remove "www." if it's the only subdomain
      if (hostname.startsWith('www.')) {
        const withoutWww = hostname.substring(4);
        // Check if there are any other subdomains (more than 2 parts means other subdomains)
        if (withoutWww.split('.').length === 2) {
          hostname = withoutWww;
        }
      }
      
      return hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
    } catch {
      return url;
    }
  }

  /**
   * Load animation resources and apply animations
   */
  async loadAndApplyAnimations() {
    try {
      // Load animate.css if not already loaded
      if (!document.querySelector('link[href*="animate.min.css"]')) {
        const animateLink = document.createElement('link');
        animateLink.rel = 'stylesheet';
        animateLink.href = chrome.runtime.getURL('vendor/animate/animate.min.css');
        animateLink.id = 'animate-css-link';
        document.head.appendChild(animateLink);
        
        // Wait for stylesheet to load
        await new Promise((resolve, reject) => {
          animateLink.onload = resolve;
          animateLink.onerror = reject;
        });
      }

      // Load column-animations.js if not already loaded
      if (typeof ColumnAnimationManager === 'undefined') {
        const script = document.createElement('script');
        script.src = 'scripts/column-animations.js';
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Apply animations to columns
      this.applyColumnAnimations();
    } catch (error) {
      console.error('Failed to load animation resources:', error);
    }
  }

  /**
   * Apply animations to rendered columns
   */
  applyColumnAnimations() {
    const columns = document.querySelectorAll('.column');
    if (columns.length === 0) return;

    // Get animation settings from loaded data
    const animationSettings = {
      columnAnimationStyle: this.data.columnAnimationStyle,
      columnAnimationMode: this.data.columnAnimationMode,
      columnAnimationDuration: this.data.columnAnimationDuration,
      columnAnimationDelay: this.data.columnAnimationDelay,
      columnAnimationStagger: this.data.columnAnimationStagger,
      columnAnimationStylesheetOnly: this.data.columnAnimationStylesheetOnly
    };

    // Apply animations using the ColumnAnimationManager
    if (typeof ColumnAnimationManager !== 'undefined') {
      ColumnAnimationManager.applyAnimations(Array.from(columns), animationSettings);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NewTabApp();
});

// Add CSS for hiding icons and URLs when needed
const visibilityStyle = document.createElement('style');
visibilityStyle.textContent = `
  .hide-icons .link-icon-container {
    display: none !important;
  }
  
  .hide-urls .link-url {
    display: none !important;
  }
`;
document.head.appendChild(visibilityStyle);