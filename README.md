# WP 14px Rhythm Inspector

Chrome Extension for inspecting 14px grid alignment on WordPress elements.

## Overview

WP 14px Rhythm Inspector is a developer tool that helps WordPress developers validate vertical rhythm by overlaying a precise 14px grid on selected DOM elements. The extension follows modern Chrome Extension Manifest V3 standards with a minimal, performance-focused architecture.

## Features (MVP - Epic 1)

- ✅ Element discovery via hover with visual highlight
- ✅ Grid overlay injection pinned to selected element
- ✅ 14px × 14px grid pattern with CSS isolation (Shadow DOM)
- ✅ Click-through transparency for seamless interaction
- 🚧 Measurement mode (Coming in Epic 2)

## Installation

### Development Mode

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd modular-grid-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

5. **Verify installation**
   - Extension icon should appear in Chrome toolbar
   - Click icon to open popup
   - Navigate to any webpage
   - Open DevTools console → Look for "WP Inspector Ready" message

## Development

### Project Structure

```
wp-rhythm-inspector/
├── src/
│   ├── assets/              # Icons and images
│   ├── background/          # Service Worker (minimal)
│   │   └── index.js
│   ├── content/             # Content Script (core logic)
│   │   ├── components/      # UI components (grid, tooltip)
│   │   ├── modules/         # Logic modules (future: ElementSelector, GridManager)
│   │   ├── utils/           # Helper functions
│   │   └── index.js         # Entry point
│   ├── popup/               # Popup UI
│   │   ├── index.html
│   │   ├── index.js
│   │   └── style.css
│   └── manifest.js          # Manifest V3 config
├── tests/                   # Vitest unit tests
├── docs/                    # Project documentation
├── dist/                    # Build output (generated)
├── vite.config.js           # Vite + CRXJS configuration
└── package.json
```

### Available Scripts

- **`npm run dev`** - Start development server with hot module reload (HMR)
- **`npm run build`** - Build production-ready extension to `dist/`
- **`npm test`** - Run unit tests with Vitest
- **`npm test -- --run`** - Run tests once without watch mode

### Tech Stack

- **Runtime**: Vanilla JavaScript (ES2022+)
- **Build Tool**: Vite 5.x + @crxjs/vite-plugin
- **Testing**: Vitest + JSDOM
- **Extension Platform**: Chrome Manifest V3
- **CSS Strategy**: Standard CSS with Shadow DOM isolation

### Development Workflow

1. Make changes to files in `src/`
2. Run `npm run dev` for live reloading during development
3. Test changes by reloading extension in `chrome://extensions`
4. Run `npm test` to ensure tests pass
5. Build with `npm run build` before committing

### Coding Standards

- Use `const` and `let` only (no `var`)
- All modules must use ES6 imports/exports
- Magic number `14` (grid size) defined as constant `GRID_SIZE = 14`
- JSDoc comments required for complex functions
- Restrict global `document` access where possible

## Architecture

### Manifest V3 Design

- **Background**: Minimal service worker for lifecycle events
- **Content Script**: Core logic (element selection, grid injection)
- **Popup**: Simple UI for activation toggle
- **Permissions**: Only `activeTab` and `storage` (minimal access)

### Key Technical Decisions

1. **Direct Child Injection**: Grid injected as direct child of target element (`position: absolute; inset: 0`) for automatic scroll sync
2. **Shadow DOM**: Complete CSS isolation for grid overlay and tooltip UI
3. **Event Passthrough**: Grid uses `pointer-events: none` for click-through interaction

See [Technical Architecture Document](docs/architecture.md) for detailed system design.

## Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- Content script initialization
- Error handling during setup
- Console logging verification

### Manual Testing

1. Build extension: `npm run build`
2. Load in Chrome Developer Mode
3. Navigate to test page (e.g., WordPress site)
4. Open DevTools console
5. Verify "WP Inspector Ready" appears
6. Click extension icon → Verify popup opens

## Roadmap

### Epic 1: Foundation & Core Grid Injection (Completed)
- [x] Story 1.1: Project Scaffolding & Manifest V3 Setup
- [x] Story 1.2: Element Discovery & Highlighting
- [x] Story 1.3: Grid Overlay Injection ("The Lock")
- [x] Story 1.4: Click-Through Transparency

### Epic 2: Measurement & Performance (Completed)
- [x] Story 2.1: Performance Optimization (previously 2.3)
- [x] Story 2.2: Packaging & Store Assets (previously 2.4)

Note: The original Measurement stories (former 2.1 & 2.2) were intentionally removed from the roadmap — the remaining work for Epic 2 has been completed and renumbered as shown above.

### Epic 3: Developer Experience & Persistence (Completed)
- [x] Story 3.1: Global toggle shortcut
- [x] Story 3.2: Custom grid settings UI + persistence

## Contributing

This is an internal development project. For questions or issues, contact the project maintainer.

## License

MIT License - See LICENSE file for details

## Project Documentation

- [Product Requirements Document (PRD)](docs/prd.md)
- [Technical Architecture](docs/architecture.md)
- [Epic 1 Technical Specification](docs/sprint-artifacts/tech-spec-epic-1.md)
- [Sprint Status](docs/sprint-artifacts/sprint-status.yaml)

---

**Version**: 0.2.0  
**Status**: In Development (Epics 1–3 delivered; continuing polish and backlog items)  
**Last Updated**: 2025-11-27

Notes:
- Retrospective for Epic 3 has been completed and saved to `docs/sprint-artifacts`.
- Canonical sprint status and story tracking are in `docs/sprint-artifacts/sprint-status.yaml`.
