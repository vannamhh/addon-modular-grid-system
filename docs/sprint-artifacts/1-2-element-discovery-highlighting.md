# Story 1.2: Element Discovery & Highlighting

Status: drafted

## Story

As a **User**,
I want to **see a highlight effect when hovering over page elements**,
so that **I know exactly which element will be selected for the grid overlay**.

## Acceptance Criteria

1. **AC1-Hover**: Hovering over a DOM element displays a 2px blue outline (`#0080FF`) around it
2. **AC2-Clear**: Moving the mouse away immediately removes the blue outline
3. **AC3-Performance**: Hovering rapidly over nested elements shows smooth transitions without frame drops (60fps validated via DevTools Performance profiler)
4. **AC4-Filter**: Hidden elements (`display: none`, `visibility: hidden`) and zero-dimension elements are ignored during hover detection

## Tasks / Subtasks

- [ ] **Task 1: Implement Message Handling in Content Script** (AC: All - Foundation)
  - [ ] 1.1: Add `chrome.runtime.onMessage` listener in `src/content/index.js`
  - [ ] 1.2: Handle `TOGGLE_INSPECTOR` message type with `{active: boolean}` payload
  - [ ] 1.3: Initialize `InspectorController` singleton on content script load
  - [ ] 1.4: Call `InspectorController.setActive(active)` when toggle message received
  - [ ] 1.5: Add error handling for invalid message types

- [ ] **Task 2: Create InspectorController Module** (AC: All - Orchestration)
  - [ ] 2.1: Create `src/content/modules/InspectorController.js` as singleton class
  - [ ] 2.2: Implement `init()` method to initialize ElementSelector module
  - [ ] 2.3: Implement `setActive(boolean)` method to enable/disable ElementSelector
  - [ ] 2.4: Add state management: `isActive` and `lockedElement` properties
  - [ ] 2.5: Export singleton instance as `default export`
  - [ ] 2.6: Add JSDoc comments for all public methods

