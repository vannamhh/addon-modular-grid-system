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
