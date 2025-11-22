import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock GridManager constructor before any imports to avoid localStorage issues
// This mock persists across vi.resetModules() calls
vi.mock('../../../src/content/modules/GridManager.js', () => {
  return {
    default: vi.fn(function GridManagerMock() {
      // Create fresh mock methods for each instance
      return {
        inject: vi.fn(),
        remove: vi.fn(),
        isActive: vi.fn(() => false),
        getGridHost: vi.fn(() => null)
      };
    })
  };
});

describe('InspectorController', () => {
  let dom;
  let InspectorController;

  beforeEach(async () => {
    // Create fresh DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 0);
      return 1;
    });
    global.cancelAnimationFrame = vi.fn();
    
    // Clear localStorage before each test
    global.localStorage.clear();

    // Clear module cache to get fresh singleton instance
    vi.resetModules();
    
    // Import controller after globals are set
    const module = await import('../../../src/content/modules/InspectorController.js');
    InspectorController = module.default;
  });

  afterEach(() => {
    InspectorController.destroy();
    vi.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return same instance on multiple imports', async () => {
      const module1 = await import('../../../src/content/modules/InspectorController.js');
      const module2 = await import('../../../src/content/modules/InspectorController.js');
      
      expect(module1.default).toBe(module2.default);
    });

    it('should maintain state across imports', async () => {
      InspectorController.isActive = true;
      
      const module2 = await import('../../../src/content/modules/InspectorController.js');
      
      expect(module2.default.isActive).toBe(true);
    });
  });

  describe('init()', () => {
    it('should create ElementSelector instance', () => {
      InspectorController.init();
      
      expect(InspectorController.elementSelector).toBeDefined();
      expect(InspectorController.elementSelector).not.toBeNull();
    });

    it('should create GridManager instance', () => {
      InspectorController.init();
      
      expect(InspectorController.gridManager).toBeDefined();
      expect(InspectorController.gridManager).not.toBeNull();
    });

    it('should register element selection callback', () => {
      InspectorController.init();
      
      expect(InspectorController.elementSelector.selectionCallback).toBeDefined();
      expect(typeof InspectorController.elementSelector.selectionCallback).toBe('function');
    });

    it('should initialize with inactive state', () => {
      InspectorController.init();
      
      expect(InspectorController.isActive).toBe(false);
      expect(InspectorController.lockedElement).toBeNull();
    });
  });

  describe('setActive()', () => {
    beforeEach(() => {
      InspectorController.init();
      // Mock GridManager to avoid localStorage issues in unlock()
      if (!InspectorController.gridManager) {
        InspectorController.gridManager = {
          remove: vi.fn(),
          inject: vi.fn(),
          isActive: vi.fn(() => false),
          getGridHost: vi.fn(() => null)
        };
      }
    });

    it('should call ElementSelector.enable() when activated', () => {
      const enableSpy = vi.spyOn(InspectorController.elementSelector, 'enable');
      
      InspectorController.setActive(true);
      
      expect(enableSpy).toHaveBeenCalled();
      expect(InspectorController.isActive).toBe(true);
    });

    it('should call ElementSelector.disable() when deactivated', () => {
      const disableSpy = vi.spyOn(InspectorController.elementSelector, 'disable');
      
      InspectorController.setActive(true);
      InspectorController.setActive(false);
      
      expect(disableSpy).toHaveBeenCalled();
      expect(InspectorController.isActive).toBe(false);
    });

    it('should call unlock() when deactivated to remove grid', () => {
      const unlockSpy = vi.spyOn(InspectorController, 'unlock');
      
      InspectorController.setActive(true);
      InspectorController.setActive(false);
      
      expect(unlockSpy).toHaveBeenCalled();
    });

    it('should update isActive state correctly', () => {
      InspectorController.setActive(true);
      expect(InspectorController.isActive).toBe(true);
      
      InspectorController.setActive(false);
      expect(InspectorController.isActive).toBe(false);
    });

    it('should handle missing elementSelector gracefully', () => {
      InspectorController.elementSelector = null;
      
      expect(() => InspectorController.setActive(true)).not.toThrow();
      expect(() => InspectorController.setActive(false)).not.toThrow();
    });
  });

  describe('lockElement()', () => {
    beforeEach(() => {
      InspectorController.init();
    });

    it('should store locked element reference', () => {
      const testElement = dom.window.document.createElement('div');
      
      InspectorController.lockElement(testElement);
      
      expect(InspectorController.lockedElement).toBe(testElement);
    });

    it('should disable ElementSelector when locking', () => {
      const testElement = dom.window.document.createElement('div');
      const disableSpy = vi.spyOn(InspectorController.elementSelector, 'disable');
      
      InspectorController.lockElement(testElement);
      
      expect(disableSpy).toHaveBeenCalled();
    });

    // TODO: Fix localStorage SecurityError in JSDOM
    it.skip('should call GridManager.inject() with element', () => {
      const testElement = dom.window.document.createElement('div');
      const injectSpy = vi.spyOn(InspectorController.gridManager, 'inject');
      
      InspectorController.lockElement(testElement);
      
      expect(injectSpy).toHaveBeenCalledWith(testElement);
    });

    it('should allow locking different elements', () => {
      const element1 = dom.window.document.createElement('div');
      const element2 = dom.window.document.createElement('span');
      
      InspectorController.lockElement(element1);
      expect(InspectorController.lockedElement).toBe(element1);
      
      InspectorController.lockElement(element2);
      expect(InspectorController.lockedElement).toBe(element2);
    });
  });

  describe('unlock()', () => {
    beforeEach(() => {
      InspectorController.init();
    });

    it('should call GridManager.remove()', () => {
      const testElement = dom.window.document.createElement('div');
      InspectorController.lockElement(testElement);
      
      const removeSpy = vi.spyOn(InspectorController.gridManager, 'remove');
      InspectorController.unlock();
      
      expect(removeSpy).toHaveBeenCalled();
    });

    it('should clear locked element reference', () => {
      const testElement = dom.window.document.createElement('div');
      InspectorController.lockElement(testElement);
      
      InspectorController.unlock();
      
      expect(InspectorController.lockedElement).toBeNull();
    });

    it('should re-enable ElementSelector if extension is active', () => {
      InspectorController.setActive(true);
      
      const testElement = dom.window.document.createElement('div');
      InspectorController.lockElement(testElement);
      
      const enableSpy = vi.spyOn(InspectorController.elementSelector, 'enable');
      InspectorController.unlock();
      
      expect(enableSpy).toHaveBeenCalled();
    });

    it('should not re-enable ElementSelector if extension is inactive', () => {
      InspectorController.setActive(false);
      
      const testElement = dom.window.document.createElement('div');
      InspectorController.lockElement(testElement);
      
      const enableSpy = vi.spyOn(InspectorController.elementSelector, 'enable');
      InspectorController.unlock();
      
      expect(enableSpy).not.toHaveBeenCalled();
    });

    it('should be safe to call when no element is locked', () => {
      expect(() => InspectorController.unlock()).not.toThrow();
      expect(InspectorController.lockedElement).toBeNull();
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      InspectorController.init();
      InspectorController.setActive(true);
    });

    it('should call GridManager.remove()', () => {
      const testElement = dom.window.document.createElement('div');
      InspectorController.lockElement(testElement);
      
      const removeSpy = vi.spyOn(InspectorController.gridManager, 'remove');
      InspectorController.destroy();
      
      expect(removeSpy).toHaveBeenCalled();
    });

    it('should call ElementSelector.disable()', () => {
      const disableSpy = vi.spyOn(InspectorController.elementSelector, 'disable');
      
      InspectorController.destroy();
      
      expect(disableSpy).toHaveBeenCalled();
    });

    it('should reset all state properties', () => {
      const testElement = dom.window.document.createElement('div');
      InspectorController.lockElement(testElement);
      
      InspectorController.destroy();
      
      expect(InspectorController.isActive).toBe(false);
      expect(InspectorController.lockedElement).toBeNull();
      expect(InspectorController.elementSelector).toBeNull();
      expect(InspectorController.gridManager).toBeNull();
    });

    it('should handle missing elementSelector gracefully', () => {
      InspectorController.elementSelector = null;
      
      expect(() => InspectorController.destroy()).not.toThrow();
    });

    it('should handle missing gridManager gracefully', () => {
      InspectorController.gridManager = null;
      
      expect(() => InspectorController.destroy()).not.toThrow();
    });
  });

  describe('state management', () => {
    beforeEach(() => {
      InspectorController.init();
    });

    it('should track state changes correctly through workflow', () => {
      // Initial state
      expect(InspectorController.isActive).toBe(false);
      expect(InspectorController.lockedElement).toBeNull();
      
      // Activate
      InspectorController.setActive(true);
      expect(InspectorController.isActive).toBe(true);
      
      // Lock element
      const testElement = dom.window.document.createElement('div');
      InspectorController.lockElement(testElement);
      expect(InspectorController.lockedElement).toBe(testElement);
      
      // Unlock
      InspectorController.unlock();
      expect(InspectorController.lockedElement).toBeNull();
      
      // Deactivate
      InspectorController.setActive(false);
      expect(InspectorController.isActive).toBe(false);
    });

    // TODO: Fix localStorage SecurityError in JSDOM
    it.skip('should maintain independent state properties', () => {
      const testElement = dom.window.document.createElement('div');
      
      InspectorController.setActive(true);
      InspectorController.lockElement(testElement);
      
      // Deactivating should not affect locked element
      InspectorController.setActive(false);
      expect(InspectorController.lockedElement).toBe(testElement);
      
      // Unlocking should not affect active state
      InspectorController.unlock();
      expect(InspectorController.isActive).toBe(false);
    });

    // TODO: Fix localStorage SecurityError in JSDOM
    it.skip('should follow complete lock/unlock workflow with GridManager', () => {
      InspectorController.setActive(true);
      
      const testElement = dom.window.document.createElement('div');
      const injectSpy = vi.spyOn(InspectorController.gridManager, 'inject');
      const removeSpy = vi.spyOn(InspectorController.gridManager, 'remove');
      const disableSpy = vi.spyOn(InspectorController.elementSelector, 'disable');
      const enableSpy = vi.spyOn(InspectorController.elementSelector, 'enable');
      
      // Lock
      InspectorController.lockElement(testElement);
      expect(disableSpy).toHaveBeenCalled();
      expect(injectSpy).toHaveBeenCalledWith(testElement);
      
      // Unlock
      InspectorController.unlock();
      expect(removeSpy).toHaveBeenCalled();
      expect(enableSpy).toHaveBeenCalled();
    });
  });
});
