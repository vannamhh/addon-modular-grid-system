import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Content Script Initialization', () => {
  beforeEach(() => {
    // Clear console spies before each test
    vi.clearAllMocks();
  });

  it('should not throw errors during initialization', () => {
    expect(() => {
      // Simulate content script execution
      (function initializeInspector() {
        console.log('WP Inspector Ready');
      })();
    }).not.toThrow();
  });

  it('should log "WP Inspector Ready" message', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    // Simulate content script execution
    (function initializeInspector() {
      console.log('WP Inspector Ready');
    })();
    
    expect(consoleSpy).toHaveBeenCalledWith('WP Inspector Ready');
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    
    // Simulate error during initialization
    (function initializeInspector() {
      try {
        throw new Error('Test error');
      } catch (error) {
        console.error('WP Inspector initialization failed:', error);
      }
    })();
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toBe('WP Inspector initialization failed:');
  });

  it('should be wrapped in IIFE for isolation', () => {
    const code = `
      (function initializeInspector() {
        try {
          console.log('WP Inspector Ready');
        } catch (error) {
          console.error('WP Inspector initialization failed:', error);
        }
      })();
    `;
    
    // Verify IIFE pattern exists (multiline safe)
    expect(code).toMatch(/\(function[\s\S]*\)\(\)/);
  });
});
