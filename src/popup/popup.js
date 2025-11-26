// Popup Script - WP 14px Rhythm Inspector
// Handles user interaction with extension popup and settings management

// DOM Elements
const toggleBtn = document.getElementById('toggleBtn');
const statusText = document.getElementById('statusText');
const gridSizeInput = document.getElementById('gridSize');
const gridColorInput = document.getElementById('gridColor');
const gridColorTextInput = document.getElementById('gridColorText');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// State
let isActive = false;

// --- Inspector Toggle Logic ---

// Toggle button click handler
toggleBtn.addEventListener('click', async () => {
  isActive = !isActive;
  await updateToggleState(isActive);
  
  // Send message to content script
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_INSPECTOR',
        payload: { active: isActive }
      });
    }
  } catch (error) {
    console.log('Content script not ready yet or no active tab:', error);
  }
  
  // Persist state
  await chrome.storage.local.set({ isActive });
});

async function updateToggleState(active) {
  toggleBtn.textContent = active ? 'Deactivate Inspector' : 'Activate Inspector';
  statusText.textContent = active ? 'Active' : 'Inactive';
  statusText.className = active ? 'active' : '';
}

// --- Settings Logic ---

// Sync color inputs
gridColorInput.addEventListener('input', (e) => {
  gridColorTextInput.value = e.target.value.toUpperCase();
});

gridColorTextInput.addEventListener('input', (e) => {
  const val = e.target.value;
  if (/^#[0-9A-F]{6}$/i.test(val)) {
    gridColorInput.value = val;
  }
});

// Save settings
saveBtn.addEventListener('click', async () => {
  const size = parseInt(gridSizeInput.value, 10);
  const color = gridColorTextInput.value;

  // Validation
  if (isNaN(size) || size < 1) {
    showStatus('Invalid grid size', false);
    return;
  }
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    showStatus('Invalid color hex', false);
    return;
  }

  // Save to storage
  try {
    await chrome.storage.sync.set({
      gridSettings: {
        size,
        color
      }
    });
    showStatus('Settings saved!', true);
  } catch (error) {
    console.error('Save failed:', error);
    showStatus('Save failed', false);
  }
});

function showStatus(msg, success) {
  saveStatus.textContent = msg;
  saveStatus.style.color = success ? '#28a745' : '#dc3545';
  saveStatus.classList.add('visible');
  setTimeout(() => {
    saveStatus.classList.remove('visible');
  }, 2000);
}

// --- Initialization ---

(async () => {
  try {
    // Load Toggle State
    const localResult = await chrome.storage.local.get(['isActive']);
    isActive = localResult.isActive || false;
    await updateToggleState(isActive);

    // Load Settings
    const syncResult = await chrome.storage.sync.get(['gridSettings']);
    const settings = syncResult.gridSettings || { size: 14, color: '#00FFFF' };
    
    gridSizeInput.value = settings.size;
    gridColorInput.value = settings.color;
    gridColorTextInput.value = settings.color;

  } catch (error) {
    console.error('Failed to load state:', error);
  }
})();
