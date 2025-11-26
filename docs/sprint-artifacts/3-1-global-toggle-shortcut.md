# Story 3.1: Global Toggle Shortcut

Status: done

## Story

As a User,
I want to be able to toggle the grid on/off using a keyboard shortcut,
so that I can quickly check alignment without moving my mouse to the toolbar.

## Acceptance Criteria

1. **Default Shortcut:** Define a default shortcut `Alt+Shift+G` (or `Option+Shift+G` on Mac) that toggles the extension's active state.
2. **Global Access:** The shortcut works regardless of which element has focus, as long as the Chrome window is active.
3. **Immediate Feedback:** Toggling "off" removes the grid and any active highlight outlines immediately. Toggling "on" re-enables the inspection mode (highlighting on hover).

## Tasks / Subtasks

- [x] Task 1 — Manifest Configuration (AC: #1)
  - [x] 1.1: Add `commands` key to `manifest.json` (via `src/manifest.js`) defining `toggle-grid` command with suggested key `Alt+Shift+G`.
  - [x] 1.2: Ensure `_execute_action` is NOT used if we want custom logic, or map it to the action if that suffices (custom logic likely needed for specific "toggle" behavior across tabs). *Decision: Use custom command `toggle-grid` to allow granular control.*

- [x] Task 2 — Background Script Handler (AC: #1, #2)
  - [x] 2.1: In `src/background/index.js`, add listener for `chrome.commands.onCommand`.
  - [x] 2.2: On `toggle-grid` command, query the active tab and send a `TOGGLE_GRID` message to its content script.

- [x] Task 3 — Content Script Toggle Logic (AC: #3)
  - [x] 3.1: In `src/content/InspectorController.js`, add a public method `toggleActiveState()`.
  - [x] 3.2: Listen for `TOGGLE_GRID` message in `src/content/index.js` and call the controller's toggle method.
  - [x] 3.3: Ensure `toggleActiveState()` correctly:
    - If turning OFF: calls `GridManager.remove()` and disables `ElementSelector`.
    - If turning ON: enables `ElementSelector`.

- [ ] Task 4 — Verification & Testing
  - [x] 4.1: Add manual test case to `MANUAL_TESTING.md` for keyboard shortcut usage.
  - [x] 4.2: Verify no conflicts with default Chrome shortcuts (e.g., Ctrl+Shift+J/I/C).

## Dev Notes

- Architecture / Constraints
  - **Manifest V3:** Commands API is supported.
  - **Messaging:** Background -> Content Script messaging required since Content Scripts cannot listen to `chrome.commands` directly (except for specific cases, but background is more reliable for global scope).
  - **State Management:** `InspectorController` is the source of truth for "Active" state.

- Learnings from Previous Story

  **From Story 2.2 (Status: done)**

  - **CI Gap Identified:** Previous story identified a missing CI workflow for packaging (Task 3.3). While not blocking *this* story's dev work, be aware that CI verification is currently limited.
  - **New Assets:** Icons are now standard in `src/assets/`.
  - **Manifest Structure:** `src/manifest.js` is the source for `manifest.json`. Ensure `commands` are added there, not in `dist/`.

- Project Structure Notes
  - `src/manifest.js`: Update this for manifest changes.
  - `src/background/index.js`: Add command listener here.
  - `src/content/`: Core logic updates.

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Detailed Design]
- [Source: docs/prd/6. Epic Details.md#6.3.1 Story 3.1: Global Toggle Shortcut]
- [Source: docs/sprint-artifacts/2-2-packaging-assets-preparation.md] (Previous Story)

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/3-1-global-toggle-shortcut.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
