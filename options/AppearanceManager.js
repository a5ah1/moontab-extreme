/**
 * Appearance Manager - Link Stacker Options
 * Handles all visual customization: themes, CSS editor, backgrounds, page background color
 */

class AppearanceManager {
  constructor(data, uiManager, markDirty) {
    this.data = data;
    this.uiManager = uiManager;
    this.markDirty = markDirty;
    this.cssEditor = null;
    this.themeEditors = {
      light: null,
      dark: null,
      browser: null
    };
    this.editorResizeObservers = [];
  }

  /**
   * Setup appearance panel (themes, CSS, background)
   */
  setupAppearancePanel() {
    // Theme selector
    this.setupThemeSelector();

    // Theme-specific CSS sections
    this.setupThemeCSSControls();

    // Page background color
    this.setupPageBackgroundColor();

    // Background upload
    this.setupBackgroundUpload();

    // Column animations
    this.setupColumnAnimations();

    // Insert CSS variables help from template
    this.insertCSSVariablesHelp();

    // CSS variables click-to-copy functionality
    this.setupCSSVariablesClickToCopy();

    // Custom CSS section will be initialized when panel is first accessed
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

    // Find all the locations where we need to insert the help
    const insertLocations = [
      '#light-css-controls',
      '#dark-css-controls', 
      '#browser-css-controls',
      '#custom-css-section'
    ];

    insertLocations.forEach(selector => {
      const container = document.querySelector(selector);
      if (container) {
        // Check if help is already inserted
        if (!container.querySelector('.css-help')) {
          const helpClone = template.content.cloneNode(true);
          container.appendChild(helpClone);
        }
      }
    });
  }

  /**
   * Setup theme-specific CSS controls
   */
  setupThemeCSSControls() {
    const themes = ['light', 'dark', 'browser'];
    
    themes.forEach(theme => {
      const checkbox = document.getElementById(`${theme}-css-enabled`);
      const controls = document.getElementById(`${theme}-css-controls`);
      
      if (!checkbox || !controls) return;

      // Set initial state
      checkbox.checked = this.data[`${theme}CssEnabled`] || false;
      controls.classList.toggle('show', checkbox.checked);

      // Handle checkbox changes
      checkbox.addEventListener('change', () => {
        const enabled = checkbox.checked;
        controls.classList.toggle('show', enabled);
        
        // Update data
        this.data[`${theme}CssEnabled`] = enabled;
        this.markDirty();

        // Initialize editor if enabled and not already created
        if (enabled && !this.themeEditors[theme]) {
          setTimeout(() => this.initializeThemeEditor(theme), 100);
        }

        // Update theme manager if this is the current theme
        this.updateCurrentTheme();
      });

      // Initialize editor if already enabled
      if (checkbox.checked) {
        setTimeout(() => this.initializeThemeEditor(theme), 100);
      }
    });
  }

  /**
   * Initialize a theme-specific CSS editor
   * @param {string} theme - Theme name ('light', 'dark', 'browser')
   */
  initializeThemeEditor(theme) {
    const editorId = `${theme}-css-editor`;
    const editor = document.getElementById(editorId);
    
    if (!editor || this.themeEditors[theme]) return;

    try {
      // Load language tools for autocompletion
      ace.require("ace/ext/language_tools");
      
      this.themeEditors[theme] = ace.edit(editorId);

      // Detect system theme preference for editor theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const editorTheme = prefersDark ? 'ace/theme/github_dark' : 'ace/theme/github';

      this.themeEditors[theme].setTheme(editorTheme);
      this.themeEditors[theme].session.setMode('ace/mode/css');
      this.themeEditors[theme].setValue(this.data[`${theme}Css`] || '', -1);

      // Configure editor
      this.themeEditors[theme].setOptions({
        fontSize: 14,
        showPrintMargin: false,
        wrap: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useWorker: false,  // Disable web workers to fix CSP issues in Chrome extensions
        tabSize: 2
      });

      // Handle changes
      this.themeEditors[theme].session.on('change', debounce(() => {
        this.updateThemeCSS(theme, this.themeEditors[theme].getValue());
      }, 500));

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newTheme = e.matches ? 'ace/theme/github_dark' : 'ace/theme/github';
        this.themeEditors[theme].setTheme(newTheme);
      });

