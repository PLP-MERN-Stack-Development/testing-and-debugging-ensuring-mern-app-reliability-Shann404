// src/store/slices/__tests__/authSlice.test.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { 
  loginUser, 
  registerUser, 
  logoutUser, 
  clearError, 
  setCredentials 
} from '../authSlice';
import apiClient from '../../../utils/apiClient';

// Mock the API client
jest.mock('../../../utils/apiClient', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Create a proper localStorage mock
const createLocalStorageMock = () => {
  let store = {};
  return {
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
    _getStore: () => store // Helper to inspect store
  };
};

let localStorageMock;

describe('Auth Slice', () => {
  let store;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    store = configureStore({
      reducer: {
        auth: authReducer
      }
    });
    
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false
      });
    });


  });

  describe('reducers', () => {
    it('should clear error', () => {
      // Set error state by dispatching a rejected action
      const errorPayload = { message: 'Test error' };
      store.dispatch({
        type: 'auth/login/rejected',
        payload: errorPayload
      });

      expect(store.getState().auth.error).toEqual(errorPayload);
      
      store.dispatch(clearError());
      
      expect(store.getState().auth.error).toBeNull();
    });

    it('should set credentials', () => {
      const credentials = {
        user: { id: '1', name: 'Test User' },
        token: 'new-token'
      };
      
      store.dispatch(setCredentials(credentials));
      
      const state = store.getState().auth;
      expect(state.user).toEqual(credentials.user);
      expect(state.token).toBe(credentials.token);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('loginUser async thunk', () => {
    it('should handle successful login and store token in localStorage', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          token: 'mock-token'
        }
      };
      apiClient.post.mockResolvedValue(mockResponse);

      await store.dispatch(loginUser({ email: 'test@example.com', password: 'password' }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe(mockResponse.data.token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.data.token);
    });

    it('should handle login failure with server error', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };
      apiClient.post.mockRejectedValue(mockError);

      await store.dispatch(loginUser({ email: 'test@example.com', password: 'wrong' }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual({ message: 'Invalid credentials' });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should handle login failure without response data', async () => {
      apiClient.post.mockRejectedValue(new Error('Network error'));

      await store.dispatch(loginUser({ email: 'test@example.com', password: 'password' }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Login failed');
    });

    it('should set loading state during login', () => {
      // Test pending state
      store.dispatch({ type: 'auth/login/pending' });

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('registerUser async thunk', () => {
    it('should handle successful registration', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', name: 'New User', email: 'new@example.com' },
          token: 'new-token'
        }
      };
      apiClient.post.mockResolvedValue(mockResponse);

      await store.dispatch(registerUser({ 
        name: 'New User', 
        email: 'new@example.com', 
        password: 'password' 
      }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe(mockResponse.data.token);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.data.token);
    });

    it('should handle registration failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Email already exists' }
        }
      };
      apiClient.post.mockRejectedValue(mockError);

      await store.dispatch(registerUser({ 
        name: 'New User', 
        email: 'existing@example.com', 
        password: 'password' 
      }));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual({ message: 'Email already exists' });
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logoutUser async thunk', () => {
    it('should handle successful logout and remove token from localStorage', async () => {
      // First set authenticated state
      store.dispatch(setCredentials({ 
        user: { id: '1', name: 'Test User' }, 
        token: 'test-token' 
      }));
      
      localStorageMock.setItem('token', 'test-token');

      apiClient.post.mockResolvedValue({});
      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle logout failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Logout failed' }
        }
      };
      apiClient.post.mockRejectedValue(mockError);

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toEqual({ message: 'Logout failed' });
    });
  });

  // Test the actual localStorage integration
  describe('localStorage integration', () => {
    it('should save token to localStorage on successful auth', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', name: 'Test User' },
          token: 'auth-token-123'
        }
      };
      apiClient.post.mockResolvedValue(mockResponse);

      await store.dispatch(loginUser({ email: 'test@example.com', password: 'password' }));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'auth-token-123');
    });

    it('should remove token from localStorage on logout', async () => {
      // Set up authenticated state
      store.dispatch(setCredentials({ 
        user: { id: '1', name: 'Test User' }, 
        token: 'existing-token' 
      }));
      localStorageMock.setItem('token', 'existing-token');

      apiClient.post.mockResolvedValue({});
      await store.dispatch(logoutUser());

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });
});