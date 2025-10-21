/**
 * Display Scale Manager - Moontab Extreme Options
 * Handles base font size and UI scale settings
 */

class DisplayScaleManager {
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
}
