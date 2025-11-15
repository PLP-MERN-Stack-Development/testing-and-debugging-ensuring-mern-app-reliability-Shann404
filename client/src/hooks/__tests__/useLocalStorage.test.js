import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage properly
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear the store and reset mocks
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should return initial value when no value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    const [value] = result.current;
    expect(value).toBe('initial');
  });

  it('should return value from localStorage', () => {
    // Set up mock to return a valid JSON string
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored value'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    const [value] = result.current;
    expect(value).toBe('stored value');
  });

  it('should update value and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      const [, setValue] = result.current;
      setValue('new value');
    });

    const [value] = result.current;
    expect(value).toBe('new value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('new value'));
  });

  it('should handle function updates', () => {
    // Start with a value in localStorage
    localStorageMock.getItem.mockReturnValue(JSON.stringify(0));

    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      const [, setValue] = result.current;
      setValue(prev => prev + 1);
    });

    const [value] = result.current;
    expect(value).toBe(1);
  });

  it('should handle JSON parse errors gracefully', () => {
    // Mock getItem to return invalid JSON
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));

    const [value] = result.current;
    expect(value).toBe('default');
  });

  it('should handle localStorage set errors gracefully', () => {
    // Mock setItem to throw an error once
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage failed');
    });

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    // Should not throw when setting value
    expect(() => {
      act(() => {
        const [, setValue] = result.current;
        setValue('new value');
      });
    }).not.toThrow();

    // The value should still be updated in state even if localStorage fails
    const [value] = result.current;
    expect(value).toBe('new value');
  });
});