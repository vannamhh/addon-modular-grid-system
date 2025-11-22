# Epic Technical Specification: Foundation & Core Grid Injection

Date: 22-11-2025
Author: BMad
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the foundational architecture for the WP 14px Rhythm Inspector Chrome Extension. This epic delivers the core mechanism for discovering and selecting DOM elements on any webpage, rendering a precisely aligned 14px grid overlay pinned to the selected element's padding box, and ensuring transparent click-through interaction. The implementation follows Chrome Extension Manifest V3 standards using Vite as the build tool and Vanilla JavaScript for minimal runtime overhead. This epic transforms the conceptual "Local Square Grid" approach into a working prototype, eliminating the "Global Grid Fallacy" by anchoring the grid directly to the target element rather than the viewport.

## Objectives and Scope

**In Scope:**
- Complete Chrome Extension scaffolding with Manifest V3 architecture
- Vite-based build system with hot module reload for development
- Content script injection and initialization on all web pages
- Element discovery via hover with visual highlight feedback (blue outline)
- Single-click element selection to "lock" the grid to that element
- 14px × 14px grid pattern generation using Shadow DOM for CSS isolation
- Grid origin (0,0) aligned precisely to target element's padding box top-left corner
- Pointer-events passthrough enabling full interaction with underlying page elements
- Single instance constraint: only one grid visible at a time

**Out of Scope:**
- Custom grid size configuration (hardcoded to 14px for MVP)
- Measurement/delta calculation (deferred to Epic 2)
- Tooltip UI (deferred to Epic 2)
- Performance optimization for scroll/resize events (deferred to Epic 2)
- Packaging and store assets (deferred to Epic 2)
- Mobile browser support
- Backend services or external API integration

## System Architecture Alignment

This epic implements the Content Script layer and DOM injection strategy defined in the architecture document. The solution leverages the "Direct Child Injection" approach where the grid overlay becomes a direct child of the target element with `position: absolute; inset: 0`, ensuring automatic scroll synchronization without manual viewport tracking. All UI components are rendered within an open Shadow Root attached to a shadow host div to guarantee complete CSS isolation from the host page. The modular structure separates concerns across three primary modules: `ElementSelector.js` for hover/click handling, `GridManager.js` for Shadow DOM lifecycle and grid rendering, and `InspectorController.js` as the orchestration singleton. The implementation uses `requestAnimationFrame` for throttled mousemove handling to maintain 60fps performance during element discovery. This epic establishes the architectural foundation upon which Epic 2's measurement features will be built without requiring structural changes.

## Detailed Design

### Services and Modules

| Module | Responsibility | Key Inputs | Key Outputs | Owner |
|--------|---------------|------------|-------------|-------|
| **InspectorController** | Central orchestrator singleton; manages global state (active/inactive, locked element); coordinates lifecycle of child modules | Messages from popup/background, user activation events | State updates to ElementSelector, GridManager | Content Script |
| **ElementSelector** | Manages element discovery and highlighting; handles mousemove events with rAF throttling; captures click events for element selection | mousemove, click events; DOM element references | Highlighted element outline; selected element reference to GridManager | Content Script |
| **GridManager** | Manages Shadow DOM lifecycle for grid overlay; handles injection/removal of grid pattern; adjusts element positioning if static | Target HTMLElement, grid configuration (size=14px) | Shadow host with grid pattern rendered; cleanup notifications | Content Script |
| **Background Service Worker** | Minimal role: handles extension installation, manages extension lifecycle events | Chrome runtime events (onInstalled) | Initialization messages to content scripts | Background Context |
| **Popup UI** | Optional simple toggle interface; sends activation messages to content script | User toggle input | Chrome message API calls to content script | Popup Context |

### Data Models and Contracts

**Element Selection State**
```javascript
{
  isActive: boolean,           // Global extension active state
  lockedElement: HTMLElement | null,  // Currently selected element
  hoveredElement: HTMLElement | null  // Element under cursor
}
```

**Grid Configuration**
```javascript
{
  GRID_SIZE: 14,              // Fixed grid size in pixels (constant)
  gridColor: '#00FFFF',       // Cyan primary color
  gridOpacity: 0.35,          // 35% opacity for visibility
  lineWidth: 1,               // 1px stroke width
  zIndex: 2147483647          // Maximum z-index for overlay
}
```

