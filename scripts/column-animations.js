/**
 * Column Animations Manager - Link Stacker
 * Handles optional CSS animations for columns using animate.css
 */

class ColumnAnimationManager {
  
  /**
   * Apply animations to columns based on settings
   * @param {HTMLElement[]} columns - Array of column elements
   * @param {Object} settings - Animation settings from storage
   */
  static applyAnimations(columns, settings) {
    // Check if animations are disabled by user preference
    if (!this.respectMotionPreferences()) {
      return;
    }

    // If stylesheet-only mode, don't apply any programmatic animations
    if (settings.columnAnimationStylesheetOnly) {
      return;
    }

    // Apply animation classes to each column
    columns.forEach((column, index) => {
      this.applyAnimationToColumn(column, index, settings);
    });
  }

  /**
   * Apply animation to a single column
   * @param {HTMLElement} column - Column element
   * @param {number} index - Column index (for staggering)
   * @param {Object} settings - Animation settings
   */
  static applyAnimationToColumn(column, index, settings) {
    // Base animate.css classes
    column.classList.add('animate__animated');
    column.classList.add(`animate__${settings.columnAnimationStyle}`);
    
    // Set duration based on settings
    const durationClass = this.getDurationClass(settings.columnAnimationDuration);
    if (durationClass) {
      column.classList.add(durationClass);
    }
    
    // Calculate and apply delay
    const delay = this.calculateDelay(index, settings);
    if (delay > 0) {
      column.style.animationDelay = `${delay}s`;
    }
    
    // Set custom duration if not using predefined classes
    if (!durationClass) {
      column.style.animationDuration = `${settings.columnAnimationDuration}s`;
    }
  }

  /**
   * Calculate delay for a column based on mode and settings
   * @param {number} index - Column index
   * @param {Object} settings - Animation settings
   * @returns {number} Delay in seconds
   */
  static calculateDelay(index, settings) {
    let delay = settings.columnAnimationDelay;
    
    if (settings.columnAnimationMode === 'sequential') {
      delay += index * settings.columnAnimationStagger;
    }
    
    return delay;
  }

  /**
   * Get animate.css duration class based on duration value
   * @param {number} duration - Duration in seconds
   * @returns {string|null} CSS class name or null for custom duration
   */
  static getDurationClass(duration) {
    // Map common durations to animate.css classes
    if (duration <= 0.5) return 'animate__faster';
    if (duration <= 0.8) return 'animate__fast';
    if (duration <= 1.2) return 'animate__slow';
    if (duration <= 2.0) return 'animate__slower';
    
    // For other durations, use custom CSS
    return null;
  }

  /**
   * Check if user prefers reduced motion
   * @returns {boolean} True if animations should be applied
   */
  static respectMotionPreferences() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return !mediaQuery.matches;
  }

  /**
   * Remove animation classes from columns (for cleanup)
   * @param {HTMLElement[]} columns - Array of column elements
   */
  static removeAnimations(columns) {
    columns.forEach(column => {
      // Remove animate.css classes
      column.classList.remove('animate__animated');
      
      // Remove all animation style classes
      const animationClasses = [
        'animate__fadeIn', 'animate__bounceIn', 'animate__bounceInDown', 'animate__bounceInUp',
        'animate__fadeInDown', 'animate__fadeInUp', 'animate__flipInX',
        'animate__flipInY', 'animate__zoomIn', 'animate__faster',
        'animate__fast', 'animate__slow', 'animate__slower'
      ];
      
      animationClasses.forEach(className => {
        column.classList.remove(className);
      });
      
      // Remove inline styles
      column.style.animationDelay = '';
      column.style.animationDuration = '';
    });
  }

  /**
   * Get available animation styles
   * @returns {Array} Array of animation style objects
   */
  static getAvailableAnimations() {
    return [
      { value: 'fadeIn', label: 'Fade In' },
      { value: 'bounceIn', label: 'Bounce In' },
      { value: 'bounceInDown', label: 'Bounce In Down' },
      { value: 'bounceInUp', label: 'Bounce In Up' },
      { value: 'fadeInDown', label: 'Fade In Down' },
      { value: 'fadeInUp', label: 'Fade In Up' },
      { value: 'flipInX', label: 'Flip In X' },
      { value: 'flipInY', label: 'Flip In Y' },
      { value: 'zoomIn', label: 'Zoom In' }
    ];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColumnAnimationManager;
}