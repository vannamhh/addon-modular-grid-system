/**
 * GridManager Unit Tests
 * Tests Shadow DOM creation, positioning, single instance, and cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GridManager from '../../../src/content/modules/GridManager.js';

describe('GridManager', () => {
  let gridManager;
  let mockElement;
  
  beforeEach(() => {
    gridManager = new GridManager();
    
    // Create mock target element
    mockElement = document.createElement('div');
    mockElement.style.width = '280px';
    mockElement.style.height = '140px';
    document.body.appendChild(mockElement);
    
    // Mock attachShadow for JSDOM compatibility
    if (!HTMLElement.prototype.attachShadow) {
      HTMLElement.prototype.attachShadow = function(options) {
        const shadowRoot = document.createElement('div');
        shadowRoot.mode = options.mode;
        shadowRoot.querySelector = function(selector) {
          return this.querySelector.call(this, selector);
        }.bind(shadowRoot);
        this.shadowRoot = shadowRoot;
        return shadowRoot;
      };
    }
    
    // Mock getBoundingClientRect
    mockElement.getBoundingClientRect = vi.fn(() => ({
      width: 280,
      height: 140,
      top: 0,
      left: 0,
      right: 280,
      bottom: 140
    }));
    
    // Mock getComputedStyle
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn((element) => {
      if (element === mockElement) {
        return {
          position: 'static',
          borderTopWidth: '0px',
          borderLeftWidth: '0px',
          borderRightWidth: '0px',
          borderBottomWidth: '0px',
          paddingTop: '0px',
          paddingLeft: '0px',
          paddingRight: '0px',
          paddingBottom: '0px'
        };
      }
      return originalGetComputedStyle(element);
    });
  });
  
  afterEach(() => {
    // Cleanup
    gridManager.remove();
    if (mockElement.parentNode) {
      mockElement.remove();
    }
    vi.restoreAllMocks();
  });
  
  describe('inject()', () => {
    it('should create shadow host with correct ID', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      expect(shadowHost).not.toBeNull();
      expect(shadowHost.id).toBe('wp-rhythm-host');
    });
    
    it('should create shadow host with correct positioning styles', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      expect(shadowHost.style.position).toBe('absolute');
      // Grid extends to border edge using negative offset
      // When borders are 0 (mocked), -0px becomes 0px in JS
      expect(shadowHost.style.top).toBe('0px'); // -borderTop (0 when border=0)
      expect(shadowHost.style.left).toBe('0px'); // -borderLeft
      expect(shadowHost.style.right).toBe('0px'); // -borderRight
      expect(shadowHost.style.bottom).toBe('0px'); // -borderBottom
      expect(shadowHost.style.pointerEvents).toBe('none');
      expect(shadowHost.style.zIndex).toBe('999');
    });
    
    it('should attach shadow root in open mode', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      expect(shadowHost.shadowRoot).not.toBeNull();
      expect(shadowHost.shadowRoot.mode).toBe('open');
    });
    
    it('should inject style tag into shadow root', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      const style = shadowHost.shadowRoot.querySelector('style');
      
      expect(style).not.toBeNull();
      expect(style.textContent).toContain('.grid-pattern');
      expect(style.textContent).toContain('repeating-linear-gradient');
    });
    
    it('should inject grid pattern div into shadow root', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      const gridPattern = shadowHost.shadowRoot.querySelector('.grid-pattern');
      
      expect(gridPattern).not.toBeNull();
      expect(gridPattern.className).toBe('grid-pattern');
    });
    
    it('should set position:relative on static elements', () => {
      // mockElement already has position:static via mock
      gridManager.inject(mockElement);
      
      expect(mockElement.style.position).toBe('relative');
    });
    
    it('should store original position value', () => {
      mockElement.style.position = 'absolute';
      
      window.getComputedStyle = vi.fn(() => ({ position: 'absolute' }));
      
      gridManager.inject(mockElement);
      
      expect(gridManager.originalPosition).toBe('absolute');
    });
    
    it('should remove previous grid before creating new one (single instance)', () => {
      const firstElement = document.createElement('div');
      document.body.appendChild(firstElement);
      
      gridManager.inject(firstElement);
      const firstHost = firstElement.querySelector('#wp-rhythm-host');
      
      gridManager.inject(mockElement);
      
      // First shadow host should be removed
      expect(firstHost.isConnected).toBe(false);
      
      // New shadow host should exist
      const newHost = mockElement.querySelector('#wp-rhythm-host');
      expect(newHost).not.toBeNull();
      
      firstElement.remove();
    });
  });
  
  describe('remove()', () => {
    it('should remove shadow host from DOM', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      expect(shadowHost).not.toBeNull();
      
      gridManager.remove();
      
      const removedHost = mockElement.querySelector('#wp-rhythm-host');
      expect(removedHost).toBeNull();
    });
    
    it('should restore original position style', () => {
      mockElement.style.position = 'absolute';
      window.getComputedStyle = vi.fn(() => ({ position: 'absolute' }));
      
      gridManager.inject(mockElement);
      gridManager.remove();
      
      expect(mockElement.style.position).toBe('absolute');
    });
    
    it('should clear position style if not originally set', () => {
      // Element has no explicit style.position
      gridManager.inject(mockElement);
      gridManager.remove();
      
      expect(mockElement.style.position).toBe('');
    });
    
    it('should clear internal references', () => {
      gridManager.inject(mockElement);
      gridManager.remove();
      
      expect(gridManager.currentGridHost).toBeNull();
      expect(gridManager.targetElement).toBeNull();
      expect(gridManager.originalPosition).toBeNull();
    });
    
    it('should handle remove when no grid is active', () => {
      // Should not throw error
      expect(() => gridManager.remove()).not.toThrow();
    });
  });
  
  describe('isActive()', () => {
    it('should return false when no grid is injected', () => {
      expect(gridManager.isActive()).toBe(false);
    });
    
    it('should return true when grid is injected', () => {
      gridManager.inject(mockElement);
      expect(gridManager.isActive()).toBe(true);
    });
    
    it('should return false after grid is removed', () => {
      gridManager.inject(mockElement);
      gridManager.remove();
      expect(gridManager.isActive()).toBe(false);
    });
    
    it('should return false if shadow host is disconnected from DOM', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      shadowHost.remove();
      
      expect(gridManager.isActive()).toBe(false);
    });
  });
  
  describe('getGridHost()', () => {
    it('should return null when no grid is active', () => {
      expect(gridManager.getGridHost()).toBeNull();
    });
    
    it('should return shadow host element when grid is active', () => {
      gridManager.inject(mockElement);
      
      const host = gridManager.getGridHost();
      expect(host).not.toBeNull();
      expect(host.id).toBe('wp-rhythm-host');
    });
    
    it('should return null after grid is removed', () => {
      gridManager.inject(mockElement);
      gridManager.remove();
      
      expect(gridManager.getGridHost()).toBeNull();
    });
  });
  
  describe('Grid CSS Generation', () => {
    it('should generate CSS with 14px grid size', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      const style = shadowHost.shadowRoot.querySelector('style');
      
      // New pattern: colored line at 0, transparent section after
      expect(style.textContent).toContain('1px'); // LINE_WIDTH
      expect(style.textContent).toContain('14px'); // GRID_SIZE
    });
    
    it('should use cyan color #00FFFF', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      const style = shadowHost.shadowRoot.querySelector('style');
      
      expect(style.textContent).toContain('#00FFFF');
    });
    
    it('should set opacity to 0.35', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      const style = shadowHost.shadowRoot.querySelector('style');
      
      expect(style.textContent).toContain('opacity: 0.35');
    });
    
    it('should create both vertical and horizontal gradients', () => {
      gridManager.inject(mockElement);
      
      const shadowHost = mockElement.querySelector('#wp-rhythm-host');
      const style = shadowHost.shadowRoot.querySelector('style');
      
      // Check for to bottom (horizontal lines) and to right (vertical lines)
      expect(style.textContent).toContain('to bottom');
      expect(style.textContent).toContain('to right');
    });
  });
});