**Shadow DOM Structure**
```html
<div id="wp-rhythm-host" style="position: absolute; inset: 0; pointer-events: none; z-index: 9999;">
  #shadow-root (open)
    <style>
      .grid-pattern {
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
          0deg, transparent, transparent 13px, #00FFFF 13px, #00FFFF 14px
        ),
        repeating-linear-gradient(
          90deg, transparent, transparent 13px, #00FFFF 13px, #00FFFF 14px
        );
        opacity: 0.35;
        pointer-events: none;
      }
    </style>
    <div class="grid-pattern"></div>
</div>
```

**Element Highlight Style**
```javascript
{
  outline: '2px solid #0080FF',  // Blue outline for hover
  outlineOffset: '0px',
  pointerEvents: 'auto'          // Element remains interactive
}
```

### APIs and Interfaces

**Chrome Extension Messaging API**

```javascript
// Popup → Content Script: Toggle extension
chrome.tabs.sendMessage(tabId, {
  type: 'TOGGLE_INSPECTOR',
  payload: { active: boolean }
});

// Content Script → Background: State update
chrome.runtime.sendMessage({
  type: 'STATE_CHANGED',
  payload: { isActive: boolean, elementLocked: boolean }
});
```

**InspectorController Public Interface**

```javascript
class InspectorController {
  // Initialize all modules and event listeners
  init(): void
  
  // Activate/deactivate extension
  setActive(active: boolean): void
  
  // Lock grid to specific element
  lockElement(element: HTMLElement): void
  
  // Remove current grid and unlock
  unlock(): void
  
  // Cleanup all resources
  destroy(): void
}
```

**ElementSelector Public Interface**

```javascript
class ElementSelector {
  // Start listening for hover events
  enable(): void
  
  // Stop listening and clear highlights
  disable(): void
  
  // Manually highlight specific element
  highlightElement(element: HTMLElement): void
  
  // Remove all highlights
  clearHighlight(): void
  
  // Register callback for element selection
  onElementSelected(callback: (element: HTMLElement) => void): void
}
```

**GridManager Public Interface**

```javascript
class GridManager {
  // Inject grid overlay into target element
  inject(targetElement: HTMLElement): void
  
  // Remove grid and cleanup Shadow DOM
  remove(): void
  
  // Check if grid is currently active
  isActive(): boolean
  
  // Get reference to current grid host
  getGridHost(): HTMLElement | null
}
```

### Workflows and Sequencing

**Workflow 1: Extension Initialization**
1. User installs extension → Background service worker receives `chrome.runtime.onInstalled`
2. Background registers content script to run on all tabs (`matches: ["<all_urls>"]`)
3. On page load, content script executes → `InspectorController.init()` called
4. Controller initializes `ElementSelector` and `GridManager` modules
5. Console log: "WP Inspector Ready" confirms successful initialization
6. Extension waits in inactive state until user activates via popup/toolbar

**Workflow 2: Element Discovery and Grid Lock**
1. User activates extension → Popup sends `TOGGLE_INSPECTOR` message
2. `InspectorController.setActive(true)` → enables `ElementSelector`
3. `ElementSelector.enable()` registers throttled mousemove listener (rAF)
4. User hovers over DOM element → `mousemove` event fires
5. `ElementSelector` applies blue outline to `event.target`
6. User clicks element → `click` event captured
7. `ElementSelector.onElementSelected` callback fires → passes element to Controller
8. `InspectorController.lockElement(element)` called
9. Controller checks if previous grid exists → calls `GridManager.remove()` if needed (single instance)
10. Controller calls `GridManager.inject(element)`
11. `GridManager` checks element positioning:
    - If `position: static` → temporarily adds class to set `position: relative`
12. `GridManager` creates shadow host div with `position: absolute; inset: 0`
13. Attaches open shadow root and injects grid pattern CSS
14. Grid becomes visible, perfectly aligned to element's padding box
15. `ElementSelector.disable()` stops hover detection (locked state)

**Workflow 3: Grid Unlock and Cleanup**
1. User clicks extension icon again or presses escape key
2. Controller receives deactivation signal
3. `InspectorController.unlock()` called
4. `GridManager.remove()` removes shadow host from DOM
5. Reverts any position style changes on target element
6. `ElementSelector.enable()` re-enables hover detection
7. Extension returns to discovery mode

**Workflow 4: Pointer Events Passthrough**
1. Grid overlay rendered with `pointer-events: none` on shadow host
2. User attempts to click button beneath grid
3. Browser ignores shadow host div, passes event to underlying element
4. Button click handler executes normally
5. User can interact with forms, links, select text without grid interference
6. Right-click context menu (Inspect Element) works on actual page elements

