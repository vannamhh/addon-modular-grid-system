# **Technical Architecture Document \- WP 14px Rhythm Inspector**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-11-21 | 1.0 | Initial architecture setup (Manifest V3, Vanilla JS, Vite) | Winston (Architect) |

## **1\. Introduction**

This document outlines the technical architecture for **WP 14px Rhythm Inspector**, a Chrome Extension designed to assist WordPress developers in validating vertical rhythm.

### **Architectural Goals**

1. **Performance (60fps):** Ensure smooth scrolling while the grid is active, utilizing the "Direct Child Injection" strategy.  
2. **Non-intrusive:** Ensure mouse events pass through the grid (click-through) and grid CSS is isolated from the host page (Shadow DOM).  
3. **Simplicity:** Use pure Vanilla JS, avoiding heavy runtime frameworks (React/Vue).

## **2\. High-Level Architecture**

The system follows the standard **Chrome Extension Manifest V3** model. The core logic is centralized in the **Content Script**, while the **Popup** and **Background** play minimal support roles.

### **System Diagram**

graph TD  
    subgraph "Chrome Browser Context"  
        User\[User Action: Hover/Click/Alt\] \--\>|Event| ContentScript  
    end

    subgraph "Extension Core"  
        Popup\[Popup UI\] \--\>|Message: Toggle| ContentScript  
        Background\[Service Worker\] \-.-\>|Lifecycle/Install| ContentScript  
    end

    subgraph "Content Script (Core Logic)"  
        Controller\[Inspector Controller\]  
          
        subgraph "Modules"  
            Selector\[Element Selector\]  
            GridMgr\[Grid Manager\]  
            Measure\[Measurement Engine\]  
        end  
          
        Controller \--\>|Coordination| Selector  
        Controller \--\>|Coordination| GridMgr  
        Controller \--\>|Coordination| Measure  
    end

    subgraph "DOM Injection (Shadow DOM)"  
        Target\[Target Element\] \--\>|Contains| ShadowHost\[\<div id='wp-rhythm-root'\>\]  
        ShadowHost \--\>|Shadow Root| ShadowTree  
        ShadowTree \--\> Grid\[Grid Overlay\]  
        ShadowTree \--\> Tooltip\[Measurement Tooltip\]  
    end

    style ShadowHost fill:\#f9f,stroke:\#333,stroke-width:2px

### **Key Technical Decisions**

1. **Injection Strategy (Direct Child Injection):** The Grid is injected directly as a child of the target element (position: absolute, inset: 0). This allows the Grid to scroll naturally with the parent element without continuous position recalculation, effectively solving the "Scroll Sync" issue.  
2. **Shadow DOM:** The entire UI (Grid, Tooltip) resides within an open Shadow Root to ensure absolute CSS isolation.  
3. **Event Passthrough:** The Grid container uses pointer-events: none to allow click-through interaction.

## **3\. Tech Stack**

| Category | Technology | Version | Purpose & Notes |
| :---- | :---- | :---- | :---- |
| **Runtime** | Vanilla JS (ESNext) | ES2022+ | Core logic. No runtime frameworks used. |
| **Extension Platform** | Manifest V3 | V3 | Mandatory Chrome Store requirement. |
| **Build Tool** | **Vite** | 5.x | Bundling, Minification, HMR. |
| **Vite Plugin** | **@crxjs/vite-plugin** | Latest | Automates Manifest and Hot Reload for Content Scripts. |
| **Testing** | **Vitest** \+ JSDOM | Latest | Unit Test for coordinate calculation logic. |
| **CSS Strategy** | Standard CSS Files | N/A | Imported via Vite (import './style.css'). |

## **4\. Component Architecture**

The source code will be organized using Modular Vanilla JS (ES Modules) rather than heavy Object-Oriented Programming patterns.

### **4.1. src/content/InspectorController.js (Singleton)**

The application brain.

* **Responsibility:** Initialize child modules, listen for messages from Background/Popup, manage global state (Active/Inactive).  
* **State:**  
  * isActive: boolean (Global toggle state)  
  * lockedElement: HTMLElement (Currently pinned element)

### **4.2. src/content/ElementSelector.js**

Manages element highlighting on hover.

* **Responsibility:**  
  * Listen for mousemove (when unlocked).  
  * Draw a blue outline around event.target.  
  * Handle click to select the element and trigger GridManager.  
* **Optimization:** Use requestAnimationFrame to throttle mousemove events.

### **4.3. src/content/GridManager.js**

Manages the lifecycle of the Grid Overlay.

* **Responsibility:**  
  * inject(targetElement): Create Shadow Host, inject Grid CSS and HTML into targetElement.  
  * remove(): Clean up Shadow Host from DOM.  
  * **Static Positioning Edge Case:** If targetElement has position: static, GridManager will temporarily assign an internal class to set position: relative on the target, ensuring the Grid displays correctly.  
