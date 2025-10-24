/**
 * Background Manager - Moontab Extreme Options
 *
 * Manages all background-related functionality for the new tab page:
 * - Page background color (independent of theme)
 * - Background image uploads with data URI storage
 * - Background image positioning and sizing controls
 * - Live preview of background settings
 *
 * Background Color System:
 * - Sets `--page-bg-color` CSS variable
 * - Works with any theme (preset, browser, or custom)
 * - Can be enabled/disabled independently
 * - Overrides theme's default background when active
 *
 * Background Image System:
 * - Stores images as data URIs (max 5MB)
 * - Supports standard CSS background properties:
 *   - Size: cover, contain, auto, or custom dimensions
 *   - Repeat: no-repeat, repeat, repeat-x, repeat-y
 *   - Position: center, top, bottom, left, right, combinations
 * - Custom size support with width/height inputs (e.g., "50% auto")
 * - Real-time preview in options page
 *
 * @class
 */
class BackgroundManager {
  /**
   * @param {Object} data - Settings data object
   * @param {Object} uiManager - UI manager for error/success messages
   * @param {Function} markDirty - Callback to mark settings as dirty
   */
  constructor(data, uiManager, markDirty) {
    this.data = data;
    this.uiManager = uiManager;
    this.markDirty = markDirty;
  }

  /**
   * Setup all background controls
   */
  setup() {
    this.setupPageBackgroundColor();
    this.setupBackgroundImage();
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
   * Setup background image upload and controls
   */
  setupBackgroundImage() {
    const uploadBtn = document.getElementById('upload-background-btn');
    const removeBtn = document.getElementById('remove-background-btn');
    const fileInput = document.getElementById('background-upload');

    // Background setting controls
    const sizeSelect = document.getElementById('background-size');
    const repeatSelect = document.getElementById('background-repeat');
    const positionSelect = document.getElementById('background-position');

    // Custom size controls
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

    // Upload button handler
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    // File input handler
    fileInput.addEventListener('change', async (e) => {
      await this.handleBackgroundUpload(e.target.files[0]);
    });

    // Remove button handler
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
   * Handle background image upload
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
   * Update background data URI
   * @param {string|null} dataUri - Background data URI
   */
  async updateBackground(dataUri) {
    this.data.backgroundDataUri = dataUri;
    this.updateBackgroundPreview();
    this.markDirty();
  }

  /**
   * Remove background image
   */
  removeBackground() {
    this.updateBackground(null);
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
      } else {
        // Apply standard size value
        this.updateBackgroundPreview();
      }
    } else {
      // For other settings, apply directly
      this.updateBackgroundPreview();
    }

    this.markDirty();
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

      // Store for later use (the new tab page will apply this)
      this.data.backgroundCustomSize = customSize;
      this.updateBackgroundPreview();
    }
  }

  /**
   * Update background preview
   */
  updateBackgroundPreview() {
    const preview = document.getElementById('background-preview');
    const removeBtn = document.getElementById('remove-background-btn');
    const backgroundOptions = document.getElementById('background-options');

    if (this.data.backgroundDataUri) {
      // Determine the size value to use
      let sizeValue = this.data.backgroundSize || 'cover';
      if (sizeValue === 'custom' && this.data.backgroundCustomSize) {
        sizeValue = this.data.backgroundCustomSize;
      }

      preview.style.backgroundImage = `url(${this.data.backgroundDataUri})`;
      preview.style.backgroundSize = sizeValue;
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
}
