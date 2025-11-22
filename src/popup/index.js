// Popup Script - WP 14px Rhythm Inspector
// Handles user interaction with extension popup

const toggleBtn = document.getElementById('toggleBtn');
const statusText = document.getElementById('statusText');

let isActive = false;

// Toggle button click handler
toggleBtn.addEventListener('click', async () => {
  isActive = !isActive;
  
  // Update UI
  toggleBtn.textContent = isActive ? 'Deactivate Inspector' : 'Activate Inspector';
  statusText.textContent = isActive ? 'Active' : 'Inactive';
  statusText.className = isActive ? 'active' : '';
  
  // Send message to content script (stub for now)
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_INSPECTOR',
      payload: { active: isActive }
    });
  } catch (error) {
    console.log('Content script not ready yet:', error);
  }
  
  // Persist state to storage
  await chrome.storage.local.set({ isActive });
});

// Initialize popup state
(async () => {
  try {
    const result = await chrome.storage.local.get(['isActive']);
    isActive = result.isActive || false;
    toggleBtn.textContent = isActive ? 'Deactivate Inspector' : 'Activate Inspector';
    statusText.textContent = isActive ? 'Active' : 'Inactive';
    statusText.className = isActive ? 'active' : '';
  } catch (error) {
    console.error('Failed to load state:', error);
  }
})();
