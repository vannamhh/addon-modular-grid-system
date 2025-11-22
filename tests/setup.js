// Vitest setup file
// Mock localStorage for JSDOM environment

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

global.localStorage = new LocalStorageMock();

// Override Storage prototype to prevent SecurityError in JSDOM
if (typeof Storage !== 'undefined') {
  Object.defineProperty(Storage.prototype, 'getItem', {
    value: function(key) {
      return this[key] || null;
    },
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(Storage.prototype, 'setItem', {
    value: function(key, value) {
      this[key] = String(value);
    },
    writable: true,
    configurable: true
  });
}
