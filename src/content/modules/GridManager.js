/**
 * GridManager - Manages Shadow DOM lifecycle for grid overlay
 * Handles injection/removal of grid pattern and element positioning
 */

// Grid configuration constants
const GRID_SIZE = 14;           // 14px × 14px squares
const GRID_COLOR = '#00FFFF';   // Cyan primary color
const GRID_OPACITY = 0.35;      // 35% opacity
const LINE_WIDTH = 1;           // 1px line thickness
const SHADOW_HOST_ID = 'wp-rhythm-host';
const Z_INDEX = 999;            // Z-index (reduced from 9999 to avoid conflicts with ruler extensions)

class GridManager {
  constructor() {
    /** @type {HTMLElement|null} Current grid shadow host element */
    this.currentGridHost = null;
    
    /** @type {HTMLElement|null} Target element with grid */
    this.targetElement = null;
    
    /** @type {string|null} Original position value for restoration */
    this.originalPosition = null;
  }
  
  /**
   * Inject grid overlay into target element
   * Removes previous grid if exists (single instance rule)
   * @param {HTMLElement} targetElement - Element to attach grid to
   */
  inject(targetElement) {
    // Remove existing grid first (single instance enforcement)
    if (this.currentGridHost) {
      this.remove();
    }
    
    // Store target element reference
    this.targetElement = targetElement;
    
    // Adjust positioning if needed
    this.adjustElementPositioning(targetElement);
    
    // Create shadow host
    const shadowHost = this.createShadowHost();
    
    // Attach shadow root
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    
    // Inject grid styles and pattern
    this.injectGridContent(shadowRoot);
    
    // Append shadow host to target element
    targetElement.appendChild(shadowHost);
    
    // Store reference
    this.currentGridHost = shadowHost;
  }
  
  /**
   * Remove grid and cleanup Shadow DOM
   */
  remove() {
    if (!this.currentGridHost) return;
    
    // Remove shadow host from DOM
    this.currentGridHost.remove();
    
    // Restore original positioning
    this.restoreElementPositioning();
    
    // Clear references
    this.currentGridHost = null;
    this.targetElement = null;
    this.originalPosition = null;
  }
  
  /**
   * Check if grid is currently active
   * @returns {boolean} True if grid is displayed
   */
  isActive() {
    return this.currentGridHost !== null && this.currentGridHost.isConnected;
  }
  
  /**
   * Get reference to current grid host element
   * @returns {HTMLElement|null} Shadow host element or null
   */
  getGridHost() {
    return this.currentGridHost;
  }
  
  /**
   * Adjust element positioning if static
   * @private
   * @param {HTMLElement} element - Target element
   */
  adjustElementPositioning(element) {
    const computedStyle = window.getComputedStyle(element);
    const position = computedStyle.position;
    
    // Store original position
    this.originalPosition = element.style.position || null;
    
    // If position is static, set to relative
    if (position === 'static') {
      element.style.position = 'relative';
    }
  }
  
  /**
   * Restore original element positioning
   * @private
   */
  restoreElementPositioning() {
    if (!this.targetElement) return;
    
    // Restore original position value
    if (this.originalPosition !== null) {
      this.targetElement.style.position = this.originalPosition;
    } else {
      // Remove position style if it wasn't set originally
      this.targetElement.style.position = '';
    }
  }
  
  /**
   * Create shadow host div
   * @private
   * @returns {HTMLElement} Shadow host element
   */
  createShadowHost() {
    const host = document.createElement('div');
    host.id = SHADOW_HOST_ID;
    
    // Positioning styles
    host.style.position = 'absolute';
    host.style.pointerEvents = 'none';
    host.style.zIndex = Z_INDEX.toString();
    
    // Grid covers entire element including border (border-box)
    // Position shadow host to fill entire element using inset
    // This ensures consistent behavior across all websites
    host.style.inset = '0';
    
    return host;
  }
  
  /**
   * Inject grid CSS and HTML into shadow root
   * @private
   * @param {ShadowRoot} shadowRoot - Shadow root to inject into
   */
  injectGridContent(shadowRoot) {
    // Create style element
    const style = document.createElement('style');
    style.textContent = this.generateGridCSS();
    
    // Create grid pattern div
    const gridPattern = document.createElement('div');
    gridPattern.className = 'grid-pattern';
    
    // Append to shadow root
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(gridPattern);
  }
  
  /**
   * Generate grid pattern CSS
   * @private
   * @returns {string} CSS string
   */
  generateGridCSS() {
    return `
      .grid-pattern {
        position: absolute;
        inset: 0;
        background-image:
          repeating-linear-gradient(
            to bottom,
            ${GRID_COLOR} 0 ${LINE_WIDTH}px,
            transparent ${LINE_WIDTH}px ${GRID_SIZE}px
          ),
          repeating-linear-gradient(
            to right,
            ${GRID_COLOR} 0 ${LINE_WIDTH}px,
            transparent ${LINE_WIDTH}px ${GRID_SIZE}px
          );
        opacity: ${GRID_OPACITY};
        pointer-events: none;
      }
    `;
  }
}

export default GridManager;
