# Manual Testing Guide - WP 14px Rhythm Inspector

**Last Updated:** 22-11-2025  
**Stories Covered:** 1.1, 1.2, 1.3

---

## Prerequisites

- Chrome browser (version 88+)
- Extension built successfully: `npm run build`
- `test-page.html` file available in project root

---

## Load Extension (One-Time Setup)

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (toggle top-right)
3. Click "Load unpacked" → Select `dist/` folder
4. Verify extension appears with no errors
5. Click extension icon (puzzle piece) → "Activate Inspector"

---

## Story 1.3: Grid Overlay Injection Tests

### Test Environment
- Open `test-page.html` in Chrome
- Activate extension via popup
- Open DevTools (F12) → Elements tab

---

### ✅ TEST 11: Click Triggers Grid (AC1)

**Steps:**
1. Hover over **Section 6** (280×140 yellow box with red border)
2. Blue outline should appear
3. **Click** the highlighted section
4. Cyan grid overlay should appear immediately (<100ms)

**Expected:**
- Grid covers entire element
- Grid lines are cyan (#00FFFF) at 35% opacity
- Grid appears within 100ms of click

**Result:** [ ] PASS [ ] FAIL

---

### ✅ TEST 12: Shadow DOM Structure (AC2)

**Steps:**
1. With grid locked on Section 6, right-click element → Inspect
2. In Elements tab, locate `<div id="wp-rhythm-host">` as child of section
3. Expand shadow host, verify `#shadow-root (open)` exists
4. Inside shadow root, verify:
   - `<style>` tag with CSS rules
   - `<div class="grid-pattern"></div>`

**Expected:**
- Shadow root mode: open
- Shadow host styles: `position: absolute; inset: 0; pointer-events: none; z-index: 9999`

**Result:** [ ] PASS [ ] FAIL

**Screenshot:** _Paste DevTools screenshot here if documenting_

---

### ✅ TEST 13-14: Grid Pattern 14px Squares (AC3)

**Steps:**
1. Inspect shadow root `<style>` tag content
2. Verify CSS contains:
   ```css
   repeating-linear-gradient(0deg, transparent 0 13px, #00FFFF 13px 14px)
   repeating-linear-gradient(90deg, transparent 0 13px, #00FFFF 13px 14px)
   opacity: 0.35
   ```
3. Visually verify grid squares are 14×14px

**Expected:**
- Two perpendicular gradients (horizontal + vertical lines)
- Color: Cyan (#00FFFF)
- Opacity: 35%
- Line width: 1px (14px - 13px = 1px gap)

**Result:** [ ] PASS [ ] FAIL

---

### ✅ TEST 15-16: Padding Box Alignment (AC4)

**Steps:**
1. Lock grid to **Section 6** (has 5px red border + 20px padding)
2. Enable DevTools Ruler/Measure tool (Cmd+Shift+M)
3. Measure distance from **red border edge** to **first cyan grid line**
   - Should be **5px** (grid starts at padding box, not border box)
4. Count grid squares:
   - **Columns:** 280px ÷ 14px = 20 columns expected
   - **Rows:** 140px ÷ 14px = 10 rows expected

**Expected:**
- Grid starts exactly at padding box top-left corner (inside border)
- 20 × 10 grid squares visible

**Result:** [ ] PASS [ ] FAIL

**Measured offset:** _____ px (should be 5px)  
**Grid squares counted:** _____ columns × _____ rows

---

### ✅ TEST 17: Single Instance Rule (AC5)

**Steps:**
1. Click **Element A** (blue box) in Section 8
2. Grid A appears on Element A
3. Click **Element B** (pink box) in Section 8
4. Verify:
   - Grid A disappears
   - Grid B appears on Element B
   - Only ONE grid visible at any time
5. Inspect DOM: Search for `#wp-rhythm-host` (should find only 1 element)

**Expected:**
- Previous grid removed before new grid injected
- Only one `#wp-rhythm-host` exists in entire page

**Result:** [ ] PASS [ ] FAIL

---

### ✅ TEST 18: Pointer-Events Passthrough (AC6)

**Steps:**
1. Lock grid to **Section 9** container
2. **Click "Click This Button"** → Alert "✅ Click passthrough works!" should appear
3. **Type in text input** → Characters should appear
4. **Click "Click This Link"** → Alert "✅ Link works!" should appear
5. **Right-click button** → Context menu should open
6. **Select text** inside container → Text selection should work

**Expected:**
- All interactions work normally despite grid overlay
- Grid does not block mouse events

**Result:** [ ] PASS [ ] FAIL

---

### ✅ TEST 19: Static Position Adjustment (AC7)

**Steps:**
1. Lock grid to **Section 7** (yellow box, `position: static`)
2. Open DevTools → Elements tab → Select Section 7
3. Check Styles panel → Inline styles
4. Verify `position: relative` appears (temporarily added by GridManager)
5. **Deactivate extension** via popup
6. Re-inspect Section 7 → Verify position restored to original (`static` or no position style)

**Expected:**
- Static elements temporarily get `position: relative` while grid active
- Original position restored on cleanup

**Result:** [ ] PASS [ ] FAIL

---

### ✅ TEST 20-21: CSS Isolation (AC8)

**Test 20 - Shadow DOM Query Isolation:**
1. Lock grid to any element
2. Open Console (F12 → Console tab)
3. Run: `document.querySelector('.grid-pattern')`
4. **Expected result:** `null` (not accessible via document)
5. Run: `document.querySelector('#wp-rhythm-host').shadowRoot.querySelector('.grid-pattern')`
6. **Expected result:** `<div class="grid-pattern"></div>` (accessible via shadowRoot)

**Test 21 - Page CSS Doesn't Affect Grid:**
1. With grid locked, run in console:
   ```javascript
   const style = document.createElement('style');
   style.textContent = '.grid-pattern { display: none !important; background: red !important; }';
   document.head.appendChild(style);
   ```
2. Verify grid remains **visible and cyan** (page CSS ignored)

**Expected:**
- Grid styles isolated in shadow root
- Page CSS cannot affect grid appearance

**Result:** [ ] PASS [ ] FAIL

---

### ✅ TEST 22-25: Edge Cases

**Test 22 - Scroll Behavior:**
1. Lock grid to element
2. Scroll page up/down
3. **Expected:** Grid scrolls naturally with element (Direct Child Injection)

**Test 23 - Resize Window:**
1. Lock grid to element
2. Resize browser window (drag corner)
3. **Expected:** Grid remains correctly positioned relative to element

**Test 24 - Deactivate Extension:**
1. Lock grid to element
2. Click extension icon → "Deactivate Inspector"
3. **Expected:** Grid disappears immediately

**Test 25 - Page Refresh:**
1. Lock grid to element
2. Refresh page (Cmd+R or Ctrl+R)
3. **Expected:** Grid disappears (no persistence across page loads)

**Result:** [ ] PASS [ ] FAIL

---

## Story 1.2: Element Discovery & Highlighting Tests

### ✅ TEST 1-5: Basic Hover (AC1-AC4)

1. **Hover Test:** Hover over elements → 2px blue outline (#0080FF) appears
2. **Clear Test:** Move away → Outline disappears immediately
3. **Nested Test:** Rapidly hover over Section 2 nested divs → Smooth transitions
4. **Hidden Test:** Hover over Section 3 hidden elements → NO outline
5. **Performance Test:** Generate 100 stress boxes → Hover rapidly → Check FPS in DevTools Performance tab (target: 60fps, acceptable: 55fps)

**Results:**
- Hover: [ ] PASS [ ] FAIL
- Clear: [ ] PASS [ ] FAIL
- Nested: [ ] PASS [ ] FAIL
- Hidden: [ ] PASS [ ] FAIL
- Performance: [ ] PASS [ ] FAIL (measured: _____ fps)

---

## Story 1.1: Scaffolding Tests

### ✅ TEST 1-3: Build & Load (AC1-AC3)

1. **Build:** `npm run build` → `dist/` folder created with valid `manifest.json`
2. **Load:** Extension loads in `chrome://extensions` with no errors
3. **Console:** Navigate to any page → Console shows "WP Inspector Ready"

**Results:**
- Build: [ ] PASS [ ] FAIL
- Load: [ ] PASS [ ] FAIL
- Console: [ ] PASS [ ] FAIL

---

## Test Summary Template

```
Date: 2025-11-22
Tester: BMad
Browser: Chrome [version]
OS: macOS

Story 1.3 Tests (Grid Overlay):
- Test 11 (Click Triggers Grid): ✅/❌
- Test 12 (Shadow DOM Structure): ✅/❌
- Test 13-14 (Grid Pattern): ✅/❌
- Test 15-16 (Padding Box Alignment): ✅/❌
- Test 17 (Single Instance): ✅/❌
- Test 18 (Pointer-Events Passthrough): ✅/❌
- Test 19 (Position Adjustment): ✅/❌
- Test 20-21 (CSS Isolation): ✅/❌
- Test 22-25 (Edge Cases): ✅/❌

Overall: ____ / 9 tests passed

Issues Found:
- [None / List issues here]

Notes:
- [Any observations]
```

---

## Troubleshooting

### Grid Not Appearing
- Verify element is highlighted (blue outline) before clicking
- Check Console for errors
- Try toggling extension off/on

### Grid Misaligned
- Verify element has computed position (not static)
- Check for CSS transforms on parent elements

### Multiple Grids Visible
- **BUG:** Only one grid should exist (single instance rule)
- Inspect DOM for multiple `#wp-rhythm-host` elements
- Report as defect

---

## Approval Checklist

Before marking story as "Done":
- [ ] All automated tests pass (84/84 tests)
- [ ] All manual tests pass (Tests 11-25)
- [ ] No console errors
- [ ] Performance ≥55fps
- [ ] Grid visually accurate (14px squares, padding box aligned)
- [ ] Single instance enforced
- [ ] Pointer-events passthrough works
- [ ] CSS isolation verified
