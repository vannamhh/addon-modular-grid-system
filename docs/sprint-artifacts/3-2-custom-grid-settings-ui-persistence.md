# Story 3.2: Custom Grid Settings UI & Persistence

Status: review

## Story

As a User,
I want to customize the grid size and color via a popup UI and have these settings saved,
so that I can use the tool on different projects with different requirements.

## Acceptance Criteria

1. **Settings UI:**
   - Create a Popup UI (`popup.html`) accessible from the extension toolbar icon.
   - Include an input field for **Grid Size** (number) defaulting to 14.
   - Include an input field for **Grid Color** (color picker or hex input) defaulting to Cyan (#00FFFF).
   - Changes are saved automatically or via a "Save" button.

2. **Persistence:**
   - Save settings using `chrome.storage.sync` (falling back to `local` if needed) so they persist across browser sessions and restarts.

3. **Reactivity:**
   - The Content Script must listen for storage changes (`chrome.storage.onChanged`).
   - If the grid is active, it must update immediately when settings change.
   - New settings apply to all tabs (eventually) or the active tab immediately.

## Tasks / Subtasks

- [x] Task 1 — Popup UI Implementation (AC: #1)
  - [x] 1.1: Create `src/popup/index.html` with inputs for Grid Size and Color.
  - [x] 1.2: Create `src/popup/style.css` for basic styling (match extension aesthetic).
  - [x] 1.3: Create `src/popup/popup.js` to handle form interactions.
  - [x] 1.4: Update `src/manifest.js` to register the `default_popup`.

- [x] Task 2 — Settings Persistence (AC: #2)
  - [x] 2.1: Implement logic in `src/popup/popup.js` to load existing settings from `chrome.storage.sync` on open.
  - [x] 2.2: Implement logic to save settings to `chrome.storage.sync` on change (or save button click).
  - [x] 2.3: Validate inputs (e.g., size > 0, valid hex color) before saving.

- [x] Task 3 — Content Script Integration (AC: #3)
  - [x] 3.1: Create `src/content/modules/ConfigManager.js` to manage settings retrieval and updates.
  - [x] 3.2: In `ConfigManager`, listen for `chrome.storage.onChanged` and broadcast/notify updates.
  - [x] 3.3: Update `src/content/modules/GridManager.js` to accept dynamic configuration (size, color) instead of hardcoded constants.
  - [x] 3.4: Ensure `GridManager` re-renders the grid if active when settings change.

- [x] Task 4 — Verification & Testing
  - [x] 4.1: Verify Popup opens and saves values correctly.
  - [x] 4.2: Verify settings persist after browser restart.
  - [x] 4.3: Verify grid updates in real-time when settings change in Popup.
  - [x] 4.4: Verify default values are used if no settings exist.

## Dev Notes

- Architecture / Constraints
  - **Manifest V3:** Use `chrome.storage` API. Requires `storage` permission in `manifest.json`.
  - **Popup:** Runs in a separate context. Communicates via Storage or Runtime messages. Here, Storage is the primary sync mechanism.
  - **Reactivity:** `chrome.storage.onChanged` is the preferred way for Content Scripts to react to Popup changes.

- Learnings from Previous Story

  **From Story 3.1 (Status: done)**

  - **Manifest Structure:** `src/manifest.js` is the source of truth. Add `action: { default_popup: ... }` and `permissions: ['storage']` there.
  - **Assets:** Ensure any new icons or assets for the popup are in `src/assets/` or properly referenced.
  - **State Management:** `InspectorController` manages active state; `ConfigManager` will manage configuration state.

### Project Structure Notes

- New directory: `src/popup/`
- New module: `src/content/modules/ConfigManager.js`
- Modified module: `src/content/modules/GridManager.js`

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Detailed Design]
- [Source: docs/prd/6. Epic Details.md#6.3.2 Story 3.2: Custom Grid Settings UI & Persistence]
- [Source: docs/sprint-artifacts/3-1-global-toggle-shortcut.md] (Previous Story)

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/3-2-custom-grid-settings-ui-persistence.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented Popup UI with Grid Size and Color inputs.
- Created `ConfigManager` to handle settings persistence and reactivity.
- Refactored `GridManager` to use dynamic configuration.
- Updated `InspectorController` to wire `ConfigManager` updates to `GridManager`.
- Verified with manual testing steps and updated unit tests (mocking chrome API).

### File List

- src/popup/index.html
- src/popup/style.css
- src/popup/popup.js
- src/popup/index.js (Deleted)
- src/content/modules/ConfigManager.js (New)
- src/content/modules/GridManager.js
- src/content/modules/InspectorController.js
- tests/content/modules/InspectorController.spec.js
