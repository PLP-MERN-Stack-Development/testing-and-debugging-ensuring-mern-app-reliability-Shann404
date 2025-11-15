import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    // Update value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Value should be updated after delay
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );
    
    // Rapidly change values
    rerender({ value: 'second', delay: 500 });
    rerender({ value: 'third', delay: 500 });
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Should only have the last value
    expect(result.current).toBe('third');
  });

  it('should handle different delay times', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );
    
    rerender({ value: 'updated', delay: 1000 });
    
    // Should not update after shorter time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');
    
    // Should update after full delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should cleanup on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = renderHook(() => useDebounce('test', 500));
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});