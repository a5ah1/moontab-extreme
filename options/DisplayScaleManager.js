/**
 * Display Scale Manager - Moontab Extreme Options
 *
 * Manages display scale, typography, and layout settings for the new tab page:
 * - Base font size configuration (affects all text sizing)
 * - UI scale multiplier (affects overall interface size)
 * - Column width (affects layout density)
 * - Reset controls for all settings
 *
 * Base Font Size:
 * - Default: 16px (browser standard)
 * - Range: 12px - 24px
 * - Affects all typography through CSS rem units
 * - Useful for accessibility and user preference
 *
 * UI Scale:
 * - Default: 1.0 (100%)
 * - Range: 0.8 (80%) to 1.5 (150%)
 * - Applies scaling to entire interface
 * - Allows users to zoom the entire UI proportionally
 * - Useful for high-DPI displays or user preference
 *
 * Column Width:
 * - Default: 320px
 * - Range: 250px - 500px
 * - Sets base column width at 100% UI scale
 * - Actual width scales with UI scale setting
 * - Allows users to customize layout density
 *
 * Implementation:
 * - Base font size sets document root font-size
 * - UI scale applies scaling to all interface elements
 * - Column width sets CSS custom property --column-width-base
 * - All settings work together and can be combined
 * - Changes persist across browser sessions
 *
 * @class
 */
class DisplayScaleManager {
  /**
   * @param {Object} data - Settings data object
   * @param {Function} markDirty - Callback to mark settings as dirty
   */
  constructor(data, markDirty) {
    this.data = data;
    this.markDirty = markDirty;
  }

  /**
   * Setup display scale controls
   */
  setup() {
    this.setupBaseFontSize();
    this.setupUIScale();
    this.setupColumnWidth();
  }

  /**
   * Setup base font size input
   */
  setupBaseFontSize() {
    const input = document.getElementById('base-font-size');
    const resetBtn = document.getElementById('reset-font-size-btn');

    if (!input) return;

    // Set initial value
    input.value = this.data.baseFontSize || 16;

    // Handle input changes
    input.addEventListener('input', () => {
      const size = parseInt(input.value, 10);
      if (size >= 12 && size <= 24) {
        this.data.baseFontSize = size;
        this.markDirty();
      }
    });

    // Handle reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        input.value = 16;
        this.data.baseFontSize = 16;
        this.markDirty();
      });
    }
  }

  /**
   * Setup UI scale slider
   */
  setupUIScale() {
    const slider = document.getElementById('ui-scale');
    const valueDisplay = document.getElementById('ui-scale-value');
    const resetBtn = document.getElementById('reset-ui-scale-btn');

    if (!slider) return;

    // Set initial value
    const initialValue = this.data.uiScale || 1.0;
    slider.value = initialValue;
    if (valueDisplay) {
      valueDisplay.textContent = `${Math.round(initialValue * 100)}%`;
    }

    // Handle slider changes
    slider.addEventListener('input', () => {
      const scale = parseFloat(slider.value);
      this.data.uiScale = scale;

      if (valueDisplay) {
        valueDisplay.textContent = `${Math.round(scale * 100)}%`;
      }

      this.markDirty();
    });

    // Handle reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        slider.value = 1.0;
        this.data.uiScale = 1.0;

        if (valueDisplay) {
          valueDisplay.textContent = '100%';
        }

        this.markDirty();
      });
    }
  }

  /**
   * Setup column width slider
   */
  setupColumnWidth() {
    const slider = document.getElementById('column-width');
    const valueDisplay = document.getElementById('column-width-value');
    const resetBtn = document.getElementById('reset-column-width-btn');

    if (!slider) return;

    // Set initial value
    const initialValue = this.data.columnWidthBase || 320;
    slider.value = initialValue;
    if (valueDisplay) {
      valueDisplay.textContent = `${initialValue}px`;
    }

    // Handle slider changes
    slider.addEventListener('input', () => {
      const width = parseInt(slider.value, 10);
      this.data.columnWidthBase = width;

      if (valueDisplay) {
        valueDisplay.textContent = `${width}px`;
      }

      this.markDirty();
    });

    // Handle reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        slider.value = 320;
        this.data.columnWidthBase = 320;

        if (valueDisplay) {
          valueDisplay.textContent = '320px';
        }

        this.markDirty();
      });
    }
  }
}
