# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story's `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-11-22 | 1.1 | 1 | TechDebt | Medium | TBD | Open | Implement `chrome.runtime.onMessage` listener in content script (Story 1.2 scope) - file: src/content/index.js:11-13 |
| 2025-11-22 | 1.1 | 1 | TechDebt | Medium | TBD | Open | Refactor popup state persistence to Promise-based storage API - file: src/popup/index.js:29-34 |
| 2025-11-22 | 1.1 | 1 | Enhancement | Low | TBD | Open | Update README features list to reflect Story 1.1 actual deliverables - file: README.md:12-15 |
| 2025-11-22 | 1.1 | 1 | Enhancement | Low | TBD | Open | Add automated manifest validation script post-build |
| 2025-11-22 | 1.1 | 1 | Enhancement | Low | TBD | Open | Replace placeholder icons with branded icons before Chrome Web Store submission (Epic 2) |
| 2025-11-26 | 2.1 | 2 | TechDebt | Low | TBD | Open | Make GridManager.z-index configurable or document expected z-index behavior (file: src/content/modules/GridManager.js:11-12) |
| 2025-11-26 | 2.1 | 2 | Enhancement | Low | TBD | Open | Replace system `zip` packaging step with a cross-platform Node-based packaging solution (file: package.json:9) |
| 2025-11-26 | 2.2 | 2 | Bug | High | TBD | Open | Add CI workflow to run `npm run package`, unzip `dist.zip` and assert `manifest.json` at archive root and required icon files present (Story 2.2) |

