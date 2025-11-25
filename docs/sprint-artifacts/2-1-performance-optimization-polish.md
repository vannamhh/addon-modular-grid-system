# Story 2.1: Performance Optimization & Polish

Status: drafted

## Story

As a **User**,
I want **the tool to operate smoothly even when I scroll the page or resize the window**,
so that **I can validate alignment without lag or consuming excessive browser RAM**.

## Acceptance Criteria

1. **AC1-Throttled-Interaction**: All `mousemove` events for highlighting are throttled using `requestAnimationFrame` to ensure 60fps performance.
2. **AC2-Scroll-Resize-Stability**: The grid overlay and measurement tool (if active) maintain correct positioning relative to the target element during page scroll and window resize.
3. **AC3-Clean-Lifecycle**: Disabling the extension or switching target elements removes all attached Event Listeners and DOM nodes, returning the page to its original state (no memory leaks).
4. **AC4-Icon-Assets**: The extension includes valid 16px, 32px, 48px, and 128px icons in the `assets` folder.
5. **AC5-Manifest-Metadata**: The `manifest.json` contains the correct name, version, description, and icon references.
6. **AC6-Production-Build**: Running `npm run package` (or equivalent) successfully generates a `dist` folder and a `.zip` file containing the optimized, minified extension ready for upload.

## Tasks / Subtasks

- [ ] **Task 1: Implement RequestAnimationFrame Throttling** (AC: #1)
  - [ ] 1.1: Refactor `ElementSelector.js` to use a `requestAnimationFrame` loop for `mousemove` handling
  - [ ] 1.2: Ensure highlight position updates only on animation frames
  - [ ] 1.3: Verify no visual lag during rapid mouse movement

- [ ] **Task 2: Implement Scroll and Resize Handling** (AC: #2)
  - [ ] 2.1: Verify `GridManager.js` direct child injection strategy handles scrolling naturally (no code change expected, just validation)
  - [ ] 2.2: Add `resize` event listener (throttled) to `InspectorController` or `GridManager` to handle window resizing
  - [ ] 2.3: Ensure grid overlay adjusts dimensions if target element resizes (optional: use `ResizeObserver`)

- [ ] **Task 3: Implement Comprehensive Cleanup Logic** (AC: #3)
  - [ ] 3.1: Add `deactivate()` method to `InspectorController.js`
  - [ ] 3.2: Ensure `ElementSelector.disable()` removes all event listeners
  - [ ] 3.3: Ensure `GridManager.remove()` cleans up shadow host and any internal state
  - [ ] 3.4: Verify heap snapshot shows no detached DOM nodes after toggle cycle

- [ ] **Task 4: Prepare Icon Assets** (AC: #4)
  - [ ] 4.1: Generate or source 16px, 32px, 48px, 128px icons (PNG format)
  - [ ] 4.2: Place icons in `src/assets/` directory

- [ ] **Task 5: Update Manifest Metadata** (AC: #5)
  - [ ] 5.1: Update `manifest.js` (or `manifest.json`) with full description, version 1.0.0, and icon paths
  - [ ] 5.2: Verify manifest loads correctly in Chrome

- [ ] **Task 6: Create Production Build Script** (AC: #6)
  - [ ] 6.1: Add `package` script to `package.json` (using `zip` or node script)
  - [ ] 6.2: Configure build to output to `dist`
  - [ ] 6.3: Verify `npm run package` creates a valid `.zip` file

- [ ] **Task 7: Update Test Infrastructure** (AC: #1, #2, #3)
  - [ ] 7.1: Add performance test case to `MANUAL_TESTING.md` (checking for long tasks)
  - [ ] 7.2: Add memory leak test case to `MANUAL_TESTING.md`
  - [ ] 7.3: Add build verification step to `MANUAL_TESTING.md`

## Dev Notes

### Architecture Alignment

- **Performance**: Adheres to the "Performance (60fps)" goal using `requestAnimationFrame`.
- **Lifecycle**: Enforces the "Clean Up" principle in `InspectorController`.
- **Build**: Uses Vite + CRXJS for optimized builds.

### Project Structure Notes

- **Modified Files**:
  - `src/content/modules/ElementSelector.js` (Throttling)
  - `src/content/modules/InspectorController.js` (Cleanup)
  - `src/content/modules/GridManager.js` (Resize handling if needed)
  - `package.json` (Scripts)
  - `manifest.js` (Metadata)
- **New Files**:
  - `src/assets/icon-*.png`

### References

- [Tech Spec Epic 2](docs/sprint-artifacts/tech-spec-epic-2.md)
- [Architecture Document](docs/architecture.md)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

### Learnings from Previous Story

**From Story 1-4-click-through-transparency (Status: done)**

- **Pointer-Events**: Confirmed `pointer-events: none` works perfectly for click-through. Ensure this property is preserved during any refactoring in this story.
- **Shadow DOM**: The structure `div#wp-rhythm-host` is stable. Cleanup logic in Task 3 must ensure this host is completely removed.
- **Testing**: `test-page.html` and `MANUAL_TESTING.md` are robust. Add new sections for performance and memory testing.
- **Z-Index**: Recall that z-index is set to 999.

[Source: stories/1-4-click-through-transparency.md#Dev-Agent-Record]
