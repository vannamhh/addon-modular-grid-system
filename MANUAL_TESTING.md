# Manual Testing Guide - WP 14px Rhythm Inspector

**Last Updated:** 22-11-2025  
**Stories Covered:** 1.1, 1.2, 1.3, 1.4

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

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

**Result:** [x] PASS [ ] FAIL

---

## Story 1.4: Click-Through Transparency Tests

### Test Environment
- Open `test-page.html` → **Section 10**
- Activate extension via popup
- Open Console (F12) to see event logs

---

### ✅ TEST 26: Button Click Passthrough (AC2)

**Steps:**
1. Lock grid to **Section 10.1** (button test area - green background)
2. Click each button in sequence:
   - "Default Z-Index" → Alert/log appears
   - "Z-Index 1", "10", "100", "9999" → All should trigger
3. Verify button log shows: "✅ Button [name] - [timestamp]"
4. Check Console for event logs

**Expected:**
- All buttons clickable despite grid overlay
- Click handlers execute normally
- Event.target references actual button, not shadow host

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 27: Link Click Passthrough (AC2)

**Steps:**
1. Lock grid to **Section 10.2** (link test area - blue background)
2. Click "Internal Anchor Link" → Console log should appear
3. Hover over "Hover Me" link → Verify `:hover` styles (color change/underline)
4. Ctrl+Click (Cmd+Click Mac) "External Link" → Should open alert
5. Verify all links remain interactive

**Expected:**
- Links clickable through grid
- Hover styles work correctly
- Link navigation and event handlers function

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 28: Form Input Passthrough (AC2)

**Steps:**
1. Lock grid to **Section 10.3** (form test area - orange background)
2. Click text input → Should focus (cursor blinks)
3. Type "test" → Characters should appear
4. Click textarea → Focus and type
5. Click checkbox → Should toggle
6. Click radio buttons → Should select
7. Click select dropdown → Should open options
8. Click Submit button → Alert "Form Submitted"
9. Check Console for focus/click event logs

**Expected:**
- All form elements focusable and interactive
- Keyboard input works after click-focus
- Form submission triggers correctly

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 29: Text Selection Passthrough (AC3)

**Steps:**
1. Lock grid to **Section 10.4** (text selection area - purple background)
2. **Click-drag** across text → Selection highlight should appear
3. **Double-click** a word → Word should be selected
4. **Triple-click** paragraph → Entire paragraph selected
5. Press Ctrl+A (Cmd+A Mac) → All text in container selected
6. Verify selection highlight color displays correctly beneath grid

**Expected:**
- Text selection works normally
- Selection highlight visible through grid overlay
- Multi-click selection patterns function

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 30: Context Menu Passthrough (AC4)

**Steps:**
1. Lock grid to **Section 10.5** (context menu area - pink background)
2. **Right-click text paragraph:**
   - Context menu should show: "Copy", "Select All"
3. **Right-click image:**
   - Menu should show: "Save Image As...", "Copy Image"
4. **Right-click link:**
   - Menu should show: "Open Link in New Tab", "Copy Link Address"
5. **Right-click input field:**
   - Menu should show: "Cut", "Copy", "Paste"

**Expected:**
- Correct context menu for each element type
- Menu items target page element, not grid
- "Inspect Element" option available

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 31: DevTools Inspect Element (AC4)

**Steps:**
1. Lock grid to **Section 10.6** (DevTools test area - teal background)
2. Right-click "Right-click me → Inspect Element" button
3. Select "Inspect" or "Inspect Element" from context menu
4. DevTools Elements panel opens:
   - Verify highlighted element is `<button id="inspectTestButton">`
   - **NOT** `<div id="wp-rhythm-host">` (shadow host)
   - **NOT** `<div class="grid-pattern">` (grid pattern)
5. Check Elements panel breadcrumb shows: `html > body > div > div > button`

**Expected:**
- DevTools highlights actual page button
- Shadow host is NOT selected
- Correct element tree shown in breadcrumb

**Result:** [x] PASS [ ] FAIL

**Screenshot:** _Paste DevTools screenshot showing button selected_

---

### ✅ TEST 32: Drag-and-Drop Passthrough (AC2)

**Steps:**
1. Lock grid to **Section 10.7** (drag-drop area - yellow background)
2. Click and hold "Drag Me" box → Drag to "Drop Zone"
3. Release mouse → Drop Zone should turn green and show "✅ Dropped!"
4. Check Console for "Drag Started" and "Dropped" logs
5. Refresh page, repeat test to verify drag preview ghost image displays

**Expected:**
- Drag operation initiates correctly
- Drop zone receives drop event
- Drag preview image visible during drag

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 33: Custom Event Handlers (AC2)

**Steps:**
1. Lock grid to **Section 10.8** (custom event area - light purple background)
2. Click "Click Me (addEventListener)" button
   - Console log: "Custom Button Clicked via addEventListener"
   - Event.target should match button
3. Hover over purple "Hover Over Me" box:
   - Box turns green (mouseenter)
   - Console log: "mouseenter event fired"
4. Move mouse away:
   - Box returns to purple (mouseleave)
   - Console log: "mouseleave event fired"

**Expected:**
- addEventListener click handlers work
- mouseenter/mouseleave events fire
- Event.target references correct element

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 34: Performance - Event Propagation Latency (AC5)

**Steps:**
1. Scroll to **Section 10.9** (performance test - peach background)
2. **WITHOUT Grid:**
   - Click "Test Click WITHOUT Grid" 3 times
   - Note baseline timestamps in console
3. **Lock grid to Section 10.9 container**
4. **WITH Grid:**
   - Click "Test Click WITH Grid" 3 times
   - Check performance log for latency delta
