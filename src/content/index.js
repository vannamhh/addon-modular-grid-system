// Content Script Entry Point - WP 14px Rhythm Inspector
// Initializes extension on page load

import InspectorController from './modules/InspectorController.js';

(function initializeInspector() {
  try {
    // Initialize InspectorController singleton
    InspectorController.init();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      try {
        // Handle TOGGLE_INSPECTOR message
        if (message.type === 'TOGGLE_INSPECTOR') {
          const { active } = message.payload;
          InspectorController.setActive(active);
          sendResponse({ success: true });
        } else {
          console.warn('Unknown message type:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
        }
      } catch (error) {
        console.error('Message handling error:', error);
        sendResponse({ success: false, error: error.message });
      }
      
      // Return true to indicate async response
      return true;
    });
    
    console.log('WP Inspector Ready');
    
  } catch (error) {
    console.error('WP Inspector initialization failed:', error);
  }
})();