## Non-Functional Requirements

### Performance

**Target: 60fps during hover interactions**
- All `mousemove` event handlers must be throttled using `requestAnimationFrame` to prevent frame drops
- Element highlight application should complete within 16ms per frame
- Shadow DOM creation and grid injection must complete within 100ms from click event
- Memory footprint: Shadow DOM tree should not exceed 50KB per grid instance
- Event listener cleanup must be comprehensive to prevent memory leaks when switching between elements
- No continuous polling or interval timers; all updates driven by discrete events

**Metrics Referenced:**
- PRD NFR1: "mousemove event handlers must be throttled using requestAnimationFrame"
- Architecture Section 2: "Performance (60fps): Ensure smooth scrolling while the grid is active"

### Security

**Content Security Policy Compliance**
- Extension must declare minimal permissions in manifest: only `activeTab` permission required (no broad `<all_urls>` access in manifest permissions)
- No inline scripts or `eval()` usage; all JavaScript must be externalized for CSP compliance
- Shadow DOM must use open mode (not closed) for debuggability but provides sufficient CSS isolation
- No external network requests; all resources bundled within extension package
- No localStorage or cookie access; state maintained only in memory during session

**Data Handling**
- Extension does not collect, transmit, or store any user data or webpage content
- No telemetry or analytics in MVP scope
- Element references held in memory only during active session; cleared on unlock/disable

**Threat Model:**
- Primary risk: Malicious webpage CSS attempting to style extension UI → Mitigated by Shadow DOM isolation
- Secondary risk: Extension CSS affecting host page → Mitigated by scoped styles within shadow root only

### Reliability/Availability

**Target: 99.9% operational stability during active use**

**Error Handling:**
- Grid injection must gracefully fail if target element is removed from DOM (mutation observer detecting element removal)
- If Shadow DOM attachment fails (rare browser API error), log error to console and display user-facing notification
- Element positioning calculations must handle edge cases: fixed positioning, transform contexts, iframe boundaries

**Degradation Behavior:**
- If rAF not available (unlikely in modern Chrome), fallback to debounced setTimeout with 16ms delay
- If Shadow DOM not supported (Chrome 53+), display compatibility warning and disable extension gracefully

**Recovery:**
- Extension state resets on page navigation (no persistence required for MVP)
- Manual unlock via popup button always available as escape hatch if grid becomes stuck
- Service worker remains lightweight to avoid background suspension issues in Manifest V3

**Availability Notes:**
- Desktop Chrome/Chromium only; mobile browsers explicitly out of scope per PRD NFR4
- Extension remains dormant (zero CPU) when inactive; only activates on user trigger

### Observability

**Logging Requirements:**
- Console log on initialization: `"WP Inspector Ready"` (per Story 1.1 AC4)
- Console error logs for critical failures: Shadow DOM attachment failure, element positioning errors
- Warning logs for edge cases: Target element with position:static requiring adjustment

**Debug Signals:**
- Shadow root must be inspectable via Chrome DevTools (open mode)
- Grid host div must have `id="wp-rhythm-host"` for easy DOM inspection
- CSS class names must be semantic: `.grid-pattern`, `.highlight-outline`

**Metrics to Expose (for future telemetry, not implemented in Epic 1):**
- Count of grid injections per session
- Average time between element hover and click (user decision latency)
- Element positioning adjustments (static → relative conversions)

**Tracing:**
- No distributed tracing required (client-side only)
- Event flow traceable via console logs in development mode
- Use Chrome DevTools Performance profiler to validate 60fps target

## Dependencies and Integrations

**Build & Development Dependencies**

| Dependency | Version | Purpose | Notes |
|------------|---------|---------|-------|
| **vite** | ^5.0.0 | Build tool and bundler | Handles module resolution, minification, HMR |
| **@crxjs/vite-plugin** | ^2.0.0 | Chrome Extension plugin for Vite | Automates manifest generation, content script hot reload |
| **vitest** | ^1.0.0 | Unit testing framework | Tests for coordinate calculation logic |
| **jsdom** | ^23.0.0 | DOM environment for tests | Simulates browser DOM in Node.js test environment |

**Runtime Dependencies**

| Dependency | Version | Purpose | Notes |
|------------|---------|---------|-------|
| None | N/A | Pure Vanilla JS | No runtime libraries; all code native browser APIs |

**Browser APIs & Integrations**

