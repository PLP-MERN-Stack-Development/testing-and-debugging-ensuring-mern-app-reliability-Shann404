import {
  getFromStorage,
  setToStorage,
  removeFromStorage,
  clearStorage
} from '../storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getFromStorage', () => {
    it('should retrieve string from localStorage', () => {
      localStorage.setItem('testKey', 'testValue');
      const result = getFromStorage('testKey');
      
      expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
      expect(result).toBe('testValue');
    });

    it('should parse JSON objects', () => {
      const testObj = { name: 'John', age: 30 };
      localStorage.setItem('testKey', JSON.stringify(testObj));
      
      const result = getFromStorage('testKey', true);
      
      expect(result).toEqual(testObj);
    });

    it('should return null for non-existent key', () => {
      const result = getFromStorage('nonExistentKey');
      expect(result).toBeNull();
    });
  });

  describe('setToStorage', () => {
    it('should store string in localStorage', () => {
      setToStorage('testKey', 'testValue');
      
      expect(localStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
    });

    it('should stringify objects when stringify=true', () => {
      const testObj = { name: 'John' };
      setToStorage('testKey', testObj, true);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'testKey', 
        JSON.stringify(testObj)
      );
    });
  });

  describe('removeFromStorage', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('testKey', 'testValue');
      
      removeFromStorage('testKey');
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('testKey');
    });
  });

  describe('clearStorage', () => {
    it('should clear all items from localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      
      clearStorage();
      
      expect(localStorage.clear).toHaveBeenCalled();
    });
  });
});