/**
 * ConfigManager - Manages configuration settings for the extension
 * Handles retrieval from storage and listening for changes
 */

class ConfigManager {
  constructor() {
    this.settings = {
      size: 14,
      color: '#00FFFF'
    };
    this.listeners = new Set();
    
    // Initialize
    this.init();
  }

  /**
   * Initialize settings and listeners
   */
  async init() {
    await this.loadSettings();
    this.setupStorageListener();
  }

  /**
   * Load settings from storage
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['gridSettings']);
      if (result.gridSettings) {
        this.settings = { ...this.settings, ...result.gridSettings };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('ConfigManager: Failed to load settings', error);
    }
  }

  /**
   * Setup storage change listener
   */
  setupStorageListener() {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.gridSettings) {
        this.settings = { ...this.settings, ...changes.gridSettings.newValue };
        this.notifyListeners();
      }
    });
  }

  /**
   * Get current settings
   * @returns {Object} Current settings object
   */
  getSettings() {
    return this.settings;
  }

  /**
   * Subscribe to settings changes
   * @param {Function} callback - Function to call on change
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Call immediately with current settings
    callback(this.settings);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of changes
   * @private
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.settings));
  }
}

export default new ConfigManager();
