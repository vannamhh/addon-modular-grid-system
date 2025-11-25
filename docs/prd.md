# **WP 14px Rhythm Inspector Product Requirements Document (PRD)**

## **1\. Goals and Background Context**

### **1.1 Goals**

* **Rhythm Precision Assurance:** Provide WordPress developers with the ability to check 14px grid alignment (vertical and horizontal) on specific DOM elements, effectively resolving pixel phase misalignment issues.  
* **Non-intrusive UX:** Implement a grid overlay that allows full "click-through" interaction, ensuring users can inspect the grid while simultaneously manipulating DevTools or interacting with the web interface without obstruction.  
* **Smart Measurement:** Provide an on-demand pixel deviation measurement tool (delta) to quickly detect minor misalignment errors (1-2px).  
* **Workflow Optimization:** Eliminate visual distraction by rendering the grid only on the selected element (Active Container) rather than the entire viewport.

### **1.2 Background Context**

In modern web interface development, especially within the WordPress ecosystem, components are often designed as nested modules. A significant pain point is the "Global Grid Fallacy": a global 14px grid anchored to the \<body\> often misaligns when applied to a child component with odd coordinates (e.g., a top offset of 13px), rendering "pixel-perfect" checks impossible.

Furthermore, existing tools often hijack mouse events (blocking interactions), forcing developers to constantly toggle the tool on and off to interact with the underlying elements. "WP 14px Rhythm Inspector" is conceived as a lightweight Chrome Extension utilizing a "Local Square Grid" mechanism anchored directly to the element's padding-box, helping developers maintain design rhythm without disrupting their workflow.

### **1.3 Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-11-21 | 0.1 | Initial document creation from Project Brief | John (PM) |
| 2025-11-21 | 0.2 | Added Requirements (Functional & Non-functional) | John (PM) |
| 2025-11-21 | 0.3 | Added User Interface Design Goals | John (PM) |
| 2025-11-21 | 0.4 | Added Technical Assumptions | John (PM) |
| 2025-11-21 | 0.5 | Added Epic List | John (PM) |
| 2025-11-21 | 0.6 | Added Epic 1 Details | John (PM) |
| 2025-11-21 | 0.7 | Added Epic 2 Details | John (PM) |
| 2025-11-21 | 1.0 | Completed Checklist & Next Steps | John (PM) |
| 2025-11-21 | 1.1 | Translated to Standard English | John (PM) |

## **2\. Requirements**

### **2.1 Functional Requirements**

* **FR1 \- Targeted Activation:** The user activates the extension and hovers to highlight DOM elements. Upon clicking an element, a 14px grid is "pinned" to that element (Active Container), resetting the origin coordinates (0,0) to the top-left corner of the element's padding-box.  
* **FR2 \- Grid Visualization:** The grid must be rendered as fixed 14px x 14px squares. Lines should be 1px wide, using a high-contrast color (Cyan/Magenta) with approximately 30-50% opacity. The grid must scroll naturally with the element's content (absolute positioning relative to the container).  
* **FR3 \- Transparent Interaction:** The grid overlay container must possess the CSS property pointer-events: none. All clicks, text selection, or drag operations must pass through the grid to the underlying web element.  


### **2.2 Non-Functional Requirements**

* **NFR1 \- Performance:** Measurement logic must remain idle by default. When active (Alt key held), mousemove event handlers must be throttled using requestAnimationFrame to ensure optimal frame rates.  
* **NFR2 \- Isolation:** Extension UI components (tooltips, toggle buttons) must be rendered within a **Shadow DOM** to prevent CSS bleeding (style conflicts) from the host page.  
* **NFR3 \- Tech Stack Constraints:** Utilize **Vanilla JavaScript** (no heavy frameworks) to minimize the injection footprint. Adhere to **Chrome Extension Manifest V3** architecture.  
* **NFR4 \- Platform Scope:** Support Desktop Chrome/Chromium browsers only. Mobile support is out of scope for the MVP.  
* **NFR5 \- Configurable Unit:** Grid size should be configurable (default 14px). UI for custom sizing will be provided in Epic 3.

