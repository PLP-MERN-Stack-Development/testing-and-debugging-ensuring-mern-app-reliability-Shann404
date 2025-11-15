import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';
import { useApi } from '../useApi';

// Mock the hooks
jest.mock('../useDebounce');
jest.mock('../useApi');

describe('useSearch (Integration Test)', () => {
  it('should debounce search and call API', async () => {
    const mockApi = {
      data: [{ id: 1, name: 'Result' }],
      loading: false,
      error: null,
      execute: jest.fn().mockResolvedValue([{ id: 1, name: 'Result' }]),
    };

    useDebounce.mockReturnValue('debounced-search');
    useApi.mockReturnValue(mockApi);

    // This simulates how you might compose hooks
    const useSearch = (query) => {
      const debouncedQuery = useDebounce(query, 300);
      const api = useApi(`/search?q=${debouncedQuery}`, { immediate: !!debouncedQuery });
      
      return api;
    };

    const { result, rerender } = renderHook(
      ({ query }) => useSearch(query),
      { initialProps: { query: 'test' } }
    );

    expect(useDebounce).toHaveBeenCalledWith('test', 300);
    expect(useApi).toHaveBeenCalledWith('/search?q=debounced-search', { immediate: true });

    // Simulate query change
    rerender({ query: 'new search' });

    expect(useDebounce).toHaveBeenCalledWith('new search', 300);
  });
});