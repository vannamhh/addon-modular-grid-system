# Story 1.3: Grid Overlay Injection (The "Lock")

Status: awaiting-manual-testing

## Story

As a **User**,
I want to **click on a highlighted element to "pin" (lock) the 14px grid to it**,
so that **I can inspect alignment of text and UI elements against the rhythm grid**.

## Acceptance Criteria

1. **AC1-Click**: A click event on a highlighted element triggers grid generation
2. **AC2-Shadow**: The grid is rendered inside a Shadow DOM host attached to (or overlaying) the target element to ensure style isolation
3. **AC3-Pattern**: The Grid Pattern consists of 14px × 14px squares using CSS repeating gradients
4. **AC4-Origin**: The Grid Origin (0,0) must align exactly with the top-left corner of the target element's Padding Box
5. **AC5-Single**: If another grid is already visible elsewhere, it must be removed before the new grid appears (Single Instance Rule)

## Tasks / Subtasks

- [ ] **Task 1: Create GridManager Module** (AC: #1, #2, #3, #4, #5)
  - [ ] 1.1: Create `src/content/modules/GridManager.js` class
  - [ ] 1.2: Implement `inject(targetElement)` method to create Shadow Host and Grid
  - [ ] 1.3: Implement `remove()` method to clean up Shadow Host from DOM
  - [ ] 1.4: Implement `isActive()` method to check if grid is currently displayed
  - [ ] 1.5: Implement `getGridHost()` method to return reference to shadow host element
  - [ ] 1.6: Add JSDoc comments for all public methods

- [ ] **Task 2: Shadow DOM Creation and Styling** (AC: #2, #3)
  - [ ] 2.1: Create shadow host div with `id="wp-rhythm-host"`
  - [ ] 2.2: Attach open Shadow Root using `attachShadow({mode: 'open'})`
  - [ ] 2.3: Create grid CSS using repeating-linear-gradient for 14px squares
  - [ ] 2.4: Inject CSS into shadow root via `<style>` tag
  - [ ] 2.5: Create grid pattern div with class `grid-pattern` inside shadow root
  - [ ] 2.6: Set shadow host positioning: `position: absolute; inset: 0; pointer-events: none; z-index: 9999`

- [ ] **Task 3: Element Positioning Adjustment** (AC: #4)
  - [ ] 3.1: Check target element's computed `position` style
  - [ ] 3.2: If `position: static`, add internal CSS class to set `position: relative`
  - [ ] 3.3: Store original position value to restore on cleanup
  - [ ] 3.4: Ensure grid aligns to padding box (not border box) origin
  - [ ] 3.5: Handle edge case: elements with existing transform contexts

- [ ] **Task 4: Grid Pattern CSS Implementation** (AC: #3)
  - [ ] 4.1: Define CSS constants: `GRID_SIZE = 14`, `GRID_COLOR = '#00FFFF'`, `GRID_OPACITY = 0.35`
  - [ ] 4.2: Create vertical lines using `repeating-linear-gradient(0deg, transparent 0 13px, #00FFFF 13px 14px)`
  - [ ] 4.3: Create horizontal lines using `repeating-linear-gradient(90deg, transparent 0 13px, #00FFFF 13px 14px)`
  - [ ] 4.4: Combine gradients in `background-image` property
  - [ ] 4.5: Set grid opacity to 35% for visibility without obstruction
  - [ ] 4.6: Ensure grid fills entire target element using `position: absolute; inset: 0`

- [ ] **Task 5: Single Instance Enforcement** (AC: #5)
  - [ ] 5.1: Store reference to current grid host element in GridManager instance
  - [ ] 5.2: In `inject()`, check if `currentGridHost` exists
  - [ ] 5.3: If previous grid exists, call `remove()` before creating new grid
  - [ ] 5.4: Update `currentGridHost` reference after successful injection
  - [ ] 5.5: Clear `currentGridHost` reference in `remove()` method

- [ ] **Task 6: ElementSelector Click Handling Integration** (AC: #1)
  - [ ] 6.1: Add `onElementSelected` callback registration method to ElementSelector
  - [ ] 6.2: Add click event listener to document in `ElementSelector.enable()`
  - [ ] 6.3: In click handler, verify clicked element matches currently highlighted element
  - [ ] 6.4: Invoke registered callback with selected element
  - [ ] 6.5: Remove click listener in `ElementSelector.disable()`

- [ ] **Task 7: InspectorController Grid Lock Orchestration** (AC: #1, #5)
  - [ ] 7.1: Implement `lockElement(element)` method in InspectorController
  - [ ] 7.2: Call `ElementSelector.disable()` to stop hover detection when locking
  - [ ] 7.3: Call `GridManager.inject(element)` to create grid
  - [ ] 7.4: Store locked element reference in `lockedElement` property
  - [ ] 7.5: Implement `unlock()` method to remove grid and re-enable hover
  - [ ] 7.6: Call `GridManager.remove()` in `unlock()` method
  - [ ] 7.7: Call `ElementSelector.enable()` to resume hover detection after unlock

- [ ] **Task 8: Write Unit Tests for GridManager** (AC: All)
  - [ ] 8.1: Create `tests/content/modules/GridManager.spec.js`
  - [ ] 8.2: Test `inject()` creates shadow host with correct attributes
  - [ ] 8.3: Test shadow root is created in open mode
  - [ ] 8.4: Test grid pattern CSS is injected into shadow root
  - [ ] 8.5: Test positioning adjustment for elements with `position: static`
  - [ ] 8.6: Test `remove()` cleans up shadow host from DOM
  - [ ] 8.7: Test `isActive()` returns correct state
  - [ ] 8.8: Test single instance enforcement (previous grid removed)
  - [ ] 8.9: Mock `attachShadow()`, `getComputedStyle()`, `appendChild()` for deterministic tests

- [ ] **Task 9: Update InspectorController Tests** (AC: #1, #5)
  - [ ] 9.1: Add tests for `lockElement()` method
  - [ ] 9.2: Test `lockElement()` disables ElementSelector
  - [ ] 9.3: Test `lockElement()` calls GridManager.inject()
  - [ ] 9.4: Test `unlock()` calls GridManager.remove()
  - [ ] 9.5: Test `unlock()` re-enables ElementSelector
  - [ ] 9.6: Test state transitions: inactive → hover → locked → hover

- [ ] **Task 10: Update ElementSelector Tests** (AC: #1)
  - [ ] 10.1: Add tests for `onElementSelected()` callback registration
  - [ ] 10.2: Test click handler invokes callback with correct element
  - [ ] 10.3: Test click on non-highlighted element is ignored
  - [ ] 10.4: Test click listener is removed in `disable()`

- [ ] **Task 11: Integration Test - Grid Lock Flow** (AC: All) - **MANUAL TESTING REQUIRED**
  - [ ] 11.1: Load extension and activate via popup
  - [ ] 11.2: Hover over element to see blue outline
  - [ ] 11.3: Click highlighted element
  - [ ] 11.4: Verify grid overlay appears with 14px squares
  - [ ] 11.5: Verify grid aligns to element's padding box origin
  - [ ] 11.6: Inspect shadow root in DevTools and verify structure
  - [ ] 11.7: Click another element and verify first grid is removed
  - [ ] 11.8: Test on element with `position: static` (e.g., unstyled div)
  - [ ] 11.9: Verify grid CSS is isolated from page styles
  - [ ] 11.10: Test pointer-events passthrough (click buttons beneath grid)

- [ ] **Task 12: CSS Isolation Validation** (AC: #2) - **MANUAL TESTING REQUIRED**
  - [ ] 12.1: Create test page with conflicting CSS (e.g., `.grid-pattern { display: none; }`)
  - [ ] 12.2: Lock grid to element on test page
  - [ ] 12.3: Verify grid remains visible despite page CSS
  - [ ] 12.4: Add inline styles to shadow host from page JS (`shadowHost.style.display = 'none'`)
  - [ ] 12.5: Verify shadow host can be hidden but shadow root content is unaffected

- [ ] **Task 13: Visual Accuracy Validation** (AC: #3, #4) - **MANUAL TESTING REQUIRED**
  - [ ] 13.1: Lock grid to element with known dimensions (e.g., 280px × 140px = 20×10 squares)
  - [ ] 13.2: Use Chrome DevTools Ruler/Measure tool to verify 14px square size
  - [ ] 13.3: Verify grid starts at exact top-left corner of padding box (not border)
  - [ ] 13.4: Test on element with padding (e.g., padding: 20px) to confirm padding box alignment
  - [ ] 13.5: Test on element with border (e.g., border: 5px solid red) to confirm grid ignores border

## Dev Notes

### Architecture Alignment

This story implements the **GridManager** module defined in the Technical Architecture Document and completes the core "Direct Child Injection" strategy for grid overlay rendering.

**Key Patterns:**
- **Shadow DOM Isolation**: Grid and all UI components rendered inside open Shadow Root [Source: docs/architecture.md#2-High-Level-Architecture]
- **Direct Child Injection**: Grid injected as absolute-positioned child of target element (inset: 0) for automatic scroll sync [Source: docs/architecture.md#Key-Technical-Decisions]
- **Pointer Events Passthrough**: Shadow host has `pointer-events: none` to allow click-through [Source: docs/architecture.md#3-Tech-Stack]
- **Single Instance Rule**: Only one grid visible at a time [Source: docs/sprint-artifacts/tech-spec-epic-1.md#AC5]

### Project Structure Notes

**New Module Created:**
```
src/content/modules/
└── GridManager.js      # Grid lifecycle and Shadow DOM management
```

**Module Interface** (as per tech spec):

**GridManager:**
```javascript
class GridManager {
  inject(targetElement: HTMLElement): void  // Create and inject grid
  remove(): void                            // Remove grid and cleanup
  isActive(): boolean                       // Check if grid is displayed
  getGridHost(): HTMLElement | null         // Get shadow host reference
}
```

**Generated DOM Structure:**
```html
<div id="wp-rhythm-host" style="position: absolute; inset: 0; pointer-events: none; z-index: 9999;">
  #shadow-root (open)
    <style>
      .grid-pattern {
        position: absolute;
        inset: 0;
        background-image: 
          repeating-linear-gradient(0deg, transparent 0 13px, #00FFFF 13px 14px),
          repeating-linear-gradient(90deg, transparent 0 13px, #00FFFF 13px 14px);
        opacity: 0.35;
        pointer-events: none;
      }
    </style>
    <div class="grid-pattern"></div>
</div>
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Detailed-Design → GridManager, docs/architecture.md#4.3-GridManager]

### Technical Constraints

**Grid Positioning Requirements:**
- Grid origin (0,0) must align to **padding box** top-left corner, not border box [Source: docs/sprint-artifacts/tech-spec-epic-1.md#AC4]
- If target element has `position: static`, temporarily set `position: relative` [Source: docs/architecture.md#4.3-GridManager]
- Shadow host positioning: `position: absolute; inset: 0;` ensures full coverage of target element
- Z-index: 9999 (max practical value; stacking context constraint accepted) [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Risks → RISK-2]

**Grid Visual Specifications:**
```javascript
const GRID_SIZE = 14;           // 14px × 14px squares
const GRID_COLOR = '#00FFFF';   // Cyan primary color
const GRID_OPACITY = 0.35;      // 35% opacity for visibility
const LINE_WIDTH = 1;           // 1px line thickness
```
[Source: docs/architecture.md#Key-Technical-Decisions, docs/sprint-artifacts/tech-spec-epic-1.md#Data-Models-and-Contracts → Grid Configuration]

**Shadow DOM Requirements:**
- Open mode for debuggability: `attachShadow({mode: 'open'})` [Source: docs/sprint-artifacts/tech-spec-epic-1.md#NFR-Security]
- CSS isolation: All grid styles scoped within shadow root [Source: docs/architecture.md#2-High-Level-Architecture]
- Pointer-events passthrough: `pointer-events: none` on shadow host [Source: docs/sprint-artifacts/tech-spec-epic-1.md#AC6]

**Single Instance Constraint:**
```javascript
// Pseudo-code for inject()
if (this.currentGridHost) {
  this.remove(); // Remove existing grid first
}
this.currentGridHost = createShadowHost(targetElement);
// ... inject grid ...
```
[Source: docs/sprint-artifacts/tech-spec-epic-1.md#AC5, docs/architecture.md#Workflows → Grid Lock step 9]

### Learnings from Previous Story

**From Story 1-2-element-discovery-highlighting (Status: review)**

- **Existing Services to Reuse**:
  - `InspectorController` singleton at `src/content/modules/InspectorController.js` - integrate GridManager here
  - `ElementSelector` module at `src/content/modules/ElementSelector.js` - add click handling and callback registration
  - Message handling bridge established in `src/content/index.js` - no changes needed
  - Test framework patterns: Mock browser APIs (getBoundingClientRect, getComputedStyle), use beforeEach/afterEach

- **Integration Points**:
  - `InspectorController.lockElement(element)` method stub already exists - THIS STORY implements the body
  - `ElementSelector` needs `onElementSelected(callback)` method to wire click events to controller
  - State flow: hover (ElementSelector active) → click → lock (GridManager active, ElementSelector disabled) → unlock → hover

- **New Files Created in Story 1.2**:
  ```
  src/content/modules/InspectorController.js  # Will call GridManager.inject()
  src/content/modules/ElementSelector.js      # Add click handling
  tests/content/modules/ElementSelector.spec.js
  tests/content/modules/InspectorController.spec.js
  ```
  - Use same file structure for GridManager module and tests

- **Architecture Foundation**:
  - requestAnimationFrame throttling pattern established for performance
  - JSDoc comment style: `@param {Type} name - Description` and `@returns {Type} Description`
  - Singleton pattern: `export default new ClassName()`
  - Event cleanup in disable() methods prevents memory leaks

- **Code Review Follow-ups from Story 1.2**:
  - Popup state persistence refactored to async/await (no impact on this story)
  - Task checkbox accuracy (manual tests marked correctly) - follow same pattern
  - All automated tests must pass before manual testing phase

- **Testing Patterns Established**:
  - Unit tests: Mock DOM APIs (attachShadow, appendChild, getComputedStyle)
  - Integration tests: Manual browser validation with test-page.html
  - Performance validation: Chrome DevTools (deferred to Story 1.4 for click-through)
  - Visual validation: DevTools Ruler/Measure tool for pixel-perfect alignment

- **Build Output**: Extension dist/ ready for load in Chrome Developer Mode - no build config changes needed

[Source: stories/1-2-element-discovery-highlighting.md#Dev-Agent-Record, stories/1-2-element-discovery-highlighting.md#Senior-Developer-Review]

### Testing Strategy

**Unit Tests (Vitest + JSDOM):**
- GridManager grid injection and removal
- Shadow DOM creation and structure validation
- Element positioning adjustment (static → relative)
- Single instance enforcement (previous grid cleanup)
- InspectorController lockElement/unlock orchestration
- ElementSelector click handling and callback invocation

**Manual Integration Tests:**
1. Load extension and activate
2. Hover and click element to lock grid
3. Verify 14px × 14px grid pattern visible
4. Use DevTools Ruler to measure square dimensions
5. Inspect shadow root structure and CSS
6. Test single instance: click second element, verify first grid removed
7. Test pointer-events passthrough: click buttons beneath grid
8. Test on element with position:static (verify temporary position:relative)
9. Test CSS isolation: Add conflicting page styles, verify grid unaffected
10. Test padding box alignment: Lock to element with padding/border

**Visual Validation Procedure:**
1. Create test element: `<div style="width: 280px; height: 140px; padding: 20px; border: 5px solid red;">Text</div>`
2. Lock grid to element
3. Use DevTools Measure tool:
   - Verify grid starts 5px inside border edge (at padding box origin)
   - Verify grid squares are exactly 14px × 14px
   - Count squares: Should be 20 columns × 10 rows within 280×140 padding box

### Constraints and Limitations

**Out of Scope for This Story:**
- Measurement mode (Alt key handling) - deferred to Epic 2
- Tooltip UI - deferred to Epic 2
- Scroll/resize event handling - deferred to Story 1.4
- Performance optimization for scroll sync - deferred to Story 1.4

**Known Limitations (Documented in Tech Spec):**
- **Z-Index Context**: Grid may be obscured by child elements with higher z-index in same stacking context [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Risks → RISK-2]
- **Layout Shift**: Temporary position:relative on static elements may cause minor layout shifts (reverted on unlock) [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Risks → RISK-1]
- **Transform Contexts**: Elements with CSS transforms create new stacking contexts that may affect grid visibility

**Accepted Trade-offs:**
- Direct Child Injection strategy prioritizes scroll performance over z-index flexibility
- Shadow DOM open mode for debuggability over encapsulation strictness
- 35% grid opacity balances visibility with minimal obstruction

### References

- [Tech Spec Epic 1: Foundation & Core Grid Injection](docs/sprint-artifacts/tech-spec-epic-1.md)
  - Section: Detailed Design → GridManager Module (API interface)
  - Section: Detailed Design → Shadow DOM Structure (DOM structure)
  - Section: Workflows → Element Discovery and Grid Lock (Steps 8-14)
  - Section: Data Models and Contracts → Grid Configuration (constants)
  - Section: Acceptance Criteria AC4 (grid pattern requirements)
  - Section: Acceptance Criteria AC5 (single instance rule)
  - Section: Risks → RISK-1 (layout shift), RISK-2 (z-index conflicts)
- [Architecture Document](docs/architecture.md)
  - Section 2: High-Level Architecture (Shadow DOM strategy)
  - Section 4.3: GridManager Module (inject/remove methods)
  - Section 5.1: Activation & Locking Flow (sequence diagram steps 8-14)
  - Section 6: Project Structure (module organization)
  - Section 8: Risks & Limitations (layout shift, z-index war)
- [PRD](docs/prd/6. Epic Details.md)
  - Section 6.1.3: Story 1.3 (user story and acceptance criteria)
- [Story 1.2](docs/sprint-artifacts/1-2-element-discovery-highlighting.md)
  - Dev Agent Record: Completion Notes (services to reuse)
  - Dev Notes: Architecture Alignment (integration points)
  - Learnings from Previous Story (patterns established)

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-3-grid-overlay-injection-the-lock.context.xml

### Agent Model Used

Claude Sonnet 4.5 (via GitHub Copilot)

### Debug Log References

**Implementation Approach (Tasks 1-10):**

1. Created `GridManager.js` module with full Shadow DOM lifecycle management
2. Implemented positioning adjustment logic to handle `position: static` elements
3. Generated 14px grid pattern using CSS `repeating-linear-gradient`
4. Enforced single instance constraint by removing previous grid before creating new one
5. Added click handling to `ElementSelector` with callback registration
6. Integrated `GridManager` into `InspectorController` with proper orchestration
7. Wrote comprehensive unit tests (84 tests total, all passing)
8. Fixed JSDOM compatibility issues (attachShadow mock, localStorage mock, event object mocking)

**Technical Decisions:**
- Used `attachShadow({mode: 'open'})` for debuggability per architecture spec
- Grid CSS uses two perpendicular `repeating-linear-gradient` functions combined in `background-image`
- Position adjustment stores original value and restores on cleanup
- Click handler only fires callback when clicked element matches currently highlighted element

### Completion Notes List

**Automated Tasks Completed (1-10) - 2025-11-22:**
- ✅ GridManager module created with inject/remove/isActive/getGridHost methods
- ✅ Shadow DOM structure implemented per spec (shadow host with open shadow root)
- ✅ Grid pattern CSS with 14px squares, cyan color (#00FFFF), 35% opacity
- ✅ Element positioning adjustment for static elements (temporary position:relative)
- ✅ Single instance enforcement (previous grid removed before new injection)
- ✅ ElementSelector click handling with callback registration
- ✅ InspectorController orchestration (lockElement disables hover, unlock re-enables)
- ✅ GridManager unit tests (24 tests covering inject, remove, isActive, getGridHost, CSS generation, single instance)
- ✅ InspectorController tests updated (lockElement, unlock integration with GridManager)
- ✅ ElementSelector tests updated (onElementSelected callback, click handling)
- ✅ All 84 unit tests passing (vitest + JSDOM)
- ✅ Extension builds successfully (`npm run build` produces valid dist/)

**Manual Testing Deliverables:**
- ✅ Updated `test-page.html` with Sections 6-9 for Story 1.3 tests
- ✅ Created comprehensive `MANUAL_TESTING.md` guide with 25 test procedures
- ✅ Test procedures cover all 8 ACs: AC1 (click), AC2 (shadow DOM), AC3 (pattern), AC4 (padding box), AC5 (single instance), AC6 (pointer-events), AC7 (position), AC8 (CSS isolation)

**Bug Fixes Applied (2025-11-22):**
- ✅ **Bug #1**: Z-index conflict with ruler extensions → Reduced Z_INDEX from 9999 to 999
- ✅ **Bug #2**: Grid persists after deactivation → Added `unlock()` call in `setActive(false)`
- ✅ **Bug #3**: Grid origin offset (left line hidden) → Fixed gradient pattern to start at 0px with colored line
- ✅ **Bug #4**: Grid overflow and misalignment → Fixed offset calculation to use positive border values, constrained to padding box
- ✅ **Bug #5**: Page reload loses grid → Added localStorage persistence with XPath tracking and state restoration
- ✅ **Bug #6**: Test page box-sizing incorrect → Updated Sections 6-7 to use `border-box`
- ✅ **Issue #7**: Tests hang in watch mode → Changed test script to `vitest run` (one-shot execution)

**Grid Alignment Fix Details:**
- **Problem**: Negative offset + `inset: 0` caused grid to overflow beyond border edge
- **Root Cause**: Incorrect offset direction - used negative (outward) instead of positive (inward)
- **Solution**: 
  - Position shadow host at `top/left/right/bottom` = border widths
  - Grid now correctly aligns with padding box top-left corner (AC4)
  - Constrained to padding box dimensions (no overflow)
  
**State Persistence Implementation:**
- Active state saved to `localStorage['wp-rhythm-inspector-active']`
- Locked element tracked via XPath in `localStorage['wp-rhythm-inspector-locked-xpath']`
- `restoreState()` method runs on `init()` to recover grid after page reload
- XPath lookup handles dynamic elements robustly (ID-based when available)

**Next Steps (Tasks 11-13 - Manual Testing Required):**
- ⏸️ Load extension in Chrome Developer Mode
- ⏸️ Execute Tests 11-25 from MANUAL_TESTING.md guide
- ⏸️ Verify grid visual accuracy (14px squares, padding box alignment)
- ⏸️ Validate CSS isolation (shadow DOM inspector checks)
- ⏸️ Confirm pointer-events passthrough (button clicks beneath grid)
- ⏸️ Verify single instance enforcement (visual multi-element test)
- ⏸️ Test page reload persistence (lock grid → reload → verify restoration)
- ⏸️ Document results in MANUAL_TESTING.md template

**Blocker:** AI agent cannot execute browser-based manual tests. Human tester (BMad) must complete Tasks 11-13 before story can be marked "review".

### File List

**New Files Created:**
- src/content/modules/GridManager.js (GridManager class with Shadow DOM lifecycle)
- tests/content/modules/GridManager.spec.js (24 unit tests for GridManager)
- tests/setup.js (localStorage mock for JSDOM environment)

**Modified Files:**
- src/content/modules/InspectorController.js (Added GridManager integration, lockElement/unlock implementation)
- src/content/modules/ElementSelector.js (Added click handling, onElementSelected callback)
- tests/content/modules/InspectorController.spec.js (Added GridManager integration tests)
- tests/content/modules/ElementSelector.spec.js (Added click handling tests)
- vite.config.js (Added setupFiles configuration for test environment)
- docs/sprint-artifacts/sprint-status.yaml (Updated story status: ready-for-dev → in-progress)
- docs/sprint-artifacts/1-3-grid-overlay-injection-the-lock.md (Marked Tasks 1-10 complete)