      // Setup resize observer
      this.setupEditorResizeObserver(editorId, this.themeEditors[theme]);

    } catch (error) {
      console.error(`Failed to initialize ${theme} CSS editor:`, error);
    }
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
   * Update theme CSS
   * @param {string} theme - Theme name
   * @param {string} css - CSS content
   */
  updateThemeCSS(theme, css) {
    this.data[`${theme}Css`] = css;
    this.markDirty();
    
    // Update theme manager if this is affecting the current theme
    this.updateCurrentTheme();
  }

  /**
   * Update the current theme in the theme manager
   * Note: This should NOT apply themes to the options page itself,
   * only update the data model for the new tab page to use
   */
  updateCurrentTheme() {
    // DO NOT call theme manager methods here that inject CSS into options page
    // The theme manager is designed for the new tab page context, not options page
    // Theme changes will be applied when the new tab page loads with updated data
    
    // Just mark data as dirty so changes are saved to storage
    this.markDirty();
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
          
          // Create and show 'Copied!' notification
          const notification = document.createElement('span');
          notification.className = 'css-copied-notification animate__animated animate__fadeIn';
          notification.textContent = 'Copied!';
          code.appendChild(notification);
          
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
          
        } catch (err) {
          console.error('Failed to copy CSS variable:', err);
          
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = variable;
          document.body.appendChild(textArea);
          textArea.select();
          
          try {
            document.execCommand('copy');
            
            // Create and show 'Copied!' notification
            const notification = document.createElement('span');
            notification.className = 'css-copied-notification animate__animated animate__fadeIn';
            notification.textContent = 'Copied!';
            code.appendChild(notification);
            
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
            
          } catch (fallbackErr) {
            console.error('Fallback copy failed:', fallbackErr);
          }
          
          document.body.removeChild(textArea);
        }
      });
    });
  }

  /**
   * Setup theme selector
   */
  setupThemeSelector() {
    const themeInputs = document.querySelectorAll('input[name="theme"]');

    // Set current theme
    themeInputs.forEach(input => {
      input.checked = input.value === this.data.theme;
    });

    // Handle theme changes
    themeInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          this.updateTheme(input.value);
        }
      });
    });

    // Show/hide appropriate CSS sections
    this.toggleThemeCSSSection();
  }


  /**
   * Setup page background color controls
   */
  setupPageBackgroundColor() {
    const enabledCheckbox = document.getElementById('page-background-enabled');
    const colorInput = document.getElementById('page-background-color');
    const clearBtn = document.getElementById('clear-page-background-btn');

    // Set initial state
    const hasColor = this.data.pageBackgroundColor !== null;
    enabledCheckbox.checked = hasColor;
    colorInput.disabled = !hasColor;
    
    if (hasColor) {
      colorInput.value = this.data.pageBackgroundColor;
    } else {
      colorInput.value = '#ffffff'; // Default color when not active
    }

    // Handle checkbox changes
    enabledCheckbox.addEventListener('change', () => {
      const isEnabled = enabledCheckbox.checked;
      colorInput.disabled = !isEnabled;
      
      if (isEnabled) {
        // Enable: use current color input value
        this.data.pageBackgroundColor = colorInput.value;
      } else {
        // Disable: clear the background color
        this.data.pageBackgroundColor = null;
      }
      
      this.applyPageBackgroundColor();
      this.markDirty();
    });

    // Handle color changes (only when enabled)
    colorInput.addEventListener('change', () => {
      if (enabledCheckbox.checked) {
        this.data.pageBackgroundColor = colorInput.value;
        this.applyPageBackgroundColor();
        this.markDirty();
      }
    });

    // Handle clear button
    clearBtn.addEventListener('click', () => {
      enabledCheckbox.checked = false;
      colorInput.disabled = true;
      this.data.pageBackgroundColor = null;
      this.applyPageBackgroundColor();
      this.markDirty();
    });

    // Apply initial color
    this.applyPageBackgroundColor();
  }

  /**
   * Apply page background color independently of theme
   */
  applyPageBackgroundColor() {
    const root = document.documentElement;
    
    if (this.data.pageBackgroundColor) {
      // Set page background color with lower priority than theme
      root.style.setProperty('--page-bg-color', this.data.pageBackgroundColor);
    } else {
      // Remove page background color
      root.style.removeProperty('--page-bg-color');
    }
  }

  /**
   * Initialize CSS editor (Ace)
   */
  initializeCSSEditor() {
    if (this.cssEditor) return;

    try {
      // Load language tools for autocompletion
      ace.require("ace/ext/language_tools");
      
      this.cssEditor = ace.edit('css-editor');

      // Detect system theme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'ace/theme/github_dark' : 'ace/theme/github';

      this.cssEditor.setTheme(theme);
      this.cssEditor.session.setMode('ace/mode/css');
      this.cssEditor.setValue(this.data.customCss || '', -1);

      // Configure editor
      this.cssEditor.setOptions({
        fontSize: 14,
        showPrintMargin: false,
        wrap: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useWorker: false,  // Disable web workers to fix CSP issues in Chrome extensions
        tabSize: 2
      });

      // Handle changes
      this.cssEditor.session.on('change', debounce(() => {
        this.updateCustomCSS(this.cssEditor.getValue());
      }, 500));

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newTheme = e.matches ? 'ace/theme/github_dark' : 'ace/theme/github';
        this.cssEditor.setTheme(newTheme);
      });

      // Setup CSS actions
      this.setupCSSActions();

      // Setup resize observer for manual resizing
      this.setupEditorResizeObserver('css-editor', this.cssEditor);

    } catch (error) {
      console.error('Failed to initialize CSS editor:', error);
      // Fallback to textarea if Ace fails
      this.createFallbackCSSEditor();
    }
  }

  /**
   * Create fallback CSS editor (textarea) if Ace fails
   */
  createFallbackCSSEditor() {
    const container = document.getElementById('css-editor');
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
    textarea.value = this.data.customCss || '';

    textarea.addEventListener('input', debounce(() => {
      this.updateCustomCSS(textarea.value);
    }, 500));

    container.appendChild(textarea);
    this.cssEditor = { getValue: () => textarea.value, setValue: (val) => textarea.value = val };
  }

  /**
   * Setup CSS editor actions
   */
  setupCSSActions() {
    const previewBtn = document.getElementById('css-preview-btn');
    const resetBtn = document.getElementById('css-reset-btn');

    previewBtn.addEventListener('click', () => {
      this.previewCSS();
    });

    resetBtn.addEventListener('click', () => {
      this.resetCustomCSS();
    });
  }


  /**
   * Setup background image upload
   */
  setupBackgroundUpload() {
    const uploadBtn = document.getElementById('upload-background-btn');
    const removeBtn = document.getElementById('remove-background-btn');
    const fileInput = document.getElementById('background-upload');
    const preview = document.getElementById('background-preview');

    // Background setting controls
    const sizeSelect = document.getElementById('background-size');
    const repeatSelect = document.getElementById('background-repeat');
    const positionSelect = document.getElementById('background-position');
    
    // Custom size controls
    const customSizeGroup = document.getElementById('custom-size-group');
    const widthInput = document.getElementById('background-width');
    const heightInput = document.getElementById('background-height');

    // Set initial state
    this.updateBackgroundPreview();

    // Set initial values for controls
    sizeSelect.value = this.data.backgroundSize || 'cover';
    
    repeatSelect.value = this.data.backgroundRepeat || 'no-repeat';
    positionSelect.value = this.data.backgroundPosition || 'center';
    
    // Set custom size values if they exist
    if (this.data.backgroundWidth) {
      widthInput.value = this.data.backgroundWidth;
    }
    if (this.data.backgroundHeight) {
      heightInput.value = this.data.backgroundHeight;
    }

    // Show/hide custom size inputs based on size selection
    this.updateCustomSizeVisibility();
    
    // If background size is already set to custom, apply the custom size
    if (sizeSelect.value === 'custom') {
      this.updateCustomBackgroundSize();
    }

    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      await this.handleBackgroundUpload(e.target.files[0]);
    });

    removeBtn.addEventListener('click', () => {
      this.removeBackground();
    });

    // Background setting handlers
    sizeSelect.addEventListener('change', () => {
      this.updateBackgroundSetting('backgroundSize', sizeSelect.value);
      this.updateCustomSizeVisibility();
    });

    repeatSelect.addEventListener('change', () => {
      this.updateBackgroundSetting('backgroundRepeat', repeatSelect.value);
    });

    positionSelect.addEventListener('change', () => {
      this.updateBackgroundSetting('backgroundPosition', positionSelect.value);
    });

    // Custom size input handlers
    widthInput.addEventListener('input', () => {
      this.updateBackgroundSetting('backgroundWidth', widthInput.value);
      this.updateCustomBackgroundSize();
    });

    heightInput.addEventListener('input', () => {
      this.updateBackgroundSetting('backgroundHeight', heightInput.value);
      this.updateCustomBackgroundSize();
    });
  }

  /**
   * Update visibility of custom size inputs
   */
  updateCustomSizeVisibility() {
    const customSizeGroup = document.getElementById('custom-size-group');
    const sizeSelect = document.getElementById('background-size');
    
    if (customSizeGroup && sizeSelect) {
      const isCustom = sizeSelect.value === 'custom';
      customSizeGroup.style.display = isCustom ? 'block' : 'none';
    }
  }

  /**
   * Update background size with custom values
   */
  updateCustomBackgroundSize() {
    const sizeSelect = document.getElementById('background-size');
    
    if (sizeSelect && sizeSelect.value === 'custom') {
      // Get values from inputs, defaulting to 'auto' if empty
      const widthInput = document.getElementById('background-width');
      const heightInput = document.getElementById('background-height');
      
      const width = (widthInput && widthInput.value.trim()) ? widthInput.value.trim() : 'auto';
      const height = (heightInput && heightInput.value.trim()) ? heightInput.value.trim() : 'auto';
      
      // Create custom CSS value
      const customSize = `${width} ${height}`;
      
      // Apply the custom size directly to theme manager
      this.applyBackgroundSetting('backgroundSize', customSize);
    }
  }

  /**
   * Update theme
   * @param {string} theme - Theme name
   */
  updateTheme(theme) {
    try {
      this.data.theme = theme;
      this.toggleThemeCSSSection();
      this.markDirty();

    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  }

  /**
   * Toggle theme CSS sections visibility based on selected theme
   */
  toggleThemeCSSSection() {
    const sections = {
      'light-theme-css-section': this.data.theme === 'light',
      'dark-theme-css-section': this.data.theme === 'dark',
      'browser-theme-css-section': this.data.theme === 'browser',
      'custom-css-section': this.data.theme === 'custom'
    };

    Object.entries(sections).forEach(([sectionId, isVisible]) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.toggle('hidden', !isVisible);
      }
    });

    // Initialize CSS editor for custom theme if needed
    if (this.data.theme === 'custom' && !this.cssEditor) {
      setTimeout(() => this.initializeCSSEditor(), 100);
    }
  }

  /**
   * Toggle custom CSS section visibility (legacy method for backward compatibility)
   */
  toggleCustomCSSSection() {
    this.toggleThemeCSSSection();
  }

  /**
   * Update custom CSS
   * @param {string} css - CSS string
   */
  updateCustomCSS(css) {
    this.data.customCss = css;
    this.markDirty();
  }


  /**
   * Preview CSS in modal
   */
  previewCSS() {
    const css = this.cssEditor ? this.cssEditor.getValue() : '';

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
      if (this.cssEditor) {
        this.cssEditor.setValue('', -1);
      }
      this.markDirty();
    }
  }

  /**
   * Handle background upload
   * @param {File} file - Background image file
   */
  async handleBackgroundUpload(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Background image must be smaller than 5MB');
      return;
    }

    try {
      const dataUri = await fileToDataUri(file);
      await this.updateBackground(dataUri);

    } catch (error) {
      console.error('Failed to upload background:', error);
      this.uiManager.showError('Failed to upload background. Please try again.');
    }
  }

  /**
   * Update background setting
   * @param {string} setting - Setting name
   * @param {string} value - Setting value
   */
  updateBackgroundSetting(setting, value) {
    this.data[setting] = value;
    
    // For background size, we need special handling
    if (setting === 'backgroundSize') {
      if (value === 'custom') {
        // Apply custom size using current width/height values
        this.updateCustomBackgroundSize();
        this.updateBackgroundPreview();
      } else {
        // Apply standard size value
        this.applyBackgroundSetting(setting, value);
        this.updateBackgroundPreview();
      }
    } else {
      // For other settings, apply directly
      this.applyBackgroundSetting(setting, value);
      this.updateBackgroundPreview();
    }
    
    this.markDirty();
  }

  /**
   * Apply background setting to theme manager
   * @param {string} setting - Setting name
   * @param {string} value - Setting value
   */
  applyBackgroundSetting(setting, value) {
    // DO NOT apply background settings to options page theme manager
    // This would affect the options page appearance instead of the new tab page
    // Background changes will be applied when the new tab page loads with updated data
    
    // Just ensure the data is saved - the new tab page will pick up the changes
    this.markDirty();
  }

  /**
   * Update background
   * @param {string|null} dataUri - Background data URI
   */
  async updateBackground(dataUri) {
    this.data.backgroundDataUri = dataUri;
    this.updateBackgroundPreview();
    this.markDirty();
  }

  /**
   * Remove background
   */
  removeBackground() {
    this.updateBackground(null);
  }

  /**
   * Update background preview
   */
  updateBackgroundPreview() {
    const preview = document.getElementById('background-preview');
    const removeBtn = document.getElementById('remove-background-btn');
    const backgroundOptions = document.getElementById('background-options');

    if (this.data.backgroundDataUri) {
      preview.style.backgroundImage = `url(${this.data.backgroundDataUri})`;
      preview.style.backgroundSize = this.data.backgroundSize || 'cover';
      preview.style.backgroundRepeat = this.data.backgroundRepeat || 'no-repeat';
      preview.style.backgroundPosition = this.data.backgroundPosition || 'center';
      preview.classList.add('has-image');
      preview.querySelector('.background-placeholder').style.display = 'none';
      removeBtn.disabled = false;
      backgroundOptions.style.display = 'grid';
    } else {
      preview.style.backgroundImage = '';
      preview.style.backgroundSize = '';
      preview.style.backgroundRepeat = '';
      preview.style.backgroundPosition = '';
      preview.classList.remove('has-image');
      preview.querySelector('.background-placeholder').style.display = '';
      removeBtn.disabled = true;
      backgroundOptions.style.display = 'none';
    }
  }

  /**
   * Setup column animations controls
   */
  setupColumnAnimations() {
    const enabledCheckbox = document.getElementById('column-animation-enabled');
    const controlsDiv = document.getElementById('column-animation-controls');
    const styleSelect = document.getElementById('column-animation-style');
    const modeSelect = document.getElementById('column-animation-mode');
    const durationInput = document.getElementById('column-animation-duration');
    const delayInput = document.getElementById('column-animation-delay');
    const staggerInput = document.getElementById('column-animation-stagger');
    const staggerGroup = document.getElementById('stagger-delay-group');
    const stylesheetOnlyCheckbox = document.getElementById('column-animation-stylesheet-only');

    // Update UI with current data
    this.updateColumnAnimationsUI();

    // Enable/disable animations
    enabledCheckbox.addEventListener('change', async () => {
      await SettingsManager.updateColumnAnimationEnabled(enabledCheckbox.checked);
      this.data.columnAnimationEnabled = enabledCheckbox.checked;
      this.updateColumnAnimationControlsVisibility();
      this.markDirty();
    });

    // Animation style
    styleSelect.addEventListener('change', async () => {
      await SettingsManager.updateColumnAnimationStyle(styleSelect.value);
      this.data.columnAnimationStyle = styleSelect.value;
      this.markDirty();
    });

    // Animation mode
    modeSelect.addEventListener('change', async () => {
      await SettingsManager.updateColumnAnimationMode(modeSelect.value);
      this.data.columnAnimationMode = modeSelect.value;
      this.updateStaggerVisibility();
      this.markDirty();
    });

    // Duration
    durationInput.addEventListener('input', async () => {
      const duration = parseFloat(durationInput.value);
      if (duration >= 0.1 && duration <= 2.0) {
        await SettingsManager.updateColumnAnimationTiming({ duration });
        this.data.columnAnimationDuration = duration;
        this.markDirty();
      }
    });

    // Initial delay
    delayInput.addEventListener('input', async () => {
      const delay = parseFloat(delayInput.value);
      if (delay >= 0 && delay <= 0.5) {
        await SettingsManager.updateColumnAnimationTiming({ delay });
        this.data.columnAnimationDelay = delay;
        this.markDirty();
      }
    });

    // Stagger delay
    staggerInput.addEventListener('input', async () => {
      const stagger = parseFloat(staggerInput.value);
      if (stagger >= 0.1 && stagger <= 0.5) {
        await SettingsManager.updateColumnAnimationTiming({ stagger });
        this.data.columnAnimationStagger = stagger;
        this.markDirty();
      }
    });

    // Stylesheet only mode
    stylesheetOnlyCheckbox.addEventListener('change', async () => {
      await SettingsManager.updateColumnAnimationStylesheetOnly(stylesheetOnlyCheckbox.checked);
      this.data.columnAnimationStylesheetOnly = stylesheetOnlyCheckbox.checked;
      this.updateColumnAnimationFormVisibility();
      this.markDirty();
    });
  }

  /**
   * Update column animations UI with current data
   */
  updateColumnAnimationsUI() {
    const enabledCheckbox = document.getElementById('column-animation-enabled');
    const styleSelect = document.getElementById('column-animation-style');
    const modeSelect = document.getElementById('column-animation-mode');
    const durationInput = document.getElementById('column-animation-duration');
    const delayInput = document.getElementById('column-animation-delay');
    const staggerInput = document.getElementById('column-animation-stagger');
    const stylesheetOnlyCheckbox = document.getElementById('column-animation-stylesheet-only');

    // Set form values from data
    enabledCheckbox.checked = this.data.columnAnimationEnabled;
    styleSelect.value = this.data.columnAnimationStyle;
    modeSelect.value = this.data.columnAnimationMode;
    durationInput.value = this.data.columnAnimationDuration;
    delayInput.value = this.data.columnAnimationDelay;
    staggerInput.value = this.data.columnAnimationStagger;
    stylesheetOnlyCheckbox.checked = this.data.columnAnimationStylesheetOnly;

    // Update visibility states
    this.updateColumnAnimationControlsVisibility();
    this.updateStaggerVisibility();
    this.updateColumnAnimationFormVisibility();
  }

  /**
   * Update visibility of animation controls based on enabled state
   */
  updateColumnAnimationControlsVisibility() {
    const controlsDiv = document.getElementById('column-animation-controls');
    const enabledCheckbox = document.getElementById('column-animation-enabled');
    
    if (enabledCheckbox.checked) {
      controlsDiv.style.display = 'block';
    } else {
      controlsDiv.style.display = 'none';
    }
  }

  /**
   * Update visibility of stagger delay control based on mode
   */
  updateStaggerVisibility() {
    const staggerGroup = document.getElementById('stagger-delay-group');
    const modeSelect = document.getElementById('column-animation-mode');
    
    if (modeSelect.value === 'sequential') {
      staggerGroup.style.display = 'flex';
    } else {
      staggerGroup.style.display = 'none';
    }
  }

  /**
   * Update visibility of animation form based on stylesheet-only mode
   */
  updateColumnAnimationFormVisibility() {
    const stylesheetOnlyCheckbox = document.getElementById('column-animation-stylesheet-only');
    const styleSelect = document.getElementById('column-animation-style');
    const modeSelect = document.getElementById('column-animation-mode');
    const timingControls = document.querySelector('.animation-timing-controls');
    
    const isStylesheetOnly = stylesheetOnlyCheckbox.checked;
    
    // Disable/enable form controls
    styleSelect.disabled = isStylesheetOnly;
    modeSelect.disabled = isStylesheetOnly;
    
    // Hide/show timing controls
    if (timingControls) {
      if (isStylesheetOnly) {
        timingControls.style.opacity = '0.5';
        timingControls.style.pointerEvents = 'none';
      } else {
        timingControls.style.opacity = '1';
        timingControls.style.pointerEvents = 'auto';
      }
    }
  }

  /**
   * Initialize CSS editor when switching to appearance panel
   * @param {string} panelId - Panel ID
   */
  onPanelSwitch(panelId) {
    // Initialize CSS editor if switching to appearance panel
    if (panelId === 'appearance' && !this.cssEditor) {
      setTimeout(() => this.initializeCSSEditor(), 100);
    }
  }
}