| API | Version/Spec | Integration Point | Constraints |
|-----|--------------|-------------------|-------------|
| **Chrome Extensions Manifest V3** | Chrome 88+ | Background service worker, content scripts, messaging | Mandatory for Chrome Web Store |
| **Shadow DOM (attachShadow)** | Web Components V1 | Grid overlay CSS isolation | Chrome 53+, open mode required |
| **requestAnimationFrame** | Standard | Throttle mousemove events | Fallback to setTimeout if unavailable |
| **getBoundingClientRect** | CSSOM View Module | Element position/size calculations | Returns live geometry; must recalc on resize |
| **Chrome Tabs API** | Manifest V3 | Popup → Content Script messaging | Requires `activeTab` permission |
| **Chrome Runtime API** | Manifest V3 | Extension lifecycle, message passing | Standard bidirectional messaging |

**External Service Integrations**

None. This epic is entirely client-side with no external API calls, CDN dependencies, or third-party services.

**Manifest Permissions Required**

```json
{
  "permissions": ["activeTab"],
  "host_permissions": []
}
```

- **activeTab**: Allows content script injection on user-activated tabs only (no broad surveillance)
- No host_permissions needed; extension waits for user interaction before activating

**Development Workflow Integrations**

- **ESLint** (optional): Code quality linting with `eslint-plugin-chrome-extension`
- **Chrome DevTools**: Manual testing and debugging; Performance profiler for 60fps validation
- **Chrome Extension Developer Mode**: Load unpacked extension for testing

**Version Constraints**

- **Minimum Chrome Version**: 88 (Manifest V3 support)
- **Node.js Version** (development): 18+ (for Vite compatibility)
- **NPM Version**: 8+ (workspace support if future mono-repo expansion)

## Acceptance Criteria (Authoritative)

