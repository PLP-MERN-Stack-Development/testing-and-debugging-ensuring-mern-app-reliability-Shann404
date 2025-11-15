import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

export function useApi(url, options = {}) {
  const { immediate = false, ...fetchOptions } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (executeUrl = url, executeOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(executeUrl, { ...fetchOptions, ...executeOptions });
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(fetchOptions)]);

  useEffect(() => {
    let mounted = true;
    
    if (immediate) {
      setLoading(true);
      execute().catch(() => {
        // Error is already handled in execute
      }).finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [execute, immediate]);

  return { data, loading, error, execute };
}