- [ ] **Task 3: Create ElementSelector Module** (AC: #1, #2, #3, #4)
  - [ ] 3.1: Create `src/content/modules/ElementSelector.js` class
  - [ ] 3.2: Implement `enable()` method to start hover detection
  - [ ] 3.3: Implement `disable()` method to stop hover detection and clear highlights
  - [ ] 3.4: Add throttled `mousemove` event listener using `requestAnimationFrame`
  - [ ] 3.5: Implement element filtering logic (check `isElementValid()` helper)
  - [ ] 3.6: Apply blue outline style to valid hovered elements
  - [ ] 3.7: Store reference to currently highlighted element
  - [ ] 3.8: Implement `clearHighlight()` to remove outline from previous element

- [ ] **Task 4: Implement Element Validation Logic** (AC: #4)
  - [ ] 4.1: Create `isElementValid(element)` helper in ElementSelector
  - [ ] 4.2: Check `display` computed style is not `none`
  - [ ] 4.3: Check `visibility` computed style is not `hidden`
  - [ ] 4.4: Check `opacity` computed style is not `0`
  - [ ] 4.5: Get bounding rect and verify `width > 0` and `height > 0`
  - [ ] 4.6: Return `false` if element is the shadow host itself (avoid recursion)

- [ ] **Task 5: Implement Hover Outline Styling** (AC: #1, #2)
  - [ ] 5.1: Define outline constants: `OUTLINE_COLOR = '#0080FF'`, `OUTLINE_WIDTH = '2px'`
  - [ ] 5.2: Apply inline styles: `element.style.outline = '2px solid #0080FF'`
  - [ ] 5.3: Set `element.style.outlineOffset = '0px'` for precise alignment
  - [ ] 5.4: Store original outline styles before applying (for restoration)
  - [ ] 5.5: Restore original outline styles in `clearHighlight()`

- [ ] **Task 6: Implement requestAnimationFrame Throttling** (AC: #3)
  - [ ] 6.1: Create `rafId` property to store animation frame ID
  - [ ] 6.2: In `mousemove` handler, check if `rafId` is null before scheduling
  - [ ] 6.3: Use `requestAnimationFrame(() => { handleHover(event); rafId = null; })`
  - [ ] 6.4: Cancel pending animation frame in `disable()` using `cancelAnimationFrame(rafId)`
  - [ ] 6.5: Add comment explaining throttling prevents >60fps event processing

- [ ] **Task 7: Write Unit Tests for ElementSelector** (AC: All)
  - [ ] 7.1: Create `tests/content/modules/ElementSelector.spec.js`
  - [ ] 7.2: Test `enable()` registers mousemove listener
  - [ ] 7.3: Test `disable()` removes listener and clears highlights
  - [ ] 7.4: Test `isElementValid()` filters hidden/zero-size elements
  - [ ] 7.5: Test outline styles are applied correctly on hover
  - [ ] 7.6: Test rAF throttling (verify only one frame scheduled at a time)
  - [ ] 7.7: Mock `getBoundingClientRect()` and `getComputedStyle()` for deterministic tests

- [ ] **Task 8: Write Unit Tests for InspectorController** (AC: All)
  - [ ] 8.1: Create `tests/content/modules/InspectorController.spec.js`
  - [ ] 8.2: Test singleton pattern (multiple imports return same instance)
  - [ ] 8.3: Test `init()` creates ElementSelector instance
  - [ ] 8.4: Test `setActive(true)` calls `ElementSelector.enable()`
  - [ ] 8.5: Test `setActive(false)` calls `ElementSelector.disable()`
  - [ ] 8.6: Test state changes are tracked in `isActive` property

- [ ] **Task 9: Integration Test - Message Flow** (AC: All)
  - [ ] 9.1: Create test page HTML with nested div structure
  - [ ] 9.2: Load extension in Chrome Developer Mode
  - [ ] 9.3: Click extension icon to activate (popup sends message)
  - [ ] 9.4: Verify console logs "Inspector activated" (or similar)
  - [ ] 9.5: Hover over test page elements and verify blue outline appears
  - [ ] 9.6: Move mouse rapidly over 20+ nested elements
  - [ ] 9.7: Open DevTools Performance tab and verify frame rate stays above 55fps
  - [ ] 9.8: Test hover on hidden elements (display:none) - should be ignored

- [ ] **Task 10: Performance Validation** (AC: #3)
  - [ ] 10.1: Create stress test page with 100+ nested divs
  - [ ] 10.2: Activate extension and start DevTools Performance recording
  - [ ] 10.3: Hover rapidly across elements for 10 seconds
  - [ ] 10.4: Stop recording and analyze frame rate chart
  - [ ] 10.5: Verify no frame drops below 55fps (target 60fps with 5fps buffer)
  - [ ] 10.6: Check for long tasks (>50ms) in Performance profile - should be zero

## Dev Notes

### Architecture Alignment

This story implements the **ElementSelector** module defined in the Technical Architecture Document and establishes the message-passing bridge between Popup and Content Script.

**Key Patterns:**
- **Singleton Controller**: `InspectorController` acts as central orchestrator [Source: docs/architecture.md#Component-Architecture]
- **rAF Throttling**: `requestAnimationFrame` throttles mousemove to maintain 60fps [Source: docs/architecture.md#4.2-ElementSelector, docs/sprint-artifacts/tech-spec-epic-1.md#NFR-Performance]
- **Shadow DOM Preparation**: Module structure prepares for Shadow DOM injection in Story 1.3 [Source: docs/architecture.md#High-Level-Architecture]

### Project Structure Notes

**New Modules Created:**
```
src/content/modules/
├── InspectorController.js  # Singleton orchestrator
└── ElementSelector.js      # Hover detection and highlighting
```

**Module Interfaces** (as per tech spec):

**InspectorController:**
```javascript
class InspectorController {
  init(): void                          // Initialize ElementSelector
  setActive(active: boolean): void      // Toggle extension active state
  lockElement(element: HTMLElement): void  // Lock grid (Story 1.3)
  unlock(): void                        // Remove grid (Story 1.3)
  destroy(): void                       // Cleanup all resources
}
```

**ElementSelector:**
```javascript
class ElementSelector {
  enable(): void                        // Start hover detection
  disable(): void                       // Stop and clear highlights
  highlightElement(element: HTMLElement): void  // Apply outline
  clearHighlight(): void                // Remove outline
  onElementSelected(callback: Function): void   // Register click handler (Story 1.3)
}
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Detailed-Design → APIs and Interfaces]

### Technical Constraints

**Performance Requirements:**
- Target: 60fps during hover interactions [Source: docs/sprint-artifacts/tech-spec-epic-1.md#NFR-Performance]
- Throttling: All `mousemove` handlers use `requestAnimationFrame` [Source: docs/prd/2. Requirements.md#NFR1]
- Element highlight application must complete within 16ms per frame

**Element Filtering Logic:**
```javascript
function isElementValid(element) {
  const style = window.getComputedStyle(element);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (parseFloat(style.opacity) === 0) return false;
  
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  // Avoid highlighting shadow host itself
  if (element.id === 'wp-rhythm-host') return false;
  
  return true;
}
```
[Source: docs/sprint-artifacts/tech-spec-epic-1.md#AC3]

**Styling Constants:**
```javascript
const OUTLINE_COLOR = '#0080FF';  // Blue outline color
const OUTLINE_WIDTH = '2px';       // Outline thickness
const OUTLINE_OFFSET = '0px';      // No offset for precise alignment
```
[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Data-Models-and-Contracts → Element Highlight Style]

### Learnings from Previous Story

**From Story 1-1-project-scaffolding-manifest-v3-setup (Status: done)**

- **Existing Infrastructure to Reuse**:
  - Content script entry point at `src/content/index.js` - add message listener here
  - Module directory at `src/content/modules/` - create new modules here
  - Test framework Vitest + JSDOM - follow patterns from `tests/content/index.spec.js`
  - Build system configured - no changes needed

- **Message Bridge Gap**: Story 1.1 left popup sending `TOGGLE_INSPECTOR` message but content script not listening. THIS STORY closes that gap by implementing `chrome.runtime.onMessage` listener [Source: stories/1-1-project-scaffolding-manifest-v3-setup.md#Review-Follow-ups]

- **Architectural Foundation**: 
  - Manifest V3 configured with `activeTab` permission
  - IIFE pattern in content script for scope isolation
  - ES modules with default exports
  - All coding standards established (const/let, no var)

- **Testing Patterns Established**:
  - Vitest config at `vite.config.js` with JSDOM environment
  - Mock console.log with `vi.spyOn()`
  - Use `beforeEach`/`afterEach` for setup/teardown
  - Test file naming: `*.spec.js`

- **Build Output Performance**: Previous story achieved <2KB bundle. ElementSelector module should maintain lightweight footprint (target: add <5KB)

[Source: stories/1-1-project-scaffolding-manifest-v3-setup.md#Dev-Agent-Record]

### Testing Strategy

**Unit Tests (Vitest + JSDOM):**
- ElementSelector hover detection logic
- InspectorController state management
- Element validation filtering (hidden, zero-size cases)
- rAF throttling behavior (verify only one pending frame)

**Manual Integration Tests:**
1. Load extension and activate via popup
2. Hover over elements on test page (verify blue outline)
3. Test rapid hover on nested elements (visual smoothness check)
4. Test hidden elements ignored (create test page with `display:none` divs)
5. DevTools Performance profiler validation (60fps target)

**Performance Test Procedure:**
1. Create test page: 100 nested divs with varying sizes
2. Start DevTools Performance recording
3. Activate extension
4. Hover rapidly in zigzag pattern for 10 seconds
5. Stop recording and analyze:
   - Frame rate chart (target: no drops below 55fps)
   - Long tasks (target: zero tasks >50ms)
   - Memory allocations (target: no leaks)

### Constraints and Limitations

**Out of Scope for This Story:**
- Click handling to lock grid (deferred to Story 1.3)
- Grid rendering and Shadow DOM creation (Story 1.3)
- Measurement mode (Epic 2)
- Element selection callback (Story 1.3 will add)

**Known Edge Cases:**
- Elements with `pointer-events: none` can still be hovered (acceptable for highlighting)
- Dynamically added elements are detected (event delegation on document)
- Iframes not supported (cross-origin security constraint)

### References

- [Tech Spec Epic 1: Foundation & Core Grid Injection](docs/sprint-artifacts/tech-spec-epic-1.md)
  - Section: Detailed Design → ElementSelector Module (API interface)
  - Section: Detailed Design → InspectorController Module (Singleton pattern)
  - Section: Workflows → Element Discovery and Grid Lock (Steps 1-6)
  - Section: NFR Performance (60fps target, rAF throttling)
  - Section: Acceptance Criteria AC3 (hover highlighting requirements)
- [Architecture Document](docs/architecture.md)
  - Section 4: Component Architecture (ElementSelector responsibilities)
  - Section 5.1: Activation & Locking Flow (sequence diagram)
  - Section 7: Coding Standards (const/let, JSDoc)
- [PRD](docs/prd/2. Requirements.md)
  - FR1: Targeted Activation (hover to highlight)
  - NFR1: Performance (rAF throttling for mousemove)
  - NFR3: Tech Stack (Vanilla JS, no frameworks)
- [Story 1.1](docs/sprint-artifacts/1-1-project-scaffolding-manifest-v3-setup.md)
  - Dev Agent Record: Completion Notes (infrastructure to reuse)
  - Review Follow-ups: Message listener gap to close

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled by dev agent during implementation -->

### Completion Notes List

<!-- Will be filled by dev agent after story completion -->

### File List

<!-- Will be filled by dev agent - list all NEW, MODIFIED, DELETED files -->

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-22 | 0.1 | Initial story draft created from tech spec, PRD, and architecture | Bob (SM) |
