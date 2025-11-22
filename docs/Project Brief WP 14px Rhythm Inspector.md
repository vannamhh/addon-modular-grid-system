# **Project Brief: WP 14px Rhythm Inspector**

## **1\. Introduction**

This document serves as the foundational input for the "WP 14px Rhythm Inspector" Chrome Extension. It outlines the vision, core problems, and technical requirements for a tool designed to help WordPress developers maintain vertical and horizontal rhythm with precision.

## **2\. Executive Summary**

**Product Concept:** "WP 14px Rhythm Inspector" is a lightweight Chrome Extension designed specifically for WordPress Theme Developers. It overlays a precise **14px x 14px square grid** locally onto selected DOM elements, ensuring 2D alignment (horizontal & vertical) without visual clutter.

**Primary Problem:**

* **Phase Misalignment:** Global viewport grids often fail to align with nested components (e.g., cards, widgets) that sit on odd pixel coordinates, making "pixel-perfect" checks impossible.  
* **Visual Noise:** Full-screen grids create unnecessary distraction when a developer only needs to inspect a specific module.  
* **Blocking Workflow:** Many existing tools block mouse events, preventing interaction with the underlying elements during inspection.

**Key Value Proposition:**

* **Scoped DOM Injection:** Users click to "pin" the grid to a specific element. The grid's origin (0,0) resets to that element's top-left corner, ensuring relative alignment.  
* **Non-Intrusive:** The grid layer allows "click-through" access (pass-through pointer events) to the underlying DOM, enabling simultaneous use of Chrome DevTools.  
* **Smart Measurement:** On-demand deviation checking to measure pixel offsets from the grid lines.

## **3\. Problem Statement**

* **The "Global Grid" Fallacy:** In modern web design, components are modular. A global 14px grid anchored to the \<body\> often misaligns with a component container that has a top offset of 13px or 15px. This 1px offset renders the grid useless for internal alignment checks.  
* **Interaction Blocking:** Developers often need to toggle grid tools ON/OFF constantly to inspect CSS or click buttons, disrupting the workflow.  
* **Invisible Errors:** It is difficult for the human eye to detect a 1px or 2px deviation from the rhythm without explicit measurement guides.

## **4\. Proposed Solution**

**Core Concept:** A "Non-intrusive Local Square Grid" extension.

**Key Features:**

1. **Local Square Grid Rendering:**  
   * Renders a 14px x 14px square grid.  
   * Anchors the grid origin to the **padding-box** of the targeted element.  
2. **Targeted Selection Workflow:**  
   * Activate extension \-\> Hover to highlight DOM elements \-\> Click to inject grid.  
3. **Transparent Interaction:**  
   * The grid overlay uses pointer-events: none to allow full interaction with the page.  
4. **Smart Measurement (On-Demand):**  
   * Holding the Alt key triggers a measurement mode that shows the distance (delta) from the cursor/hovered element to the nearest grid line.

## **5\. User Stories & Acceptance Criteria**

### **Story 1: Activation & Local Selection**

As a Developer,  
I want to activate the inspector and click a specific DOM element,  
So that the grid appears only on that element and aligns with its internal layout.

* **Acceptance Criteria:**  
  * On activation, hovering elements shows a blue outline highlight.  
  * Clicking an element "locks" the grid to it (Active Container).  
  * The grid strictly respects the boundaries of the Active Container.

### **Story 2: 14px Square Grid Rendering**

As a Designer,  
I want to see a precise 14px square grid overlay,  
So that I can check both vertical and horizontal rhythm.

* **Acceptance Criteria:**  
  * Grid Unit: Fixed **14px x 14px**.  
  * Visual Style: Solid lines, 1px width.  
  * Color: High-contrast (Cyan/Magenta) with \~30-50% opacity.  
  * Origin: Top-left (0,0) of the Active Container.

### **Story 3: Non-blocking Workflow**

As a Developer,  
I want to use Chrome DevTools to inspect or modify the element under the grid,  
So that I don't have to toggle the extension off to work.

* **Acceptance Criteria:**  
  * Grid overlay must have CSS pointer-events: none.  
  * Clicks, text selection, and drags must pass through to the website.

### **Story 4: Smart Measurement (On-Demand)**

As a Perfectionist Dev,  
I want to see how far an element is from the grid lines by holding a specific key,  
So that I can identify 1-2px deviations instantly.

* **Acceptance Criteria:**  
  * **Trigger:** Active only while holding the Alt key.  
  * **Visual:** Show a tooltip or indicator with X/Y delta values (e.g., x: \+2px).  
  * **Performance:** Logic must throttle (using requestAnimationFrame) and stop completely when Alt is released.

## **6\. Technical Considerations**

* **Architecture:** Chrome Extension **Manifest V3**.  
* **Tech Stack:** Vanilla JavaScript (no heavy frameworks) to minimize injection footprint.  
* **Isolation:** Use **Shadow DOM** for extension UI elements (tooltips, toggles) to prevent CSS bleeding from the host page.  
* **Rendering:** Use SVG patterns or CSS background-image (linear-gradient) for the grid (lighter and sharper than Canvas).  
* **Performance:**  
  * Measurement logic must be idle by default.  
  * Use requestAnimationFrame for mousemove handlers during measurement mode.

## **7\. Constraints & Assumptions**

* **Platform:** Desktop Chrome/Chromium browsers only. No mobile support for MVP.  
* **Grid Size:** Hardcoded to **14px**. No customization UI in MVP.  
* **Single Instance:** Only one grid overlay active at a time (User selects Element A, then Element B \-\> Grid moves to B).  
* **Z-Index:** Assumes z-index: 2147483647 is sufficient to overlay most web content.

## **8\. Risks & Open Questions**

* **Risk \- Permissions:** Users may hesitate if requested permissions are too broad.  
  * *Mitigation:* Request only activeTab permission. No background scripts running persistently.  
* **Risk \- Shortcut Conflicts:** Alt key might conflict with OS or browser menus.  
  * *Mitigation:* Accept for MVP; consider Shift or custom mapping in V2.  
* **Open Question \- Scroll Sync:** How does the grid behave on scrollable containers?  
  * *Decision:* Grid container must use absolute positioning relative to the target element to scroll naturally with content.

## **9\. Next Steps**

1. **PM Handoff:** This brief is ready for the Product Manager to generate the formal PRD.  
2. **Prototype:** Developer to create a "Hello World" extension injecting a static 14px CSS grid into a selected div.