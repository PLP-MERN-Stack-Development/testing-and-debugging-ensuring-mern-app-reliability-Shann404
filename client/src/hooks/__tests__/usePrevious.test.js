import { renderHook } from '@testing-library/react';
import { usePrevious } from '../usePrevious';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'));
    
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    );
    
    // First render - should be undefined
    expect(result.current).toBeUndefined();
    
    // Second render with new value
    rerender({ value: 'second' });
    expect(result.current).toBe('first');
    
    // Third render with another value
    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null } }
    );
    
    expect(result.current).toBeUndefined();
    
    rerender({ value: undefined });
    expect(result.current).toBe(null);
    
    rerender({ value: 'defined' });
    expect(result.current).toBeUndefined();
  });

  it('should handle number values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } }
    );
    
    expect(result.current).toBeUndefined();
    
    rerender({ value: 2 });
    expect(result.current).toBe(1);
    
    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('should handle object references', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    );
    
    expect(result.current).toBeUndefined();
    
    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);
  });
});