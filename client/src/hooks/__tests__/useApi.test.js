import { renderHook, act } from '@testing-library/react';
import { useApi } from '../useApi';
import { apiClient } from '../../utils/apiClient';

jest.mock('../../utils/apiClient');

describe('useApi', () => {
  beforeEach(() => {
    apiClient.get.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useApi('/test'));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful API call', async () => {
    const mockData = { id: 1, name: 'Test' };
    apiClient.get.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApi('/test'));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    const errorMessage = 'API Error';
    apiClient.get.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useApi('/test'));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (err) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('should execute immediately when immediate is true', async () => {
    const mockData = { id: 1 };
    apiClient.get.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApi('/test', { immediate: true }));

    // Wait for the promise to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(apiClient.get).toHaveBeenCalledWith('/test', {});
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
  });
});