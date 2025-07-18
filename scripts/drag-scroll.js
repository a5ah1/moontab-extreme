/**
 * Drag scrolling functionality for Link Stacker
 * Enables horizontal mouse/touch scrolling on the board container
 */

class DragScroll {
  constructor(container) {
    this.container = container;
    this.isDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.velocity = 0;
    this.momentum = 0;
    this.lastX = 0;
    this.lastTime = 0;
    this.animationId = null;

    // Configuration
    this.friction = 0.95;
    this.momentumThreshold = 1;
    this.maxVelocity = 50;

    this.init();
  }

  /**
   * Initialize drag scroll functionality
   */
  init() {
    // Mouse events
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Touch events
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Wheel events for better scrolling
    this.container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    // Prevent default drag behavior on images and links
    this.container.addEventListener('dragstart', (e) => e.preventDefault());

    // Handle click events to distinguish from drag
    this.container.addEventListener('click', this.handleClick.bind(this), true);
  }

  /**
   * Mouse down handler
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseDown(e) {
    // Only handle left mouse button
    if (e.button !== 0) return;

    // Don't interfere with interactive elements
    if (this.isInteractiveElement(e.target)) return;

    this.isDown = true;
    this.startX = e.pageX - this.container.offsetLeft;
    this.scrollLeft = this.container.scrollLeft;
    this.lastX = e.pageX;
    this.lastTime = Date.now();
    this.velocity = 0;

    this.container.style.cursor = 'grabbing';
    this.container.style.userSelect = 'none';

    // Stop any ongoing momentum animation
    this.stopMomentum();

    e.preventDefault();
  }

  /**
   * Mouse move handler
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    if (!this.isDown) return;

    e.preventDefault();

    const x = e.pageX - this.container.offsetLeft;
    const walk = x - this.startX; // 1:1 mapping, no multiplier

    this.container.scrollLeft = this.scrollLeft - walk;

    // Calculate velocity for momentum
    const now = Date.now();
    const timeDelta = now - this.lastTime;

    if (timeDelta > 0) {
      this.velocity = (e.pageX - this.lastX) / timeDelta;
      this.lastX = e.pageX;
      this.lastTime = now;
    }
  }

  /**
   * Mouse up handler
   */
  handleMouseUp() {
    if (!this.isDown) return;

    this.isDown = false;
    this.container.style.cursor = 'grab';
    this.container.style.userSelect = '';

    // Start momentum scrolling if velocity is high enough
    if (Math.abs(this.velocity) > this.momentumThreshold) {
      this.startMomentum();
    }
  }

  /**
   * Mouse leave handler
   */
  handleMouseLeave() {
    if (this.isDown) {
      this.handleMouseUp();
    }
  }

  /**
   * Touch start handler
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    if (this.isInteractiveElement(e.target)) return;

    const touch = e.touches[0];
    this.isDown = true;
    this.startX = touch.pageX - this.container.offsetLeft;
    this.scrollLeft = this.container.scrollLeft;
    this.lastX = touch.pageX;
    this.lastTime = Date.now();
    this.velocity = 0;

    this.stopMomentum();
  }

  /**
   * Touch move handler
   * @param {TouchEvent} e - Touch event
   */
  handleTouchMove(e) {
    if (!this.isDown) return;

    e.preventDefault();

    const touch = e.touches[0];
    const x = touch.pageX - this.container.offsetLeft;
    const walk = x - this.startX; // 1:1 mapping, no multiplier

    this.container.scrollLeft = this.scrollLeft - walk;

    // Calculate velocity
    const now = Date.now();
    const timeDelta = now - this.lastTime;

    if (timeDelta > 0) {
      this.velocity = (touch.pageX - this.lastX) / timeDelta;
      this.lastX = touch.pageX;
      this.lastTime = now;
    }
  }

  /**
   * Touch end handler
   */
  handleTouchEnd() {
    if (!this.isDown) return;

    this.isDown = false;

    // Start momentum scrolling
    if (Math.abs(this.velocity) > this.momentumThreshold) {
      this.startMomentum();
    }
  }

