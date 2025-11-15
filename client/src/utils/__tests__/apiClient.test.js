// src/utils/__tests__/apiClient.test.js
import apiClient from '../apiClient';

describe('API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    // Clear any stored token
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should make GET request with auth header', async () => {
    const mockResponse = { data: 'test' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    localStorage.setItem('token', 'test-token');
    
    const response = await apiClient.get('/test');

    expect(global.fetch).toHaveBeenCalledWith('/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
  });

  it('should make POST request with data', async () => {
    const mockResponse = { data: 'created' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const postData = { title: 'Test Post' };
    await apiClient.post('/posts', postData);

    expect(global.fetch).toHaveBeenCalledWith('/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null'
      },
      body: JSON.stringify(postData)
    });
  });

  it('should handle request without token', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    });

    await apiClient.get('/public');

    expect(global.fetch).toHaveBeenCalledWith('/public', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null'
      }
    });
  });

  it('should handle failed request', async () => {
    const mockError = { message: 'Not found' };
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => mockError
    });

    try {
      await apiClient.get('/not-found');
    } catch (error) {
      expect(error.response).toEqual(mockError);
    }
  });

  it('should handle network error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    try {
      await apiClient.get('/test');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });
});