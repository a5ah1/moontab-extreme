/**
 * CSS Editor Manager - Moontab Extreme Options
 * Manages all CSS editors (custom, light, dark, browser, glass, acrylic)
 *
 * Uses THEME_CONFIG for centralized theme configuration
 */

class CSSEditorManager {
  constructor(data, uiManager, markDirty) {
    this.data = data;
    this.uiManager = uiManager;
    this.markDirty = markDirty;
    this.editors = {
      custom: null
    };
    this.editorResizeObservers = [];

    // Initialize editors object with all themes from config
    if (window.THEME_CONFIG) {
      THEME_CONFIG.getCustomizableThemes().forEach(theme => {
        this.editors[theme.key] = null;
      });
    }
  }

  /**
   * Setup all CSS editors and controls
   */
  setup() {
    this.generateThemeSections();
    this.setupThemeSpecificEditors();
    this.insertCSSVariablesHelp();
    this.setupCSSVariablesClickToCopy();
  }

  /**
   * Generate theme CSS sections from template
   */
  generateThemeSections() {
    if (!window.THEME_CONFIG) {
      console.error('THEME_CONFIG not found');
      return;
    }

    const container = document.getElementById('theme-css-sections-container');
    const template = document.getElementById('theme-css-section-template');

    if (!container || !template) {
      console.error('Theme CSS container or template not found');
      return;
    }

    // Generate a section for each customizable theme
    THEME_CONFIG.getCustomizableThemes().forEach(theme => {
      const section = template.content.cloneNode(true);
      const sectionDiv = section.querySelector('.section');

      // Set section ID
      sectionDiv.id = `${theme.id}-theme-css-section`;
      sectionDiv.setAttribute('data-theme-id', theme.id);

      // Set header
      const header = section.querySelector('[data-theme-name]');
      header.textContent = `${theme.name} Theme Customization`;

      // Set checkbox
      const checkbox = section.querySelector('[data-theme-checkbox]');
      checkbox.id = `${theme.id}-css-enabled`;
      checkbox.removeAttribute('data-theme-checkbox');

      // Set label
      const label = section.querySelector('[data-theme-label]');
      label.textContent = `Custom CSS for ${theme.name} Theme`;

      // Set help text
      const helpText = section.querySelector('[data-theme-help]');
      helpText.textContent = `Add custom CSS to enhance the ${theme.name} theme`;

      // Set controls container
      const controls = section.querySelector('[data-theme-controls]');
      controls.id = `${theme.id}-css-controls`;
      controls.removeAttribute('data-theme-controls');

      // Set editor div
      const editor = section.querySelector('[data-theme-editor]');
      editor.id = `${theme.id}-css-editor`;
      editor.removeAttribute('data-theme-editor');

      // Append to container
      container.appendChild(section);
    });
  }

  /**
   * Setup theme-specific CSS controls
   */
  setupThemeSpecificEditors() {
    if (!window.THEME_CONFIG) {
      console.error('THEME_CONFIG not found');
      return;
    }

    THEME_CONFIG.getCustomizableThemes().forEach(theme => {
      const checkbox = document.getElementById(`${theme.id}-css-enabled`);
      const controls = document.getElementById(`${theme.id}-css-controls`);

      if (!checkbox || !controls) {
        console.warn(`Theme section not found for ${theme.id}`);
        return;
      }

      // Set initial state
      checkbox.checked = this.data[`${theme.key}CssEnabled`] || false;
      controls.classList.toggle('show', checkbox.checked);

      // Handle checkbox changes
      checkbox.addEventListener('change', () => {
        const enabled = checkbox.checked;
        controls.classList.toggle('show', enabled);

        // Update data
        this.data[`${theme.key}CssEnabled`] = enabled;
        this.markDirty();

        // Initialize editor if enabled and not already created
        if (enabled && !this.editors[theme.key]) {
          setTimeout(() => this.initializeEditor(theme.key, `${theme.id}-css-editor`), 100);
        }
      });

      // Initialize editor if already enabled
      if (checkbox.checked) {
        setTimeout(() => this.initializeEditor(theme.key, `${theme.id}-css-editor`), 100);
      }
    });
  }

