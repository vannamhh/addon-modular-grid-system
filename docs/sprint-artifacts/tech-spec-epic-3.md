# Epic Technical Specification: Configuration & Workflow Optimization

Date: 2025-11-26
Author: Van Nam
Epic ID: 3
Status: Draft

---

## Overview

This epic focuses on enhancing the user workflow and flexibility of the "WP 14px Rhythm Inspector" extension. It introduces two key features: a global keyboard shortcut for quick toggling of the grid, and a configuration UI (Popup) allowing users to customize grid parameters such as size and color. These settings will be persisted across browser sessions, ensuring a personalized and efficient experience.

## Objectives and Scope

### In-Scope
*   **Global Shortcut:** Implementation of a keyboard shortcut (e.g., Ctrl+Shift+G) to toggle the extension's active state.
*   **Settings UI:** Creation of a Popup interface (`popup.html`) accessible from the extension toolbar icon.
*   **Configuration:** Users can configure Grid Size (px) and Grid Color.
*   **Persistence:** Settings are saved using `chrome.storage.sync` and persist across browser restarts.
*   **Real-time Updates:** Changes in settings are immediately reflected in the active grid (or upon next activation).

### Out-of-Scope
*   **Cloud Sync:** Syncing settings across different devices (beyond standard Chrome profile sync).
*   **Advanced Keybinding UI:** A UI for users to remap the shortcut within the extension (users can do this via Chrome's extensions page).
*   **Mobile Support:** Configuration UI is for Desktop only.

## System Architecture Alignment

This implementation aligns with the existing **Manifest V3** architecture.
*   **Popup:** A new `src/popup` directory will house the UI logic, interacting with the `storage` API.
*   **Background Service Worker:** Will handle the `chrome.commands` event for the global shortcut.
*   **Content Script:** Will listen for `storage` changes to update the grid dynamically.
*   **Storage API:** `chrome.storage.sync` will be used for persistence, falling back to `local` if needed.

## Detailed Design

### Services and Modules

| Module | Responsibility | Owner |
| :--- | :--- | :--- |
| **Popup UI** (`src/popup/`) | Renders the settings form, validates input, and saves to storage. | Frontend |
| **Shortcut Handler** (`src/background/`) | Listens for `chrome.commands` events and broadcasts a toggle message to the active tab. | Backend/Core |
| **Config Manager** (`src/content/modules/ConfigManager.js`) | Manages retrieving settings from storage and listening for updates. | Core |
| **Grid Manager** (`src/content/modules/GridManager.js`) | Updated to accept dynamic configuration (size, color) instead of hardcoded constants. | Core |

### Data Models and Contracts

**Settings Object (Storage Schema)**
```json
{
  "gridSettings": {
    "size": 14,          // integer, default: 14
    "color": "#00FFFF"   // string (hex), default: "#00FFFF" (Cyan)
  }
}
```

### APIs and Interfaces

**Chrome APIs**
*   `chrome.commands.onCommand.addListener(callback)`: To handle keyboard shortcuts.
*   `chrome.storage.sync.get(keys, callback)`: To retrieve settings.
*   `chrome.storage.sync.set(items, callback)`: To save settings.
*   `chrome.storage.onChanged.addListener(callback)`: To listen for setting changes in the Content Script.

**Internal Messaging**
*   **Command:** `TOGGLE_GRID` (sent from Background to Content Script on shortcut).

### Workflows and Sequencing

**1. Global Shortcut Toggle**
1.  User presses `Ctrl+Shift+G`.
2.  Browser triggers `chrome.commands.onCommand`.
3.  Background Script receives event `toggle-grid`.
4.  Background Script queries active tab and sends `TOGGLE_GRID` message.
5.  Content Script `InspectorController` receives message and toggles `isActive` state.

**2. Changing Settings**
1.  User opens Popup.
2.  Popup loads current settings from `chrome.storage.sync`.
3.  User changes Grid Size to 20px and Color to Magenta.
4.  Popup saves new object to `chrome.storage.sync`.
5.  `chrome.storage.onChanged` fires in Content Script.
6.  `ConfigManager` updates local state.
7.  If Grid is active, `GridManager` re-renders with new styles.

## Non-Functional Requirements

### Performance
*   **Instant Toggle:** Shortcut response should be immediate (< 100ms).
*   **Storage Access:** Settings retrieval should be asynchronous and non-blocking.

### Security
*   **Input Validation:** Popup must validate grid size (e.g., 4px - 100px) and color format to prevent injection or rendering errors.

### Reliability/Availability
*   **Defaults:** System must gracefully fall back to default values (14px, Cyan) if storage is empty or corrupted.

### Observability
*   **Logging:** Log configuration changes and toggle events to console for debugging (dev mode only).

## Dependencies and Integrations

*   **Chrome Storage API:** Requires `storage` permission in `manifest.json`.
*   **Chrome Commands API:** Requires `commands` block in `manifest.json`.

## Acceptance Criteria (Authoritative)

1.  **Global Shortcut**
    *   [ ] Default shortcut `Ctrl+Shift+G` (or `Command+Shift+G` on Mac) toggles the extension state.
    *   [ ] Shortcut works regardless of focus (as long as Chrome has focus).
    *   [ ] Toggling off removes the grid and highlights immediately.

2.  **Settings UI**
    *   [ ] Popup opens when clicking the extension icon.
    *   [ ] Input field for **Grid Size** (number) defaults to 14.
    *   [ ] Input field for **Grid Color** (color picker/hex) defaults to Cyan (#00FFFF).
    *   [ ] Changes are saved automatically or via a "Save" button.

3.  **Persistence & Reactivity**
    *   [ ] Settings persist after closing the browser and reopening.
    *   [ ] Changing settings while the grid is active updates the grid visual immediately.
    *   [ ] New settings apply to all tabs (eventually) or the active tab immediately.

## Traceability Mapping

| AC ID | Spec Section | Component | Test Idea |
| :--- | :--- | :--- | :--- |
| AC 1.1 | Workflows (1) | Background/Manifest | Manual: Press keys, verify toggle. |
| AC 2.1 | Detailed Design | Popup | Manual: Open popup, check UI. |
| AC 2.2 | Data Models | Popup | Manual: Check default values. |
| AC 3.2 | Workflows (2) | Content/GridMgr | Manual: Change color, watch grid change. |

## Risks, Assumptions, Open Questions

*   **Risk:** Shortcut conflicts with other extensions or system shortcuts.
    *   *Mitigation:* Use a relatively obscure default. Users can customize via `chrome://extensions/shortcuts`.
*   **Assumption:** `chrome.storage.sync` is available. If not (e.g., offline, no profile), fallback to `local`.

## Test Strategy Summary

### Manual Verification
*   **Shortcut Testing:** Verify toggle behavior on various sites.
*   **UI Testing:** Verify Popup layout, input validation, and saving.
*   **Persistence:** Restart browser and check if settings remain.
*   **Live Update:** Open Grid, open Popup, change color -> Grid should change color instantly.

### Automated Tests
*   **Unit Tests:** Test `ConfigManager` logic (default fallback, validation) using Vitest.
