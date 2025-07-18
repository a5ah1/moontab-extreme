/**
 * Help Manager - Link Stacker Options
 * Handles markdown loading, parsing, and TOC generation for the help panel
 */

class HelpManager {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.helpContent = null;
    this.tocItems = [];
  }

  /**
   * Setup help panel with markdown content
   */
  async setupHelpPanel() {
    const helpPanel = document.getElementById('help-panel');
    const panelBody = helpPanel.querySelector('.panel-body');
    
    // Create help layout structure
    panelBody.innerHTML = `
      <div class="help-layout">
        <div class="help-toc">
          <h3>Contents</h3>
          <nav class="toc-nav"></nav>
        </div>
        <div class="help-content-wrapper">
          <div class="help-content" id="help-content">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>Loading help content...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Load and render help content
    await this.loadHelpContent();
    
    // Setup interactions
    this.setupInteractions();
  }

  /**
   * Load help content from markdown file
   */
  async loadHelpContent() {
    try {
      const response = await fetch('help.md');
      const markdownContent = await response.text();
      
      // Parse markdown to HTML
      const htmlContent = marked.parse(markdownContent);
      
      // Generate TOC and render content
      this.generateTOC(htmlContent);
      this.renderContent(htmlContent);
      
    } catch (error) {
      console.error('Failed to load help content:', error);
      this.renderError();
    }
  }

  /**
   * Generate Table of Contents from HTML content
   * @param {string} htmlContent - Parsed HTML content
   */
  generateTOC(htmlContent) {
    // Create temporary element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all headings
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    this.tocItems = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      const id = this.generateHeadingId(text, index);
      
      // Add ID to heading for anchor linking
      heading.id = id;
      
      // Store TOC item
      this.tocItems.push({
        level,
        text,
        id,
        element: heading
      });
    });
    
    // Update original content with IDs
    this.helpContent = tempDiv.innerHTML;
    
    // Render TOC
    this.renderTOC();
  }

  /**
   * Generate a URL-safe ID from heading text
   * @param {string} text - Heading text
   * @param {number} index - Heading index for uniqueness
   * @returns {string} Generated ID
   */
  generateHeadingId(text, index) {
    const baseId = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    return baseId || `heading-${index}`;
  }

  /**
   * Render Table of Contents
   */
  renderTOC() {
    const tocNav = document.querySelector('.toc-nav');
    
    if (this.tocItems.length === 0) {
      tocNav.innerHTML = '<p class="no-toc">No headings found</p>';
      return;
    }
    
    let tocHtml = '<ul class="toc-list">';
    
    this.tocItems.forEach(item => {
      const levelClass = `toc-level-${item.level}`;
      tocHtml += `
        <li class="toc-item ${levelClass}">
          <a href="#${item.id}" class="toc-link" data-target="${item.id}">
            ${this.escapeHtml(item.text)}
          </a>
        </li>
      `;
    });
    
    tocHtml += '</ul>';
    tocNav.innerHTML = tocHtml;
  }

  /**
   * Render help content
   * @param {string} htmlContent - HTML content to render
   */
  renderContent(htmlContent) {
    const contentDiv = document.getElementById('help-content');
    contentDiv.innerHTML = this.helpContent || htmlContent;
    
    // Add click handlers to internal links
    this.setupInternalLinks();
  }

  /**
   * Render error message
   */
  renderError() {
    const contentDiv = document.getElementById('help-content');
    contentDiv.innerHTML = `
      <div class="help-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Failed to Load Help Content</h3>
        <p>There was an error loading the help documentation. Please try refreshing the page.</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
  }

  /**
   * Setup interactions for help panel
   */
  setupInteractions() {
    // TOC link clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('toc-link')) {
        e.preventDefault();
        const targetId = e.target.dataset.target;
        this.scrollToSection(targetId);
      }
    });


    // Update active TOC item based on scroll position
    this.setupScrollSpy();
  }

  /**
   * Setup internal link handlers
   */
  setupInternalLinks() {
    const helpContent = document.getElementById('help-content');
    const links = helpContent.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
      });
    });
  }

  /**
   * Scroll to a specific section
   * @param {string} sectionId - ID of the section to scroll to
   */
  scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    const helpWrapper = document.querySelector('.help-content-wrapper');
    
    if (targetElement && helpWrapper) {
      const offsetTop = targetElement.offsetTop - 20; // Add some padding
      helpWrapper.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Update active TOC item
      this.updateActiveTOCItem(sectionId);
    }
  }

  /**
   * Scroll to top of help content
   */
  scrollToTop() {
    const helpWrapper = document.querySelector('.help-content-wrapper');
    if (helpWrapper) {
      helpWrapper.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Setup scroll spy for active TOC highlighting
   */
  setupScrollSpy() {
    const helpWrapper = document.querySelector('.help-content-wrapper');
    if (!helpWrapper) return;

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver(
      (entries) => {
        let visibleHeading = null;
        
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visibleHeading = entry.target;
          }
        });
        
        if (visibleHeading) {
          this.updateActiveTOCItem(visibleHeading.id);
        }
      },
      {
        root: helpWrapper,
        rootMargin: '-20px 0px -80% 0px',
        threshold: 0
      }
    );

    // Observe all headings
    this.tocItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });
  }

  /**
   * Update active TOC item
   * @param {string} activeId - ID of the active section
   */
  updateActiveTOCItem(activeId) {
    // Remove all active classes
    document.querySelectorAll('.toc-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current item
    const activeLink = document.querySelector(`[data-target="${activeId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  /**
   * Escape HTML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Called when panel is switched to help
   */
  onPanelSwitch(panelId) {
    if (panelId === 'help' && !this.helpContent) {
      // Initialize help panel if not already done
      this.setupHelpPanel();
    }
  }
}