5. Verify delta is **< 16ms** (target: < 1ms for pure CSS passthrough)
6. **Optional:** Use Chrome DevTools Performance profiler:
   - Start recording → Click button 10 times → Stop
   - Verify no blocking tasks or event handling overhead

**Expected:**
- Latency delta < 16ms (60fps budget)
- Ideally < 1ms (pure CSS, zero JS overhead)
- Performance log shows "✅ PASS" or "🌟 EXCELLENT"

**Result:** [ ] PASS [x] FAIL  
**Measured Latency:** 44215.60 ms

---

### ✅ TEST 35: Edge Case - Z-Index Stacking Conflicts (AC1, AC2)

**Steps:**
1. Lock grid to **Section 10.10** (z-index test - light green background)
   - Grid has z-index: 999 (from GridManager)
2. Click each button:
   - "Z-Index 1000" → Should trigger
   - "Z-Index 5000" → Should trigger
   - "Z-Index 10000 (Modal)" → Should trigger
3. Scroll to top-right corner → Click fixed position button (z-index: 9999)
4. All clicks should work despite buttons having higher z-index than grid

**Expected:**
- Buttons clickable even with z-index > 999
- pointer-events: none makes z-index irrelevant for event targeting

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 36: Edge Case - CSS pointer-events Override (AC1)

**Steps:**
1. Lock grid to **Section 10.11** (pointer-events override - red background)
2. Click "Normal Button (pointer-events: auto)" → Should trigger
3. Click "Disabled Button (pointer-events: none)" → Should NOT trigger
4. Verify disabled button remains non-interactive

**Expected:**
- Grid doesn't re-enable pointer-events on disabled elements
- Elements with explicit pointer-events: none stay disabled

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 37: Accessibility - Keyboard Navigation (AC2)

**Steps:**
1. Lock grid to **Section 10.12** (a11y test - light blue background)
2. Press **Tab** key repeatedly:
   - Focus should move: Button 1 → Button 2 → Input → Link
   - Verify focus indicators (outlines) display correctly
3. Focus Button 1 → Press **Space** or **Enter** → Click event fires
4. Focus Input → Type text → Characters appear
5. Check Console for focus event logs

**Expected:**
- Tab navigation works normally
- Focus indicators visible through grid
- Space/Enter activation on focused buttons
- Keyboard input works in focused fields

**Result:** [x] PASS [ ] FAIL

---

### ✅ TEST 38-40: Cross-Browser Compatibility (AC: All)

**Test 38 - Chrome (Primary Target):**
- Run all Story 1.4 tests (26-37) in Chrome 88+
- Document any issues

**Test 39 - Edge (Chromium-based):**
- Run all Story 1.4 tests in Microsoft Edge
- Compare behavior with Chrome
- Document differences (expected: identical)

**Test 40 - Brave/Opera (Optional):**
- Run all Story 1.4 tests in Brave or Opera
- Verify pointer-events behavior consistent

**Expected:**
- All Chromium-based browsers behave identically
- pointer-events: none is standard CSS (broad support)

**Results:**
- Chrome: [ ] PASS [ ] FAIL
- Edge: [ ] PASS [ ] FAIL [ ] SKIPPED
- Brave/Opera: [ ] PASS [ ] FAIL [ ] SKIPPED

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

Story 1.4 Tests (Click-Through Transparency):
- Test 26 (Button Click Passthrough): ✅/❌
- Test 27 (Link Click Passthrough): ✅/❌
- Test 28 (Form Input Passthrough): ✅/❌
- Test 29 (Text Selection Passthrough): ✅/❌
- Test 30 (Context Menu Passthrough): ✅/❌
- Test 31 (DevTools Inspect Element): ✅/❌
- Test 32 (Drag-and-Drop Passthrough): ✅/❌
- Test 33 (Custom Event Handlers): ✅/❌
- Test 34 (Performance Latency): ✅/❌
- Test 35 (Z-Index Edge Case): ✅/❌
- Test 36 (Pointer-Events Override): ✅/❌
- Test 37 (Accessibility): ✅/❌
- Test 38-40 (Cross-Browser): ✅/❌

Overall: ____ / 22 tests passed

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

### Story 1.1 (Scaffolding):
- [ ] All automated tests pass (npm test)
- [ ] Extension builds without errors
- [ ] Extension loads in chrome://extensions
- [ ] Console log "WP Inspector Ready" appears

### Story 1.2 (Element Discovery):
- [ ] Hover shows blue outline
- [ ] Hidden elements ignored
- [ ] Performance ≥55fps during rapid hover

### Story 1.3 (Grid Overlay):
- [ ] Grid visually accurate (14px squares, padding box aligned)
- [ ] Single instance enforced (Tests 11-25 pass)
- [ ] Shadow DOM structure correct
- [ ] CSS isolation verified
- [ ] Static position adjustment works

### Story 1.4 (Click-Through Transparency):
- [ ] All automated tests pass (87/87 tests including pointer-events tests)
- [ ] Button/link/form click passthrough works (Tests 26-28)
- [ ] Text selection works (Test 29)
- [ ] Context menu and DevTools inspect correct (Tests 30-31)
- [ ] Drag-drop and custom events work (Tests 32-33)
- [ ] Performance: Event latency < 16ms (Test 34)
- [ ] Edge cases pass: Z-index, pointer-events override (Tests 35-36)
- [ ] Accessibility: Keyboard navigation works (Test 37)
- [ ] Cross-browser: Chrome/Edge/Brave consistent (Tests 38-40)

### General:
- [ ] No console errors
- [ ] test-page.html Section 10 functions correctly
- [ ] MANUAL_TESTING.md updated with Story 1.4 procedures
- [ ] All task checkboxes marked in story file
