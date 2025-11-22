# Manual Testing Instructions - Story 1.2

## Prerequisites
- Chrome browser (version 88+)
- Extension built successfully (run `npm run build` if not done)

## Testing Steps

### 1. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist/` folder from the project directory
5. Verify extension appears in the list with no errors

### 2. Open Test Page

1. Open `test-page.html` in a new Chrome tab (can drag file to browser)
2. Open Chrome DevTools (press F12 or right-click → Inspect)
3. Go to Console tab
4. Verify you see: "Test page loaded. Activate the extension to begin testing."

### 3. Activate Extension

1. Click the extension icon in Chrome toolbar (puzzle piece icon if needed)
2. In the popup, click "Activate Inspector" button
3. Return to test page
4. In Console, verify you see: "WP Inspector Ready"

### 4. Test Basic Hover (AC1, AC2)

**Expected:** Blue outline (#0080FF, 2px) appears when hovering over elements

1. Hover mouse over "Section 1: Basic Hover Test"
   - ✅ Blue outline should appear on the section div
2. Hover over the paragraph inside
   - ✅ Outline should switch to the paragraph
3. Hover over the button
   - ✅ Outline should switch to the button
4. Move mouse away from all elements
   - ✅ Outline should disappear

**Status:** ⬜ PASS / ⬜ FAIL

### 5. Test Nested Elements (AC3 - Performance)

**Expected:** Smooth transitions without frame drops

1. Go to "Section 2: Nested Elements"
2. Move mouse rapidly in zigzag pattern over the nested divs
3. Observe visual smoothness (should feel fluid, no lag)

**Status:** ⬜ PASS / ⬜ FAIL

### 6. Test Hidden Element Filtering (AC4)

**Expected:** Hidden elements are ignored (no outline)

1. Go to "Section 3: Hidden Elements Test"
2. Hover over the area where "display: none" text should be
   - ✅ NO outline should appear
3. Hover over the yellow box with "visibility: hidden" text
   - ✅ Only the container box gets outline, not the invisible text
4. Hover over "opacity: 0" text area
   - ✅ NO outline should appear
5. Hover over "height: 0" div area
   - ✅ NO outline should appear
6. Hover over "Normal visible paragraph"
   - ✅ Outline SHOULD appear (proving selector still works)

**Status:** ⬜ PASS / ⬜ FAIL

### 7. Performance Profiling (AC3)

**Expected:** 60fps target, no frame drops below 55fps

1. Go to "Section 5: Stress Test"
2. Click "Generate 100 Boxes" button
3. Open DevTools → Performance tab (Cmd+Shift+E or Ctrl+Shift+E)
4. Click the Record button (circle icon)
5. Hover rapidly across all 100 boxes for 10 seconds
6. Stop recording
7. Analyze the results:
   - Check FPS graph (should stay above 55fps consistently)
   - Look for long tasks (should be none >50ms)
   - Check for frame drops (red bars in FPS graph)

**Measured FPS:** _____ fps
**Frame drops:** ⬜ None / ⬜ Some / ⬜ Many
**Long tasks >50ms:** ⬜ 0 / ⬜ 1-5 / ⬜ >5

**Status:** ⬜ PASS / ⬜ FAIL

### 8. Deactivate Extension

1. Click extension icon again
2. Click "Deactivate Inspector" button
3. Hover over elements on test page
   - ✅ NO blue outline should appear anymore

**Status:** ⬜ PASS / ⬜ FAIL

### 9. Check Console for Errors

1. Review DevTools Console tab
2. Verify:
   - ✅ No error messages (red text)
   - ✅ Only expected logs: "WP Inspector Ready", etc.

**Status:** ⬜ PASS / ⬜ FAIL

---

## Summary

**Total Tests:** 7
**Passed:** _____
**Failed:** _____

**Acceptance Criteria Validation:**

- [ ] AC1-Hover: Blue outline appears on hover
- [ ] AC2-Clear: Outline disappears when mouse moves away
- [ ] AC3-Performance: 60fps maintained (validated via profiler)
- [ ] AC4-Filter: Hidden elements ignored

**Overall Status:** ⬜ APPROVED / ⬜ CHANGES NEEDED

**Notes:**
_Add any observations, issues, or concerns here_

---

## If Issues Found

1. Check Chrome Console for error messages
2. Verify extension was built successfully (`npm run build`)
3. Try reloading the extension (click refresh icon in chrome://extensions)
4. Try reloading the test page (Cmd+R or Ctrl+R)
5. If issue persists, document the exact steps to reproduce and report to dev team