## **3\. User Interface Design Goals**

### **3.1 Overall UX Vision**

Minimalist, Utilitarian, "Invisible". The user interface must not compete for attention with the web content. It operates as a technical "heads-up display" (HUD) layer that appears only when necessary.

### **3.2 Key Interaction Paradigms**

* **Activation:** Click the Extension icon on the browser toolbar.  
* **Discovery:** Hover to see a **Blue Outline** around available DOM elements.  
* **Locking:** Left-click to pin the grid to the element. Any previously active grid disappears (Single Instance rule).  
* **Measurement:** Hold the Alt key to trigger temporary measurement mode. Release to exit.

### **3.3 Core Screens and Views**

* **Selection State:** Light Blue Outline surrounding the hovered element.  
* **Active Grid Overlay:** 14x14px Grid (Cyan/Magenta, 30% opacity) overlaying the selected element.  
* **Measurement Tooltip:** A small floating information box displaying delta coordinates (e.g., x: \+2px, y: 0\) appearing next to the cursor while Alt is held.

### **3.4 Accessibility**

* **Standard:** WCAG AA (for contrast of grid lines and tooltip text).  
* **Color Blindness:** Support default high-contrast colors (Cyan/Magenta) that are visible on both light and dark backgrounds.

### **3.5 Branding**

