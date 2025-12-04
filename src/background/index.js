// Background Service Worker - WP 14px Rhythm Inspector
// Minimal implementation following Manifest V3 standards

chrome.runtime.onInstalled.addListener((details) => {
  console.log('WP 14px Rhythm Inspector installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Extension installed for the first time');
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Clean up tab state when tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    const result = await chrome.storage.local.get(['tabStates']);
    const tabStates = result.tabStates || {};
    if (tabStates[tabId]) {
      delete tabStates[tabId];
      await chrome.storage.local.set({ tabStates });
    }
  } catch (error) {
    console.debug('Failed to clean up tab state:', error);
  }
});

// Keep service worker minimal - no heavy logic
// All core functionality lives in content script

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-grid') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_GRID' });
        
        // Update tab state after toggle
        if (response?.success) {
          const result = await chrome.storage.local.get(['tabStates']);
          const tabStates = result.tabStates || {};
          tabStates[tab.id] = { isActive: response.active };
          await chrome.storage.local.set({ tabStates });
        }
      }
    } catch (error) {
      // Ignore errors when sending to tabs that don't have content script
      // or if the tab is restricted (e.g. chrome:// URLs)
      console.debug('Failed to send toggle command:', error);
    }
  }
});