  /**
   * Initialize custom CSS editor
   */
  initializeCustomEditor() {
    if (this.editors.custom) return;

    this.initializeEditor('custom', 'css-editor');
    this.setupCustomCSSActions();
  }

  /**
   * Initialize a CSS editor
   * @param {string} editorKey - Editor key ('custom', 'light', 'dark', 'browser')
   * @param {string} elementId - DOM element ID
   */
  initializeEditor(editorKey, elementId) {
    const editor = document.getElementById(elementId);

    if (!editor || this.editors[editorKey]) return;

    try {
      // Load language tools for autocompletion
      ace.require("ace/ext/language_tools");

      this.editors[editorKey] = ace.edit(elementId);

      // Detect system theme preference for editor theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const editorTheme = prefersDark ? 'ace/theme/github_dark' : 'ace/theme/github';

      this.editors[editorKey].setTheme(editorTheme);
      this.editors[editorKey].session.setMode('ace/mode/css');

      // Set initial value based on editor type
      const dataKey = editorKey === 'custom' ? 'customCss' : `${editorKey}Css`;
      this.editors[editorKey].setValue(this.data[dataKey] || '', -1);

      // Configure editor
      this.editors[editorKey].setOptions({
        fontSize: 14,
        showPrintMargin: false,
        wrap: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useWorker: false,  // Disable web workers to fix CSP issues in Chrome extensions
        tabSize: 2
      });

      // Handle changes
      this.editors[editorKey].session.on('change', debounce(() => {
        this.updateCSS(editorKey, this.editors[editorKey].getValue());
      }, 500));

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newTheme = e.matches ? 'ace/theme/github_dark' : 'ace/theme/github';
        this.editors[editorKey].setTheme(newTheme);
      });

