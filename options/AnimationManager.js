/**
 * Animation Manager - Moontab Extreme Options
 *
 * Manages column animation configuration for the new tab page:
 * - Enable/disable column animations on page load
 * - Configure animation styles (fade-in, slide-in, scale-in, etc.)
 * - Control animation timing and sequencing
 * - Support for both managed and stylesheet-only modes
 *
 * Animation System:
 * - Applied to columns when new tab page loads
 * - Provides visual feedback as columns appear
 * - Configurable timing: duration (0.1-2s), delay (0-0.5s), stagger (0.1-0.5s)
 *
 * Animation Modes:
 * - all-at-once: All columns animate simultaneously
 * - sequential: Columns animate one after another with stagger delay
 *
 * Animation Styles:
 * - fade-in: Opacity transition
 * - slide-in: Slide from top/bottom/left/right
 * - scale-in: Scale from small to normal size
 * - And more (defined in settings UI)
 *
 * Stylesheet-Only Mode:
 * - Allows CSS-only animation control via custom CSS
 * - Disables JavaScript animation configuration
 * - Gives advanced users full control over animations
 *
 * @class
 */
class AnimationManager {
  /**
   * @param {Object} data - Settings data object
   * @param {Function} markDirty - Callback to mark settings as dirty
   */
  constructor(data, markDirty) {
    this.data = data;
    this.markDirty = markDirty;
  }

  /**
   * Setup column animation controls
   */
  setup() {
    const enabledCheckbox = document.getElementById('column-animation-enabled');
    const styleSelect = document.getElementById('column-animation-style');
    const modeSelect = document.getElementById('column-animation-mode');
    const durationInput = document.getElementById('column-animation-duration');
    const delayInput = document.getElementById('column-animation-delay');
    const staggerInput = document.getElementById('column-animation-stagger');
    const stylesheetOnlyCheckbox = document.getElementById('column-animation-stylesheet-only');

    // Update UI with current data
    this.updateUI();

    // Enable/disable animations
    enabledCheckbox.addEventListener('change', async () => {
      await SettingsManager.updateColumnAnimationEnabled(enabledCheckbox.checked);
      this.data.columnAnimationEnabled = enabledCheckbox.checked;
      this.updateControlsVisibility();
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
      this.updateFormVisibility();
      this.markDirty();
    });
  }

  /**
   * Update UI with current data
   */
  updateUI() {
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
    this.updateControlsVisibility();
    this.updateStaggerVisibility();
    this.updateFormVisibility();
  }

  /**
   * Update visibility of animation controls based on enabled state
   */
  updateControlsVisibility() {
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
  updateFormVisibility() {
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
}
