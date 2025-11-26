/**
 * InspectorController - Central orchestrator singleton
 * Manages global state and coordinates lifecycle of child modules
 */

import ElementSelector from './ElementSelector.js';
import GridManager from './GridManager.js';
import ConfigManager from './ConfigManager.js';

// Storage keys
const STORAGE_KEY_ACTIVE = 'wp-rhythm-inspector-active';
const STORAGE_KEY_LOCKED_XPATH = 'wp-rhythm-inspector-locked-xpath';

class InspectorController {
  constructor() {
    /** @type {boolean} Global extension active state */
    this.isActive = false;
    
    /** @type {HTMLElement|null} Currently locked element */
    this.lockedElement = null;
    
    /** @type {ElementSelector|null} Element selector instance */
    this.elementSelector = null;
    
    /** @type {GridManager|null} Grid manager instance */
    this.gridManager = null;
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    
    /** @type {number|null} Resize rAF ID */
    this.resizeRafId = null;
  }
  
  /**
   * Initialize all modules and event listeners
   */
  init() {
    // Initialize ElementSelector module
    this.elementSelector = new ElementSelector();
    
    // Initialize GridManager module
    this.gridManager = new GridManager();

    // Connect ConfigManager to GridManager
    ConfigManager.subscribe((settings) => {
      this.gridManager.updateConfig(settings);
    });
    
    // Register element selection callback
    this.elementSelector.onElementSelected((element) => {
      this.lockElement(element);
    });
    
    // Restore previous state if exists
    this.restoreState();
  }
  
  /**
   * Restore state from localStorage after page reload
   * @private
   */
  restoreState() {
    try {
      const wasActive = localStorage.getItem(STORAGE_KEY_ACTIVE) === 'true';
      const lockedXPath = localStorage.getItem(STORAGE_KEY_LOCKED_XPATH);
      
      if (wasActive) {
        this.setActive(true);
        
        // Restore locked element if it was locked
        if (lockedXPath) {
          const element = this.getElementByXPath(lockedXPath);
          if (element) {
            this.lockElement(element);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore inspector state:', error);
    }
  }
  
  /**
   * Get XPath for an element
   * @private
   * @param {HTMLElement} element - Target element
   * @returns {string} XPath string
   */
  getXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    if (element === document.body) {
      return '/html/body';
    }
    
    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = element.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      const tagName = element.nodeName.toLowerCase();
      const pathIndex = index > 0 ? `[${index + 1}]` : '';
      path.unshift(`${tagName}${pathIndex}`);
      
      element = element.parentNode;
    }
    
    return path.length ? `/${path.join('/')}` : '';
  }
  
  /**
   * Find element by XPath
   * @private
   * @param {string} xpath - XPath string
   * @returns {HTMLElement|null} Found element or null
   */
  getElementByXPath(xpath) {
    try {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch (error) {
      console.warn('Failed to find element by XPath:', error);
      return null;
    }
  }
  
  /**
   * Activate or deactivate the extension
   * @param {boolean} active - True to activate, false to deactivate
   */
  setActive(active) {
    this.isActive = active;
    
    // Persist active state
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, active.toString());
    } catch (error) {
      console.warn('Failed to save active state:', error);
    }
    
    if (active) {
      // Enable element hover detection
      this.elementSelector?.enable();
      // Add resize listener
      window.addEventListener('resize', this.handleResize);
    } else {
      this.deactivate();
    }
  }

  /**
   * Toggle the active state
   * @returns {boolean} New active state
   */
  toggleActiveState() {
    const newState = !this.isActive;
    this.setActive(newState);
    return newState;
  }
  
  /**
   * Deactivate inspector and clean up resources
   */
  deactivate() {
    this.isActive = false;
    
    // Disable hover detection
    this.elementSelector?.disable();
    
    // Remove grid
    this.unlock();
    
    // Remove resize listener
    window.removeEventListener('resize', this.handleResize);
    
    // Cancel pending resize frame
    if (this.resizeRafId) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    if (this.resizeRafId === null) {
      this.resizeRafId = requestAnimationFrame(() => {
        this.gridManager?.update();
        this.resizeRafId = null;
      });
    }
  }
  
  /**
   * Lock grid to specific element
   * @param {HTMLElement} element - Target element to lock
   */
  lockElement(element) {
    // Store locked element reference
    this.lockedElement = element;
    
    // Persist locked element XPath
    try {
      const xpath = this.getXPath(element);
      localStorage.setItem(STORAGE_KEY_LOCKED_XPATH, xpath);
    } catch (error) {
      console.warn('Failed to save locked element:', error);
    }
    
    // Disable hover detection
    this.elementSelector?.disable();
    
    // Inject grid overlay
    this.gridManager?.inject(element);
  }
  
  /**
   * Remove current grid and unlock
   */
  unlock() {
    // Remove grid overlay
    this.gridManager?.remove();
    
    // Clear locked element reference
    this.lockedElement = null;
    
    // Clear persisted locked element
    try {
      localStorage.removeItem(STORAGE_KEY_LOCKED_XPATH);
    } catch (error) {
      console.warn('Failed to clear locked element:', error);
    }
    
    // Re-enable hover detection if extension is still active
    if (this.isActive) {
      this.elementSelector?.enable();
    }
  }
  
  /**
   * Cleanup all resources
   */
  destroy() {
    this.deactivate();
    this.elementSelector = null;
    this.gridManager = null;
  }
}

// Export singleton instance
export default new InspectorController();