      // Setup resize observer
      this.setupEditorResizeObserver(elementId, this.editors[editorKey]);

    } catch (error) {
      console.error(`Failed to initialize ${editorKey} CSS editor:`, error);

      // Fallback to textarea if Ace fails (only for custom editor)
      if (editorKey === 'custom') {
        this.createFallbackEditor(elementId, editorKey);
      }
    }
  }

  /**
   * Create fallback CSS editor (textarea) if Ace fails
   * @param {string} containerId - Editor container ID
   * @param {string} editorKey - Editor key
   */
  createFallbackEditor(containerId, editorKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const textarea = document.createElement('textarea');
    textarea.className = 'css-editor-fallback';
    textarea.style.cssText = `
      width: 100%;
      height: 300px;
      font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
      font-size: 14px;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--bg-primary);
      color: var(--text-primary);
      resize: vertical;
    `;

    const dataKey = editorKey === 'custom' ? 'customCss' : `${editorKey}Css`;
    textarea.value = this.data[dataKey] || '';

    textarea.addEventListener('input', debounce(() => {
      this.updateCSS(editorKey, textarea.value);
    }, 500));

    container.appendChild(textarea);
    this.editors[editorKey] = {
      getValue: () => textarea.value,
      setValue: (val) => textarea.value = val
    };
  }

  /**
   * Setup resize observer for a specific editor
   * @param {string} containerId - Editor container ID
   * @param {Object} editor - Ace editor instance
   */
  setupEditorResizeObserver(containerId, editor) {
    if (!editor || !editor.resize) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // Create a ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Tell Ace editor to resize to fit the new container size
        editor.resize();
      }
    });

    // Start observing the editor container
    resizeObserver.observe(container);

    // Store the observer for cleanup
    this.editorResizeObservers.push(resizeObserver);
  }

  /**
   * Update CSS content
   * @param {string} editorKey - Editor key
   * @param {string} css - CSS content
   */
  updateCSS(editorKey, css) {
    const dataKey = editorKey === 'custom' ? 'customCss' : `${editorKey}Css`;
    this.data[dataKey] = css;
    this.markDirty();
  }

  /**
   * Setup custom CSS editor actions (preview and reset)
   */
  setupCustomCSSActions() {
    const previewBtn = document.getElementById('css-preview-btn');
    const resetBtn = document.getElementById('css-reset-btn');

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        this.previewCustomCSS();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetCustomCSS();
      });
    }
  }

  /**
   * Preview custom CSS in modal
   */
  previewCustomCSS() {
    const css = this.editors.custom ? this.editors.custom.getValue() : '';

    // Create and show preview modal
    const modal = this.uiManager.createModal('preview');
    const iframe = modal.querySelector('#preview-frame');

    // Apply CSS to iframe when loaded
    iframe.addEventListener('load', () => {
      const doc = iframe.contentDocument;

      // Initialize theme manager in iframe context
      const themeManager = new (iframe.contentWindow.ThemeManager || class {
        async init() { }
        async applyCustomTheme() { }
        generatePreviewCSS(css) { return css; }
      })();

      // Apply preview CSS
      if (this.data.theme === 'custom') {
        const previewCSS = css || this.data.customCss;
        const style = doc.createElement('style');
        style.textContent = previewCSS;
        doc.head.appendChild(style);
      }
    });

    document.body.appendChild(modal);
  }

  /**
   * Reset custom CSS
   */
  resetCustomCSS() {
    if (confirm('Are you sure you want to reset the custom CSS? This cannot be undone.')) {
      this.data.customCss = '';
      if (this.editors.custom) {
        this.editors.custom.setValue('', -1);
      }
      this.markDirty();
    }
  }

  /**
   * Insert CSS variables help from template
   */
  insertCSSVariablesHelp() {
    const template = document.getElementById('css-variables-help-template');
    if (!template) {
      console.error('CSS variables help template not found');
      return;
    }

    // Insert help into custom CSS section
    const customCssSection = document.querySelector('#custom-css-section');
    if (customCssSection && !customCssSection.querySelector('.css-help')) {
      const helpClone = template.content.cloneNode(true);
      customCssSection.appendChild(helpClone);
    }

    // Insert help into all theme CSS controls (dynamically generated)
    if (!window.THEME_CONFIG) return;

    THEME_CONFIG.getCustomizableThemes().forEach(theme => {
      const container = document.querySelector(`#${theme.id}-css-controls`);
      if (container && !container.querySelector('.css-help')) {
        const helpClone = template.content.cloneNode(true);
        container.appendChild(helpClone);
      }
    });
  }

  /**
   * Setup click-to-copy functionality for CSS variables
   */
  setupCSSVariablesClickToCopy() {
    const codeElements = document.querySelectorAll('.css-variables code');

    codeElements.forEach(code => {
      code.addEventListener('click', async () => {
        const variable = code.textContent;

        try {
          await navigator.clipboard.writeText(variable);
          this.showCopiedNotification(code);
        } catch (err) {
          console.error('Failed to copy CSS variable:', err);
          this.fallbackCopy(variable, code);
        }
      });
    });
  }

  /**
   * Show "Copied!" notification
   * @param {HTMLElement} element - Element to attach notification to
   */
  showCopiedNotification(element) {
    // Create and show 'Copied!' notification
    const notification = document.createElement('span');
    notification.className = 'css-copied-notification animate__animated animate__fadeIn';
    notification.textContent = 'Copied!';
    element.appendChild(notification);

    // Remove notification after 600ms with fade out animation
    setTimeout(() => {
      notification.classList.remove('animate__fadeIn');
      notification.classList.add('animate__fadeOut');

      // Remove element after fade out completes
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300); // animate.css fadeOut duration
    }, 600);
  }

  /**
   * Fallback copy method for older browsers
   * @param {string} text - Text to copy
   * @param {HTMLElement} element - Element to attach notification to
   */
  fallbackCopy(text, element) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      this.showCopiedNotification(element);
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
    }

    document.body.removeChild(textArea);
  }

  /**
   * Get editor instance
   * @param {string} editorKey - Editor key
   * @returns {Object|null} Editor instance
   */
  getEditor(editorKey) {
    return this.editors[editorKey];
  }

  /**
   * Cleanup resize observers
   */
  cleanup() {
    this.editorResizeObservers.forEach(observer => observer.disconnect());
    this.editorResizeObservers = [];
  }
}
