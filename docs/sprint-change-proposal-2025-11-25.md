# Sprint Change Proposal: MVP Scope Adjustment & Epic 2 Restructuring

**Date:** 2025-11-25
**Author:** John (PM)
**Status:** Draft

## 1. Issue Summary
**Problem:** Following the completion of Epic 1, a strategic review determined that the "Smart Measurement Mode" (FR4) and its associated features (Vertical Rhythm Gap, Element-to-Element Distance) introduce unnecessary complexity for the MVP (v1.0) and divert resources from core stability.
**Context:** The team decided to pivot Epic 2 from "Smart Measurement & Polish" to "Core Stabilization & Launch Prep" to ensure a high-performance, bug-free launch.

## 2. Impact Analysis
### Epic Impact
*   **Epic 2 (Smart Measurement & Polish):** Completely redefined.
    *   **Old Goal:** Implement measurement logic and UI.
    *   **New Goal:** Optimize performance, handle edge cases, and prepare release assets.

### Story Impact
*   **Story 2.1 (Measurement Core Logic):** REMOVED.
*   **Story 2.2 (Measurement Tooltip UI):** REMOVED.
*   **Story 2.3 (Performance Optimization):** RETAINED (Renumbered to 2.1).
*   **Story 2.4 (Packaging & Assets):** RETAINED (Renumbered to 2.2).

### Artifact Conflicts
*   **PRD:**
    *   Section 2.1 (Functional Requirements): Remove FR4.
    *   Section 6 (Epic Details): Rewrite Epic 2 definition.
*   **Architecture Document:**
    *   Remove Section 4.4 (MeasurementEngine.js).
    *   Remove Section 4.3 references to Tooltip.
    *   Remove Section 5.2 (Measurement Mode Flow).
*   **Sprint Status:**
    *   Update Epic 2 backlog items.

## 3. Recommended Approach
**Selected Path:** **Option 3: PRD MVP Review (Scope Reduction)**
**Rationale:**
*   **Focus:** Concentrates effort on the "Grid" value proposition, which is the core differentiator.
*   **Quality:** Allows more time for performance optimization (requestAnimationFrame, memory leak prevention) and edge case handling.
*   **Timeline:** Reduces risk of schedule slippage by removing complex math/UI logic.

## 4. Detailed Change Proposals

### A. PRD Updates (`docs/prd/2. Requirements.md`)
**REMOVE:**
> FR4 - Smart Measurement Mode: Holding the Alt key activates a mode displaying the distance...

### B. Epic Details Updates (`docs/prd/6. Epic Details.md`)
**MODIFY:** Section 6.2 Epic 2
*   **New Title:** Core Stabilization & Launch Prep
*   **New Story 2.1:** Performance Optimization & Polish (formerly 2.3)
*   **New Story 2.2:** Packaging & Assets Preparation (formerly 2.4)

### C. Architecture Updates (`docs/architecture.md`)
**REMOVE:**
*   `src/content/modules/MeasurementEngine.js` module definition.
*   `src/content/components/tooltip.css` and Tooltip component references.
*   Measurement Mode Sequence Diagram.

### D. Sprint Status (`docs/sprint-artifacts/sprint-status.yaml`)
**UPDATE:**
```yaml
epic-2: backlog
2-1-performance-optimization-polish: backlog
2-2-packaging-assets-preparation: backlog
# Removed: measurement-core-logic, measurement-tooltip-ui
```

## 5. Implementation Handoff
**Scope Classification:** **Moderate** (Requires backlog reorganization and documentation updates).

**Roles & Responsibilities:**
*   **Product Manager (Me):** Update PRD and Sprint Status.
*   **Architect:** Update Architecture Document.
*   **Developer:**
    *   Delete `MeasurementEngine.js` and `TooltipComponent.js` (if already created).
    *   Clean up `InspectorController.js` to remove measurement references.
    *   Proceed with Story 2.1 (Performance).

## 6. Approval
Do you approve this Sprint Change Proposal?