  /**
   * Wheel event handler for horizontal scrolling
   * @param {WheelEvent} e - Wheel event
   */
  handleWheel(e) {
    // Check if we're over a scrollable links container
    const linksContainer = e.target.closest('.links-container');

    if (linksContainer) {
      // We're over a column's links - check if it needs vertical scrolling
      const hasVerticalScroll = linksContainer.scrollHeight > linksContainer.clientHeight;

      if (hasVerticalScroll) {
        // Let the column handle vertical scrolling naturally
        return;
      }
    }

    // Convert vertical scroll to horizontal if shift key is not pressed
    if (!e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();

      // Use smooth scrolling for wheel events
      this.container.scrollBy({
        left: e.deltaY,
        behavior: 'auto'
      });
    }
  }

  /**
   * Click handler to prevent clicks during drag
   * @param {MouseEvent} e - Click event
   */
  handleClick(e) {
    // If we just finished dragging, prevent the click
    if (this.momentum > 0.1) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * Start momentum scrolling animation
   */
  startMomentum() {
    this.momentum = Math.min(Math.abs(this.velocity), this.maxVelocity);

    if (this.velocity < 0) {
      this.momentum = -this.momentum;
    }

    this.animateMomentum();
  }

  /**
   * Animate momentum scrolling
   */
  animateMomentum() {
    if (Math.abs(this.momentum) < 0.1) {
      this.stopMomentum();
      return;
    }

    this.container.scrollLeft -= this.momentum * 10;
    this.momentum *= this.friction;

    this.animationId = requestAnimationFrame(() => this.animateMomentum());
  }

  /**
   * Stop momentum scrolling
   */
  stopMomentum() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.momentum = 0;
  }

  /**
   * Check if element is interactive and should not trigger drag
   * @param {Element} element - Element to check
   * @returns {boolean} Whether element is interactive
   */
  isInteractiveElement(element) {
    const interactiveSelectors = [
      'button',
      'input',
      'textarea',
      'select',
      'a',
      '.settings-btn'
    ];

    // Check if element itself matches
    for (const selector of interactiveSelectors) {
      if (element.matches && element.matches(selector)) {
        return true;
      }
    }

    // Check if any parent matches
    let parent = element.parentElement;
    while (parent && parent !== this.container) {
      for (const selector of interactiveSelectors) {
        if (parent.matches && parent.matches(selector)) {
          return true;
        }
      }
      parent = parent.parentElement;
    }

    return false;
  }

  /**
   * Update container reference (useful if container changes)
   * @param {Element} newContainer - New container element
   */
  updateContainer(newContainer) {
    this.destroy();
    this.container = newContainer;
    this.init();
  }

  /**
   * Destroy drag scroll functionality
   */
  destroy() {
    // Stop any ongoing animations
    this.stopMomentum();

    // Remove event listeners
    this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.container.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.container.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.container.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.container.removeEventListener('wheel', this.handleWheel.bind(this));
    this.container.removeEventListener('dragstart', (e) => e.preventDefault());
    this.container.removeEventListener('click', this.handleClick.bind(this), true);

    // Reset styles
    this.container.style.cursor = '';
    this.container.style.userSelect = '';
  }
}

/**
 * Singleton instance for the main board container
 */
let dragScrollInstance = null;

/**
 * Initialize drag scrolling on the board container
 * @param {Element} container - Container element to enable drag scrolling on
 * @returns {DragScroll} Drag scroll instance
 */
function initializeDragScroll(container) {
  if (dragScrollInstance) {
    dragScrollInstance.destroy();
  }

  dragScrollInstance = new DragScroll(container);
  return dragScrollInstance;
}

/**
 * Get the current drag scroll instance
 * @returns {DragScroll|null} Current instance or null
 */
function getDragScrollInstance() {
  return dragScrollInstance;
}

/**
 * Destroy the current drag scroll instance
 */
function destroyDragScroll() {
  if (dragScrollInstance) {
    dragScrollInstance.destroy();
    dragScrollInstance = null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DragScroll,
    initializeDragScroll,
    getDragScrollInstance,
    destroyDragScroll
  };
}