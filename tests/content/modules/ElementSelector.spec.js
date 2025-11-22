import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock GridManager to avoid localStorage issues
vi.mock('../../../src/content/modules/GridManager.js', () => {
  return {
    default: vi.fn(function GridManagerMock() {
      return {
        inject: vi.fn(),
        remove: vi.fn(),
        isActive: vi.fn(() => false),
        getGridHost: vi.fn(() => null)
      };
    })
  };
});

import ElementSelector from '../../../src/content/modules/ElementSelector.js';

describe('ElementSelector', () => {
  let selector;
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Create fresh DOM environment for each test
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="test">Test</div></body></html>');
    document = dom.window.document;
    window = dom.window;
    
    // Make DOM globals available
    global.document = document;
    global.window = window;
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 0);
      return 1;
    });
    global.cancelAnimationFrame = vi.fn();
    
    selector = new ElementSelector();
  });

  afterEach(() => {
    selector.disable();
    vi.clearAllMocks();
  });

  describe('enable()', () => {
    it('should register mousemove listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      selector.enable();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
      expect(selector.enabled).toBe(true);
    });

    it('should not register listener twice if already enabled', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      selector.enable();
      selector.enable();
      
      // Should register mousemove and click listeners once each (2 total)
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('disable()', () => {
    it('should remove mousemove listener', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      selector.enable();
      selector.disable();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
      expect(selector.enabled).toBe(false);
    });

    it('should cancel pending animation frame', () => {
      selector.enabled = true; // Must be enabled first
      selector.rafId = 123;
      
      selector.disable();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);
      expect(selector.rafId).toBeNull();
    });

    it('should clear highlights', () => {
      const testElement = document.getElementById('test');
      selector.enabled = true; // Must be enabled
      selector.highlightElement(testElement);
      
      selector.disable();
      
      expect(selector.currentElement).toBeNull();
      expect(testElement.style.outline).toBe('');
    });
  });

  describe('isElementValid()', () => {
    it('should return false for display:none elements', () => {
      const testElement = document.getElementById('test');
      testElement.style.display = 'none';
      
      // Mock getComputedStyle
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'none',
        visibility: 'visible',
        opacity: '1'
      });
      
      // Mock getBoundingClientRect
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      
      expect(selector.isElementValid(testElement)).toBe(false);
    });

    it('should return false for visibility:hidden elements', () => {
      const testElement = document.getElementById('test');
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'hidden',
        opacity: '1'
      });
      
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      
      expect(selector.isElementValid(testElement)).toBe(false);
    });

    it('should return false for opacity:0 elements', () => {
      const testElement = document.getElementById('test');
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '0'
      });
      
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      
      expect(selector.isElementValid(testElement)).toBe(false);
    });

    it('should return false for zero-width elements', () => {
      const testElement = document.getElementById('test');
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
      
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 0,
        height: 100
      }));
      
      expect(selector.isElementValid(testElement)).toBe(false);
    });

    it('should return false for zero-height elements', () => {
      const testElement = document.getElementById('test');
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
      
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 0
      }));
      
      expect(selector.isElementValid(testElement)).toBe(false);
    });

    it('should return false for shadow host element', () => {
      const shadowHost = document.createElement('div');
      shadowHost.id = 'wp-rhythm-host';
      
      expect(selector.isElementValid(shadowHost)).toBe(false);
    });

    it('should return true for valid visible elements', () => {
      const testElement = document.getElementById('test');
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
      
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      
      expect(selector.isElementValid(testElement)).toBe(true);
    });
  });

  describe('highlightElement()', () => {
    it('should apply correct outline styles', () => {
      const testElement = document.getElementById('test');
      
      selector.highlightElement(testElement);
      
      expect(testElement.style.outline).toBe('2px solid #0080FF');
      expect(testElement.style.outlineOffset).toBe('0px');
      expect(selector.currentElement).toBe(testElement);
    });

    it('should store original outline styles', () => {
      const testElement = document.getElementById('test');
      testElement.style.outline = '1px solid red';
      testElement.style.outlineOffset = '2px';
      
      selector.highlightElement(testElement);
      
      expect(selector.originalStyles.outline).toBe('1px solid red');
      expect(selector.originalStyles.outlineOffset).toBe('2px');
    });
  });

  describe('clearHighlight()', () => {
    it('should restore original outline styles', () => {
      const testElement = document.getElementById('test');
      testElement.style.outline = '1px solid red';
      testElement.style.outlineOffset = '2px';
      
      selector.highlightElement(testElement);
      selector.clearHighlight();
      
      expect(testElement.style.outline).toBe('1px solid red');
      expect(testElement.style.outlineOffset).toBe('2px');
      expect(selector.currentElement).toBeNull();
    });

    it('should handle elements with no original styles', () => {
      const testElement = document.getElementById('test');
      
      selector.highlightElement(testElement);
      selector.clearHighlight();
      
      expect(testElement.style.outline).toBe('');
      expect(testElement.style.outlineOffset).toBe('');
    });

    it('should do nothing if no element is highlighted', () => {
      expect(() => selector.clearHighlight()).not.toThrow();
    });
  });

  describe('requestAnimationFrame throttling', () => {
    it('should only schedule one frame at a time', () => {
      const testElement = document.getElementById('test');
      
      // Mock valid element
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      
      selector.enable();
      
      // Simulate multiple rapid mousemove events
      const event1 = { target: testElement };
      const event2 = { target: testElement };
      const event3 = { target: testElement };
      
      selector.handleMouseMove(event1);
      selector.handleMouseMove(event2);
      selector.handleMouseMove(event3);
      
      // Should only call requestAnimationFrame once
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    it('should reset rafId after frame execution', async () => {
      const testElement = document.getElementById('test');
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      
      // Use Promise-based approach instead of done callback
      const rafPromise = new Promise((resolve) => {
        global.requestAnimationFrame = (cb) => {
          setTimeout(() => {
            cb();
            resolve();
          }, 0);
          return 1;
        };
      });
      
      selector.enable();
      selector.handleMouseMove({ target: testElement });
      
      await rafPromise;
      
      // rafId should be null after callback executes
      expect(selector.rafId).toBeNull();
    });
  });

  describe('handleHover()', () => {
    it('should not highlight if element is same as current', () => {
      const testElement = document.getElementById('test');
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      
      selector.highlightElement(testElement);
      const originalOutline = testElement.style.outline;
      
      selector.handleHover({ target: testElement });
      
      expect(testElement.style.outline).toBe(originalOutline);
    });

    it('should clear previous highlight before applying new one', () => {
      const element1 = document.getElementById('test');
      const element2 = document.createElement('div');
      document.body.appendChild(element2);
      
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
      element1.getBoundingClientRect = vi.fn(() => ({ width: 100, height: 100 }));
      element2.getBoundingClientRect = vi.fn(() => ({ width: 100, height: 100 }));
      
      selector.highlightElement(element1);
      selector.handleHover({ target: element2 });
      
      expect(element1.style.outline).toBe('');
      expect(element2.style.outline).toBe('2px solid #0080FF');
    });
  });

  describe('onElementSelected()', () => {
    it('should register callback function', () => {
      const mockCallback = vi.fn();
      
      selector.onElementSelected(mockCallback);
      
      expect(selector.selectionCallback).toBe(mockCallback);
    });

    it('should allow callback to be updated', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      selector.onElementSelected(callback1);
      expect(selector.selectionCallback).toBe(callback1);
      
      selector.onElementSelected(callback2);
      expect(selector.selectionCallback).toBe(callback2);
    });
  });

  describe('handleClick()', () => {
    let testElement;
    let mockCallback;

    beforeEach(() => {
      testElement = document.getElementById('test');
      mockCallback = vi.fn();
      selector.onElementSelected(mockCallback);
      
      // Mock element validation
      testElement.getBoundingClientRect = vi.fn(() => ({
        width: 100,
        height: 100
      }));
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      });
    });

    // TODO: Fix localStorage SecurityError in JSDOM
    it.skip('should invoke callback when clicking highlighted element', () => {
      selector.currentElement = testElement;
      
      // Use plain object instead of MouseEvent to avoid JSDOM security issues
      const clickEvent = {
        target: testElement,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        defaultPrevented: false
      };
      clickEvent.preventDefault = vi.fn(() => {
        clickEvent.defaultPrevented = true;
      });
      
      selector.handleClick(clickEvent);
      
      expect(mockCallback).toHaveBeenCalledWith(testElement);
      expect(clickEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not invoke callback when clicking non-highlighted element', () => {
      const otherElement = document.createElement('span');
      selector.currentElement = testElement;
      
      const clickEvent = {
        target: otherElement,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      };
      
      selector.handleClick(clickEvent);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not throw if no callback is registered', () => {
      selector.selectionCallback = null;
      selector.currentElement = testElement;
      
      const clickEvent = {
        target: testElement,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      };
      
      expect(() => selector.handleClick(clickEvent)).not.toThrow();
    });

    it('should stop event propagation', () => {
      selector.currentElement = testElement;
      
      const stopPropagationSpy = vi.fn();
      const clickEvent = {
        target: testElement,
        preventDefault: vi.fn(),
        stopPropagation: stopPropagationSpy
      };
      
      selector.handleClick(clickEvent);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('click listener registration', () => {
    it('should register click listener when enabled', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      selector.enable();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
    });

    it('should remove click listener when disabled', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      selector.enable();
      selector.disable();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
    });
  });
});