* **Style:** "Technical Blueprint" aesthetic.  
* **Primary Colors:** Cyan (\#00FFFF) or Magenta (\#FF00FF) to ensure visibility on the majority of web designs.

### **3.6 Target Device and Platforms**

* **Desktop Chrome/Chromium Only:** Due to the nature of development tools and hover/shortcut interactions, the MVP supports Desktop only.

## **4\. Technical Assumptions**

### **4.1 Repository Structure**

* **Single Repo (Monorepo style):** Small project containing the entire extension source code.  
  * /src: Main source code (Background scripts, Content scripts, Popup UI).  
  * /assets: Icons, images.  
  * /dist or /build: Output after build (using bundler).

### **4.2 Service Architecture**

* **Client-side Only:** The extension operates independently within the user's browser. No backend server, database, or external API calls (except potential future telemetry, excluded from MVP).  
* **Communication:** Utilize Chrome Messaging API for communication between popup (if any), background service worker (state management), and content script (DOM/Grid manipulation).

### **4.3 Testing Requirements**

* **Unit Testing:** Mandatory for calculation logic functions (measurement logic). Use **Jest** or **Vitest**.  
* **Manual Testing:** Due to the highly visual nature, manual testing on actual WordPress sites is paramount.  
* **No E2E Automation (MVP):** Cypress/Selenium setup is deferred for this phase to save time.

### **4.4 Additional Technical Assumptions**

* **Build Tool:** Use **Vite** to bundle code. Although using Vanilla JS, Vite improves Developer Experience (DX) with modules, hot-reload, and production file optimization.  
* **Manifest Version:** Mandatory **Manifest V3**.  
* **Permissions:** Minimize permissions; request only activeTab to ensure privacy and facilitate Store approval.

## **5\. Epic List**

### **5.1 Epic 1: Foundation & Core Grid Injection**

**Goal:** Establish the project foundation (Vite \+ Manifest V3) and deliver core functionality: extension activation, element selection, and basic 14px grid rendering.

### **5.2 Epic 2: Core Stabilization & Launch Prep**

**Goal:** Optimize application performance, handle edge cases, and finalize necessary assets for the final product packaging to ensure a stable v1.0 launch.

### **5.3 Epic 3: Configuration & Workflow Optimization**

**Goal:** Enhance user workflow with global shortcuts and provide a UI for customizing grid settings (size, color) with persistence.

## **6\. Epic Details**

### **6.1 Epic 1: Foundation & Core Grid Injection**

**Expanded Goal:** Establish a functional Chrome Extension architecture (Manifest V3), implement the mechanism for discovering and selecting target DOM elements, and display a 14px grid overlay (CSS/SVG) accurately pinned to the element without blocking user interaction.

#### **6.1.1 Story 1.1: Project Scaffolding & Manifest V3 Setup**

* **User Story:** As a Developer, I want a functional extension build system using Vite and Manifest V3 so that I can develop the extension according to modern standards.  
* **Acceptance Criteria:**  
  1. npm run build command generates a dist folder containing a valid manifest.json (V3) and bundled JS files for background and content scripts.  
  2. The extension loads into Chrome Developer Mode (Load Unpacked) without errors.  
  3. The extension has a simple Popup or Toolbar Icon that functions.  
  4. Content Script runs on any web page and logs "WP Inspector Ready" to the console.

#### **6.1.2 Story 1.2: Element Discovery & Highlighting**

* **User Story:** As a User, I want to see a highlight effect when hovering over page elements so that I know exactly which element will be selected for the grid.  
* **Acceptance Criteria:**  
  1. Hovering over a DOM element displays a **Blue Outline** around it.  
  2. Moving the mouse away removes the blue outline.  
  3. Performance must be smooth without lag when moving quickly over nested elements (requires throttling/debouncing or requestAnimationFrame).  
  4. Only visible elements with real dimensions are highlighted (ignore hidden or 0x0 px elements).

#### **6.1.3 Story 1.3: Grid Overlay Injection (The "Lock")**

* **User Story:** As a User, I want to click on a highlighted element to "pin" (lock) the 14px grid to it so that I can inspect alignment.  
* **Acceptance Criteria:**  
  1. A click event on a highlighted element triggers grid generation.  
  2. The grid is rendered inside a **Shadow DOM** host attached to (or overlaying) the target element to ensure style isolation.  
  3. The Grid Pattern consists of 14px x 14px squares.  
  4. The Grid Origin (0,0) must align exactly with the top-left corner of the target element's **Padding Box**.  
  5. If another grid is already visible elsewhere, it must be removed before the new grid appears (Single Instance Rule).

#### **6.1.4 Story 1.4: Click-Through Transparency**

* **User Story:** As a Developer, I want to be able to click and interact with elements beneath the grid layer so that my workflow is not interrupted.  
* **Acceptance Criteria:**  
  1. The container holding the grid must have the CSS property pointer-events: none.  
  2. Users can click buttons, links, or form inputs located beneath the grid.  
  3. Users can select text located beneath the grid.  
  4. Users can right-click to open the Chrome Context Menu on elements beneath the grid (Inspect Element).

### **6.2 Epic 2: Core Stabilization & Launch Prep**

**Expanded Goal:** Optimize application performance, handle edge cases, and finalize necessary assets for the final product packaging to ensure a stable v1.0 launch.

#### **6.2.1 Story 2.1: Performance Optimization & Polish**

* **User Story:** As a User, I want the tool to operate smoothly even when I scroll the page or resize the window, without consuming excessive browser RAM.  
* **Acceptance Criteria:**  
  1. Use requestAnimationFrame for all mousemove events (throttling).  
  2. Handle scroll and resize events: The grid and measurement area must maintain correct positioning relative to the target element (or automatically recalculate position).  
  3. Cleanup: Ensure all Event Listeners are removed when the Extension is disabled or switched to another element to avoid Memory Leaks.

#### **6.2.2 Story 2.2: Packaging & Assets Preparation**

* **User Story:** As a Product Owner, I want a complete set of installation files and image assets so that I can upload to the Chrome Web Store or distribute to testers.  
* **Acceptance Criteria:**  
  1. Complete set of standard Icon sizes (16, 32, 48, 128px).  
  2. Complete manifest.json file with metadata (name, description, version).  
  3. npm run package command (or equivalent) generates a .zip file containing the optimized production build (minified code).

### **6.3 Epic 3: Configuration & Workflow Optimization**

**Expanded Goal:** Enhance user workflow with global shortcuts and provide a UI for customizing grid settings (size, color) with persistence.

#### **6.3.1 Story 3.1: Global Toggle Shortcut**

* **User Story:** As a User, I want to be able to toggle the grid on/off using a keyboard shortcut so that I can quickly check alignment without moving my mouse to the toolbar.  
* **Acceptance Criteria:**  
  1. Define a default shortcut (e.g., Ctrl+Shift+G or Command+Shift+G).  
  2. The shortcut toggles the active state of the extension (same behavior as clicking the icon).  
  3. Ensure the shortcut does not conflict with common browser shortcuts.

#### **6.3.2 Story 3.2: Custom Grid Settings UI & Persistence**

* **User Story:** As a User, I want to customize the grid size and color via a popup UI and have these settings saved so that I can use the tool on different projects with different requirements.  
* **Acceptance Criteria:**  
  1. Create a Popup UI (popup.html) with inputs for:  
     * Grid Size (px) - Default: 14  
     * Grid Color (Color Picker or Hex Input) - Default: Cyan/Magenta  
  2. Save settings using chrome.storage.sync (or local) so they persist across sessions.  
  3. The Content Script must listen for storage changes and update the grid immediately (or on next activation).

## **7\. Checklist Results Report**

Based on the PM Checklist, here are the validation results for PRD V1.1:

| Category | Status | Notes |
| :---- | :---- | :---- |
| **1\. Problem Definition** | ✅ **PASS** | "Global Grid Fallacy" and "Visual Noise" issues are clearly identified. |
| **2\. MVP Scope** | ✅ **PASS** | Scope is well-bounded (Desktop only, 14px fixed, Single Instance). Suitable for rapid development. |
| **3\. User Experience** | ✅ **PASS** | "Click-through" interactions and "Targeted Activation" address user pain points directly. |
| **4\. Functional Req** | ✅ **PASS** | 2 Epics cover all 4 core User Stories. No superfluous features. |
| **5\. Technical** | ✅ **PASS** | Stack (Vite, Vanilla JS, Manifest V3) and Shadow DOM are appropriate choices for a modern Extension. |
| **6\. Clarity** | ✅ **PASS** | Terms like "Active Container", "Padding Box", and "Delta" are clearly defined. |

**Conclusion:** The PRD is complete and **READY** for handover to the Engineering and Design teams.

## **8\. Next Steps**

### **8.1 UX Expert Prompt**

Role: UX Designer  
Task: Create High-Fidelity Mockups for "WP 14px Rhythm Inspector" Extension.  
Input: docs/prd.md  
Focus Areas:  
1\.  Visual Style: "Technical Blueprint" aesthetic.  
2\.  Color Palette: High-contrast Cyan (\#00FFFF) & Magenta (\#FF00FF) suitable for overlay on diverse backgrounds.  
3\.  Components:  
    \* Hover State (Blue Outline).  
    \* Grid Overlay (14px squares, 1px stroke, opacity).  
    \* Measurement Tooltip (Floating, clear typography, Shadow DOM isolation).  
4\.  Deliverables: SVG assets for the Grid pattern and Icon set (16-128px).

### **8.2 Architect Prompt**

Role: Software Architect  
Task: Design Technical Architecture for Chrome Extension (Manifest V3).  
Input: docs/prd.md  
Constraints: Vanilla JS, Vite, Shadow DOM, No External Frameworks.  
Key Challenges to Solve:  
1\.  Precise Grid Injection: Calculating \`padding-box\` coordinates relative to the viewport vs. document.  
2\.  Scroll Sync: Ensuring the grid stays "pinned" when the user scrolls (handling \`absolute\` vs \`fixed\` positioning contexts).  
3\.  Measurement Math: Efficient algorithm for \`MouseX % 14\` delta calculation within \`requestAnimationFrame\`.  
4\.  Project Structure: Set up the Monorepo structure for \`src/background\`, \`src/content\`, \`src/popup\`.  