**AC1: Build System Operational**
1. Running `npm run build` generates a `dist/` folder containing valid `manifest.json` (Manifest V3 schema)
2. `dist/` contains bundled JavaScript files for background service worker and content script
3. Extension loads in Chrome Developer Mode (chrome://extensions) without console errors
4. Popup or toolbar icon is functional and clickable

**AC2: Content Script Initialization**
1. Content script automatically injects on any webpage after extension installation
2. Console displays "WP Inspector Ready" message on page load
3. No visible changes to page until user activates extension

**AC3: Element Hover Highlighting**
1. When extension is active, hovering over any DOM element displays a 2px blue outline (`#0080FF`)
2. Moving mouse away immediately removes the outline
3. Hovering rapidly over nested elements shows smooth transitions without frame drops (60fps validated via DevTools)
4. Hidden elements (`display: none`, `visibility: hidden`) and zero-dimension elements are ignored

**AC4: Grid Lock on Click**
1. Clicking a highlighted element triggers grid generation
2. Grid is rendered inside an open Shadow DOM attached to a shadow host div
3. Shadow host is a direct child of the clicked element with `position: absolute; inset: 0`
4. Grid pattern consists of 14px × 14px squares using CSS repeating gradients
5. Grid origin (0,0) aligns precisely with top-left corner of element's padding box (not border or margin)

**AC5: Single Instance Constraint**
1. If a grid already exists on another element, clicking a new element removes the old grid before creating the new one
2. Only one grid is visible on the page at any time

**AC6: Click-Through Transparency**
1. Shadow host div has CSS property `pointer-events: none`
2. Users can click buttons, links, and form inputs beneath the grid without interference
3. Text selection works normally beneath the grid
4. Right-clicking beneath the grid opens context menu on the underlying page element (not the grid)

**AC7: Element Positioning Adjustment**
1. If target element has `position: static`, GridManager temporarily applies `position: relative` via CSS class
2. Original positioning is restored when grid is removed
3. Adjustment occurs within 100ms of grid injection

**AC8: Shadow DOM CSS Isolation**
1. Grid styles (colors, opacity, dimensions) are unaffected by host page CSS
2. Host page styles remain unchanged by grid injection
3. Shadow root is inspectable in Chrome DevTools (open mode)

## Traceability Mapping

| AC # | Spec Section | Component(s) | API(s) / Interface(s) | Test Idea |
|------|--------------|--------------|----------------------|-----------|
| AC1 | Dependencies → Build & Development | Vite, @crxjs/vite-plugin | Vite build pipeline, manifest.json | Run `npm run build` and validate dist/ structure; load extension in chrome://extensions and verify no errors |
| AC2 | Detailed Design → InspectorController | InspectorController.init() | Chrome content script injection | Load extension, navigate to test page, check console for "WP Inspector Ready" log |
| AC3 | Detailed Design → ElementSelector | ElementSelector.enable(), highlightElement() | mousemove event, getBoundingClientRect() | Activate extension, hover over elements; use DevTools Performance to validate 60fps; test hidden/zero-size elements ignored |
| AC4 | Detailed Design → GridManager, Shadow DOM Structure | GridManager.inject() | attachShadow(), getBoundingClientRect() | Click element, inspect Shadow DOM in DevTools; measure grid alignment to padding box with ruler tool; verify 14px squares |
| AC5 | Workflows → Element Discovery and Grid Lock (step 9) | InspectorController.lockElement(), GridManager.remove() | GridManager.isActive() | Create grid on element A, click element B, verify only one grid exists and it's on element B |
| AC6 | Detailed Design → Shadow DOM Structure, Workflows → Pointer Events Passthrough | GridManager shadow host CSS | pointer-events: none CSS property | Create grid over button, click button and verify handler fires; select text beneath grid; right-click and verify context menu on page element |
| AC7 | Detailed Design → GridManager, Workflows → Element Discovery step 11 | GridManager.inject() positioning logic | getComputedStyle(element).position | Create grid on element with position:static; inspect element in DevTools and verify temporary position:relative applied; remove grid and verify original restored |
| AC8 | System Architecture → Shadow DOM, NFR Security | Shadow host with open shadow root | attachShadow({mode: 'open'}) | Inject grid; add conflicting CSS to host page (e.g., .grid-pattern styles); verify grid appearance unchanged; inspect shadow root in DevTools |

## Risks, Assumptions, Open Questions

**RISK-1: Layout Shift from Position Adjustment**
- **Severity:** Medium
- **Description:** Changing `position: static` to `position: relative` on the target element may cause unexpected layout shifts, especially if the element has no explicit `top/left/right/bottom` values and child elements rely on default positioning
- **Mitigation:** Apply position change only when grid is active; revert immediately on unlock; add visual regression testing on common WordPress component structures (headers, sidebars, nested flexbox layouts)
- **Contingency:** If layout shifts are severe, alternative approach is to inject shadow host as a sibling with absolute positioning relative to viewport, but this requires continuous scroll tracking (deferred complexity)

**RISK-2: Z-Index Stacking Context Conflicts**
- **Severity:** Low-Medium
- **Description:** Even with `z-index: 2147483647` on shadow host, the grid may be obscured by child elements with higher z-index within the same stacking context, or by elements that create new stacking contexts (e.g., position:fixed, transform)
- **Mitigation:** Accept this as documented limitation of "Direct Child Injection" strategy; grid visibility depends on target element's stacking context
- **Contingency:** Provide user documentation on selecting appropriate container elements (e.g., avoid locking to elements with complex transformed children)

**RISK-3: Performance Degradation on Complex Pages**
- **Severity:** Medium
- **Description:** Pages with 10,000+ DOM nodes may experience lag during hover detection due to event propagation and getBoundingClientRect() calls
- **Mitigation:** Use rAF throttling (already planned); consider adding debounce delay (50ms) on mousemove in addition to rAF for extremely heavy pages
- **Contingency:** Provide toggle to disable hover highlighting after lock (manual re-enable if needed)

**ASSUMPTION-1: Target Browser Version**
- Chrome 88+ with Manifest V3 support is available
- Shadow DOM V1 (attachShadow) is universally supported in target browsers
- No need to support legacy Edge, Firefox, Safari in MVP

**ASSUMPTION-2: Target Element Structure**
- Target elements have measurable dimensions (not display:none or 0x0 px)
- Padding box calculations via getBoundingClientRect() are accurate and consistent
- Element is attached to DOM during grid lifecycle (not dynamically removed)

**ASSUMPTION-3: User Interaction Model**
- Users understand hover-then-click paradigm without onboarding tutorial
- Single grid instance suffices; no need for multi-grid comparison mode
- Alt key is available for future measurement feature (no conflicts with OS shortcuts)

**QUESTION-1: Icon and Popup Design**
- Final icon design (16, 32, 48, 128px) to be provided by designer
- Popup UI scope: Simple on/off toggle, or include settings (grid color picker)? → Answer: Simple toggle only for Epic 1 MVP

**QUESTION-2: Grid Visual Style Preferences**
- Cyan (#00FFFF) vs Magenta (#FF00FF) as default color? → Answer: Cyan primary, consider magenta as future user preference
- Opacity 30% vs 50%? → Answer: 35% as middle ground for visibility vs obstruction

**QUESTION-3: Extension Activation State Persistence**
- Should extension remember active state across page reloads? → Answer: No persistence in Epic 1; reset to inactive on navigation for simplicity

## Test Strategy Summary

**Unit Testing (Vitest + JSDOM)**
- **Target Coverage:** 80% code coverage for utility functions and calculation logic
- **Key Test Suites:**
  - `ElementSelector.spec.js`: Mousemove throttling, highlight application/removal, element filtering (hidden/zero-size)
  - `GridManager.spec.js`: Shadow DOM creation, positioning logic, static→relative conversion, cleanup
  - `InspectorController.spec.js`: State management, module coordination, single instance enforcement
- **Edge Cases:**
  - Element removed from DOM while grid is active
  - Rapid hover over 100+ nested elements
  - Grid injection on elements with position:fixed, transform, or iframe contexts

**Integration Testing (Manual)**
- **Test Environment:** Real Chrome browser with loaded extension
- **Test Pages:**
  - Blank HTML page with single div (baseline)
  - WordPress Twenty Twenty-Three theme homepage (realistic complexity)
  - Page with 5,000+ DOM nodes (stress test)
  - Page with fixed headers, modals, overlays (z-index conflicts)
- **Scenarios:**
  - Install extension → verify console log
  - Activate → hover → click → verify grid appears
  - Click second element → verify first grid removed
  - Click buttons/links beneath grid → verify passthrough
  - Inspect Shadow DOM → verify structure and CSS isolation

**Performance Testing**
- **Tool:** Chrome DevTools Performance Profiler
- **Metrics:**
  - Frame rate during hover (target: 60fps)
  - Grid injection time (target: <100ms)
  - Memory usage per grid instance (target: <50KB)
- **Procedure:**
  1. Start profiling
  2. Activate extension and hover over 20 elements rapidly
  3. Lock grid to element
  4. Stop profiling and analyze frame drops, long tasks

**Regression Testing**
- **Scope:** Visual regression on common WordPress component layouts
- **Tool:** Manual screenshots comparison (automated visual regression deferred to Epic 2)
- **Test Cases:**
  - Grid on header with logo and nav menu
  - Grid on sidebar widget area
  - Grid on main content area with nested blocks

**Acceptance Testing**
- **Method:** PM/Designer validation against AC1-AC8
- **Checklist:**
  - [ ] Build produces valid dist/
  - [ ] Extension loads without errors
  - [ ] Console log appears on page load
  - [ ] Hover shows blue outline, click locks grid
  - [ ] Only one grid at a time
  - [ ] Click-through works on buttons/links/text
  - [ ] Grid aligns to padding box origin
  - [ ] Shadow DOM isolates styles

**Test Exclusions (Out of Scope for Epic 1)**
- E2E automation (Cypress/Selenium)
- Cross-browser testing (Firefox, Safari)
- Mobile responsive testing
- Accessibility testing (WCAG AA audit deferred)
- Load testing (concurrent users N/A for client-side extension)

---

## Post-Review Follow-ups

### Story 1.1 Code Review (2025-11-22)

**Action Items from Senior Developer Review:**

1. **[Medium] Content Script Message Listener** (Story 1.2 scope)
   - Implement `chrome.runtime.onMessage` listener in content script to handle `TOGGLE_INSPECTOR` messages from popup
   - Reference: Story 1.1, file: `src/content/index.js:11-13`
   - Status: Planned for Story 1.2 implementation
   
2. **[Medium] Popup State Persistence Race Condition**
   - Refactor popup state persistence to use Promise-based `chrome.storage.local.get()` API
   - Current callback pattern may lose state if popup closes immediately after toggle
   - Reference: Story 1.1, file: `src/popup/index.js:29-34`
   - Status: Open

3. **[Low] README Features List Accuracy**
   - Update README to reflect actual Story 1.1 deliverables only
   - Currently lists Story 1.2+ features as complete
   - Reference: Story 1.1, file: `README.md:12-15`
   - Status: Open

4. **[Low] Automated Build Validation**
   - Add npm script to validate `dist/manifest.json` conforms to Manifest V3 schema post-build
   - Prevents silent build failures
   - Status: Enhancement for future consideration

5. **[Low] Production Icon Assets**
   - Replace 1x1 transparent PNG placeholders with branded icons
   - Deferred to Epic 2 packaging phase
   - Status: Tracked in Epic 2 backlog
