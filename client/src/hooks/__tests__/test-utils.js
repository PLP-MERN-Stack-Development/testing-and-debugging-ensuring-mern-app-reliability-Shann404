import { renderHook, act } from '@testing-library/react';

// Mock localStorage for testing
export const setupLocalStorageMock = () => {
  let store = {};
  
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    store = {};
    jest.clearAllMocks();
  });
};

// Mock fetch/API for testing
export const setupFetchMock = () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
};

export const createMockStorage = () => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      if (value === undefined) {
        store[key] = 'undefined';
      } else {
        store[key] = value.toString();
      }
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
};

// Mock localStorage for tests
export const mockLocalStorage = createMockStorage();