* **Generated DOM Structure:**  
  \<div id="wp-rhythm-host" style="position: absolute; inset: 0; pointer-events: none; z-index: 9999;"\>  
    \#shadow-root (open)  
      \<style\>...css...\</style\>  
      \<div class="grid-pattern"\>\</div\>  
      \<div class="tooltip hidden"\>\</div\>  
  \</div\>

### **4.4. src/content/MeasurementEngine.js**

Handles math and measurement logic.

* **Responsibility:**  
  * Listen for Alt key (keydown/keyup).  
  * Calculate Delta: (MouseX \- Rect.left) % 14\.  
  * Update Tooltip content and position inside Shadow DOM.  
* **Delta Algorithm:**  
  // Pseudo-code  
  const localX \= event.clientX \- rect.left;  
  const remainderX \= localX % 14;  
  const deltaX \= remainderX \> 7 ? remainderX \- 14 : remainderX;  
  // Result: \-7 to \+7 (px)

## **5\. Core Workflows**

### **5.1. Activation & Locking Flow**

sequenceDiagram  
    participant User  
    participant Selector  
    participant GridMgr  
    participant DOM

    User-\>\>Selector: Hover over element  
    Selector-\>\>DOM: Draw Blue Outline  
    User-\>\>Selector: Left Click  
    Selector-\>\>GridMgr: lock(element)  
    GridMgr-\>\>DOM: Check element 'position'  
    alt Element is Static  
        GridMgr-\>\>DOM: Set position: relative  
    end  
    GridMgr-\>\>DOM: Append Shadow Host (Grid)  
    GridMgr-\>\>User: Display 14px Grid

### **5.2. Measurement Mode Flow**

sequenceDiagram  
    participant User  
    participant MeasureEng  
    participant TooltipUI

    User-\>\>MeasureEng: Hold Alt Key (KeyDown)  
    MeasureEng-\>\>TooltipUI: Show Tooltip  
    loop Mouse Move  
        User-\>\>MeasureEng: Move Mouse  
        MeasureEng-\>\>MeasureEng: Calculate Delta (Mouse % 14\)  
        MeasureEng-\>\>TooltipUI: Update Text (x: \+2, y: \-1) & Position  
    end  
    User-\>\>MeasureEng: Release Alt Key (KeyUp)  
    MeasureEng-\>\>TooltipUI: Hide Tooltip

## **6\. Project Structure**

Utilizes a simplified Monorepo structure, separated clearly by Chrome Extension context.

wp-rhythm-inspector/  
├── src/  
│   ├── assets/                 \# Icons, Images  
│   ├── background/             \# Service Worker  
│   │   └── index.js  
│   ├── content/                \# Content Script (Core Logic)  
│   │   ├── components/         \# UI Components (Grid, Tooltip)  
│   │   │   ├── grid.css  
│   │   │   └── tooltip.css  
│   │   ├── modules/            \# Logic Modules  
│   │   │   ├── ElementSelector.js  
│   │   │   ├── GridManager.js  
│   │   │   └── MeasurementEngine.js  
│   │   ├── utils/              \# Helpers (Math, DOM)  
│   │   └── index.js            \# Entry point  
│   ├── popup/                  \# Popup UI  
│   │   ├── index.html  
│   │   ├── index.js  
│   │   └── style.css  
│   └── manifest.js             \# Manifest Config (for CRXJS)  
├── tests/                      \# Vitest Tests  
├── vite.config.js              \# Vite \+ CRXJS Config  
├── package.json  
└── README.md

## **7\. Coding Standards**

* **No var:** Use const and let only.  
* **Modularization:** All JS files in src/content/modules must export default class or export function.  
* **DOM Access:** Restrict global document access. Always scope queries within targetElement or shadowRoot where possible.  
* **Magic Numbers:** The number 14 (grid size) must be defined as a constant GRID\_SIZE \= 14\.  
* **JSDoc:** Mandatory JSDoc comments for complex mathematical functions.

## **8\. Risks & Limitations**

1. **Layout Shift (Low Risk):** Temporarily changing position: static to relative on the target element may cause minor layout shifts (e.g., affecting z-index context or unexpected top/left behavior).  
   * *Mitigation:* Apply this change only when the grid is active, and strictly revert to the original state when the grid is removed.  
2. **Z-Index War:** The grid might be obscured by child elements with higher z-index within the same stacking context.  
   * *Mitigation:* Shadow Host will be set to z-index: 2147483647 (max int), but it is still subject to the parent element's stacking context. This is an accepted limitation of the "Direct Child Injection" strategy.

*End of Document.*