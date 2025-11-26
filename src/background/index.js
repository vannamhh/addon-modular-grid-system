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

// Keep service worker minimal - no heavy logic
// All core functionality lives in content script

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-grid') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_GRID' });
      }
    } catch (error) {
      // Ignore errors when sending to tabs that don't have content script
      // or if the tab is restricted (e.g. chrome:// URLs)
      console.debug('Failed to send toggle command:', error);
    }
  }
});
