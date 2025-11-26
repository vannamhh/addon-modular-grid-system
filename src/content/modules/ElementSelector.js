/**
 * ElementSelector - Manages element discovery and highlighting
 * Handles mousemove events with requestAnimationFrame throttling
 */

// Outline styling constants
const OUTLINE_COLOR = '#0080FF';
const OUTLINE_WIDTH = '2px';
const OUTLINE_OFFSET = '0px';

class ElementSelector {
  constructor() {
    /** @type {HTMLElement|null} Currently highlighted element */
    this.currentElement = null;
    
    /** @type {number|null} RequestAnimationFrame ID for throttling */
    this.rafId = null;
    
    /** @type {MouseEvent|null} Latest mouse event for throttling */
    this.lastEvent = null;
    
    /** @type {boolean} Whether selector is currently enabled */
    this.enabled = false;
    
    /** @type {Object} Stores original outline styles for restoration */
    this.originalStyles = {};
    
    /** @type {Function|null} Callback for element selection */
    this.selectionCallback = null;
    
    // Bind methods to maintain correct 'this' context
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  /**
   * Start listening for hover events
   */
  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    document.addEventListener('mousemove', this.handleMouseMove, true);
    document.addEventListener('click', this.handleClick, true);
  }
  
  /**
   * Stop listening and clear highlights
   */
  disable() {
    if (!this.enabled) return;
    
    this.enabled = false;
    document.removeEventListener('mousemove', this.handleMouseMove, true);
    document.removeEventListener('click', this.handleClick, true);
    
    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Clear any existing highlight
    this.clearHighlight();
  }
  
  /**
   * Throttled mousemove handler using requestAnimationFrame
   * Prevents >60fps event processing
   * @param {MouseEvent} event - Mouse move event
   */
  handleMouseMove(event) {
    // Store latest event
    this.lastEvent = event;

    // Only schedule new frame if none is pending
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        if (this.lastEvent) {
          this.handleHover(this.lastEvent);
          this.lastEvent = null;
        }
        this.rafId = null;
      });
    }
  }
  
  /**
   * Process hover event and highlight element
   * @param {MouseEvent} event - Mouse event
   */
  handleHover(event) {
    const element = event.target;
    
    // Skip if element is invalid or same as current
    if (!this.isElementValid(element) || element === this.currentElement) {
      return;
    }
    
    // Clear previous highlight
    this.clearHighlight();
    
    // Highlight new element
    this.highlightElement(element);
  }
  
  /**
   * Validate if element should be highlighted
   * @param {HTMLElement} element - Element to validate
   * @returns {boolean} True if element is valid for highlighting
   */
  isElementValid(element) {
    // Avoid highlighting shadow host itself
    if (element.id === 'wp-rhythm-host') {
      return false;
    }
    
    // Get computed styles
    const style = window.getComputedStyle(element);
    
    // Check display property
    if (style.display === 'none') {
      return false;
    }
    
    // Check visibility property
    if (style.visibility === 'hidden') {
      return false;
    }
    
    // Check opacity
    if (parseFloat(style.opacity) === 0) {
      return false;
    }
    
    // Check dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Apply blue outline to element
   * @param {HTMLElement} element - Element to highlight
   */
  highlightElement(element) {
    // Store original outline styles
    this.originalStyles = {
      outline: element.style.outline,
      outlineOffset: element.style.outlineOffset
    };
    
    // Apply highlight styles
    element.style.outline = `${OUTLINE_WIDTH} solid ${OUTLINE_COLOR}`;
    element.style.outlineOffset = OUTLINE_OFFSET;
    
    // Update current element reference
    this.currentElement = element;
  }
  
  /**
   * Remove outline from previous element
   */
  clearHighlight() {
    if (!this.currentElement) return;
    
    // Restore original outline styles
    this.currentElement.style.outline = this.originalStyles.outline || '';
    this.currentElement.style.outlineOffset = this.originalStyles.outlineOffset || '';
    
    // Clear references
    this.currentElement = null;
    this.originalStyles = {};
  }
  
  /**
   * Handle click event for element selection
   * @param {MouseEvent} event - Click event
   */
  handleClick(event) {
    const element = event.target;
    
    // Only process if element matches currently highlighted element
    if (element !== this.currentElement) {
      return;
    }
    
    // Prevent default action
    event.preventDefault();
    event.stopPropagation();
    
    // Invoke selection callback if registered
    if (this.selectionCallback && typeof this.selectionCallback === 'function') {
      this.selectionCallback(element);
    }
  }
  
  /**
   * Register callback for element selection
   * @param {Function} callback - Callback function receiving selected element
   */
  onElementSelected(callback) {
    this.selectionCallback = callback;
  }
}

export default ElementSelector;
